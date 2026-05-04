import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10 text-sm">
        <div className="md:col-span-2">
          <div className="font-display text-3xl mb-3">
            Anim<span className="text-gradient-gold">ify</span>
          </div>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Discover the animal that lives in you. A free, premium AI experience —
            built for curiosity, made for sharing.
          </p>
        </div>
        <div>
          <div className="text-foreground font-medium mb-3">Product</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/discover" className="hover:text-gold transition">Discover</Link></li>
            <li><Link to="/gallery" className="hover:text-gold transition">Gallery</Link></li>
            <li><Link to="/encyclopedia" className="hover:text-gold transition">Encyclopedia</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-foreground font-medium mb-3">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/about" className="hover:text-gold transition">About</Link></li>
            <li><Link to="/privacy" className="hover:text-gold transition">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="gold-divider" />
      <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} Animify. Always free.</span>
        <span>Made with care · Photos auto-deleted in 48h</span>
      </div>
    </footer>
  );
}
