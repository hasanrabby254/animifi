import { createFileRoute } from "@tanstack/react-router";

const ANIMALS = [
  { name: "Lion", traits: "Bold · Loyal · Magnetic", body: "Born to lead. Lions radiate warmth and command rooms without lifting a voice." },
  { name: "Fox", traits: "Clever · Witty · Adaptive", body: "Sharp-minded and quick on their feet. Foxes turn obstacles into opportunities." },
  { name: "Owl", traits: "Wise · Observant · Calm", body: "Old souls. Owls notice everything — and speak only when it matters." },
  { name: "Wolf", traits: "Loyal · Protective · Intuitive", body: "Family-first. Wolves are fiercely loyal and lead with instinct." },
  { name: "Deer", traits: "Gentle · Graceful · Intuitive", body: "Soft strength. Deer move through the world with quiet elegance." },
  { name: "Panther", traits: "Mysterious · Powerful · Independent", body: "Quiet confidence. Panthers don't need to prove anything." },
  { name: "Eagle", traits: "Visionary · Free · Decisive", body: "Big-picture thinkers who soar above the noise." },
  { name: "Dolphin", traits: "Playful · Social · Bright", body: "Joyful intelligence. Dolphins make life lighter for everyone around." },
];

export const Route = createFileRoute("/encyclopedia")({
  head: () => ({
    meta: [
      { title: "Animal Encyclopedia — Animify" },
      { name: "description", content: "Explore the personalities of the spirit animals featured in Animify." },
    ],
  }),
  component: Enc,
});

function Enc() {
  return (
    <div className="bg-hero">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Encyclopedia</div>
        <h1 className="font-display text-5xl md:text-6xl mb-12">Meet the animals.</h1>
        <div className="grid md:grid-cols-2 gap-5">
          {ANIMALS.map((a) => (
            <div key={a.name} className="rounded-3xl p-6 bg-card/60 border border-border/60 hover:border-gold/40 transition">
              <div className="font-display text-3xl text-gradient-gold mb-1">{a.name}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">{a.traits}</div>
              <p className="text-muted-foreground leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
