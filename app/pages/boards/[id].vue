<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard'
})

const { params } = useRoute()
const title = usePageTitle()
const { add } = useToast()

const { data: board, refresh } = await useFetch(`/api/boards/${params.id}`)

title.value = board.value ? board.value.name : 'Unknown'

// Schema pour créer une liste
const listSchema = z.object({
  title: z.string().min(1, { message: 'Le titre est requis' }).max(255)
})

type ListSchema = z.output<typeof listSchema>

const listState = reactive<Partial<ListSchema>>({
  title: undefined
})

// Schema pour créer une carte
const cardSchema = z.object({
  title: z.string().min(1, { message: 'Le titre est requis' }).max(255)
})

type CardSchema = z.output<typeof cardSchema>

const cardState = reactive<Partial<CardSchema>>({
  title: undefined
})

const creatingListFor = ref<string | null>(null)
const creatingCardFor = ref<string | null>(null)

// Fonction pour créer une liste
async function createList({ data }: FormSubmitEvent<ListSchema>, next?: () => void) {
  if (!board.value) return

  try {
    const maxPosition = board.value.lists.length > 0
      ? Math.max(...board.value.lists.map(l => l.position)) + 1
      : 0

    await $fetch(`/api/boards/${params.id}/lists`, {
      method: 'POST',
      body: {
        title: data.title,
        position: maxPosition,
        color: 'GRAY'
      }
    })

    await refresh()
    next?.()
    creatingListFor.value = null
    listState.title = undefined

    add({
      title: 'Liste créée',
      description: 'La nouvelle liste a été créée avec succès.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Erreur',
      description: error.message || 'Impossible de créer la liste'
    })
  }
}

// Fonction pour créer une carte
async function createCard({ data }: FormSubmitEvent<CardSchema>, listId: string, next?: () => void) {
  if (!board.value) return

  try {
    const list = board.value.lists.find(l => l.id === listId)
    if (!list) return

    const maxPosition = list.cards.length > 0
      ? Math.max(...list.cards.map(c => c.position)) + 1
      : 0

    await $fetch('/api/cards', {
      method: 'POST',
      body: {
        title: data.title,
        position: maxPosition,
        listId
      }
    })
    await refresh()
    next?.()
    creatingCardFor.value = null
    cardState.title = undefined

    add({
      title: 'Carte créée',
      description: 'La nouvelle carte a été créée avec succès.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Erreur',
      description: error.message || 'Impossible de créer la carte'
    })
  }
}

// Fonction pour supprimer une liste
async function deleteList(listId: string) {
  try {
    await $fetch(`/api/lists/${listId}`, {
      method: 'DELETE'
    })

    await refresh()

    add({
      title: 'Liste supprimée',
      description: 'La liste a été supprimée avec succès.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Erreur',
      description: error.message || 'Impossible de supprimer la liste'
    })
  }
}

// Fonction pour supprimer une carte
async function deleteCard(cardId: string) {
  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'DELETE'
    })

    await refresh()

    add({
      title: 'Carte supprimée',
      description: 'La carte a été supprimée avec succès.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Erreur',
      description: error.message || 'Impossible de supprimer la carte'
    })
  }
}

// Mapping des couleurs
const colorMap: Record<string, string> = {
  GRAY: 'bg-gray-200 dark:bg-gray-700',
  RED: 'bg-red-200 dark:bg-red-700',
  YELLOW: 'bg-yellow-200 dark:bg-yellow-700',
  GREEN: 'bg-green-200 dark:bg-green-700',
  SKY: 'bg-sky-200 dark:bg-sky-700',
  BLUE: 'bg-blue-200 dark:bg-blue-700',
  VIOLET: 'bg-violet-200 dark:bg-violet-700',
  PINK: 'bg-pink-200 dark:bg-pink-700'
}
</script>

