<script setup lang="ts">
// @ts-ignore
import { Container, Draggable } from 'vue3-smooth-dnd'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard'
})

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

const schema = z.object({
  title: z.string('Title is required').min(1, 'Title is required'),
  color: z.enum(['GRAY', 'RED', 'YELLOW', 'GREEN', 'SKY', 'BLUE', 'VIOLET', 'PINK'])
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: undefined,
  color: 'GRAY'
})

const cardModalOpen = ref(false)
const selectedCard = ref<{
  id: string
  title: string
  description?: string | null
  labels?: Array<{ id: string, name: string, color: string }>
} | null>(null)
const cardEditDraft = ref({ title: '', description: '' })

function openCardModal(card: {
  id: string
  title: string
  description?: string | null
  labels?: Array<{ id: string, name: string, color: string }>
}) {
  selectedCard.value = card
  cardEditDraft.value = {
    title: card.title,
    description: card.description ?? ''
  }
  cardModalOpen.value = true
}

async function deleteCard(cardId: string, close: () => void) {
  try {
    await $fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
    await refresh()
    close()
    add({
      title: 'Card deleted',
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Error',
      description: error?.data?.message ?? error?.message ?? 'Failed to delete the card'
    })
  }
}

async function updateCard(
  cardId: string,
  payload: { title: string, description?: string | null }
) {
  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: {
        title: payload.title,
        description: payload.description ?? undefined
      }
    })
    await refresh()
    add({
      title: 'Card updated',
      color: 'success'
    })
    cardModalOpen.value = false
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Error',
      description: error?.data?.message ?? error?.message ?? 'Failed to update the card'
    })
  }
}

async function createList({ data }: FormSubmitEvent<Schema>, next?: () => void) {
  if (!board.value) return

  try {
    const maxPosition = board.value.lists.length > 0
      ? Math.max(...board.value.lists.map(l => l.position)) + POSITION_GAP
      : POSITION_GAP

    await $fetch(`/api/boards/${params.id}/lists`, {
      method: 'POST',
      body: {
        title: data.title,
        position: maxPosition,
        color: data.color
      }
    })

    await refresh()
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

function applyDrag(arr: any[], dragResult: any) {
  const { removedIndex, addedIndex, payload } = dragResult

  if (removedIndex === null && addedIndex === null) return arr

  const result = [...arr]
  let itemToAdd = payload

  if (removedIndex !== null) {
    itemToAdd = result.splice(removedIndex, 1)[0]
  }

  if (addedIndex !== null) {
    result.splice(addedIndex, 0, itemToAdd)
  }

  return result
}

const getCardPayload = (listId: string) => (index: number) => {
  const list = board.value?.lists.find(l => l.id === listId)
  const card = list?.cards[index]

  return card ? JSON.parse(JSON.stringify(card)) : undefined
}

const POSITION_GAP = 1000

function calculateNewPosition(cards: any[], index: number) {
  if (cards.length <= 1) return POSITION_GAP

  if (index === 0) {
    return cards[1].position / 2
  }

  if (index === cards.length - 1) {
    return cards[index - 1].position + POSITION_GAP
  }

  const prevPos = cards[index - 1].position
  const nextPos = cards[index + 1].position

  return (prevPos + nextPos) / 2
}

async function onCardDrop(listId: string, dropResult: any) {
  if (!board.value || dropResult.removedIndex === null && dropResult.addedIndex === null) return

  const listIndex = board.value.lists.findIndex(l => l.id === listId)
  if (listIndex === -1) return

  const list = board.value.lists[listIndex]

  const newCards = applyDrag(list!.cards, dropResult)

  board.value.lists[listIndex]!.cards = newCards

  if (dropResult.addedIndex !== null) {
    const card = dropResult.payload
    const newIndex = dropResult.addedIndex
    const newPosition = calculateNewPosition(newCards, newIndex)

    if (newCards[newIndex]) {
      newCards[newIndex].position = newPosition
    }

    try {
      await $fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        body: {
          listId: listId,
          position: newPosition
        }
      })
    } catch (error: any) {
      add({
        color: 'error',
        title: 'Error',
        description: error.message || 'Unable to move the card'
      })

      await refresh()
    }
  }
}

const getListPayload = (index: number) => {
  const list = board.value?.lists[index]

  return list ? JSON.parse(JSON.stringify(list)) : undefined
}

