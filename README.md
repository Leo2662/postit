# Idées LÜM

Mur d'idées une page, mobile-first, à la charte LÜM Vieux-Lille
(terracotta `#8B4A2B` sur crème `#F5EFE6`, Nunito / Lato, cartes arrondies).

**Stack** — Next.js · TypeScript · Tailwind CSS · Supabase · Vercel

## 1. Supabase

Projet : **carte-lum**.

Project ref : `uixcoavsqsfxsmwqyvky` → URL `https://uixcoavsqsfxsmwqyvky.supabase.co`.

Ouvrir le **SQL Editor** du projet et exécuter [`supabase/schema.sql`](supabase/schema.sql).
Cela crée la table `posts` (`id`, `content`, `likes`, `created_at`), les policies
publiques (pas d'auth pour le MVP) et la fonction `like_post`.

## 2. Lancer en local

```bash
cp .env.example .env.local
npm install
npm run dev
```

| Variable | Valeur |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uixcoavsqsfxsmwqyvky.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la publishable key du projet |

La *secret key* n'est pas utilisée : l'app parle directement à Supabase depuis le
navigateur, il n'y a ni serveur ni API intermédiaire. Elle ne doit jamais être
ajoutée au dépôt ni à Vercel.

## 3. Déployer sur Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** le dépôt `Leo2662/postit`.
2. Vercel détecte Next.js seul : ne rien changer aux réglages de build.
3. **Environment Variables** : ajouter les deux variables ci-dessus, cochées pour
   Production, Preview et Development.
4. **Deploy**.

La branche par défaut du dépôt devient la Production ; chaque push crée un
déploiement. Si les variables sont ajoutées après un déploiement, il faut
redéployer (Deployments → ⋯ → Redeploy) pour qu'elles soient prises en compte :
elles sont inlinées au moment du build.
