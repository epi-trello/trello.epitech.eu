<template>
  <section
    id="cta"
    class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-lg"
  >
    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="space-y-3">
        <p class="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200">
          Collab
        </p>
        <h2 class="text-2xl font-semibold sm:text-3xl">
          Construisez vos boards en équipe
        </h2>
        <p class="max-w-2xl text-sm text-indigo-100 sm:text-base">
          Invitez vos collègues, répartissez les responsabilités et gardez la visibilité en un clin
          d’œil. Chaque colonne reflète un état clair, chaque carte une action précise.
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink
          to="/sign-up"
          class="inline-flex items-center justify-center rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:scale-[1.01]"
        >
          Démarrer gratuitement
        </NuxtLink>
        <NuxtLink
          to="/login"
          class="inline-flex items-center justify-center rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Accéder à mes boards
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
