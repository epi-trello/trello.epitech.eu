<template>
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-8 shadow-sm ring-1 ring-slate-200">
    <div class="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-200/40 blur-3xl" />
    <div class="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-indigo-200/40 blur-3xl" />

    <div class="relative grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
      <div class="space-y-4">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
          Tableaux Kanban
        </p>
        <h1 class="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          Un hub clair pour vos idées, projets et tâches récurrentes
        </h1>
        <p class="max-w-xl text-base text-slate-600 sm:text-lg">
          Retrouver l’expérience Trello : colonnes, cartes drag-and-drop et collaboration en temps
          réel. TaskFlow organise tout pour vous concentrer sur l’essentiel.
        </p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <NuxtLink
            to="/sign-up"
            class="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:scale-[1.01]"
          >
            Créer un compte
          </NuxtLink>
          <NuxtLink
            to="/board"
            class="inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 bg-white hover:border-slate-300 transition"
          >
            Voir mes tableaux
          </NuxtLink>
          <span class="text-xs font-medium text-slate-500">S’inspire de Trello, 100% Nuxt</span>
        </div>
      </div>

      <slot />
    </div>
  </section>
</template>
