import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchResult, setResultPublic } from "@/animify.functions";
import { Download, Share2, Sparkles, RefreshCw, Globe } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/result/$id")({
  loader: async ({ params }) => {
    const r = await fetchResult({ data: { id: params.id } });
    if (!r) throw notFound();
    return r;
  },
  head: ({ loaderData }) => {
    const animal = loaderData?.animal ?? "Animal";
    const pct = loaderData?.confidence ?? 0;
    return {
      meta: [
        { title: `${animal} · ${pct}% match — Animify` },
        { name: "description", content: `My spirit animal is a ${animal}! Discover yours on Animify — free.` },
        { property: "og:title", content: `My spirit animal is a ${animal}` },
        { property: "og:description", content: `${pct}% match. Find yours free on Animify.` },
        ...(loaderData?.morph_url ? [{ property: "og:image", content: loaderData.morph_url } as const] : []),
      ],
    };
  },
  component: ResultPage,
  notFoundComponent: () => (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div>
        <h1 className="font-display text-4xl mb-2">Result not found</h1>
        <Link to="/discover" className="text-gold">Try a new selfie →</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div>
        <h1 className="font-display text-4xl mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Link to="/discover" className="text-gold">Start over →</Link>
      </div>
    </div>
  ),
});

function ResultPage() {
  const r = Route.useLoaderData();
  const setPub = useServerFn(setResultPublic);
  const [isPublic, setIsPublic] = useState(r.is_public);
  const traits = (r.traits as string[]) ?? [];
  const top = (r.top_matches as { animal: string; percent: number }[]) ?? [];
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/result/${r.id}` : "";

  const share = async (network: "x" | "facebook" | "whatsapp" | "copy") => {
    const text = `My spirit animal is a ${r.animal}! Find yours free on Animify.`;
    const u = encodeURIComponent(shareUrl);
    const t = encodeURIComponent(text);
    if (network === "x") window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}`, "_blank");
    else if (network === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${u}`, "_blank");
    else if (network === "whatsapp") window.open(`https://wa.me/?text=${t}%20${u}`, "_blank");
    else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    }
  };

  const togglePublic = async () => {
    const next = !isPublic;
    setIsPublic(next);
    try {
      await setPub({ data: { id: r.id, isPublic: next } });
      toast.success(next ? "Added to public gallery" : "Removed from gallery");
    } catch {
      setIsPublic(!next);
      toast.error("Could not update");
    }
  };

  const downloadImage = () => {
    if (!r.morph_url) return;
    const a = document.createElement("a");
    a.href = r.morph_url;
    a.download = `animify-${r.animal.toLowerCase()}.png`;
    a.target = "_blank";
    a.click();
  };

  return (
    <div className="bg-hero">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12 opacity-0 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-xs uppercase tracking-[0.2em] text-gold mb-4">
            <Sparkles className="w-3 h-3" /> Your reveal
          </span>
          <h1 className="font-display text-5xl md:text-7xl mb-3">
            You're a <span className="text-gradient-gold">{r.animal}</span>
          </h1>
          <div className="text-2xl text-gold">{r.confidence}% match</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative rounded-[2rem] overflow-hidden shadow-luxe border border-gold/20 aspect-square bg-card">
              {r.morph_url ? (
                <img src={r.morph_url} alt={`${r.animal} portrait`} className="w-full h-full object-cover" />
              ) : r.selfie_url ? (
                <img src={r.selfie_url} alt="Your photo" className="w-full h-full object-cover opacity-70" />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground">No image</div>
              )}
              <div className="absolute top-4 right-4 backdrop-blur-md bg-background/40 border border-border/50 rounded-full px-3 py-1 text-xs text-gold">
                Animify
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={downloadImage}
                disabled={!r.morph_url}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground font-medium shadow-gold disabled:opacity-40"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => share("copy")}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border hover:border-gold/40 transition"
              >
                <Share2 className="w-4 h-4" /> Copy link
              </button>
            </div>
            <div className="mt-3 flex gap-2 justify-center text-sm text-muted-foreground">
              <button onClick={() => share("x")} className="hover:text-gold">X</button>·
              <button onClick={() => share("facebook")} className="hover:text-gold">Facebook</button>·
              <button onClick={() => share("whatsapp")} className="hover:text-gold">WhatsApp</button>
            </div>
          </div>

          <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="rounded-3xl p-6 bg-card/60 border border-border/60 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Personality</div>
              <p className="text-lg leading-relaxed">{r.personality}</p>
            </div>

            <div className="rounded-3xl p-6 bg-card/60 border border-border/60">
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Your traits</div>
              <div className="flex flex-wrap gap-2">
                {traits.map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full bg-emerald-grad text-sm border border-gold/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-6 bg-card/60 border border-border/60">
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Top 5 matches</div>
              <div className="space-y-3">
                {top.slice(0, 5).map((m) => (
                  <div key={m.animal}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m.animal}</span>
                      <span className="text-gold">{m.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary/40 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[oklch(0.7_0.14_75)] to-[oklch(0.85_0.13_85)]" style={{ width: `${m.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={togglePublic}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border hover:border-gold/40 text-sm transition"
            >
              <Globe className="w-4 h-4" /> {isPublic ? "Remove from public gallery" : "Add to public gallery"}
            </button>

            <Link to="/discover" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm text-muted-foreground hover:text-gold">
              <RefreshCw className="w-4 h-4" /> Try another photo
            </Link>
          </div>
        </div>

        <div className="mt-16">
          <AdSlot />
        </div>
      </div>
    </div>
  );
}
