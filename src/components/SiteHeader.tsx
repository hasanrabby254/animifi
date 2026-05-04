import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-emerald-grad grid place-items-center shadow-gold">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <span className="font-display text-2xl tracking-tight">
            Anim<span className="text-gradient-gold">ify</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/discover" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Discover</Link>
          <Link to="/gallery" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">Gallery</Link>
          <Link to="/about" activeProps={{ className: "text-foreground" }} className="hover:text-foreground transition-colors">About</Link>
        </nav>
        <Link
          to="/discover"
          className="px-5 py-2 rounded-full text-sm font-medium bg-gradient-to-br from-[oklch(0.85_0.13_85)] to-[oklch(0.7_0.14_75)] text-primary-foreground shadow-gold hover:opacity-90 transition"
        >
          Try Free
        </Link>
      </div>
    </header>
  );
}