<template>
  <div class="flex flex-col h-[calc(100vh-64px)]">
    <!-- Header -->
    <div class="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
      <UButton
        to="/boards"
        variant="ghost"
        icon="i-ph-arrow-left"
        size="sm"
      >
        Retour
      </UButton>
      <h1 class="text-2xl font-bold">{{ board?.name || 'Tableau' }}</h1>
    </div>

    <!-- Board Content -->
    <div class="flex-1 overflow-x-auto overflow-y-hidden bg-gray-50 dark:bg-gray-950 p-4 min-h-0">
      <div class="flex gap-4 h-full min-w-fit">
        <!-- Colonnes existantes -->
        <div
          v-for="list in board?.lists || []"
          :key="list.id"
          class="flex-shrink-0 w-72 flex flex-col"
        >
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-fit max-h-full">
            <!-- Header de la liste -->
            <div
              class="p-3 rounded-t-lg flex items-center justify-between"
              :class="colorMap[list.color] || colorMap.GRAY"
            >
              <h3 class="font-semibold text-sm">{{ list.title }}</h3>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ph-trash"
                size="xs"
                @click="deleteList(list.id)"
              />
            </div>

            <!-- Cartes -->
            <div class="flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] max-h-[calc(100vh-200px)]">
              <div
                v-for="card in list.cards"
                :key="card.id"
                class="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div class="flex items-start justify-between gap-2">
                  <p class="text-sm font-medium flex-1">{{ card.title }}</p>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    icon="i-ph-trash"
                    size="xs"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="deleteCard(card.id)"
                  />
                </div>
                <p
                  v-if="card.description"
                  class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2"
                >
                  {{ card.description }}
                </p>
                <div
                  v-if="card.dueDate"
                  class="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"
                >
                  <UIcon name="i-ph-calendar" class="w-3 h-3" />
                  {{ new Date(card.dueDate).toLocaleDateString('fr-FR') }}
                </div>
              </div>

              <!-- Formulaire d'ajout de carte -->
              <div v-if="creatingCardFor === list.id" class="p-2">
                <UForm
                  :schema="cardSchema"
                  :state="cardState"
                  class="space-y-2"
                  @submit.prevent="createCard($event, list.id, () => {})"
                >
                  <UFormField name="title">
                    <UInput
                      v-model="cardState.title"
                      placeholder="Titre de la carte..."
                      size="sm"
                      autofocus
                    />
                  </UFormField>
                  <div class="flex gap-2">
                    <UButton
                      type="submit"
                      size="xs"
                      label="Ajouter"
                      loading-auto
                    />
                    <UButton
                      variant="ghost"
                      size="xs"
                      label="Annuler"
                      @click="creatingCardFor = null; cardState.title = undefined"
                    />
                  </div>
                </UForm>
              </div>
            </div>

            <!-- Bouton pour ajouter une carte -->
            <div v-if="creatingCardFor !== list.id" class="p-2">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ph-plus"
                label="Ajouter une carte"
                size="sm"
                block
                @click="creatingCardFor = list.id"
              />
            </div>
          </div>
        </div>

        <!-- Bouton pour ajouter une liste -->
        <div class="flex-shrink-0 w-72">
          <div
            v-if="creatingListFor === null"
            class="bg-gray-200 dark:bg-gray-800 rounded-lg p-4 h-fit min-h-[100px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 transition-colors cursor-pointer"
            @click="creatingListFor = 'new'"
          >
            <UButton
              variant="ghost"
              color="neutral"
              icon="i-ph-plus"
              label="Ajouter une liste"
              size="sm"
            />
          </div>

          <!-- Formulaire d'ajout de liste -->
          <div
            v-else
            class="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3"
          >
            <UForm
              :schema="listSchema"
              :state="listState"
              class="space-y-2"
              @submit.prevent="createList($event, () => {})"
            >
              <UFormField name="title">
                <UInput
                  v-model="listState.title"
                  placeholder="Titre de la liste..."
                  size="sm"
                  autofocus
                />
              </UFormField>
              <div class="flex gap-2">
                <UButton
                  type="submit"
                  size="xs"
                  label="Ajouter"
                  loading-auto
                />
                <UButton
                  variant="ghost"
                  size="xs"
                  label="Annuler"
                  @click="creatingListFor = null; listState.title = undefined"
                />
              </div>
            </UForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
