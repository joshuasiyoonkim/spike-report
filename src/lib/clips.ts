import fs from "node:fs";
import path from "node:path";
import type { Clip } from "./types";

const CLIPS_FILE = path.join(process.cwd(), "content", "clips.json");

/** All clips, newest first. */
export function getAllClips(): Clip[] {
  if (!fs.existsSync(CLIPS_FILE)) return [];
  const raw = fs.readFileSync(CLIPS_FILE, "utf8");
  const clips = JSON.parse(raw) as Clip[];
  return clips.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Distinct tags across all clips, sorted alphabetically. */
export function getClipTags(): string[] {
  const set = new Set<string>();
  for (const clip of getAllClips()) {
    for (const tag of clip.tags ?? []) set.add(tag);
  }
  return Array.from(set).sort();
}
