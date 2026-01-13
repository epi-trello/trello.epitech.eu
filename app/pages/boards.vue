<script setup lang="ts">
import { z } from 'zod'

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
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long')
})

type CreateBoardSchema = z.output<typeof createBoardSchema>

const createBoardState = reactive<Partial<CreateBoardSchema>>({
  name: undefined
})

const isCreateModalOpen = ref(false)

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

async function createBoard() {
  try {
    creating.value = true
    const newBoard = await $fetch<Board>('/api/boards', {
      method: 'POST',
      body: {
        name: createBoardState.name
      }
    })
    boards.value.push(newBoard)
    isCreateModalOpen.value = false
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

onMounted(() => {
  fetchBoards()
})
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">
          Mes Tableaux
        </h1>
        <p class="text-muted">
          Gérez vos projets et organisez vos tâches
        </p>
      </div>
      <UButton
        icon="i-ph-plus"
        size="lg"
        @click="isCreateModalOpen = true"
      >
        Créer un tableau
      </UButton>
    </div>

    <UModal v-model="isCreateModalOpen">
      <UCard class="sm:max-w-md">
        <template #header>
          <h3 class="text-lg font-semibold">
            Créer un nouveau tableau
          </h3>
        </template>

        <UForm
          :schema="createBoardSchema"
          :state="createBoardState"
          class="space-y-4"
          @submit.prevent="createBoard"
        >
          <UFormField
            label="Nom du tableau"
            name="name"
            required
          >
            <UInput
              v-model="createBoardState.name"
              placeholder="Ex: Projet Minishell"
              size="lg"
              autofocus
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              color="neutral"
              variant="ghost"
              @click="isCreateModalOpen = false"
            >
              Annuler
            </UButton>
            <UButton
              type="submit"
              :loading="creating"
            >
              Créer
            </UButton>
          </div>
        </UForm>
      </UCard>
    </UModal>

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
      <UButton
        icon="i-ph-plus"
        @click="isCreateModalOpen = true"
      >
        Créer un tableau
      </UButton>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <UCard
        v-for="board in boards"
        :key="board.id"
        class="hover:shadow-lg transition-shadow cursor-pointer group"
        @click="navigateTo(`/boards/${board.id}`)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg mb-1 truncate">
              {{ board.name }}
            </h3>
            <p class="text-muted text-sm">
              Créé le {{ new Date(board.createdAt).toLocaleDateString('fr-FR') }}
            </p>
          </div>
          <UDropdown
            :items="[
              [
                {
                  label: 'Ouvrir',
                  icon: 'i-ph-arrow-right',
                  click: () => navigateTo(`/boards/${board.id}`)
                },
                {
                  label: 'Supprimer',
                  icon: 'i-ph-trash',
                  click: () => deleteBoard(board.id),
                  color: 'error'
                }
              ]
            ]"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-ph-dots-three"
              size="sm"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
            />
          </UDropdown>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
