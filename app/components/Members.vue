<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { InternalApi } from 'nitropack'

const modalOpen = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  board: NonNullable<InternalApi['/api/boards/:id']['get']>
}>()

const { add } = useToast()
const { user } = useAuth()

const state = reactive({
  email: ''
})

const schema = z.object({
  email: z.email({ message: 'Please enter a valid email address' })
})

type Schema = z.output<typeof schema>

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  try {
    await $fetch(`/api/boards/${props.board.id}/invite`, {
      method: 'POST',
      body: {
        email: data.email
      }
    })

    state.email = ''

    add({
      title: 'Invitation sent',
      description: 'The user has been invited to the board.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      title: 'Error while inviting user',
      description: error.message,
      color: 'error'
    })
  }
}
</script>

<template>
  <UModal
    v-model:open="modalOpen"
    title="Members"
    :ui="{ body: 'flex flex-col gap-y-4' }"
  >
    <template #body>
      <p class="text-sm">Invite new members to collaborate on this board.</p>

      <UForm
        :disabled="board.owner.id !== user?.id"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
        class="flex items-start gap-2"
      >
        <UFormField name="email" class="flex-1">
          <UInput
            v-model="state.email"
            class="w-full"
            placeholder="e.g. user@example.com"
          />
        </UFormField>
        <UButton
          :disabled="board.owner.id !== user?.id"
          type="submit"
          label="Invite"
          loading-auto
        />
      </UForm>

      <UPageList class="gap-1.5">
        <UPageCard
          variant="naked"
          :ui="{ body: 'flex items-center gap-3 w-full' }"
        >
          <template #body>
            <UUser
              :name="`${board?.owner?.firstname} ${board?.owner?.lastname}`"
              :description="board?.owner?.email"
              :avatar="{
                src: board?.owner?.image || undefined,
                alt: `${board?.owner?.firstname} ${board?.owner?.lastname}`,
                icon: 'i-ph-user'
              }"
            />

            <UBadge variant="outline" color="neutral" size="sm" class="ml-auto">
              Owner
            </UBadge>
          </template>
        </UPageCard>
        <UPageCard
          v-for="member in board?.members"
          :key="member.id"
          variant="naked"
          :ui="{ body: 'flex items-center gap-3 w-full' }"
        >
          <template #body>
            <UUser
              :name="`${member.user.firstname} ${member.user.lastname}`"
              :description="member.user.email"
              :avatar="{
                src: member.user.image || undefined,
                alt: `${member.user.firstname} ${member.user.lastname}`,
                icon: 'i-ph-user'
              }"
            />
            <UBadge variant="outline" color="neutral" size="sm" class="ml-auto">
              {{ member.role.at(0) + member.role.slice(1).toLowerCase() }}
            </UBadge>
          </template>
        </UPageCard>
      </UPageList>
    </template>
  </UModal>
</template>
