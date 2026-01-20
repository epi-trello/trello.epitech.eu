<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard'
})

const { add } = useToast()
const title = usePageTitle()

title.value = 'Boards'

const schema = z.object({
  name: z
    .string({ message: 'Please enter a name for your board' })
    .min(3, { message: 'Board name must be at least 3 characters long' })
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined
})

const { data: boards, refresh } = await useFetch('/api/boards')

async function onSubmit({ data }: FormSubmitEvent<Schema>, next?: () => void) {
  try {
    await $fetch('/api/boards', {
      method: 'post',
      body: {
        name: data.name
      }
    })

    await refresh()
    next?.()

    add({
      title: 'Board created',
      description: "Your new board has been created successfully.",
      color: 'success'
    })
  } catch (error: any) {
    add({
      color: 'error',
      title: "Error while creating board",
      description: error.message
    })
  }
}

async function deleteBoard(boardId: string, next?: () => void) {
  try {
    await $fetch(`/api/boards/${boardId}`, {
      method: 'DELETE'
    })

    await refresh()
    next?.()

    add({
      title: 'Board deleted',
      description: 'The board has been deleted successfully.',
      color: 'success'
    })
  } catch (error) {
    add({
      title: 'Error while deleting board',
      description: 'Unable to delete the board.',
      color: 'error'
    })
  }
}
</script>

<template>
  <ClientOnly>
    <Teleport to="#navbar-actions">
      <UModal title="Create a new board" @update:open="state.name = undefined">
        <UButton
          icon="i-ph-plus"
          label="Create"
        />

        <template #body="{ close }">
          <UForm
            :schema="schema"
            :state="state"
            class="space-y-4"
            @submit.prevent="onSubmit($event, close)"
          >
            <UFormField
              label="Name"
              name="name"
            >
              <UInput
                v-model="state.name"
                placeholder="e.g. Minishell"
                class="w-full"
              />
            </UFormField>

            <div class="flex w-full justify-end">
              <UButton
                type="submit"
                label="Create Board"
                loading-auto
              />
            </div>
          </UForm>
        </template>
      </UModal>
    </Teleport>
  </ClientOnly>

  <UContainer class="py-8">
    <UPageGrid>
      <UPageCard
        v-for="board in boards"
        :key="board.id"
        :title="board.name"
        :to="`/boards/${board.id}`"
        icon="i-ph-kanban"
        class="group/card"
      >
        <UModal
          :title="`Delete ${board.name}`"
          :ui="{ footer: 'justify-end' }"
        >
          <UButton
            variant="link"
            color="neutral"
            icon="i-ph-trash"
            class="absolute right-0 z-1 hidden group-hover/card:inline-flex"
          />

          <template #body>
            <p class="text-muted text-sm">
              Deleting a board is irreversible.
              All associated lists and cards will be permanently removed.
              Are you sure you want to proceed?
            </p>
          </template>

          <template #footer="{ close }">
            <UButton
              variant="ghost"
              color="neutral"
              label="Cancel"
              @click="close"
            />
            <UButton
              color="error"
              label="Delete"
              loading-auto
              @click="deleteBoard(board.id, close)"
            />
          </template>
        </UModal>
      </UPageCard>
    </UPageGrid>
  </UContainer>
</template>
