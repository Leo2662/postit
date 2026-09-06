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
    <main className="mx-auto w-full max-w-[1200px] px-6 pb-20 pt-10">
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

      <ul className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li
            key={post.id}
            className="animate-fade-up relative flex min-h-48 flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(44,24,16,0.12)] transition duration-250 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(44,24,16,0.2)]"
          >
            <p className="flex-1 p-6 text-lg leading-relaxed break-words whitespace-pre-wrap text-dark-brown">
              {post.content}
            </p>

            <div className="flex items-center justify-between bg-terracotta px-5 py-4">
              <button
                type="button"
                onClick={() => likePost(post.id)}
                aria-label="Liker"
                className="font-display flex items-center gap-2 rounded-full border-[2.5px] border-white px-5 py-1.5 text-sm font-extrabold tracking-[0.08em] text-white transition-colors duration-200 hover:bg-white hover:text-terracotta"
              >
                <ThumbUp />
                {post.likes}
              </button>

              <button
                type="button"
                onClick={() => setPendingDelete(post.id)}
                aria-label="Supprimer"
                className="px-2 text-2xl leading-none text-white transition-opacity duration-200 hover:opacity-60"
              >
                &times;
              </button>
            </div>

            {pendingDelete === post.id && (
              <div className="animate-fade-in absolute inset-0 flex flex-col items-center justify-center gap-5 bg-cream p-6 text-center">
                <p className="font-display text-lg font-extrabold text-dark-brown">
                  Êtes-vous sûr de vouloir supprimer ?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    className="font-display rounded-full border-[2.5px] border-terracotta bg-terracotta px-6 py-1.5 text-sm font-extrabold tracking-[0.08em] text-white uppercase transition-colors duration-200 hover:bg-terracotta-dark hover:border-terracotta-dark"
                  >
                    Oui
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(null)}
                    className="font-display rounded-full border-[2.5px] border-terracotta px-6 py-1.5 text-sm font-extrabold tracking-[0.08em] text-terracotta uppercase transition-colors duration-200 hover:bg-terracotta hover:text-white"
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

function ThumbUp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
      <path d="M2 10h4v11H2zM21.5 10.5h-6l1-4.2A2.1 2.1 0 0 0 14.4 3.7L13 3 8.6 9.4c-.2.3-.3.6-.3 1V19c0 1.1.9 2 2 2h8.2c.9 0 1.7-.6 1.9-1.5l1.6-6.5c.3-1.2-.6-2.5-1.9-2.5z" />
    </svg>
  );
}
