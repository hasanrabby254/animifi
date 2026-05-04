import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Animify" },
      { name: "description", content: "Animify is a free, premium AI experience that reveals your spirit animal." },
      { property: "og:title", content: "About Animify" },
      { property: "og:description", content: "Why we built the most beautiful free spirit-animal AI." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="bg-hero">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">About</div>
        <h1 className="font-display text-5xl md:text-6xl mb-8">A free, beautiful AI playground.</h1>
        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>Animify exists to spark curiosity. Upload a photo, and our AI paints the animal that lives in you — with care, taste, and a little magic.</p>
          <p>The whole experience is free. No paywalls, no premium tiers, no usage limits. We sustain the project through tasteful, non-intrusive ads — designed to feel like part of the brand, never on top of it.</p>
          <p>We believe AI entertainment can be both fun and elegant. Animify is our small attempt to prove it.</p>
        </div>
      </div>
    </div>
  );
}
