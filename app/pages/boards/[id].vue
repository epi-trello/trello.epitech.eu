<script setup lang="ts">
import { colorItems, getColors } from '~/utils/lib'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard'
})

type SortableInstance = { destroy: () => void }

const { params } = useRoute()
const title = usePageTitle()
const { add } = useToast()

const { data: _board, refresh } = await useFetch(`/api/boards/${params.id}`)
const board = ref(_board.value)

watch(_board, (newBoard) => {
  if (newBoard) {
    board.value = newBoard
  }
})

title.value = board.value ? board.value.name : 'Unknown'

// Copie locale des listes pour Sortable.js (comme avant le merge)
const lists = ref<NonNullable<typeof _board.value>['lists']>([])

watch(() => board.value?.lists, (newLists) => {
  if (!newLists) return
  lists.value = newLists.map(l => ({ ...l, cards: (l.cards || []).map(c => ({ ...c })) }))
}, { immediate: true, deep: true })

const schema = z.object({
  title: z.string('Title is required').min(1, 'Title is required'),
  color: z.enum(['GRAY', 'RED', 'YELLOW', 'GREEN', 'SKY', 'BLUE', 'VIOLET', 'PINK'])
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: undefined,
  color: 'GRAY'
})

const createListModalOpen = ref(false)

async function createList({ data }: FormSubmitEvent<Schema>, next?: () => void) {
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
        color: data.color
      }
    })

    await refreshNuxtData()
    next?.()
    state.title = undefined

    add({
      title: 'List created',
      description: 'The new list has been successfully created.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Error',
      description: error.message || 'Unable to create the list'
    })
  }
}

// Sortable.js : même logique qu’avant le merge (commit 95773a6)
async function moveCard(cardId: string, newListId: string, newPosition: number) {
  if (!board.value) return
  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: { listId: newListId, position: newPosition }
    })
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Error',
      description: error.message || 'Unable to move the card'
    })
    await refresh()
  }
}

const boardListsContainerRef = ref<HTMLElement | null>(null)
const sortableInstances = ref<Record<string, SortableInstance>>({})

function initSortables() {
  if (import.meta.server || !lists.value.length || !boardListsContainerRef.value) return

  nextTick(() => {
    requestAnimationFrame(async () => {
      const Sortable = (await import('sortablejs')).default
      const container = boardListsContainerRef.value
      if (!container) return

      for (const list of lists.value) {
        const el = container.querySelector<HTMLElement>(`[data-list-id="${list.id}"]`)
        if (!el) continue
        const existing = sortableInstances.value[list.id]
        if (existing) {
          existing.destroy()
          delete sortableInstances.value[list.id]
        }

        const sortable = Sortable.create(el, {
          group: 'cards',
          animation: 150,
          ghostClass: 'opacity-50',
          chosenClass: 'cursor-grabbing',
          dragClass: 'cursor-grabbing',
          dataIdAttr: 'data-id',
          forceFallback: false,
          onEnd(evt: { item: HTMLElement, from: HTMLElement, to: HTMLElement, oldIndex?: number, newIndex?: number }) {
            const itemEl = evt.item
            const cardId = itemEl?.getAttribute?.('data-id')
            const toListId = evt.to?.getAttribute?.('data-list-id')
            if (!cardId || !toListId) return

            const from = evt.from
            const children = Array.from(from.children)
            const oldIndex = evt.oldIndex ?? 0
            const insertBefore = children[oldIndex] ?? null
            from.insertBefore(itemEl, insertBefore)

            moveCard(cardId, toListId, evt.newIndex ?? 0)
          }
        })
        sortableInstances.value[list.id] = sortable as SortableInstance
      }
    })
  })
}

watch(
  () => [boardListsContainerRef.value, lists.value.length] as const,
  () => initSortables(),
  { flush: 'post', immediate: false }
)

onMounted(() => {
  nextTick(() => {
    setTimeout(initSortables, 50)
  })
})

onBeforeUnmount(() => {
  Object.values(sortableInstances.value).forEach(s => s?.destroy())
})
</script>

