"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  commentsOf,
  sortPosts,
  supabase,
  type Comment,
  type Post,
} from "@/lib/supabase";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .then(({ data }) => setPosts(sortPosts(data ?? [])));
    supabase
      .from("comments")
      .select("*")
      .then(({ data }) => setComments(data ?? []));
  }, []);

  async function addPost(event: FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;

    const post: Post = {
      id: crypto.randomUUID(),
      content,
      likes: 0,
      created_at: new Date().toISOString(),
    };
    setDraft("");
    setPosts((current) => sortPosts([...current, post]));

    const { error } = await supabase.from("posts").insert(post);
    if (error) setPosts((current) => current.filter((p) => p.id !== post.id));
  }

  async function likePost(id: string) {
    const bump = (delta: number) =>
      setPosts((current) =>
        sortPosts(
          current.map((p) => (p.id === id ? { ...p, likes: p.likes + delta } : p)),
        ),
      );

    bump(1);
    const { error } = await supabase.rpc("like_post", { post_id: id });
    if (error) bump(-1);
  }

  async function deletePost(id: string) {
    const removedPost = posts.find((p) => p.id === id);
    const removedComments = comments.filter((c) => c.post_id === id);
    setPendingDelete(null);
    setPosts((current) => current.filter((p) => p.id !== id));
    setComments((current) => current.filter((c) => c.post_id !== id));

    // Les commentaires partent avec le post-it (on delete cascade).
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error && removedPost) {
      setPosts((current) => sortPosts([...current, removedPost]));
      setComments((current) => [...current, ...removedComments]);
    }
  }

  async function addComment(postId: string, text: string) {
    const comment: Comment = {
      id: crypto.randomUUID(),
      post_id: postId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setComments((current) => [...current, comment]);

    const { error } = await supabase.from("comments").insert(comment);
    if (error) {
      setComments((current) => current.filter((c) => c.id !== comment.id));
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 pt-10 pb-20">
      <h1 className="font-display text-3xl font-black tracking-[0.05em] text-terracotta uppercase sm:text-4xl">
        Idées LÜM
      </h1>

      <form onSubmit={addPost} className="mt-6">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Écris ton idée, puis Entrée"
          aria-label="Nouvelle idée"
          enterKeyHint="done"
          autoComplete="off"
          className="w-full rounded-full border-2 border-cream-dark bg-white px-6 py-4 text-lg text-dark-brown shadow-[0_4px_20px_rgba(44,24,16,0.08)] outline-none transition-colors duration-200 placeholder:text-warm-gray focus:border-terracotta"
        />
      </form>

      <ul className="mt-10 grid grid-cols-1 items-start gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            comments={commentsOf(comments, post.id)}
            confirming={pendingDelete === post.id}
            onLike={() => likePost(post.id)}
            onAskDelete={() => setPendingDelete(post.id)}
            onCancelDelete={() => setPendingDelete(null)}
            onDelete={() => deletePost(post.id)}
            onComment={(text) => addComment(post.id, text)}
          />
        ))}
      </ul>
    </main>
  );
}

type PostCardProps = {
  post: Post;
  comments: Comment[];
  confirming: boolean;
  onLike: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
  onComment: (text: string) => void;
};

function PostCard({
  post,
  comments,
  confirming,
  onLike,
  onAskDelete,
  onCancelDelete,
  onDelete,
  onComment,
}: PostCardProps) {
  const [draft, setDraft] = useState("");

  function submitComment(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onComment(text);
  }

  return (
    <li className="animate-fade-up relative flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(44,24,16,0.12)] transition duration-250 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(44,24,16,0.2)]">
      <p className="p-6 text-lg leading-relaxed break-words whitespace-pre-wrap text-dark-brown">
        {post.content}
      </p>

      <div className="border-t border-cream-dark px-6 py-4">
        {comments.length > 0 && (
          <ul className="mb-3 space-y-2">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="border-l-2 border-cream-dark pl-3 text-sm leading-relaxed break-words whitespace-pre-wrap text-medium-brown"
              >
                {comment.content}
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={submitComment}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Commenter…"
            aria-label={`Commenter : ${post.content}`}
            enterKeyHint="send"
            autoComplete="off"
            className="w-full rounded-full border border-cream-dark bg-cream px-4 py-2 text-sm text-dark-brown outline-none transition-colors duration-200 placeholder:text-warm-gray focus:border-terracotta"
          />
        </form>
      </div>

      <div className="mt-auto flex items-center justify-between bg-terracotta px-5 py-4">
        <button
          type="button"
          onClick={onLike}
          aria-label="Liker"
          className="font-display flex items-center gap-2 rounded-full border-[2.5px] border-white px-5 py-1.5 text-sm font-extrabold tracking-[0.08em] text-white transition-colors duration-200 hover:bg-white hover:text-terracotta"
        >
          <ThumbUp />
          {post.likes}
        </button>

        <button
          type="button"
          onClick={onAskDelete}
          aria-label="Supprimer"
          className="px-2 text-2xl leading-none text-white transition-opacity duration-200 hover:opacity-60"
        >
          &times;
        </button>
      </div>

      {confirming && (
        <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cream p-6 text-center">
          <p className="font-display text-lg font-extrabold text-dark-brown">
            Êtes-vous sûr de vouloir supprimer ?
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDelete}
              className="font-display rounded-full border-[2.5px] border-terracotta bg-terracotta px-6 py-1.5 text-sm font-extrabold tracking-[0.08em] text-white uppercase transition-colors duration-200 hover:border-terracotta-dark hover:bg-terracotta-dark"
            >
              Oui
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="font-display rounded-full border-[2.5px] border-terracotta px-6 py-1.5 text-sm font-extrabold tracking-[0.08em] text-terracotta uppercase transition-colors duration-200 hover:bg-terracotta hover:text-white"
            >
              Non
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function ThumbUp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M2 10h4v11H2zM21.5 10.5h-6l1-4.2A2.1 2.1 0 0 0 14.4 3.7L13 3 8.6 9.4c-.2.3-.3.6-.3 1V19c0 1.1.9 2 2 2h8.2c.9 0 1.7-.6 1.9-1.5l1.6-6.5c.3-1.2-.6-2.5-1.9-2.5z" />
    </svg>
  );
}
