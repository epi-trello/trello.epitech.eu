<template>
  <header class="border-b border-slate-200 bg-white/80 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 font-semibold text-slate-900"
      >
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md">
          TF
        </span>
        <span class="text-lg">TaskFlow</span>
      </NuxtLink>

      <nav class="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
        <a
          href="#board"
          class="hover:text-slate-900"
        >Tableaux</a>
        <a
          href="#features"
          class="hover:text-slate-900"
        >Fonctionnalités</a>
        <a
          href="#cta"
          class="hover:text-slate-900"
        >Commencer</a>
      </nav>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/login"
          class="text-sm font-semibold text-slate-700 hover:text-slate-900"
        >
          Connexion
        </NuxtLink>
        <NuxtLink
          to="/sign-up"
          class="rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:scale-[1.01] transition"
        >
          Inscription
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
