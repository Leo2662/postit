"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase, sortPosts, type Post } from "@/lib/supabase";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("posts")
      .select("*")
      .then(({ data }) => setPosts(sortPosts(data ?? [])));
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
    const removed = posts.find((p) => p.id === id);
    setPendingDelete(null);
    setPosts((current) => current.filter((p) => p.id !== id));

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error && removed) setPosts((current) => sortPosts([...current, removed]));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <h1 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
        Idées Lum
      </h1>

      <form onSubmit={addPost} className="mt-4">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Écris ton idée, puis Entrée"
          aria-label="Nouvelle idée"
          enterKeyHint="done"
          autoComplete="off"
          className="w-full border-b-4 border-paper bg-transparent py-3 text-2xl font-semibold text-paper outline-none placeholder:text-paper/40 focus:border-paper sm:text-3xl"
        />
      </form>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li
            key={post.id}
            className="animate-pop-in relative flex min-h-40 flex-col justify-between bg-paper p-4 text-ink"
          >
            <p className="text-xl font-semibold break-words whitespace-pre-wrap sm:text-2xl">
              {post.content}
            </p>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => likePost(post.id)}
                aria-label="Liker"
                className="flex items-center gap-2 text-xl font-bold active:scale-95"
              >
                <ThumbUp />
                {post.likes}
              </button>

              <button
                type="button"
                onClick={() => setPendingDelete(post.id)}
                aria-label="Supprimer"
                className="px-2 text-3xl leading-none font-bold active:scale-95"
              >
                &times;
              </button>
            </div>

            {pendingDelete === post.id && (
              <div className="animate-pop-in absolute inset-0 flex flex-col items-center justify-center gap-4 bg-paper p-4 text-center text-ink">
                <p className="text-xl font-semibold">
                  Êtes-vous sûr de vouloir supprimer ?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    className="border-2 border-ink bg-ink px-5 py-1 text-lg font-bold text-paper uppercase active:scale-95"
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="border-2 border-ink px-5 py-1 text-lg font-bold uppercase active:scale-95"
                  >
                    Non
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

/** Pouce monochrome : la palette reste strictement à deux couleurs. */
function ThumbUp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M2 10h4v11H2zM21.5 10.5h-6l1-4.2A2.1 2.1 0 0 0 14.4 3.7L13 3 8.6 9.4c-.2.3-.3.6-.3 1V19c0 1.1.9 2 2 2h8.2c.9 0 1.7-.6 1.9-1.5l1.6-6.5c.3-1.2-.6-2.5-1.9-2.5z" />
    </svg>
  );
}
