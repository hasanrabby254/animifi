import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Animify" },
      { name: "description", content: "How Animify handles your photos and data." },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <div className="bg-hero">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Privacy</div>
        <h1 className="font-display text-5xl mb-8">Your photo, your control.</h1>
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p><span className="text-foreground">Photos.</span> Selfies are processed securely and automatically deleted within 48 hours unless you explicitly choose to share your result publicly.</p>
          <p><span className="text-foreground">No accounts required.</span> You can use Animify entirely without signing up.</p>
          <p><span className="text-foreground">Sharing is opt-in.</span> Your reveals are private by default. They only appear in the community gallery if you toggle "Add to public gallery" on the result page.</p>
          <p><span className="text-foreground">Ads.</span> We use third-party ad networks (e.g. Google AdSense) which may set cookies for measurement and frequency capping.</p>
        </div>
      </div>
    </div>
  );
}
