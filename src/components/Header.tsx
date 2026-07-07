"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Container } from "./Container";
import { Logo } from "./Logo";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/articles?section=sports", label: "Off the Server" },
  { href: "/clips", label: "Clips" },
  { href: "/about", label: "About" },
];

/**
 * Nav links live in their own component because useSearchParams requires a
 * Suspense boundary. The section param decides whether "Articles" or
 * "Off the Server" gets the highlight.
 */
function NavLinks({
  linkClass,
  onNavigate,
}: {
  linkClass: (active: boolean) => string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sportsView = searchParams.get("section") === "sports";

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    if (href === "/articles?section=sports")
      return pathname === "/articles" && sportsView;
    if (href === "/articles")
      return (
        (pathname === "/articles" || pathname.startsWith("/articles/")) &&
        !sportsView
      );
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={linkClass(isActive(item.href))}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          <Suspense fallback={null}>
            <NavLinks
              linkClass={(active) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-ink-800 text-white"
                    : "text-slate-400 hover:text-white"
                }`
              }
            />
          </Suspense>
          <Link href="/articles" className="btn-primary ml-2">
            Latest
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-700 text-slate-200 sm:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-ink-700/70 bg-ink-950/95 sm:hidden">
          <Container className="flex flex-col gap-1 py-3">
            <Suspense fallback={null}>
              <NavLinks
                onNavigate={() => setOpen(false)}
                linkClass={(active) =>
                  `rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-ink-800 text-white"
                      : "text-slate-300 hover:bg-ink-800/60 hover:text-white"
                  }`
                }
              />
            </Suspense>
          </Container>
        </div>
      )}
    </header>
  );
}
