import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "About",
  description:
    "Who writes SpikeReport, what it covers, and why it exists.",
};

export default function AboutPage() {
  return (
    <section className="py-14 sm:py-16">
      <Container className="max-w-prose">
        <header className="mb-10">
          <p className="mb-2 font-display text-xs font-semibold uppercase tracking-widest text-accent">
            The person behind the takes
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            About
          </h1>
        </header>

        <div className="space-y-5 text-lg leading-relaxed text-slate-300">
          <p>
            I&apos;m Josh. I play Valorant, I watch way too much VCT, and at
            some point writing my takes down became easier than typing them
            into group chats one friend at a time. That&apos;s SpikeReport.
          </p>
          <p>
            What you&apos;ll find here: reactions to patch notes after
            I&apos;ve actually played them, roster move analysis, coverage of
            whatever drama the pro scene has cooked up this week, skin reviews
            that answer the only question that matters (does it make you play
            worse?), and the{" "}
            <Link
              href="/clips"
              className="text-accent hover:underline"
            >
              clips worth replaying
            </Link>
            .
          </p>
          <p>
            Everything here is my own opinion. No sponsorships, no access
            journalism, nobody to answer to. When I&apos;m wrong, I&apos;ll say
            so in the next post.
          </p>
          <p className="text-slate-400">
            SpikeReport is a fan site and isn&apos;t affiliated with or
            endorsed by Riot Games.
          </p>
        </div>
      </Container>
    </section>
  );
}
