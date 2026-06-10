import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

const ARTICLES_DIR = path.join(process.cwd(), "content", "articles");

/** Turn a title into a filesystem-safe slug, e.g. "My Hot Take!" -> "my-hot-take". */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  // This route writes to the local filesystem, so it only works when the app
  // is running on a machine with a writable disk (i.e. `next dev` locally).
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "The admin editor is only available in local development." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { title, date, category, excerpt, author, content } = body;

  if (!title || !date || !category || !content) {
    return NextResponse.json(
      { error: "title, date, category, and content are required." },
      { status: 400 },
    );
  }

  const slug = slugify(String(title));
  if (!slug) {
    return NextResponse.json(
      { error: "Title must contain at least one letter or number." },
      { status: 400 },
    );
  }

  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: `An article named "${slug}.md" already exists.` },
      { status: 409 },
    );
  }

  // Store a full timestamp, not just the day. The form gives us a day
  // ("2026-06-08"); we attach the current time so two articles published on the
  // same day sort by when you actually hit publish, not by filename.
  const isDayOnly = /^\d{4}-\d{2}-\d{2}$/.test(String(date));
  const timestamp = isDayOnly
    ? `${date}T${new Date().toISOString().slice(11)}`
    : String(date);

  // Only include optional frontmatter fields when the user actually filled them in.
  const frontmatter: Record<string, unknown> = {
    title: String(title),
    date: timestamp,
    category: String(category),
    excerpt: String(excerpt ?? ""),
    author: String(author || "Josh"),
  };
  if (body.coverImage) frontmatter.coverImage = String(body.coverImage);
  if (body.videoId) frontmatter.videoId = String(body.videoId);

  const fileContents = matter.stringify(`\n${String(content).trim()}\n`, frontmatter);

  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
  fs.writeFileSync(filePath, fileContents, "utf8");

  return NextResponse.json({ slug, path: `content/articles/${slug}.md` });
}
