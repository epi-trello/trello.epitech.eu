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

// Drag and drop
const draggedCard = ref<{ id: string, listId: string } | null>(null)
const dragOverListId = ref<string | null>(null)
const dragOverCardId = ref<string | null>(null) // ID de la carte sous laquelle on va insérer

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

// Fonction pour déplacer une carte
async function moveCard(cardId: string, newListId: string, newPosition: number) {
  if (!board.value) return

  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: {
        listId: newListId,
        position: newPosition
      }
    })

    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Erreur',
      description: error.message || 'Impossible de déplacer la carte'
    })
  }
}

// Gestionnaires de drag and drop
function onDragStart(event: DragEvent, cardId: string, listId: string) {
  if (!event.dataTransfer) return
  
  draggedCard.value = { id: cardId, listId }
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', cardId)
  
  // Style de la carte pendant le drag
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '0.5'
  }
}

function onDragEnd(event: DragEvent) {
  if (event.target instanceof HTMLElement) {
    event.target.style.opacity = '1'
  }
  
  draggedCard.value = null
  dragOverListId.value = null
  dragOverCardId.value = null
}

function onDragOverCard(event: DragEvent, listId: string, cardId: string) {
  event.preventDefault()
  event.stopPropagation()
  if (!event.dataTransfer || !draggedCard.value) return
  
  // Ne pas afficher l'indicateur si on survole la carte qu'on est en train de déplacer
  if (draggedCard.value.id === cardId) {
    dragOverCardId.value = null
    return
  }
  
  event.dataTransfer.dropEffect = 'move'
  dragOverListId.value = listId
  dragOverCardId.value = cardId
}

function onDragOverList(event: DragEvent, listId: string) {
  event.preventDefault()
  if (!event.dataTransfer) return
  
  event.dataTransfer.dropEffect = 'move'
  dragOverListId.value = listId
  // Si on survole la liste mais pas une carte spécifique, on insère à la fin
  dragOverCardId.value = null
}

function onDragLeave() {
  dragOverListId.value = null
  dragOverCardId.value = null
}

async function onDrop(event: DragEvent, targetListId: string, targetCardId?: string) {
  event.preventDefault()
  event.stopPropagation()
  
  if (!draggedCard.value || !board.value) return
  
  const { id: cardId } = draggedCard.value
  
  // Ne pas faire de drop si on dépose sur la même carte
  if (targetCardId === cardId) {
    draggedCard.value = null
    dragOverListId.value = null
    dragOverCardId.value = null
    return
  }
  
  const targetList = board.value.lists.find(l => l.id === targetListId)
  if (!targetList) return
  
  // Créer une copie des cartes de la liste cible, triées par position
  // Exclure la carte déplacée si elle est dans cette liste
  const cards = targetList.cards
    .filter(c => c.id !== cardId) // Retirer la carte déplacée si elle est dans cette liste
    .sort((a, b) => a.position - b.position)
  
  let insertPosition: number
  
  if (targetCardId) {
    // Insérer après la carte spécifiée (en dessous)
    const targetCardIndex = cards.findIndex(c => c.id === targetCardId)
    
    if (targetCardIndex === -1) {
      // Carte cible non trouvée, insérer à la fin
      insertPosition = cards.length
    } else {
      // Insérer après la carte (en dessous)
      insertPosition = targetCardIndex + 1
    }
  } else {
    // Insérer à la fin de la liste
    insertPosition = cards.length
  }
  
  // S'assurer que la position est valide
  insertPosition = Math.max(0, Math.min(insertPosition, cards.length))
  
  await moveCard(cardId, targetListId, insertPosition)
  
  draggedCard.value = null
  dragOverListId.value = null
  dragOverCardId.value = null
}

// Mapping des couleurs avec gradients modernes
const colorMap: Record<string, { bg: string, text: string, border: string }> = {
  GRAY: {
    bg: 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    text: 'text-slate-800 dark:text-slate-100',
    border: 'border-slate-300 dark:border-slate-700'
  },
  RED: {
    bg: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50',
    text: 'text-red-800 dark:text-red-100',
    border: 'border-red-300 dark:border-red-700'
  },
  YELLOW: {
    bg: 'bg-gradient-to-br from-amber-100 to-yellow-200 dark:from-amber-900/50 dark:to-yellow-800/50',
    text: 'text-amber-800 dark:text-amber-100',
    border: 'border-amber-300 dark:border-amber-700'
  },
  GREEN: {
    bg: 'bg-gradient-to-br from-emerald-100 to-green-200 dark:from-emerald-900/50 dark:to-green-800/50',
    text: 'text-emerald-800 dark:text-emerald-100',
    border: 'border-emerald-300 dark:border-emerald-700'
  },
  SKY: {
    bg: 'bg-gradient-to-br from-sky-100 to-cyan-200 dark:from-sky-900/50 dark:to-cyan-800/50',
    text: 'text-sky-800 dark:text-sky-100',
    border: 'border-sky-300 dark:border-sky-700'
  },
  BLUE: {
    bg: 'bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/50 dark:to-indigo-800/50',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border-blue-300 dark:border-blue-700'
  },
  VIOLET: {
    bg: 'bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-900/50 dark:to-purple-800/50',
    text: 'text-violet-800 dark:text-violet-100',
    border: 'border-violet-300 dark:border-violet-700'
  },
  PINK: {
    bg: 'bg-gradient-to-br from-pink-100 to-rose-200 dark:from-pink-900/50 dark:to-rose-800/50',
    text: 'text-pink-800 dark:text-pink-100',
    border: 'border-pink-300 dark:border-pink-700'
  }
}
</script>