<template>
  <ClientOnly>
    <Teleport to="#navbar-left">
      <UButton
        to="/boards"
        variant="ghost"
        color="neutral"
        size="sm"
        icon="i-ph-arrow-left"
        class="mr-2"
      />
    </Teleport>

    <Teleport to="#navbar-right">
      <UModal v-model:open="createListModalOpen" title="Create a new list">
        <UButton
          icon="i-ph-plus"
          label="New list"
        />

        <template #body="{ close }">
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit.prevent="createList($event, close)"
          >
            <UFormField name="title" label="Title">
              <UInput v-model="state.title" placeholder="e.g. In progress" class="w-full" />
            </UFormField>
            <UFormField name="color" label="Color">
              <USelect v-model="state.color" :items="colorItems" value-key="value" class="w-32">
                <template #leading="{ modelValue }">
                  <div
                    class="size-5 rounded-full border-2"
                    :class="getColors(modelValue!)"
                  />
                </template>
                <template #item-leading="{ item }">
                  <div
                    class="size-5 rounded-full border-2"
                    :class="getColors(item.value)"
                  />
                </template>
              </USelect>
            </UFormField>
            <div class="flex w-full justify-end">
              <UButton
                type="submit"
                label="Create list"
                loading-auto
              />
            </div>
          </UForm>
        </template>
      </UModal>
    </Teleport>

    <div class="flex-1 flex flex-col overflow-hidden">
      <UEmpty
        v-if="!board?.lists?.length"
        variant="naked"
        icon="i-ph-cards-three"
        title="This board is empty"
        description="Start by adding lists and cards to organize your tasks."
        class="flex-1 sm:p-0 lg:p-0 sm:pb-32 lg:pb-32"
      >
        <template #actions>
          <UButton
            icon="i-ph-plus"
            label="Create a new list"
            @click="createListModalOpen = true"
          />
        </template>
      </UEmpty>

      <!-- Même structure qu’avant le merge : ref sur le conteneur, querySelector pour [data-list-id] -->
      <div class="flex flex-col flex-1 min-w-0 overflow-x-auto">
        <div ref="boardListsContainerRef" class="flex gap-4 flex-1 p-4 min-w-fit">
          <div
            v-for="list in lists"
            :key="list.id"
            class="flex flex-col shrink-0 w-72"
          >
            <UCard
              variant="subtle"
              class="flex flex-col h-fit"
              :ui="{
                body: 'flex flex-col gap-4 flex-1 sm:p-4'
              }"
            >
              <div class="flex justify-between">
                <div class="flex items-center gap-2">
                  <div
                    class="size-5 rounded-full border-2"
                    :class="getColors(list.color)"
                  />
                  <p>{{ list.title }}</p>
                </div>

<div v-if="board" class="flex">
                  <CreateCardModal :board-id="board.id" :list-id="list.id" />
                  <ListActions :list="list" />
                </div>
              </div>
              <!-- Conteneur Sortable.js (data-list-id pour querySelector + onEnd) -->
              <div
                :data-list-id="list.id"
                class="flex flex-col flex-1 min-h-24 rounded-md space-y-2"
              >
                <div
                  v-for="card in list.cards"
                  :key="card.id"
                  :data-id="card.id"
                  class="cursor-grab active:cursor-grabbing"
                  @click="navigateTo(`/boards/${board?.id}/cards/${card.id}`)"
                >
                  <UCard class="ring-inset">
                    <p class="font-medium">{{ card.title }}</p>
                    <div class="flex mt-1">
                      <UBadge
                        v-for="label in card.labels"
                        :key="label.id"
                        variant="outline"
                        color="neutral"
                        :label="label.name"
                        size="sm"
                        class="mr-1"
                      >
                        <template #leading>
                          <span
                            class="inline-block rounded-full size-2 shrink-0 ml-1"
                            :style="{ backgroundColor: label.color }"
                          />
                        </template>
                      </UBadge>
                    </div>
                  </UCard>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="flex flex-col h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
        <p class="text-slate-500 dark:text-slate-400">Chargement du tableau...</p>
      </div>
    </template>
  </ClientOnly>
</template>
