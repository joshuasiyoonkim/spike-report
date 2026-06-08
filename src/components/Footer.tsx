import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-700/70 bg-ink-950">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            A personal Valorant hub — patch note opinions, roster analysis,
            drama coverage, skin reviews, and gameplay clips. Written by Josh.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <span className="mb-1 font-display text-xs font-semibold uppercase tracking-widest text-slate-500">
            Browse
          </span>
          <Link href="/" className="text-slate-400 transition-colors hover:text-accent">
            Home
          </Link>
          <Link href="/articles" className="text-slate-400 transition-colors hover:text-accent">
            Articles
          </Link>
          <Link href="/clips" className="text-slate-400 transition-colors hover:text-accent">
            Clips
          </Link>
        </nav>
      </Container>

      <div className="border-t border-ink-700/50">
        <Container className="flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SpikeReport. A fan site, not affiliated with Riot Games.</p>
          <p>Built with Next.js.</p>
        </Container>
      </div>
    </footer>
  );
}
