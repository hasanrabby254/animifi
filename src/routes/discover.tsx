import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { Upload, Camera, Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeSelfie } from "@/server/animify.functions";
import { toast } from "sonner";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover Your Animal — Animify" },
      { name: "description", content: "Upload a selfie and let AI reveal your spirit animal. 100% free, no sign-up." },
      { property: "og:title", content: "Discover Your Animal — Animify" },
      { property: "og:description", content: "Free AI selfie-to-animal experience." },
    ],
  }),
  component: Discover,
});

const STYLES = [
  { id: "realistic", label: "Realistic" },
  { id: "artistic", label: "Artistic" },
  { id: "cartoonish", label: "Cartoon" },
] as const;

function Discover() {
  const navigate = useNavigate();
  const analyze = useServerFn(analyzeSelfie);
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<(typeof STYLES)[number]["id"]>("realistic");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please pick an image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const submit = async () => {
    if (!preview) return;
    setLoading(true);
    setStage(0);
    const stages = ["Detecting features…", "Reading your aura…", "Painting your portrait…", "Finalizing…"];
    const t = setInterval(() => setStage((s) => Math.min(s + 1, stages.length - 1)), 2500);
    try {
      const res = await analyze({ data: { imageDataUrl: preview, style } });
      clearInterval(t);
      navigate({ to: "/result/$id", params: { id: res.id } });
    } catch (e) {
      clearInterval(t);
      setLoading(false);
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  const stages = ["Detecting features…", "Reading your aura…", "Painting your portrait…", "Finalizing…"];

  return (
    <div className="bg-hero">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-xs uppercase tracking-[0.2em] text-gold mb-4">
            <Sparkles className="w-3 h-3" /> Free · 100% private
          </span>
          <h1 className="font-display text-5xl md:text-6xl mb-4">Upload your selfie</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">For best results, use a clear front-facing photo with good lighting.</p>
        </div>

        {!loading ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) onFile(f);
            }}
            className="relative rounded-[2rem] border-2 border-dashed border-border/80 hover:border-gold/50 transition bg-card/40 backdrop-blur-sm p-8 md:p-12"
          >
            {preview ? (
              <div className="space-y-6">
                <div className="relative mx-auto w-72 h-72 rounded-3xl overflow-hidden shadow-luxe border border-gold/20">
                  <img src={preview} alt="Your selfie" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        style === s.id
                          ? "bg-gold text-gold-foreground border-gold shadow-gold"
                          : "border-border text-muted-foreground hover:border-gold/40"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setPreview(null)}
                    className="px-5 py-3 rounded-full border border-border text-sm hover:border-gold/40 transition"
                  >
                    Choose another
                  </button>
                  <button
                    onClick={submit}
                    className="px-7 py-3 rounded-full bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground font-medium shadow-gold"
                  >
                    Reveal my animal →
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-emerald-grad mx-auto grid place-items-center mb-6 shadow-gold">
                  <Upload className="w-8 h-8 text-gold" />
                </div>
                <div className="font-display text-2xl mb-2">Drag & drop your photo</div>
                <p className="text-muted-foreground text-sm mb-8">or pick one of the options below</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground font-medium shadow-gold"
                  >
                    <Upload className="w-4 h-4" /> Choose from device
                  </button>
                  <label className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border hover:border-gold/40 cursor-pointer transition">
                    <Camera className="w-4 h-4" /> Take a photo
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                    />
                  </label>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-gold/20 bg-card/60 backdrop-blur p-12 text-center shadow-luxe">
            <div className="relative mx-auto w-40 h-40 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-gold/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-gold animate-spin" />
              {preview && (
                <img src={preview} alt="" className="absolute inset-3 rounded-full object-cover w-[calc(100%-1.5rem)] h-[calc(100%-1.5rem)]" />
              )}
            </div>
            <div className="font-display text-3xl mb-2 text-gradient-gold">{stages[stage]}</div>
            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> Usually takes 8–12 seconds
            </p>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="w-3 h-3 text-gold" /> Your photo is processed securely and deleted within 48 hours.
        </div>

        <div className="mt-12">
          <AdSlot />
        </div>
      </div>
    </div>
  );
}
