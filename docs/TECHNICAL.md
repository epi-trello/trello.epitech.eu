# Documentation technique — Epitrello

Documentation pratique du projet : stack, setup, structure, API et conventions.

---

## 1. Vue d’ensemble

**Epitrello** est une application type Kanban (tableaux → listes → cartes) avec authentification.

- **Stack** : Nuxt 4, Vue 3, Nuxt UI, Prisma, PostgreSQL, better-auth, Zod, driver.js (tour guide), vue3-smooth-dnd (drag & drop).
- **Auth** : better-auth (email/password, sessions, adaptateur Prisma).
- **UI** : Nuxt UI 4, thème Epitech (couleur primaire), layout dashboard pour les pages protégées.

---

## 2. Prérequis et variables d’environnement

- **Node** : version supportée par Nuxt 4 (LTS recommandé).
- **pnpm** : gestionnaire de paquets utilisé (`packageManager` dans `package.json`).
- **PostgreSQL** : base de données.

Variables attendues (ex. dans `.env` à la racine) :

| Variable         | Description                    |
|------------------|--------------------------------|
| `DATABASE_URL`   | URL de connexion PostgreSQL    |

Exemple : `DATABASE_URL="postgresql://user:password@localhost:5432/epitrello"`

---

## 3. Setup et commandes

```bash
# Installer les dépendances
pnpm install

# Générer le client Prisma (fait aussi en postinstall)
pnpm db:generate

# Appliquer le schéma en base (sans migrations versionnées)
pnpm db:push

# Lancer le serveur de dev
pnpm dev
```

Autres commandes utiles :

| Commande           | Rôle                                      |
|--------------------|-------------------------------------------|
| `pnpm build`       | Build production                          |
| `pnpm preview`     | Prévisualiser le build                    |
| `pnpm typecheck`   | Vérification TypeScript                  |
| `pnpm lint`        | Vérifier le format (Prettier)             |
| `pnpm lint:fix`    | Corriger le format                        |
| `pnpm test`        | Lancer les tests (Vitest)                 |
| `pnpm auth:schema` | Générer le schéma better-auth si besoin   |

---

## 4. Structure du projet

```
├── app/
│   ├── assets/css/       # Styles globaux (main.css, thème tour)
│   ├── components/       # Composants Vue réutilisables
│   ├── composables/     # useAuth, usePageTitle, useTour
│   ├── layouts/         # default, dashboard
│   ├── middleware/      # auth.global.ts (protection des routes)
│   ├── pages/           # Routes file-based (Nuxt)
│   ├── plugins/         # driver.client.ts, auth client/server
│   └── utils/           # Helpers (getColors, etc.)
├── server/
│   ├── api/             # Handlers API (voir § 6)
│   └── utils/           # auth.ts (better-auth + Prisma), schema.ts (Zod)
├── prisma/
│   ├── schema.prisma    # Modèles et enum
│   └── generated/      # Client Prisma généré
├── docs/
│   └── TECHNICAL.md     # Ce fichier
├── nuxt.config.ts
├── prisma.config.ts     # Config Prisma (DATABASE_URL)
└── package.json
```

---

## 5. Authentification

- **Backend** : `server/utils/auth.ts` — better-auth avec adaptateur Prisma (PostgreSQL), `emailAndPassword: true`, champs additionnels `firstname` / `lastname`.
- **Client** : `app/composables/auth.ts` — `useAuth()` expose `user`, `session`, `loggedIn`, `signIn`, `signUp`, `signOut`, `fetchSession`, `options`.
- **Middleware** : `app/middleware/auth.global.ts` — appliqué à toutes les routes sauf si `meta.auth === false` ou `meta.auth.only === 'guest'`.
  - Options : `only: 'guest' | 'user'`, `redirectUserTo`, `redirectGuestTo`.
  - Par défaut : non connecté → redirection vers `redirectGuestTo` (ex. `/login`).
- **Routes auth** : proxy vers better-auth via `server/api/auth/[...all].ts`.

Exemple de meta pour une page :

```ts
definePageMeta({
  layout: 'dashboard',
  auth: false                    // pas de redirection
  // ou auth: { only: 'guest', redirectUserTo: '/boards' }
})
```

---

## 6. API (server/api)

Convention des handlers :

1. Récupérer la session : `const session = await auth.api.getSession(event)`.
2. Si pas de session : `throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })`.
3. Pour les body : `readValidatedBody(event, MySchema.safeParse)` puis en cas d’erreur `422` avec les issues Zod.
4. Vérifier que la ressource appartient à l’utilisateur (ex. `ownerId: session.user.id` ou relation via `list.board.ownerId`).

### Endpoints principaux

