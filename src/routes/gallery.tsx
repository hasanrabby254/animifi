import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchGallery } from "@/server/animify.functions";
import { AdSlot } from "@/components/AdSlot";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Community Gallery — Animify" },
      { name: "description", content: "Browse spirit animal reveals shared by the Animify community." },
      { property: "og:title", content: "Community Gallery — Animify" },
      { property: "og:description", content: "Beautiful AI animal portraits from real people." },
    ],
  }),
  loader: () => fetchGallery(),
  component: Gallery,
});

function Gallery() {
  const items = Route.useLoaderData();
  return (
    <div className="bg-hero">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Community</div>
          <h1 className="font-display text-5xl md:text-6xl">A wild gallery.</h1>
          <p className="text-muted-foreground mt-3">Reveals shared by the Animify community.</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-border/60 bg-card/40">
            <p className="text-muted-foreground mb-6">No public reveals yet — be the first.</p>
            <Link to="/discover" className="inline-flex px-6 py-3 rounded-full bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground font-medium shadow-gold">
              Reveal your animal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((g) => (
              <Link
                key={g.id}
                to="/result/$id"
                params={{ id: g.id }}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/60 hover:border-gold/40 transition"
              >
                {g.morph_url && <img src={g.morph_url} alt={g.animal} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="font-display text-xl">{g.animal}</div>
                  <div className="text-xs text-gold">{g.confidence}% match</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16">
          <AdSlot />
        </div>
      </div>
    </div>
  );
}
