<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  boardId: string
  listId: string
}>()

const emits = defineEmits<{
  submit: []
}>()

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  listId: z.string(),
  startDate: z
    .custom<CalendarDate>((value) => value instanceof CalendarDate, {
      message: 'Invalid date format'
    })
    .optional(),
  dueDate: z
    .custom<CalendarDate>((value) => value instanceof CalendarDate, {
      message: 'Invalid date format'
    })
    .optional(),
  labels: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        color: z.string()
      })
    )
    .optional()
})

type Schema = z.output<typeof schema>

const state = shallowReactive<Partial<Schema>>({
  title: '',
  description: undefined,
  listId: props.listId,
  startDate: undefined,
  dueDate: undefined,
  labels: undefined
})

const { add } = useToast()

const startDate = useTemplateRef('startDate')
const dueDate = useTemplateRef('dueDate')

const { data: lists } = await useFetch(`/api/boards/${props.boardId}/lists`, {
  transform: (data) =>
    data.map((list) => ({
      id: list.id,
      label: list.title,
      color: list.color,
      cards: list.cards
    }))
})

const { data: labels, refresh } = await useFetch(
  `/api/boards/${props.boardId}/labels`,
  {
    transform: (data) =>
      data.map((label) => ({
        value: label.id,
        label: label.name,
        color: label.color
      }))
  }
)

async function onSubmit({ data }: FormSubmitEvent<Schema>, next?: () => void) {
  try {
    const list = lists.value?.find((l) => l.id === data.listId)
    const maxPosition =
      list && list.cards.length > 0
        ? Math.max(...list.cards.map((c) => c.position)) + 1000
        : 1000

    await $fetch(`/api/cards`, {
      method: 'POST',
      body: {
        title: data.title,
        description: data.description,
        position: maxPosition,
        listId: data.listId,
        startDate: data.startDate ? data.startDate.toString() : undefined,
        dueDate: data.dueDate ? data.dueDate.toString() : undefined,
        labels: data.labels ? data.labels.map((label) => label.value) : []
      }
    })

    await refreshNuxtData()

    add({
      title: 'Card created',
      description: 'The new card has been successfully created.',
      color: 'success'
    })

    next?.()
    reset()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to create the card',
      description: error.message || 'An unexpected error occurred'
    })
  }
}

const loadingLabel = ref(false)

async function onCreateLabel(item: string) {
  loadingLabel.value = true

  const label = await $fetch(`/api/boards/${props.boardId}/labels`, {
    method: 'POST',
    body: {
      name: item,
      color: randomHexColor(),
      boardId: props.boardId
    }
  })

  labels.value?.push({ label: label.name, value: label.id, color: label.color })

  state.labels = [
    ...(state.labels || []),
    { label: label.name, value: label.id, color: label.color }
  ]

  await refresh()
  loadingLabel.value = false
}

const colorClasses: Record<string, string> = {
  GRAY: 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600',
  RED: 'bg-red-200 dark:bg-red-900 border-red-400 dark:border-red-600',
  YELLOW:
    'bg-yellow-200 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600',
  GREEN:
    'bg-green-200 dark:bg-green-900 border-green-400 dark:border-green-600',
  SKY: 'bg-sky-200 dark:bg-sky-900 border-sky-400 dark:border-sky-600',
  BLUE: 'bg-blue-200 dark:bg-blue-900 border-blue-400 dark:border-blue-600',
  VIOLET:
    'bg-violet-200 dark:bg-violet-900 border-violet-400 dark:border-violet-600',
  PINK: 'bg-pink-200 dark:bg-pink-900 border-pink-400 dark:border-pink-600'
}

const getColors = (color: string) => {
  return colorClasses[color.toUpperCase()] || colorClasses.GRAY
}

function reset() {
  state.title = ''
  state.description = undefined
  state.startDate = undefined
  state.dueDate = undefined
  state.labels = undefined
}
</script>

<template>
  <UModal title="New card" :ui="{ footer: 'justify-end' }" @update:open="reset">
    <UButton variant="ghost" color="neutral" icon="i-ph-plus" size="sm" />

    <template #body="{ close }">
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit.prevent="onSubmit($event, close)"
      >
        <UFormField name="title" label="Title" required>
          <UInput
            v-model="state.title"
            placeholder="e.g. Fix bug #123"
            class="w-full"
          />
        </UFormField>
        <UFormField name="description" label="Description">
          <UTextarea
            v-model="state.description"
            placeholder="Describe the task..."
            autoresize
            :ui="{ base: 'max-h-64' }"
            class="w-full"
          />
        </UFormField>
        <UFormField name="listId" label="List" required>
          <USelect
            v-model="state.listId"
            class="w-full max-w-36"
            placeholder="Select a list"
            value-key="id"
            label-key="label"
            :items="lists"
          >
            <template #leading="{ modelValue }">
              <div
                class="size-5 rounded-full border-2"
                :class="
                  getColors(
                    lists?.find((list) => list.id === modelValue!)?.color ||
                      'GRAY'
                  )
                "
              />
            </template>
            <template #item-leading="{ item }">
              <div
                class="size-5 rounded-full border-2"
                :class="getColors(item.color)"
              />
            </template>
          </USelect>
        </UFormField>
        <div class="flex gap-4">
          <UFormField name="startDate" label="Start date" class="flex-1">
            <UInputDate ref="startDate" v-model="state.startDate" size="sm">
              <template #trailing>
                <UPopover :reference="startDate?.inputsRef[3]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="Select a date"
                    class="px-0"
                  />

                  <template #content>
                    <UCalendar v-model="state.startDate" class="p-2" />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
          </UFormField>
          <UFormField name="dueDate" label="Due date" class="flex-1">
            <UInputDate ref="dueDate" v-model="state.dueDate" size="sm">
              <template #trailing>
                <UPopover :reference="dueDate?.inputsRef[3]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="Select a date"
                    class="px-0"
                  />

                  <template #content>
                    <UCalendar v-model="state.dueDate" class="p-2" />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
          </UFormField>
          <UFormField name="labels" label="Labels" class="flex-1">
            <USelectMenu
              v-model="state.labels"
              size="sm"
              multiple
              class="w-full max-w-36"
              placeholder="Select labels"
              create-item
              :items="labels"
              :loading="loadingLabel"
              :ui="{ item: 'items-center' }"
              @create="onCreateLabel"
            >
              <template #leading="{ modelValue }">
                <div class="relative flex h-2">
                  <span
                    v-if="modelValue?.[0]"
                    class="absolute z-1 inline-block rounded-full size-2 shrink-0 ring-2 ring-bg"
                    :style="{ backgroundColor: modelValue[0].color }"
                  />
                  <span
                    v-if="modelValue?.[1]"
                    class="absolute left-1.5 inline-block rounded-full size-2 shrink-0"
                    :style="{ backgroundColor: modelValue[1].color }"
                  />
                </div>
              </template>

              <template #item-leading="{ item }">
                <span
                  class="inline-block rounded-full size-2 shrink-0 ml-1"
                  :style="{ backgroundColor: item.color }"
                />
              </template>

              <template #create-item-label="{ item }">
                <span>Create label</span>
                <span class="ml-1">{{ item }}</span>
              </template>
            </USelectMenu>
          </UFormField>
        </div>
        <div class="flex w-full justify-end">
          <UButton type="submit" label="Create card" loading-auto />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
