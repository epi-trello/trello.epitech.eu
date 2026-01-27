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
const isModalOpen = ref(false)

function openModalWithSuggestion(suggestion?: string) {
  // Réinitialiser le nom si pas de suggestion
  if (!suggestion) {
    state.name = undefined
  } else {
    state.name = suggestion
  }
  // Ouvrir le modal
  isModalOpen.value = true
}

async function onSubmit({ data }: FormSubmitEvent<Schema>, next?: () => void) {
  try {
    await $fetch('/api/boards', {
      method: 'post',
      body: {
        name: data.name
      }
    })

    await refresh()
    
    // Réinitialiser le state avant de fermer le modal
    state.name = undefined
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
      <UModal v-model="isModalOpen" title="Create a new board" @update:open="(val) => { isModalOpen = val; if (!val) state.name = undefined }">
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
    <!-- État vide - Affiche quand il n'y a pas de boards -->
    <div
      v-if="!boards || boards.length === 0"
      class="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <div class="relative mb-8 py-16">
        <!-- Illustration avec gradient animé -->
        <div class="relative w-64 h-64 mx-auto">
          <!-- Effet de lumière externe avec blur - s'étend naturellement sans limite -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 rounded-full opacity-20 blur-3xl animate-pulse" />
          <div class="relative w-full h-full flex items-center justify-center z-10">
            <div class="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-200/50 dark:border-slate-700/50">
              <UIcon
                name="i-ph-kanban"
                class="w-24 h-24 text-slate-400 dark:text-slate-500"
              />
            </div>
          </div>
        </div>
      </div>

      <h2 class="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-4">
        Créez votre premier tableau
      </h2>
      <p class="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        Organisez vos projets, suivez vos tâches et collaborez efficacement avec votre équipe. 
        Commencez par créer votre premier tableau Kanban.
      </p>

      <!-- Bouton CTA principal -->
      <UModal v-model="isModalOpen" title="Create a new board" @update:open="(val) => { isModalOpen = val; if (!val) state.name = undefined }">
        <UButton
          size="lg"
          icon="i-ph-plus-circle"
          label="Créer mon premier tableau"
          class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300"
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

      <!-- Suggestions de tableaux -->
      <div class="mt-12 w-full max-w-2xl">
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
          Suggestions de tableaux populaires :
        </p>
        <div class="flex flex-wrap gap-3 justify-center">
          <UButton
            v-for="suggestion in ['Minishell', 'MyRPG', 'CPE', 'B2 - Projet']"
            :key="suggestion"
            variant="outline"
            size="sm"
            class="hover:bg-slate-100 dark:hover:bg-slate-800"
            @click="openModalWithSuggestion(suggestion)"
          >
            {{ suggestion }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Liste des boards existants -->
    <UPageGrid v-else>
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