| Méthode | Route | Description |
|--------|--------|-------------|
| GET    | `/api/boards` | Liste des boards de l’utilisateur |
| POST   | `/api/boards` | Créer un board (body : `{ name }`) |
| GET    | `/api/boards/:id` | Détail board + listes + cartes + labels |
| PATCH  | `/api/boards/:id` | Modifier un board |
| DELETE | `/api/boards/:id` | Supprimer un board |
| GET    | `/api/boards/:id/lists` | Listes du board |
| POST   | `/api/boards/:id/lists` | Créer une liste (body : `title`, `position`, `color?`) |
| PATCH  | `/api/lists/:id` | Modifier une liste (ex. `position`, `boardId`) |
| DELETE | `/api/lists/:id` | Supprimer une liste |
| POST   | `/api/cards` | Créer une carte (body : `title`, `listId`, `position`, etc.) |
| GET    | `/api/cards/:id` | Détail carte |
| PATCH  | `/api/cards/:id` | Modifier une carte (liste, position, labels, dates, …) |
| DELETE | `/api/cards/:id` | Supprimer une carte |
| POST   | `/api/boards/:id/labels` | Créer un label |
| GET    | `/api/boards/:id/labels` | Listes des labels du board |
| PATCH  | `/api/labels/:id` | Modifier un label |
| DELETE | `/api/labels/:id` | Supprimer un label |
| POST   | `/api/cards/:id/labels/:labelId` | Attacher un label à une carte |
| DELETE | `/api/cards/:id/labels/:labelId` | Détacher un label |
| POST   | `/api/upload` | Upload (ex. Vercel Blob) |
| *      | `/api/auth/[...all]` | Proxy better-auth |

Les schémas Zod sont dans `server/utils/schema.ts` : `BoardInputSchema`, `ListInputSchema`, `CardInputSchema`, `LabelInputSchema`.

---

## 7. Base de données (Prisma)

- **Provider** : PostgreSQL.
- **Client** : généré dans `prisma/generated` (alias `@@/prisma/generated/client` côté server).

Modèles principaux :

- **User** : id, name, email, image, firstname, lastname — lié à Session, Account, Board.
- **Board** : id, name, ownerId → User ; relations List[], Label[].
- **List** : id, title, position, color (enum), boardId → Board ; relation Card[].
- **Card** : id, title, description, position, startDate, dueDate, listId → List ; relation Label[] (M:N).
- **Label** : id, name, color (hex), boardId → Board ; relation Card[] (M:N).

Enum **Color** : GRAY, RED, YELLOW, GREEN, SKY, BLUE, VIOLET, PINK.

Pour créer/mettre à jour le schéma en dev : `pnpm db:push`. Pour des migrations versionnées, configurer Prisma en conséquence.

---

## 8. Frontend (app)

- **Layouts** : `default` (landing, header), `dashboard` (sidebar + navbar, utilisé pour /boards, /boards/:id, /settings).
- **Pages** : file-based routing sous `app/pages/` (index, login, sign-up, boards, boards/[id], boards/[id]/cards/[cardId], settings).
- **Composables** : `useAuth()`, `usePageTitle()`, `useTour()` (tour guide driver.js).
- **Tour guide** : étapes définies dans `useTour.ts` pour `/boards` et `/boards/[id]`, déclenchées par le composant `TourTrigger` ; attributs `data-tour="..."` sur les éléments ciblés.
- **Drag & drop** : `vue3-smooth-dnd` sur la page board pour listes et cartes ; positions mises à jour via PATCH list/card.

---

## 9. Configuration et thème

- **Nuxt** : `nuxt.config.ts` — modules `@nuxt/test-utils`, `@nuxt/ui` ; CSS `~/assets/css/main.css`.
- **UI** : `app/app.config.ts` — couleurs (primary: epitech, neutral: slate, error: rose), icônes Phosphor (`i-ph-*`).
- **Prisma** : `prisma.config.ts` — `schema`, `migrations`, `datasource.url` via `env('DATABASE_URL')`.

---

## 10. Bonnes pratiques utilisées

- **Validation** : Zod pour tous les body d’API via `readValidatedBody` et schémas dans `server/utils/schema.ts`.
- **Auth** : session vérifiée dans chaque handler protégé ; ownership vérifié (ownerId ou relation board.ownerId).
- **IDs** : génération côté server avec `generateId()` (better-auth) pour Board, List, Card, Label.
- **Position** : Float pour listes/cartes ; logique de réordonnancement (gap, moyenne entre positions) dans la page board.
- **Format** : Prettier + (optionnel) Commitlint / Husky pour commits et lint.

---

## 11. Dépannage rapide

- **Erreur Prisma / "can't find module"** : lancer `pnpm db:generate` (ou `pnpm install` qui fait `prisma generate`).
- **401 sur les API** : vérifier que l’utilisateur est connecté et que les cookies sont envoyés (même origine, credentials).
- **DATABASE_URL** : doit être défini au build et au runtime (server) ; pas nécessaire côté client.
- **Tour guide** : ne s’affiche que sur `/boards` et `/boards/:id` ; cliquer sur le bouton « ? » dans la navbar pour le relancer.

Si tu veux détailler une partie (ex. schémas Zod exacts, champs de chaque API), on peut l’ajouter dans ce doc ou dans des sous-fichiers (ex. `docs/API.md`, `docs/SCHEMA.md`).
