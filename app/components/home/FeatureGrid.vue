<script setup lang="ts">
interface Feature {
  title: string
  description: string
  icon: string
}

defineProps<{
  title: string
  subtitle: string
  items: Feature[]
}>()
</script>

<template>
  <section
    id="features"
    class="space-y-6 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200"
  >
    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-sky-600">
        Vue + Nuxt
      </p>
      <h2 class="text-2xl font-semibold text-slate-900 sm:text-3xl">
        {{ title }}
      </h2>
      <p class="max-w-3xl text-base text-slate-600">
        {{ subtitle }}
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="feature in items"
        :key="feature.title"
        class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
          {{ feature.icon }}
        </div>
        <h3 class="text-lg font-semibold text-slate-900">
          {{ feature.title }}
        </h3>
        <p class="text-sm text-slate-600">
          {{ feature.description }}
        </p>
      </article>
    </div>
  </section>
</template>
