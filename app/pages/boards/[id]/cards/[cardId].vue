<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const boardId = route.params.id as string
const cardId = route.params.cardId as string

const { data: card, pending, error, refresh } = await useFetch(`/api/cards/${cardId}`)

const backUrl = `/boards/${boardId}`

// Formulaire nouveau commentaire
const newCommentText = ref('')
const isSubmittingComment = ref(false)
const commentError = ref<string | null>(null)

async function submitComment() {
  const text = newCommentText.value.trim()
  if (!text || isSubmittingComment.value) return

  isSubmittingComment.value = true
  commentError.value = null
  try {
    await $fetch(`/api/cards/${cardId}/comments`, {
      method: 'POST',
      body: { text }
    })
    newCommentText.value = ''
    await refresh()
  } catch (e: unknown) {
    commentError.value =
      (e as { data?: { message?: string } })?.data?.message ?? 'Erreur lors de l\'envoi du commentaire.'
  } finally {
    isSubmittingComment.value = false
  }
}

function formatCommentDate(createdAt: string) {
  const d = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)
  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffDays < 7) return `Il y a ${diffDays} j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      @click.self="navigateTo(backUrl)"
    >
      <div
        v-if="pending"
        class="rounded-xl bg-gray-900 px-8 py-6 text-gray-400"
      >
        Chargement…
      </div>
      <div
        v-else-if="error"
        class="rounded-xl bg-gray-900 px-8 py-6 text-red-400"
      >
        Carte introuvable.
        <UButton :to="backUrl" variant="link" class="mt-2"
          >Retour au tableau</UButton
        >
      </div>
      <div
        v-else
        class="flex max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl bg-gray-900 shadow-2xl dark:bg-gray-950"
      >
        <!-- Left: card content -->
        <div class="flex flex-1 flex-col overflow-y-auto p-6">
          <div class="mb-4 flex items-start justify-between gap-4">
            <h1 class="text-xl font-bold text-white">
              {{ card?.title ?? '…' }}
            </h1>
            <UButton
              :to="backUrl"
              variant="ghost"
              color="neutral"
              icon="i-ph-x"
              size="sm"
              aria-label="Fermer"
              class="shrink-0 -m-2"
            />
          </div>

          <p class="mb-2 text-sm font-medium text-gray-400">Description</p>
          <p
            v-if="card?.description"
            class="mb-6 text-gray-300 whitespace-pre-wrap"
          >
            {{ card.description }}
          </p>
          <p v-else class="mb-6 text-gray-500 italic">Aucune description</p>

          <div v-if="card?.labels?.length" class="mb-4 flex flex-wrap gap-2">
            <span
              v-for="label in card.labels"
              :key="label.id"
              class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
              :style="{
                backgroundColor: label.color + '30',
                color: label.color
              }"
            >
              <span
                class="size-2 rounded-full shrink-0"
                :style="{ backgroundColor: label.color }"
              />
              {{ label.name }}
            </span>
          </div>

          <!-- Commentaires -->
          <section class="mb-6">
            <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-400">
              <UIcon name="i-ph-chat-circle-text" class="size-4" />
              Commentaires
              <span v-if="card?.comments?.length" class="text-gray-500">
                ({{ card.comments.length }})
              </span>
            </h2>

            <form @submit.prevent="submitComment" class="mb-4 space-y-2">
              <UTextarea
                v-model="newCommentText"
                placeholder="Écrire un commentaire…"
                :rows="2"
                :disabled="isSubmittingComment"
                class="resize-none"
                autoresize
              />
              <div class="flex items-center gap-2">
                <UButton
                  type="submit"
                  size="sm"
                  :loading="isSubmittingComment"
                  :disabled="!newCommentText.trim()"
                >
                  Envoyer
                </UButton>
                <p v-if="commentError" class="text-sm text-red-400">{{ commentError }}</p>
              </div>
            </form>

            <div v-if="card?.comments?.length" class="space-y-3">
              <div
                v-for="comment in card.comments"
                :key="comment.id"
                class="flex gap-3 rounded-lg bg-gray-800/60 p-3"
              >
                <UAvatar
                  :src="comment.user?.image ?? undefined"
                  :alt="comment.user?.name ?? 'Avatar'"
                  size="sm"
                  class="shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center gap-2 text-xs">
                    <span class="font-medium text-gray-200">{{ comment.user?.name ?? 'Utilisateur' }}</span>
                    <span class="text-gray-500">{{ formatCommentDate(comment.createdAt) }}</span>
                  </div>
                  <p class="whitespace-pre-wrap text-sm text-gray-300">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </section>

          <div
            class="mt-auto rounded-lg border border-dashed border-gray-600 bg-gray-800/50 p-3 text-gray-400 transition-colors hover:border-gray-500 hover:bg-gray-800"
          >
            <span class="text-sm">+ Ajouter une tâche</span>
          </div>
        </div>

        <!-- Right: add to card actions -->
        <div
          class="w-56 shrink-0 border-l border-gray-800 bg-gray-900/80 p-4 dark:bg-gray-950"
        >
          <p
            class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
          >
            Ajouter à la carte
          </p>
          <nav class="flex flex-col gap-1">
            <UButton
              variant="ghost"
              color="neutral"
              class="justify-start gap-2 rounded-lg bg-gray-800/80 px-3 py-2 text-gray-200 hover:bg-gray-700"
            >
              <UIcon name="i-ph-tag" class="size-4" />
              <span>Étiquettes</span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              class="justify-start gap-2 rounded-lg bg-gray-800/80 px-3 py-2 text-gray-200 hover:bg-gray-700"
            >
              <UIcon name="i-ph-users-three" class="size-4" />
              <span>Membres</span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              class="justify-start gap-2 rounded-lg bg-gray-800/80 px-3 py-2 text-gray-200 hover:bg-gray-700"
            >
              <UIcon name="i-ph-calendar" class="size-4" />
              <span>Dates</span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              class="justify-start gap-2 rounded-lg bg-gray-800/80 px-3 py-2 text-gray-200 hover:bg-gray-700"
            >
              <UIcon name="i-ph-plus" class="size-4" />
              <span>Ajouter une checklist</span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              class="justify-start gap-2 rounded-lg bg-gray-800/80 px-3 py-2 text-gray-200 hover:bg-gray-700"
            >
              <UIcon name="i-ph-paperclip" class="size-4" />
              <span>Pièce jointe</span>
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              class="justify-start gap-2 rounded-lg bg-gray-800/80 px-3 py-2 text-gray-200 hover:bg-gray-700"
            >
              <UIcon name="i-ph-archive" class="size-4" />
              <span>Archiver</span>
            </UButton>
          </nav>
        </div>
      </div>
    </div>
  </Teleport>
</template>
