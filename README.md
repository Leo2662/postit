# Idées Lum

Mur d'idées ultra minimaliste. Une page, deux couleurs.

**Stack** — Next.js · TypeScript · Tailwind CSS · Supabase · Vercel

## 1. Supabase

Projet : **carte-lum**.

1. Ouvrir le **SQL Editor** du projet et exécuter [`supabase/schema.sql`](supabase/schema.sql).
   Cela crée la table `posts` (`id`, `content`, `likes`, `created_at`), les policies
   publiques (pas d'auth pour le MVP) et la fonction `like_post`.
2. Récupérer l'URL du projet dans **Settings → Data API → Project URL**.

## 2. Lancer en local

```bash
cp .env.example .env.local   # puis renseigner NEXT_PUBLIC_SUPABASE_URL
npm install
npm run dev
```

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la publishable key du projet |

La *secret key* n'est pas utilisée : l'app parle directement à Supabase depuis le
navigateur, il n'y a ni serveur ni API intermédiaire. Elle ne doit jamais être
ajoutée au dépôt ni à Vercel.

## 3. Déployer sur Vercel

Importer le dépôt GitHub sur Vercel, ajouter les deux variables ci-dessus dans
**Settings → Environment Variables**, déployer. Aucune autre configuration.
