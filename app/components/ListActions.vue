<script setup lang="ts">
import { z } from 'zod'

import type { DropdownMenuItem, FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  list: {
    id: string
    title: string
    color: string
    [key: string]: any
  }
}>()

const schema = z.object({
  title: z.string('Title is required').min(1, 'Title is required'),
  color: z.enum(['GRAY', 'RED', 'YELLOW', 'GREEN', 'SKY', 'BLUE', 'VIOLET', 'PINK'])
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: props.list.title,
  color: props.list.color as Schema['color']
})

const isOpenEdit = ref(false)
const isOpenDelete = ref(false)

const items = ref<DropdownMenuItem[]>([
  {
    label: 'Edit',
    icon: 'i-ph-pencil-simple',
    onSelect: () => isOpenEdit.value = true
  },
  {
    label: 'Delete',
    icon: 'i-ph-trash',
    color: 'error',
    onSelect: () => isOpenDelete.value = true
  }
])

const { add } = useToast()

function reset() {
  state.title = props.list.title
  state.color = props.list.color as Schema['color']
}

async function onSubmitEdit({ data }: FormSubmitEvent<Schema>, next?: () => void) {
  try {
    await $fetch(`/api/lists/${props.list.id}`, {
      method: 'PATCH',
      body: {
        title: data.title,
        color: data.color
      }
    })

    await refreshNuxtData()

    add({
      title: 'List updated',
      description: 'The list has been successfully updated.',
      color: 'success'
    })
    next?.()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Error',
      description: error.message || 'Unable to update the list'
    })
  }
}

async function deleteList(next?: () => void) {
  try {
    await $fetch(`/api/lists/${props.list.id}`, {
      method: 'DELETE'
    })

    await refreshNuxtData()

    add({
      title: 'List deleted',
      description: 'The list has been successfully deleted.',
      color: 'success'
    })
    next?.()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Error',
      description: error.message || 'Unable to delete the list'
    })
  }
}
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      variant="ghost"
      color="neutral"
      icon="i-ph-dots-three"
      size="sm"
    />
  </UDropdownMenu>

  <UModal v-model:open="isOpenEdit" :title="`Edit ${list.title}`" @update:open="reset">
    <template #body="{ close }">
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit.prevent="onSubmitEdit($event, close)"
      >
        <UFormField name="title" label="Title">
          <UInput v-model="state.title" :placeholder="props.list.title" class="w-full" />
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
            label="Edit"
            loading-auto
          />
        </div>
      </UForm>
    </template>
  </UModal>

  <UModal v-model:open="isOpenDelete" :title="`Delete ${list.title}`" :ui="{ footer: 'justify-end' }">
    <template #body>
      <p class="text-sm text-muted">
        Are you sure you want to delete this list? This action cannot be undone.
      </p>
    </template>
    <template #footer="{ close }">
      <UButton
        variant="link"
        color="neutral"
        label="Cancel"
        @click="close()"
      />
      <UButton
        color="error"
        label="Delete"
        loading-auto
        @click="deleteList(close)"
      />
    </template>
  </UModal>
</template>
