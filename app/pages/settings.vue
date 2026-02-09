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

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const schema = z.object({
  avatar: z
    .instanceof(File, { error: 'Please select a file' })
    .refine(file => file.size <= MAX_FILE_SIZE, {
      error: 'File size must be less than 2MB'
    })
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      error: 'Please upload a valid image file (JPEG, PNG, or WebP).'
    })
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
  try {
    let imageUrl = user.value?.image

    if (state.avatar) {
      const form = new FormData()

      form.set('image', state.avatar as File)
      const { url } = await $fetch('/api/upload', {
        method: 'POST',
        body: form
      })

      imageUrl = url
    }

    const { error } = await client.updateUser({
      firstname: data.firstname,
      lastname: data.lastname,
      name: `${data.firstname} ${data.lastname}`,
      image: imageUrl
    })

    if (error) throw error

    add({
      title: 'Profile Updated',
      description: 'Your changes have been saved successfully.',
      color: 'success'
    })

    await fetchSession()

    state.avatar = undefined
  } catch (error: any) {
    add({
      title: 'Update Failed',
      description: error.message || 'Something went wrong',
      color: 'error'
    })
  }
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
                v-slot="{ open }"
                v-model="state.avatar"
                variant="button"
                icon="ph:user"
                accept="image/*"
                class="size-28"
              >
                <ClientOnly>
                  <UAvatar
                    :src="state.avatar
                      ? createObjectUrl(state.avatar)
                      : (user?.image ? getCacheBustedUrl(user.image) : undefined)"
                    class="size-full"
                    @click="open"
                  />

                  <template #fallback>
                    <USkeleton class="size-full rounded-full" />
                  </template>
                </ClientOnly>
              </UFileUpload>
            </UFormField>
          </div>
        </div>
        <div class="flex justify-end border-t border-t-default px-6 py-4">
          <UButton
            type="submit"
            label="Save Changes"
            size="xs"
            loading-auto
            :disabled="user?.firstname === state.firstname && user?.lastname === state.lastname && !state.avatar"
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
