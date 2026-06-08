import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { ClipsBrowser } from "@/components/ClipsBrowser";
import { getAllClips, getClipTags } from "@/lib/clips";

export const metadata: Metadata = {
  title: "Clips",
  description: "The best plays from VCT tournaments — aces, clutches, and highlights worth replaying.",
};

export default function ClipsPage() {
  const clips = getAllClips();
  const tags = getClipTags();

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <header className="mb-10 max-w-2xl">
          <p className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-accent">
            The highlights
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Clips
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-400">
            The best plays from VCT tournaments — aces, clutches, and the
            moments that defined the event.
          </p>
        </header>

        {clips.length > 0 ? (
          <ClipsBrowser clips={clips} tags={tags} />
        ) : (
          <p className="py-16 text-center text-slate-500">
            No clips yet. Add some in{" "}
            <code className="rounded bg-ink-800 px-1.5 py-0.5 text-accent">
              content/clips.json
            </code>
            .
          </p>
        )}
      </Container>
    </section>
  );
}
