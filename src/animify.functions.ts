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
  .validator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) throw new Error("AI is not configured");

    const selfieUrl = await uploadDataUrl(data.imageDataUrl, "selfies");

    // Step 1: Analyze face -> animal
    const analysisRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are Animify, a playful AI that matches a person to their spirit animal. Be kind and flattering.\n\nRULES:\n- Avoid Lion unless truly warranted.\n- Pick from: Fox, Wolf, Owl, Deer, Panther, Eagle, Bear, Dolphin, Otter, Rabbit, Swan, Tiger, Leopard, Hawk, Raven, Horse, Elephant, Koala, Red Panda, Lynx, Jaguar, Falcon, Husky, Gazelle, Penguin, Hedgehog, Cat, Polar Bear, Snow Leopard, etc.\n- Confidence: 60-95.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this selfie and pick the best spirit animal match for this person.",
                },
                { type: "image_url", image_url: { url: data.imageDataUrl } },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "match_animal",
                parameters: {
                  type: "object",
                  properties: {
                    animal: { type: "string" },
                    confidence: { type: "number" },
                    personality: { type: "string" },
                    traits: { type: "array", items: { type: "string" } },
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
      }
    );

    if (!analysisRes.ok) {
      const text = await analysisRes.text();
      console.error("AI analysis failed", analysisRes.status, text);
      if (analysisRes.status === 429) throw new Error("Too many requests — please try again.");
      throw new Error("AI analysis failed");
    }

    const analysisJson = await analysisRes.json();
    const toolCall = analysisJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI returned no result");
    const parsed = JSON.parse(toolCall.function.arguments);
    const animal: string = parsed.animal;

    // Step 2: Generate morph portrait using Gemini native image generation
    let morphUrl: string | null = null;
    try {
      const styleHint =
        data.style === "artistic"
          ? "painterly oil-paint artistic style"
          : data.style === "cartoonish"
          ? "Pixar-quality cartoon illustration style"
          : "hyperrealistic editorial photo style";

      const imgMatch = data.imageDataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
      const imgMime = imgMatch ? imgMatch[1] : "image/jpeg";
      const imgB64 = imgMatch ? imgMatch[2] : "";

      const morphRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: { mime_type: imgMime, data: imgB64 },
                  },
                  {
                    text: `Transform this person into a beautiful ${styleHint} portrait morphed with a ${animal}. Keep their face recognizable. Blend ${animal} features like ears, fur, and markings naturally. Deep emerald background with gold rim lighting. Square 1:1 format. Premium magazine quality.`,
                  },
                ],
              },
            ],
            generationConfig: {
              response_modalities: ["IMAGE", "TEXT"],
            },
          }),
        }
      );

      if (morphRes.ok) {
        const mj = await morphRes.json();
        const imgPart = mj.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inline_data || p.inlineData
        );
        const inlineData = imgPart?.inline_data || imgPart?.inlineData;
        if (inlineData?.data) {
          const mime = inlineData.mime_type || inlineData.mimeType || "image/png";
          const morphDataUrl = `data:${mime};base64,${inlineData.data}`;
          morphUrl = await uploadDataUrl(morphDataUrl, "morphs");
        }
      } else {
        const errText = await morphRes.text();
        console.error("morph API error", morphRes.status, errText);
      }
    } catch (e) {
      console.error("morph generation failed", e);
    }

    // Step 3: Save to database
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
  .validator((d: unknown) => fetchSchema.parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("results")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) return null;

    if (row.selfie_url) {
      const m = row.selfie_url.match(/\/animify\/(selfies\/[^?]+)/);
      const path = m ? m[1] : null;
      if (path) {
        const { data: signed } = await supabaseAdmin.storage
          .from("animify")
          .createSignedUrl(path, 3600);
        if (signed?.signedUrl) row.selfie_url = signed.signedUrl;
      }
    }
    return row;
  });

const publishSchema = z.object({ id: z.string().uuid(), isPublic: z.boolean() });
export const setResultPublic = createServerFn({ method: "POST" })
  .validator((d: unknown) => publishSchema.parse(d))
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
