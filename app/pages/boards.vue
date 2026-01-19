<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  auth: {}
})

const toast = useToast()

interface Board {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

const boards = ref<Board[]>([])
const loading = ref(true)
const creating = ref(false)

const createBoardSchema = z.object({
  name: z.string({ message: 'Veuillez entrer un nom pour votre tableau' })
    .min(1, 'Veuillez entrer un nom pour votre tableau')
    .max(10, 'Le nom ne peut pas dépasser 40 caractères')
})

type CreateBoardSchema = z.output<typeof createBoardSchema>

const createBoardState = reactive<Partial<CreateBoardSchema>>({
  name: ''
})


async function fetchBoards() {
  try {
    loading.value = true
    const data = await $fetch<Board[]>('/api/boards')
    boards.value = data
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de charger les tableaux',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

async function createBoard({ data }: FormSubmitEvent<CreateBoardSchema>) {
  try {
    creating.value = true
    const newBoard = await $fetch<Board>('/api/boards', {
      method: 'POST',
      body: {
        name: data.name
      }
    })
    boards.value.push(newBoard)
    createBoardState.name = undefined
    toast.add({
      title: 'Succès',
      description: 'Tableau créé avec succès',
      color: 'success'
    })
  } catch (error: any) {
    toast.add({
      title: 'Erreur',
      description: error.data?.message || 'Impossible de créer le tableau',
      color: 'error'
    })
  } finally {
    creating.value = false
  }
}

async function deleteBoard(boardId: string) {
  try {
    await $fetch(`/api/boards/${boardId}`, {
      method: 'DELETE'
    })
    boards.value = boards.value.filter(b => b.id !== boardId)
    toast.add({
      title: 'Succès',
      description: 'Tableau supprimé avec succès',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Erreur',
      description: 'Impossible de supprimer le tableau',
      color: 'error'
    })
  }
}

function showBoardDetails(boardId: string) {
  // TODO: Implémenter l'affichage des détails du tableau
  toast.add({
    title: 'Détails',
    description: 'Affichage des détails du tableau',
    color: 'info'
  })
}

function editBoard(boardId: string) {
  // TODO: Implémenter la modification du tableau
  toast.add({
    title: 'Modifier',
    description: 'Modification du tableau',
    color: 'info'
  })
}

onMounted(() => {
  fetchBoards()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        Mes Tableaux
      </h1>
      <p class="text-muted mb-6">
        Gérez vos projets et organisez vos tâches
      </p>
      
      <UForm
        :schema="createBoardSchema"
        :state="createBoardState"
        class="flex gap-3 max-w-md items-start"
        @submit.prevent="createBoard"
      >
        <div class="flex-1">
          <UFormField
            label="Nom du tableau"
            name="name"
            required
          >
            <UInput
              v-model="createBoardState.name"
              placeholder="Nom du tableau (ex: Projet Minishell)"
              size="lg"
            />
          </UFormField>
        </div>
        <div class="flex-shrink-0">
          <UButton
            type="submit"
            icon="i-ph-plus"
            size="lg"
            :loading="creating"
          >
            Créer
          </UButton>
        </div>
      </UForm>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <UIcon
        name="i-ph-circle-notch"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <div
      v-else-if="boards.length === 0"
      class="text-center py-12"
    >
      <UIcon
        name="i-ph-cards-three"
        class="w-16 h-16 mx-auto mb-4 text-muted"
      />
      <h3 class="text-xl font-semibold mb-2">
        Aucun tableau
      </h3>
      <p class="text-muted mb-6">
        Créez votre premier tableau pour commencer à organiser vos projets
      </p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <UCard
        v-for="board in boards"
        :key="board.id"
        class="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/50"
        @click="navigateTo(`/boards/${board.id}`)"
      >
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div class="relative p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0 pr-2">
              <h3 class="font-bold text-base mb-2 truncate">
                {{ board.name }}
              </h3>
              <p class="text-muted text-xs">
                {{ new Date(board.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) }}
              </p>
            </div>
            <UDropdownMenu
              :items="[
                [
                  {
                    label: 'Détails',
                    icon: 'i-ph-info',
                    click: () => showBoardDetails(board.id)
                  },
                  {
                    label: 'Modifier',
                    icon: 'i-ph-pencil',
                    click: () => editBoard(board.id)
                  },
                  {
                    label: 'Supprimer',
                    icon: 'i-ph-trash',
                    click: () => deleteBoard(board.id),
                    color: 'error'
                  }
                ]
              ]"
              :popper="{ placement: 'bottom-end', offset: [-20, 8] }"
            >
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-ph-dots-three"
                size="xs"
                class="opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1"
                @click.stop
              />
            </UDropdownMenu>
          </div>
          
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-ph-arrow-right"
              class="text-xs"
              @click.stop="navigateTo(`/boards/${board.id}`)"
            >
              Ouvrir
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
