<script setup lang="ts">
interface Card {
  title: string
  badge?: string
  label?: string
  users?: string[]
}

interface List {
  title: string
  color: string
  cards: Card[]
}

defineProps<{
  boardTitle: string
  lists: List[]
}>()
</script>

<template>
  <div
    id="board"
    class="relative overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/60 backdrop-blur"
  >
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <p class="text-sm font-semibold text-slate-900">
          {{ boardTitle }}
        </p>
      </div>
      <div class="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400">
        <span class="inline-flex h-6 items-center rounded-full bg-slate-100 px-3 font-semibold text-slate-700">
          Board
        </span>
        <span class="inline-flex h-6 items-center rounded-full bg-slate-100 px-3 font-semibold text-slate-700">
          Kanban
        </span>
      </div>
    </div>

    <div class="flex gap-3 overflow-x-auto px-4 pb-4 pt-3">
      <article
        v-for="list in lists"
        :key="list.title"
        class="flex w-60 flex-col gap-3 rounded-lg bg-slate-50 p-3 shadow-sm"
      >
        <header class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span
              class="h-2.5 w-2.5 rounded-full"
              :style="{ background: list.color }"
            />
            <p class="text-sm font-semibold text-slate-800">
              {{ list.title }}
            </p>
          </div>
          <button
            type="button"
            class="h-6 w-6 rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700"
            aria-label="Plus d'options"
          >
            ···
          </button>
        </header>

        <div class="space-y-2.5">
          <div
            v-for="card in list.cards"
            :key="card.title"
            class="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-sm font-semibold text-slate-900">
                {{ card.title }}
              </p>
              <span
                v-if="card.badge"
                class="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700"
              >
                {{ card.badge }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-if="card.label"
                  class="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold text-white"
                  :style="{ background: card.label }"
                >
                  Label
                </span>
              </div>
              <div class="flex -space-x-2">
                <span
                  v-for="user in card.users"
                  :key="user"
                  class="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-slate-200 text-[10px] font-semibold text-slate-700"
                >
                  {{ user }}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md px-2 py-2 text-xs font-semibold text-slate-600 transition hover:bg-white hover:shadow-sm"
          >
            <span class="text-lg">+</span> Ajouter une carte
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
