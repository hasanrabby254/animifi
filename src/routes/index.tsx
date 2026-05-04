import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Camera, Wand2, Share2, ShieldCheck } from "lucide-react";
import heroLion from "@/assets/hero-lion.jpg";
import exFox from "@/assets/example-fox.jpg";
import exDeer from "@/assets/example-deer.jpg";
import exPanther from "@/assets/example-panther.jpg";
import exOwl from "@/assets/example-owl.jpg";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Animify — Discover Your Spirit Animal with AI" },
      { name: "description", content: "Upload a selfie. Reveal your spirit animal in seconds. Free, premium AI portraits with one-click sharing." },
      { property: "og:title", content: "Animify — Discover Your Spirit Animal" },
      { property: "og:description", content: "Free AI that reveals the animal in you." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-gold/10 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-2 gap-16 items-center">
          <div className="opacity-0 animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-xs uppercase tracking-[0.2em] text-gold mb-6">
              <Sparkles className="w-3 h-3" /> Always free · No sign-up
            </span>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-6">
              Discover the <span className="text-gradient-gold">animal</span> that lives in you.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Upload a selfie. Our AI reveals your spirit animal, paints a stunning portrait, and tells you why — in under 12 seconds.
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                to="/discover"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground font-medium shadow-gold hover:scale-[1.02] transition-transform"
              >
                Upload Your Photo — It's Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/gallery" className="text-sm text-muted-foreground hover:text-gold transition story-link">
                See what others discovered →
              </Link>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-gold" /> Photos auto-deleted</span>
              <span>·</span>
              <span>5M+ animals revealed</span>
            </div>
          </div>
          <div className="relative opacity-0 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-4 bg-gradient-to-br from-gold/20 to-accent/20 rounded-[2rem] blur-2xl" />
            <div className="relative rounded-[2rem] overflow-hidden shadow-luxe border border-gold/20">
              <img src={heroLion} alt="A premium portrait morph: a person becoming a lion" width={1024} height={1024} className="w-full h-auto" />
              <div className="absolute bottom-4 left-4 right-4 backdrop-blur-md bg-background/40 border border-border/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Spirit animal</div>
                  <div className="font-display text-2xl text-gradient-gold">Lion · 94%</div>
                </div>
                <div className="text-right text-xs text-muted-foreground max-w-[120px]">Bold · Loyal · Magnetic · Brave</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gold-divider max-w-5xl mx-auto" />

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">How it works</div>
          <h2 className="font-display text-4xl md:text-5xl">Three steps. Zero friction.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Camera, title: "Upload a selfie", body: "Drag & drop or snap a photo. We do the rest." },
            { icon: Wand2, title: "AI reveals you", body: "Premium models analyze your aura and paint a unique portrait." },
            { icon: Share2, title: "Share everywhere", body: "One-click share to TikTok, Instagram, X. Your link, your moment." },
          ].map((s, i) => (
            <div key={i} className="rounded-3xl p-8 bg-card/60 border border-border/60 backdrop-blur-sm hover:border-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-grad grid place-items-center mb-5 shadow-gold">
                <s.icon className="w-5 h-5 text-gold" />
              </div>
              <div className="font-display text-2xl mb-2">{s.title}</div>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AD SLOT */}
      <div className="max-w-5xl mx-auto px-6">
        <AdSlot />
      </div>

      {/* GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Recent reveals</div>
            <h2 className="font-display text-4xl md:text-5xl max-w-xl">A gallery of beautiful, surprising matches.</h2>
          </div>
          <Link to="/gallery" className="text-sm text-muted-foreground hover:text-gold transition">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { src: exFox, animal: "Fox", pct: 92 },
            { src: exDeer, animal: "Deer", pct: 89 },
            { src: exPanther, animal: "Panther", pct: 96 },
            { src: exOwl, animal: "Owl", pct: 91 },
          ].map((g, i) => (
            <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 hover:border-gold/40 transition">
              <img src={g.src} alt={`${g.animal} match`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="font-display text-xl">{g.animal}</div>
                <div className="text-xs text-gold">{g.pct}% match</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="relative rounded-[2rem] overflow-hidden p-12 md:p-16 text-center bg-emerald-grad border border-gold/20 shadow-luxe">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,oklch(0.8_0.15_85_/_0.4),transparent_50%)]" />
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl mb-4">Ready to meet your animal?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Free forever. No account. No watermark. Just magic.</p>
            <Link to="/discover" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground font-medium shadow-gold">
              Start Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
