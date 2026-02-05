<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { colorItems, getColors } from '~/utils/lib'
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

async function onListDragEnd(evt: { oldIndex: number, newIndex: number }) {
  if (!board.value || evt.oldIndex === evt.newIndex) return

  const list = board.value.lists[evt.newIndex]
  if (!list) return

  try {
    await $fetch(`/api/lists/${list.id}`, {
      method: 'PATCH',
      body: {
        boardId: board.value.id,
        position: evt.newIndex * 1000 + 1000
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

async function onCardDragEnd(evt: { item: HTMLElement, to: { el: HTMLElement }, from?: { el: HTMLElement }, newIndex: number, oldIndex: number }) {
  const cardId = evt.item?.dataset?.cardId
  const toListId = evt.to?.el?.dataset?.listId
  if (!board.value || !cardId || !toListId) return
  if (evt.oldIndex === evt.newIndex && evt.from?.el === evt.to?.el) return

  try {
    await $fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: {
        listId: toListId,
        position: evt.newIndex * 1000 + 1000
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
        :actions="[
          {
            label: 'Create a new list'
          }
        ]"
        class="flex-1 sm:p-0 lg:p-0 sm:pb-32 lg:pb-32"
      />

      <div v-else class="flex flex-col flex-1 min-w-0 overflow-x-auto">
        <VueDraggable
          v-model="board.lists"
          group="lists"
          tag="div"
          class="flex gap-4 flex-1 p-4"
          ghost-class="opacity-50"
          chosen-class="ring-2 ring-primary/50"
          drag-class="cursor-grabbing"
          @end="onListDragEnd"
        >
          <UCard
            v-for="list in board.lists"
            :key="list.id"
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
                <CreateCardModal :board-id="board.id" :list-id="list.id" />
                <ListActions :list="list" />
              </div>
            </div>
            <VueDraggable
              v-model="list.cards"
              group="cards"
              tag="div"
              :data-list-id="list.id"
              class="flex flex-col flex-1 min-h-2"
              ghost-class="opacity-50"
              chosen-class="ring-2 ring-primary/30"
              drag-class="cursor-grabbing"
              @end="onCardDragEnd"
            >
              <div
                v-for="card in list.cards"
                :key="card.id"
                :data-card-id="card.id"
                class="mb-2"
              >
                <NuxtLink :to="`/boards/${board?.id}/cards/${card.id}`" class="block">
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
                </NuxtLink>
              </div>
            </VueDraggable>
          </UCard>
        </VueDraggable>
      </div>
    </div>

    <template #fallback>
      <div class="flex flex-col h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8">
        <p class="text-slate-500 dark:text-slate-400">Chargement du tableau...</p>
      </div>
    </template>
  </ClientOnly>
</template>
