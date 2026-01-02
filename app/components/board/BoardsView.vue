<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

interface Board {
  id: string
  title: string
  cover: string
  isPrivate: boolean
  members: string[]
  memberCount: number
}

const boards = ref<Board[]>([])
const isModalOpen = ref(false)
const isLoading = ref(false)

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
  description: z.string().max(500, 'La description est trop longue').optional()
})

type FormSchema = z.output<typeof formSchema>

const formState = reactive<Partial<FormSchema>>({
  name: '',
  description: ''
})

// Couleurs prédéfinies pour les covers
const coverGradients: string[] = [
  'linear-gradient(135deg, #8b5cf6, #6366f1)',
  'linear-gradient(135deg, #d97706, #f59e0b)',
  'linear-gradient(135deg, #0ea5e9, #3b82f6)',
  'linear-gradient(135deg, #1e293b, #334155)',
  'linear-gradient(135deg, #10b981, #14b8a6)',
  'linear-gradient(135deg, #ec4899, #f472b6)',
  'linear-gradient(135deg, #f59e0b, #f97316)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)'
]

function getRandomCover(): string {
  const index = Math.floor(Math.random() * coverGradients.length)
  const gradient = coverGradients[index]
  return gradient ?? coverGradients[0]!
}

async function onSubmit(event: FormSubmitEvent<FormSchema>) {
  isLoading.value = true
  try {
    const response = await $fetch('/api/boards', {
      method: 'POST',
      body: {
        name: event.data.name
      }
    })

    // Ajouter le nouveau board à la liste
    const newBoard: Board = {
      id: response.id,
      title: response.name,
      cover: getRandomCover(),
      isPrivate: true,
      members: [],
      memberCount: 1
    }

    boards.value.push(newBoard)
    isModalOpen.value = false
    formState.name = ''
    formState.description = ''

    useToast().add({
      title: 'Succès',
      description: 'Tableau créé avec succès',
      color: 'success'
    })
  } catch (error: any) {
    useToast().add({
      title: 'Erreur',
      description: error.data?.message || 'Erreur lors de la création du tableau',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  isModalOpen.value = true
}
</script>

<template>
  <main class="flex-1 overflow-y-auto bg-slate-900 p-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex items-center gap-2">
        <svg
          class="h-4 w-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h2 class="text-lg font-semibold text-white">
          Vos tableaux
        </h2>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <!-- Bouton créer un tableau -->
        <button
          type="button"
          @click="openCreateModal"
          class="group flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/30 transition hover:border-sky-500 hover:bg-slate-800/50"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/20 text-sky-400 transition group-hover:bg-sky-500/30">
            <svg
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <p class="text-sm font-semibold text-slate-300">
            Créer un tableau
          </p>
        </button>

        <!-- Liste des tableaux -->
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
            <h3 class="mb-2 text-sm font-semibold text-white">
              {{ board.title }}
            </h3>
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
              <svg
                class="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>

