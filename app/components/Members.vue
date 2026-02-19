<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { InternalApi } from 'nitropack'

const modalOpen = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  board: NonNullable<InternalApi['/api/boards/:id']['get']>
}>()

const emits = defineEmits<{
  change: []
}>()

const { add } = useToast()
const { user } = useAuth()

const state = reactive({
  email: ''
})

const schema = z.object({
  email: z.email({ message: 'Please enter a valid email address' })
})

const { data: me } = await useFetch(`/api/boards/${props.board.id}/me`)

const roles = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
  { label: 'Viewer', value: 'VIEWER' }
]

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

    emits('change')
    add({
      title: 'User invited',
      description:
        'The user has been added as a member to the board successfully.',
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

async function updateMemberRole(userId: string, newRole: string) {
  try {
    await $fetch(`/api/boards/${props.board.id}/members/${userId}`, {
      method: 'PATCH',
      body: {
        role: newRole
      }
    })

    emits('change')
    add({
      title: 'Role updated',
      description: "The member's role has been updated successfully.",
      color: 'success'
    })
  } catch (error: any) {
    add({
      title: 'Error while updating role',
      description: error.message,
      color: 'error'
    })
  }
}

async function removeMember(userId: string) {
  try {
    await $fetch(`/api/boards/${props.board.id}/members/${userId}`, {
      method: 'DELETE'
    })

    emits('change')
    add({
      title: 'Member removed',
      description: 'The member has been removed from the board successfully.',
      color: 'success'
    })
  } catch (error: any) {
    add({
      title: 'Error while removing member',
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
        :disabled="!me?.permissions.canManageMembers"
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
          :disabled="!me?.permissions.canManageMembers"
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

            <UButton
              variant="outline"
              color="neutral"
              size="sm"
              disabled
              class="ml-auto"
            >
              Owner
            </UButton>
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

            <USelect
              v-model="member.role"
              :items="roles"
              size="sm"
              class="ml-auto w-28"
              :disabled="
                !me?.permissions.canManageMembers || member.user.id === user?.id
              "
              @update:model-value="updateMemberRole(member.userId, $event)"
            />

            <UButton
              color="error"
              size="sm"
              icon="i-ph-trash"
              :disabled="
                !me?.permissions.canManageMembers || member.user.id === user?.id
              "
              @click="removeMember(member.userId)"
            />
          </template>
        </UPageCard>
      </UPageList>
    </template>
  </UModal>
</template>
