import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  imageDataUrl: z.string().min(20),
  style: z.enum(["realistic", "artistic", "cartoonish"]).default("realistic"),
});

type AnalysisResult = {
  id: string;
  animal: string;
  confidence: number;
  personality: string;
  traits: string[];
  topMatches: { animal: string; percent: number }[];
  morphUrl: string | null;
  selfieUrl: string | null;
};

async function uploadDataUrl(dataUrl: string, prefix: string): Promise<string | null> {
  try {
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) return null;
    const [, mime, b64] = match;
    const ext = mime.split("/")[1] ?? "png";
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("animify")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (error) {
      console.error("upload error", error);
      return null;
    }
    const { data } = supabaseAdmin.storage.from("animify").getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export const analyzeSelfie = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    if (!LOVABLE_API_KEY) throw new Error("AI is not configured");

    const selfieUrl = await uploadDataUrl(data.imageDataUrl, "selfies");

    // 1. Analyze the face -> animal match (structured output via tool calling)
    const analysisRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are Animify, a fun and entertaining AI that matches a person's facial features, vibe, and aura to their spirit animal. Always be playful, kind, flattering, and never describe a person's appearance in a sensitive way. Pick from a wide variety of animals (lion, fox, wolf, owl, deer, panther, eagle, bear, dolphin, otter, rabbit, swan, tiger, leopard, hawk, raven, horse, elephant, koala, red panda, etc).",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this selfie and return the spirit animal match." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_animal",
              description: "Return the spirit animal match for the person.",
              parameters: {
                type: "object",
                properties: {
                  animal: { type: "string", description: "Primary animal match, single word, capitalized" },
                  confidence: { type: "number", description: "Match confidence 60-99" },
                  personality: { type: "string", description: "2-3 sentence playful personality reading" },
                  traits: {
                    type: "array",
                    items: { type: "string" },
                    description: "5 short adjective traits, capitalized",
                  },
                  topMatches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        animal: { type: "string" },
                        percent: { type: "number" },
                      },
                      required: ["animal", "percent"],
                      additionalProperties: false,
                    },
                    description: "Top 5 animal matches sorted by percent desc, including the primary",
                  },
                },
                required: ["animal", "confidence", "personality", "traits", "topMatches"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "match_animal" } },
      }),
    });

    if (!analysisRes.ok) {
      const text = await analysisRes.text();
      console.error("AI analysis failed", analysisRes.status, text);
      if (analysisRes.status === 429) throw new Error("Too many requests — please try again in a moment.");
      if (analysisRes.status === 402) throw new Error("AI credits exhausted. Please try again later.");
      throw new Error("AI analysis failed");
    }

    const analysisJson = await analysisRes.json();
    const toolCall = analysisJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no result");
    const parsed = JSON.parse(toolCall.function.arguments);
    const animal: string = parsed.animal;

    // 2. Generate the morphed portrait (best-effort)
    let morphUrl: string | null = null;
    try {
      const styleHint =
        data.style === "artistic"
          ? "painterly artistic style, oil-paint texture"
          : data.style === "cartoonish"
            ? "stylized cartoon illustration, Pixar quality"
            : "hyperrealistic editorial portrait";
      const morphRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Transform this person into a premium magazine-style portrait morphing them with a ${animal}. ${styleHint}. Deep emerald background with subtle gold rim light. Keep facial identity recognizable, blend animal features beautifully into hair, eyes, and skin. Square 1:1.`,
                },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
        }),
      });
      if (morphRes.ok) {
        const mj = await morphRes.json();
        const dataUrl = mj.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (dataUrl) morphUrl = await uploadDataUrl(dataUrl, "morphs");
      }
    } catch (e) {
      console.error("morph generation failed", e);
    }

    // 3. Persist
    const { data: row, error } = await supabaseAdmin
      .from("results")
      .insert({
        animal,
        confidence: Math.round(parsed.confidence ?? 80),
        personality: parsed.personality,
        traits: parsed.traits ?? [],
        top_matches: parsed.topMatches ?? [],
        style: data.style,
        selfie_url: selfieUrl,
        morph_url: morphUrl,
        is_public: false,
      })
      .select("id")
      .single();
    if (error || !row) {
      console.error(error);
      throw new Error("Could not save result");
    }

    return {
      id: row.id,
      animal,
      confidence: Math.round(parsed.confidence ?? 80),
      personality: parsed.personality,
      traits: parsed.traits ?? [],
      topMatches: parsed.topMatches ?? [],
      morphUrl,
      selfieUrl,
    };
  });

const fetchSchema = z.object({ id: z.string().uuid() });
export const fetchResult = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => fetchSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("results")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) return null;
    return row;
  });

const publishSchema = z.object({ id: z.string().uuid(), isPublic: z.boolean() });
export const setResultPublic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => publishSchema.parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("results")
      .update({ is_public: data.isPublic })
      .eq("id", data.id);
    if (error) throw new Error("Could not update");
    return { ok: true };
  });

export const fetchGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("results")
    .select("id, animal, morph_url, confidence, created_at")
    .eq("is_public", true)
    .not("morph_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(48);
  if (error) return [];
  return data ?? [];
});