async function onListDrop(dropResult: any) {
  if (!board.value || (dropResult.removedIndex === null && dropResult.addedIndex === null)) return

  const newLists = applyDrag(board.value.lists, dropResult)
  board.value.lists = newLists

  if (dropResult.addedIndex !== null && dropResult.removedIndex !== dropResult.addedIndex) {
    const list = dropResult.payload
    const newIndex = dropResult.addedIndex

    const newPosition = calculateNewPosition(newLists, newIndex)

    if (newLists[newIndex]) {
      newLists[newIndex].position = newPosition
    }

    try {
      await $fetch(`/api/lists/${list.id}`, {
        method: 'PATCH',
        body: {
          boardId: board.value.id,
          position: newPosition
        }
      })
    } catch (error: any) {
      add({
        color: 'error',
        title: 'Error',
        description: error.message || 'Unable to move the list'
      })

      await refresh()
    }
  }
}
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
      <UModal title="Create a new list">
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
            <UFormField
              name="title"
              label="Title"
            >
              <UInput
                v-model="state.title"
                placeholder="e.g. In progress"
                class="w-full"
              />
            </UFormField>
            <UFormField
              name="color"
              label="Color"
            >
              <USelect
                v-model="state.color"
                :items="colorItems"
                value-key="value"
                class="w-32"
              >
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

    <UModal
      v-model:open="cardModalOpen"
      :title="cardEditDraft.title"
      :ui="{ content: 'max-w-2xl' }"
    >
      <template #body="{ close }">
        <div v-if="selectedCard" class="flex w-full gap-6">
          <div class="min-w-0 flex-1 overflow-y-auto space-y-5">
            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                Title
              </label>
              <UInput
                v-model="cardEditDraft.title"
                placeholder="Card title"
                class="w-full"
              />
            </div>
            <div v-if="selectedCard.labels?.length" class="space-y-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-muted">
                Labels
              </label>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="label in selectedCard.labels"
                  :key="label.id"
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium text-white"
                  :style="{ backgroundColor: label.color }"
                >
                  {{ label.name }}
                </span>
              </div>
            </div>
            <div>
              <label class="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                Description
              </label>
              <UTextarea
                v-model="cardEditDraft.description"
                placeholder="Add a description..."
                class="w-full min-h-[120px]"
                autoresize
              />
            </div>
            <UButton
              label="Save"
              color="primary"
              @click="updateCard(selectedCard.id, { title: cardEditDraft.title, description: cardEditDraft.description || null })"
            />
          </div>
          <div class="w-50 shrink-0 border-l border-default pl-6 ml-6">
            <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
              Actions
            </p>
            <nav class="flex flex-col gap-1.5">
              <UButton
                variant="soft"
                color="neutral"
                icon="i-ph-tag"
                label="Labels"
              />
              <UButton
                variant="soft"
                color="neutral"
                icon="ph:calendar-blank"
                label="Start date"
              />
              <UButton
                variant="soft"
                color="neutral"
                icon="i-ph-calendar"
                label="Due date"
              />
              <UButton
                variant="soft"
                color="error"
                icon="i-ph-trash"
                label="Delete"
                @click="deleteCard(selectedCard.id, close)"
              />
            </nav>
          </div>
        </div>
      </template>
    </UModal>
  </ClientOnly>

  <div class="flex-1 flex flex-col overflow-hidden">
    <UEmpty
      v-if="!board?.lists.length"
      variant="naked"
      icon="i-ph-cards-three"
      title="This board is empty"
      description="Start by adding lists and cards to organize your tasks."
      :actions="[
        {
          label: 'Create a new list'
        }
      ]"
      class="flex-1 sm:p-0 lg:p-0 sm:pb-32 lg:pb-32"
    />

    <div
      v-else
      class="flex flex-col flex-1 min-w-0 overflow-x-auto"
    >
      <Container
        group-name="lists"
        tag="div"
        orientation="horizontal"
        drag-class="transform rotate-2 transition-transform"
        drop-class="transition-transform"
        class="flex! gap-4 flex-1 p-4"
        :get-child-payload="getListPayload"
        @drop="onListDrop"
      >
        <Draggable
          v-for="list in board?.lists || []"
          :key="list.id"
        >
          <UCard
            variant="subtle"
            class="flex flex-col shrink-0 w-72 h-fit"
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

              <div class="flex">
                <CreateCardModal
                  :board-id="board.id"
                  :list-id="list.id"
                />
                <ListActions :list="list" />
              </div>
            </div>
            <Container
              group-name="cards"
              tag="div"
              :should-accept-drop="(e: any) => (e.groupName === 'cards')"
              :get-child-payload="getCardPayload(list.id)"
              :drop-placeholder="{
                className: 'bg-elevated border border-dashed border-muted mb-2',
                animationDuration: 150
              }"
              drag-class="transition-transform ease-in z-50 transform rotate-2"
              drop-class="transition-transform ease-in z-50"
              class="flex flex-col flex-1"
              @drop="onCardDrop(list.id, $event)"
            >
              <Draggable
                v-for="card in list.cards"
                :key="card.id"
              >
                <UCard
                  class="ring-inset mb-2 cursor-pointer"
                  @click="openCardModal(card)"
                >
                  <p class="font-medium">
                    {{ card.title }}
                  </p>
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
              </Draggable>
            </Container>
          </UCard>
        </Draggable>
      </Container>
    </div>
  </div>
</template>
