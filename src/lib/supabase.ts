import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

export type Post = {
  id: string;
  content: string;
  likes: number;
  created_at: string;
};

export const supabase = createClient(supabaseUrl, supabaseKey);

/** Likes décroissants, puis les plus récents d'abord. */
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.likes - a.likes || b.created_at.localeCompare(a.created_at),
  );
}
