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
  transform: (data) =>
    data.map((label) => ({
      value: label.id,
      label: label.name,
      color: label.color
    }))
})

const { data: members } = await useFetch(
  `/api/boards/${props.boardId}/members`,
  {
    transform: (data) =>
      data.map((member) => ({
        value: member.id,
        label: member.name,
        avatar: {
          src: member.image || undefined,
          alt: member.name,
          icon: 'i-ph-user'
        }
      }))
  }
)

const selectedAssignees = ref<
  | {
      value: string
      label: string
      avatar: { src: string | undefined; alt: string; icon: string }
    }[]
  | undefined
>(
  card.value?.assignees.map((assignee) => ({
    value: assignee.id,
    label: assignee.name,
    avatar: {
      src: assignee.image || undefined,
      alt: assignee.name,
      icon: 'i-ph-user'
    }
  }))
)

const selectedLabels = ref<
  { value: string; label: string; color: string }[] | undefined
>(
  card.value?.labels.map((label) => ({
    value: label.id,
    label: label.name,
    color: label.color
  }))
)

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

async function setAssignees() {
  const currentAssigneeIds =
    card.value?.assignees.map((assignee) => assignee.id) || []
  const selectedAssigneeIds =
    selectedAssignees.value?.map((assignee) => assignee.value) || []

  if (
    JSON.stringify(currentAssigneeIds.sort()) ===
    JSON.stringify(selectedAssigneeIds.sort())
  ) {
    return
  }

  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        assignees: selectedAssignees.value?.map((assignee) => assignee.value)
      }
    })

    emits('change')
    await refresh()
  } catch (error: any) {
    add({
      color: 'error',
      title: 'Unable to set assignees',
      description: error.message || 'An unexpected error occurred'
    })
  }
}

async function setLabels() {
  const currentLabelIds = card.value?.labels.map((label) => label.id) || []
  const selectedLabelIds =
    selectedLabels.value?.map((label) => label.value) || []

  if (
    JSON.stringify(currentLabelIds.sort()) ===
    JSON.stringify(selectedLabelIds.sort())
  ) {
    return
  }

  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'PATCH',
      body: {
        labels: selectedLabels.value?.map((label) => label.value)
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
const startDate = shallowRef<CalendarDate | undefined>(
  card.value?.startDate ? dateToCalendarDate(card.value.startDate) : undefined
)

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
const dueDate = shallowRef<CalendarDate | undefined>(
  card.value?.dueDate ? dateToCalendarDate(card.value.dueDate) : undefined
)

const description = ref(card.value?.description || '')

// Commentaires
const newCommentText = ref('')
const isSubmittingComment = ref(false)
const commentError = ref<string | null>(null)

async function submitComment() {
  const text = newCommentText.value.trim()
  if (!text || isSubmittingComment.value) return

  isSubmittingComment.value = true
  commentError.value = null
  try {
    await $fetch(`/api/cards/${props.cardId}/comments`, {
      method: 'POST',
      body: { text }
    })
    newCommentText.value = ''
    await refresh()
  } catch (e: unknown) {
    commentError.value =
      (e as { data?: { message?: string } })?.data?.message ??
      "Erreur lors de l'envoi du commentaire."
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
  if (diffMins < 1) return "À l'instant"
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffDays < 7) return `Il y a ${diffDays} j`
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

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

async function deleteCard() {
  try {
    await $fetch(`/api/cards/${props.cardId}`, {
      method: 'DELETE'
    })

    emits('change')
    add({
      title: 'Card deleted',
      description: 'The card has been deleted successfully.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      title: 'Error while deleting card',
      description: error.message || 'Unable to delete the card.',
      color: 'error'
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
      <UInput
        color="neutral"
        variant="none"
        v-model.trim="title"
        size="xl"
        :ui="{ base: 'p-0' }"
        @blur="setTitle"
      />
    </template>

    <template #body>
      <div class="flex w-full">
        <div class="w-full overflow-y-auto">
          <p
            class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Description
          </p>
          <UTextarea
            placeholder="Type something..."
            v-model.trim="description"
            autoresize
            class="w-full"
            @blur="setDescription"
          />

          <!-- Commentaires -->
          <section class="mt-6">
            <h2
              class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted"
            >
              <UIcon name="i-ph-chat-circle-text" class="size-4" />
              Commentaires
              <span
                v-if="card?.comments?.length"
                class="font-normal text-muted"
              >
                ({{ card.comments.length }})
              </span>
            </h2>

            <form @submit.prevent="submitComment" class="mb-4 space-y-2">
              <UTextarea
                v-model="newCommentText"
                placeholder="Écrire un commentaire…"
                :rows="2"
                :disabled="isSubmittingComment"
                class="resize-none w-full"
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
                <p v-if="commentError" class="text-sm text-error">
                  {{ commentError }}
                </p>
              </div>
            </form>

            <div v-if="card?.comments?.length" class="space-y-3">
              <div
                v-for="comment in card.comments"
                :key="comment.id"
                class="flex gap-3 rounded-lg bg-elevated p-3"
              >
                <UAvatar
                  :src="comment.user?.image ?? undefined"
                  :alt="comment.user?.name ?? 'Avatar'"
                  size="sm"
                  class="shrink-0"
                />
                <div class="min-w-0 flex-1">
                  <div class="mb-1 flex items-center gap-2 text-xs">
                    <span class="font-medium">{{
                      comment.user?.name ?? 'Utilisateur'
                    }}</span>
                    <span class="text-muted">{{
                      formatCommentDate(comment.createdAt)
                    }}</span>
                  </div>
                  <p class="whitespace-pre-wrap text-sm">{{ comment.text }}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="w-50 shrink-0 border-l border-default pl-6 ml-6">
          <p
            class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted"
          >
            Actions
          </p>
          <nav class="flex flex-col gap-1.5">
            <label class="text-xs font-medium">Assignees</label>
            <USelectMenu
              v-model="selectedAssignees"
              :avatar="selectedAssignees?.[0]?.avatar"
              :items="members"
              size="sm"
              multiple
              class="w-full"
              placeholder="Select assignees"
              @update:model-value="setAssignees"
            />
            <label class="text-xs font-medium">Labels</label>
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
            <label class="text-xs font-medium">Start Date</label>
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
            <label class="text-xs font-medium"> Due Date </label>
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
              @click="deleteCard"
            />
          </nav>
        </div>
      </div>
    </template>
  </UModal>
</template>
