"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/Container";
import { CATEGORIES, type CategoryName } from "@/lib/types";

const FIELD =
  "w-full rounded-lg border border-ink-700 bg-ink-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent/70 focus:outline-none";
const LABEL = "mb-1.5 block text-sm font-medium text-slate-300";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

type Result =
  | { kind: "ok"; slug: string; path: string }
  | { kind: "error"; message: string };

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today());
  const [category, setCategory] = useState<CategoryName>(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("Josh");
  const [videoId, setVideoId] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          category,
          excerpt,
          author,
          videoId,
          coverImage,
          content,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ kind: "error", message: data.error ?? "Something went wrong." });
      } else {
        setResult({ kind: "ok", slug: data.slug, path: data.path });
      }
    } catch {
      setResult({ kind: "error", message: "Could not reach the server." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl">New Article</h1>
        <p className="mt-2 text-sm text-slate-400">
          Fill this in and hit publish. It writes a markdown file straight into{" "}
          <code className="text-accent">content/articles/</code>. Commit and push to
          ship it.
        </p>

        <form onSubmit={handleSubmit} className="surface mt-6 space-y-5 p-6">
          <div>
            <label className={LABEL} htmlFor="title">
              Title
            </label>
            <input
              id="title"
              className={FIELD}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Why the new patch ruined Jett"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="date">
                Date
              </label>
              <input
                id="date"
                type="date"
                className={FIELD}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className={FIELD}
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryName)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="excerpt">
              Excerpt
            </label>
            <input
              id="excerpt"
              className={FIELD}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="One-sentence summary shown in previews."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="author">
                Author
              </label>
              <input
                id="author"
                className={FIELD}
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="videoId">
                YouTube ID <span className="text-slate-500">(optional)</span>
              </label>
              <input
                id="videoId"
                className={FIELD}
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="dQw4w9WgXcQ"
              />
            </div>
          </div>

          <div>
            <label className={LABEL} htmlFor="coverImage">
              Cover image path <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="coverImage"
              className={FIELD}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="/images/jett-nerf.jpg"
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="content">
              Body <span className="text-slate-500">(markdown)</span>
            </label>
            <textarea
              id="content"
              className={`${FIELD} min-h-[16rem] font-mono leading-relaxed`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"## The short version\n\nHere's my hot take..."}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Publishing..." : "Publish article"}
            </button>
            {result?.kind === "ok" && (
              <span className="text-sm text-accent">
                Saved to {result.path} —{" "}
                <Link href={`/articles/${result.slug}`} className="underline">
                  view it
                </Link>
              </span>
            )}
            {result?.kind === "error" && (
              <span className="text-sm text-red-400">{result.message}</span>
            )}
          </div>
        </form>
      </div>
    </Container>
  );
}