<template>
  <div class="flex flex-col h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <!-- Header amélioré - Fixe en haut -->
    <div class="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex-shrink-0 shadow-sm min-w-0">
      <div class="flex items-center gap-4">
        <UButton
          to="/boards"
          variant="ghost"
          icon="i-ph-arrow-left"
          size="sm"
          class="hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Retour
        </UButton>
        <div class="flex items-center gap-3">
          <div class="h-10 w-1 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600" />
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {{ board?.name || 'Tableau' }}
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {{ board?.lists?.length || 0 }} liste{{ (board?.lists?.length || 0) > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          variant="ghost"
          icon="i-ph-star"
          size="sm"
          class="hover:bg-slate-100 dark:hover:bg-slate-800"
        />
        <UButton
          variant="ghost"
          icon="i-ph-bell"
          size="sm"
          class="hover:bg-slate-100 dark:hover:bg-slate-800"
        />
      </div>
    </div>

    <!-- Board Content avec design amélioré - Scroll horizontal uniquement ici -->
    <div class="flex-1 overflow-x-auto overflow-y-hidden min-h-0 min-w-0">
      <div class="flex gap-5 h-full min-w-fit p-6 pb-4">
        <!-- Colonnes existantes avec design amélioré -->
        <div
          v-for="list in board?.lists || []"
          :key="list.id"
          class="flex-shrink-0 w-80 flex flex-col"
        >
          <UCard
            class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group"
            :ui="{ body: 'p-0 flex-1 flex flex-col min-h-0 overflow-hidden', header: 'p-0', footer: 'p-0' }"
          >
            <!-- Header de la liste avec gradient -->
            <div
              class="p-4 rounded-t-lg flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 flex-shrink-0"
              :class="(colorMap[list.color] ?? colorMap.GRAY)?.bg"
            >
              <div class="flex items-center gap-2 flex-1">
                <div class="h-2 w-2 rounded-full bg-current opacity-60" :class="(colorMap[list.color] ?? colorMap.GRAY)?.text" />
                <h3 class="font-bold text-sm" :class="(colorMap[list.color] ?? colorMap.GRAY)?.text">
                  {{ list.title }}
                </h3>
                <UBadge
                  :label="list.cards.length.toString()"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  class="ml-1"
                />
              </div>
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ph-trash"
                size="xs"
                class="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                @click="deleteList(list.id)"
              />
            </div>

            <!-- Cartes avec design amélioré - Zone scrollable -->
            <div
              class="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
              :class="{ 'bg-blue-50/30 dark:bg-blue-900/10': dragOverListId === list.id && !dragOverCardId && list.cards.length === 0 }"
              @dragover.prevent="onDragOverList($event, list.id)"
              @dragleave="onDragLeave"
              @drop.prevent="onDrop($event, list.id)"
            >
              <template v-for="(card, cardIndex) in list.cards" :key="card.id">
                <UCard
                  :draggable="true"
                  class="bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing group/card"
                  :class="{
                    'opacity-50': draggedCard?.id === card.id
                  }"
                  :ui="{ body: 'p-4', header: 'p-0', footer: 'p-0' }"
                  @dragstart="onDragStart($event, card.id, list.id)"
                  @dragend="onDragEnd"
                  @dragover.prevent="onDragOverCard($event, list.id, card.id)"
                  @drop.prevent="onDrop($event, list.id, card.id)"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5 leading-snug">
                        {{ card.title }}
                      </p>
                      <p
                        v-if="card.description"
                        class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed"
                      >
                        {{ card.description }}
                      </p>
                    </div>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      icon="i-ph-trash"
                      size="xs"
                      class="opacity-0 group-hover/card:opacity-100 transition-opacity flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400"
                      @click.stop="deleteCard(card.id)"
                    />
                  </div>
                  <div
                    v-if="card.dueDate"
                    class="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5"
                  >
                    <UIcon name="i-ph-calendar" class="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span class="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {{ new Date(card.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}
                    </span>
                  </div>
                </UCard>
                
                <!-- Indicateur lumineux en dessous de la carte -->
                <div
                  v-if="dragOverListId === list.id && dragOverCardId === card.id"
                  class="h-2 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500 mt-2 transition-all shadow-lg shadow-blue-500/50 animate-pulse"
                />
              </template>
              
              <!-- Indicateur à la fin de la liste si elle est vide ou si on survole la zone vide -->
              <div
                v-if="dragOverListId === list.id && !dragOverCardId && list.cards.length > 0"
                class="h-2 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500 transition-all shadow-lg shadow-blue-500/50 animate-pulse"
              />
              
              <!-- Formulaire d'ajout de carte amélioré -->
              <UCard
                v-if="creatingCardFor === list.id"
                class="bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-slate-300 dark:border-slate-700"
                :ui="{ body: 'p-3', header: 'p-0', footer: 'p-0' }"
              >
                <UForm
                  :schema="cardSchema"
                  :state="cardState"
                  class="space-y-3"
                  @submit.prevent="createCard($event, list.id, () => {})"
                >
                  <UFormField name="title">
                    <UInput
                      v-model="cardState.title"
                      placeholder="Titre de la carte..."
                      size="sm"
                      autofocus
                      class="bg-white dark:bg-slate-800"
                    />
                  </UFormField>
                  <div class="flex gap-2">
                    <UButton
                      type="submit"
                      size="sm"
                      label="Ajouter"
                      loading-auto
                      icon="i-ph-check"
                    />
                    <UButton
                      variant="ghost"
                      size="sm"
                      label="Annuler"
                      icon="i-ph-x"
                      @click="creatingCardFor = null; cardState.title = undefined"
                    />
                  </div>
                </UForm>
              </UCard>
            </div>
            
            <!-- Zone de drop en bas de la liste (si liste vide ou drop à la fin) -->
            <div
              v-if="dragOverListId === list.id && !dragOverCardId && list.cards.length === 0"
              class="h-2 mx-3 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 dark:from-blue-500 dark:via-blue-400 dark:to-blue-500 transition-all shadow-lg shadow-blue-500/50 animate-pulse"
            />

            <!-- Bouton pour ajouter une carte amélioré - Fixe en bas -->
            <div v-if="creatingCardFor !== list.id" class="p-3 border-t border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
              <UButton
                variant="ghost"
                color="neutral"
                icon="i-ph-plus"
                label="Ajouter une carte"
                size="sm"
                block
                class="hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                @click="creatingCardFor = list.id"
              />
            </div>
          </UCard>
        </div>

        <!-- Bouton pour ajouter une liste amélioré -->
        <div class="flex-shrink-0 w-80">
          <UCard
            v-if="creatingListFor === null"
            class="bg-gradient-to-br from-slate-100/80 to-slate-200/80 dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-sm border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:from-slate-200/90 hover:to-slate-300/90 dark:hover:from-slate-700/60 dark:hover:to-slate-800/60 transition-all duration-200 cursor-pointer group h-fit min-h-[120px] flex items-center justify-center"
            :ui="{ body: 'p-0', header: 'p-0', footer: 'p-0' }"
            @click="creatingListFor = 'new'"
          >
            <div class="flex flex-col items-center gap-2 p-6">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/60 dark:bg-slate-800/60 group-hover:bg-white/80 dark:group-hover:bg-slate-700/80 transition-colors">
                <UIcon name="i-ph-plus" class="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ajouter une liste
              </p>
            </div>
          </UCard>

          <!-- Formulaire d'ajout de liste amélioré -->
          <UCard
            v-else
            class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 shadow-lg"
            :ui="{ body: 'p-4', header: 'p-0', footer: 'p-0' }"
          >
            <UForm
              :schema="listSchema"
              :state="listState"
              class="space-y-3"
              @submit.prevent="createList($event, () => {})"
            >
              <UFormField name="title">
                <UInput
                  v-model="listState.title"
                  placeholder="Titre de la liste..."
                  size="sm"
                  autofocus
                  class="bg-white dark:bg-slate-800"
                />
              </UFormField>
              <div class="flex gap-2">
                <UButton
                  type="submit"
                  size="sm"
                  label="Ajouter"
                  loading-auto
                  icon="i-ph-check"
                />
                <UButton
                  variant="ghost"
                  size="sm"
                  label="Annuler"
                  icon="i-ph-x"
                  @click="creatingListFor = null; listState.title = undefined"
                />
              </div>
            </UForm>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>
