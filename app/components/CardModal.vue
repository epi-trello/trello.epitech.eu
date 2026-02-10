<script setup lang="ts">
import { type CalendarDate } from '@internationalized/date'

const props = defineProps<{
  boardId: string
  cardId: string
}>()

const emits = defineEmits<{
  change: []
}>()

const { add } = useToast()

const { data: card, refresh } = await useFetch(`/api/cards/${props.cardId}`)

const { data: labels } = await useFetch(`/api/boards/${props.boardId}/labels`, {
  transform: data => data.map(label => ({
    value: label.id,
    label: label.name,
    color: label.color
  }))
})

const selectedLabels = ref<{ value: string, label: string, color: string }[] | undefined>(card.value?.labels.map(label => ({
  value: label.id,
  label: label.name,
  color: label.color
})))

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

  selectedLabels.value = [
    ...(selectedLabels.value || []),
    { label: label.name, value: label.id, color: label.color }
  ]

  await refresh()
  loadingLabel.value = false
}

async function setLabels() {
  const currentLabelIds = card.value?.labels.map(label => label.id) || []
  const selectedLabelIds = selectedLabels.value?.map(label => label.value) || []

  if (JSON.stringify(currentLabelIds.sort()) === JSON.stringify(selectedLabelIds.sort())) {
    return
  }

  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        labels: selectedLabels.value?.map(label => label.value)
      }
    })

    emits('change')
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to set labels',
      description: error.message || 'An unexpected error occurred'
    })
  }
}

async function setStartDate() {
  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        startDate: startDate.value ? startDate.value.toString() : null
      }
    })

    emits('change')
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to set start date',
      description: error.message || 'An unexpected error occurred'
    })
  }
}

const startDateRef = useTemplateRef('startDateRef')
const startDate = shallowRef<CalendarDate | undefined>(card.value?.startDate ? dateToCalendarDate(card.value.startDate) : undefined)

async function setDueDate() {
  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        dueDate: dueDate.value ? dueDate.value.toString() : null
      }
    })

    emits('change')
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to set due date',
      description: error.message || 'An unexpected error occurred'
    })
  }
}

const dueDateRef = useTemplateRef('dueDateRef')
const dueDate = shallowRef<CalendarDate | undefined>(card.value?.dueDate ? dateToCalendarDate(card.value.dueDate) : undefined)

const description = ref(card.value?.description || '')

async function setDescription() {
  if (description.value === card.value?.description) {
    return
  }

  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        description: description.value
      }
    })

    emits('change')
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to set description',
      description: error.message || 'An unexpected error occurred'
    })
  }
}

const title = ref(card.value?.title || '')

async function setTitle() {
  if (title.value === card.value?.title) {
    return
  }

  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        title: title.value
      }
    })

    emits('change')
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to set title',
      description: error.message || 'An unexpected error occurred'
    })
  }
}
</script>

<template>
  <UModal
    :title="card?.title"
    :ui="{
      content: 'max-w-2xl'
    }"
  >
    <slot />

    <template #title>
      <UInput color="neutral" variant="none" v-model.trim="title" size="xl" :ui="{ base: 'p-0' }" @blur="setTitle" />
    </template>

    <template #body>
      <div class="flex w-full">
        <div class="w-full overflow-y-auto">
          <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Description
          </p>
          <UTextarea placeholder="Type something..." v-model.trim="description" autoresize class="w-full" @blur="setDescription" />
        </div>
        <div class="w-50 shrink-0 border-l border-default pl-6 ml-6">
          <p class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
            Actions
          </p>
          <nav class="flex flex-col gap-1.5">
            <label class="text-xs font-medium">
              Labels
            </label>
            <USelectMenu
              v-model="selectedLabels"
              size="sm"
              multiple
              class="w-full"
              placeholder="Select labels"
              create-item
              :items="labels"
              :loading="loadingLabel"
              :ui="{ item: 'items-center' }"
              @create="onCreateLabel"
              @blur="setLabels"
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
            <label class="text-xs font-medium">
              Start Date
            </label>
            <UInputDate
              ref="startDateRef"
              v-model="startDate"
              size="sm"
              @blur="setStartDate"
            >
              <template #trailing>
                <UPopover :reference="startDateRef?.inputsRef[3]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="Select a date"
                    class="px-0"
                  />

                  <template #content>
                    <UCalendar
                      v-model="startDate"
                      class="p-2"
                      @update:model-value="setStartDate"
                    />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
            <label class="text-xs font-medium">
              Due Date
            </label>
            <UInputDate
              ref="dueDateRef"
              v-model="dueDate"
              size="sm"
              @blur="setDueDate"
            >
              <template #trailing>
                <UPopover :reference="dueDateRef?.inputsRef[3]?.$el">
                  <UButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    icon="i-lucide-calendar"
                    aria-label="Select a date"
                    class="px-0"
                  />

                  <template #content>
                    <UCalendar
                      v-model="dueDate"
                      class="p-2"
                      @update:model-value="setDueDate"
                    />
                  </template>
                </UPopover>
              </template>
            </UInputDate>
            <USeparator class="my-2" />
            <UButton
              variant="soft"
              color="error"
              icon="i-ph-trash"
              label="Delete"
            />
          </nav>
        </div>
      </div>
    </template>
  </UModal>
</template>
