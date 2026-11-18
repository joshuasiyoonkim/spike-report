"use client";

import { postComment } from "@/lib/comments";
import { CommentEditor } from "./CommentEditor";

/** The composer: a CommentEditor wired to post a new comment. */
export function CommentForm({
  slug,
  onPosted,
}: {
  slug: string;
  onPosted: () => void;
}) {
  return (
    <div className="mt-5">
      <CommentEditor
        submitLabel="Post comment"
        busyLabel="Posting..."
        placeholder="Add your take..."
        clearOnSuccess
        onSubmit={async (body) => {
          await postComment(slug, body);
          onPosted();
        }}
      />
    </div>
  );
}
