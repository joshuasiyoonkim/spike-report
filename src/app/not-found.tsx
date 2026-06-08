import Link from "next/link";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-display text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-white">
        Whiffed that one.
      </h1>
      <p className="mt-2 max-w-md text-slate-400">
        The page you&apos;re looking for got planted somewhere else — or never
        existed.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to home
      </Link>
    </Container>
  );
}
