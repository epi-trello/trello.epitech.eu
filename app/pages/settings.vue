<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard'
})

const { user, client, fetchSession } = useAuth()
const { add } = useToast()
const title = usePageTitle()

title.value = 'Settings'

const schema = z.object({
  avatar: z
    .instanceof(File, { error: 'Please select a file' })
    .refine(file => file.size <= 2 * 1024 * 1024, { error: 'File size must be less than 2MB' })
    .optional(),
  firstname: z.string('First name is required').min(3, 'Must be at least 3 characters'),
  lastname: z.string('Last name is required').min(3, 'Must be at least 3 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  avatar: undefined,
  firstname: user.value?.firstname,
  lastname: user.value?.lastname
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  const { error } = await client.updateUser({
    firstname: data.firstname,
    lastname: data.lastname,
    name: `${data.firstname} ${data.lastname}`
  })

  if (error) {
    add({
      title: 'Update Error',
      description: error.message,
      color: 'error'
    })
    return
  }

  await fetchSession()
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl mx-auto space-y-4">
    <h2 class="font-medium">
      Account
    </h2>
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <UForm
        :schema="schema"
        :state="state"
        @submit.prevent="onSubmit"
      >
        <div class="flex">
          <div class="flex-1">
            <UFormField
              label="First name"
              name="firstname"
              class="px-6 py-4"
            >
              <UInput v-model="state.firstname" />
            </UFormField>
            <UFormField
              label="Last name"
              name="lastname"
              class="px-6 py-4"
            >
              <UInput v-model="state.lastname" />
            </UFormField>
          </div>
          <div>
            <UFormField
              label="Profile picture"
              name="avatar"
              :ui="{
                container: 'max-w-28'
              }"
              class="px-6 py-4"
            >
              <UFileUpload
                v-model="state.avatar"
                variant="button"
                icon="ph:user"
                accept="image/jpeg,image/png,image/webp"
                class="size-28"
              />
            </UFormField>
          </div>
        </div>
        <div class="flex justify-end border-t border-t-default px-6 py-4">
          <UButton
            type="submit"
            label="Save Changes"
            size="xs"
            loading-auto
            :disabled="user?.firstname === state.firstname && user?.lastname === state.lastname"
          />
        </div>
      </UForm>
    </UCard>
    <h2 class="font-medium">
      Appearance
    </h2>
    <UCard>
      <div class="flex items-center justify-between">
        <p class="text-sm">
          Theme preferences
        </p>
        <UColorModeSelect />
      </div>
    </UCard>
  </UContainer>
</template>
