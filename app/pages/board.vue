<script setup lang="ts">
definePageMeta({
  auth: false
})

interface Board {
  id: string
  title: string
  cover: string
  isPrivate: boolean
  members: string[]
  memberCount: number
}

const boards: Board[] = [
  {
    id: '1',
    title: 'Conduite de projet',
    cover: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    isPrivate: true,
    members: ['AP', 'MT', 'CL'],
    memberCount: 4
  },
  {
    id: '2',
    title: 'piscine react native',
    cover: 'linear-gradient(135deg, #d97706, #f59e0b)',
    isPrivate: true,
    members: ['MT', 'JD'],
    memberCount: 3
  },
  {
    id: '3',
    title: 'R-Type',
    cover: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
    isPrivate: false,
    members: ['AP', 'CL'],
    memberCount: 2
  },
  {
    id: '4',
    title: 'RPG',
    cover: 'linear-gradient(135deg, #1e293b, #334155)',
    isPrivate: true,
    members: ['MT', 'JD', 'AP'],
    memberCount: 3
  },
  {
    id: '5',
    title: 'Gestion de projet',
    cover: 'linear-gradient(135deg, #10b981, #14b8a6)',
    isPrivate: true,
    members: ['AP', 'MT'],
    memberCount: 4
  },
  {
    id: '6',
    title: 'Scrum',
    cover: 'linear-gradient(135deg, #ec4899, #f472b6)',
    isPrivate: false,
    members: ['CL', 'JD'],
    memberCount: 2
  }
]
</script>

<template>
  <div class="flex h-screen bg-slate-900 text-white">
    <!-- Sidebar gauche -->
    <aside class="w-64 border-r border-slate-800 bg-slate-900 p-4">
      <div class="mb-6 flex items-center gap-2 px-2">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white">
          TF
        </div>
        <span class="text-lg font-semibold">TaskFlow</span>
      </div>

      <nav class="space-y-1">
        <NuxtLink
          to="/board"
          class="flex items-center gap-3 rounded-lg bg-slate-800 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-slate-750"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          Tableaux
        </NuxtLink>
        <a
          href="#"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v9a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
          </svg>
          Modèles
        </a>
        <a
          href="/"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Accueil
        </a>
      </nav>

      <div class="mt-8">
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Espaces de travail
        </p>
        <div class="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-sm font-bold text-white">
            E
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-white">Espace de travail Trello</p>
          </div>
          <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </aside>

    <!-- Contenu principal -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Header -->
      <header class="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
        <div class="flex items-center gap-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-lg font-bold text-white">
            E
          </div>
          <div>
            <h1 class="text-lg font-semibold text-white">Espace de travail Trello</h1>
          </div>
          <button
            type="button"
            class="rounded p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Modifier"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <div class="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300">
            <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            Privé
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <input
              type="text"
              placeholder="Rechercher"
              class="w-64 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 pl-10 text-sm text-white placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
            <svg
              class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Créer
          </button>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Notifications"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Aide"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
            MB
          </div>
        </div>
      </header>

      <!-- Contenu scrollable -->
      <main class="flex-1 overflow-y-auto bg-slate-900 p-6">
        <div class="mx-auto max-w-7xl">
          <div class="mb-6 flex items-center gap-2">
            <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 class="text-lg font-semibold text-white">Vos tableaux</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <article
              v-for="board in boards"
              :key="board.id"
              class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-800/50 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl"
            >
              <!-- Cover du tableau -->
              <div
                class="h-28 w-full"
                :style="{ background: board.cover }"
              />

              <!-- Contenu de la carte -->
              <div class="p-4">
                <h3 class="mb-2 text-sm font-semibold text-white">{{ board.title }}</h3>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-slate-400">
                    {{ board.isPrivate ? 'Privé' : 'Public' }} • {{ board.memberCount }} membre{{ board.memberCount > 1 ? 's' : '' }}
                  </p>
                  <div class="flex -space-x-2">
                    <span
                      v-for="member in board.members.slice(0, 3)"
                      :key="member"
                      class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-800 bg-slate-700 text-[10px] font-semibold text-white"
                    >
                      {{ member }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Footer avec statut -->
              <div class="flex items-center justify-between border-t border-slate-800 px-4 py-2">
                <div class="flex items-center gap-1.5 text-xs text-slate-400">
                  <span class="h-2 w-2 rounded-full bg-emerald-400" />
                  Actif
                </div>
                <button
                  type="button"
                  class="opacity-0 text-slate-400 transition group-hover:opacity-100 hover:text-white"
                  aria-label="Options"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

