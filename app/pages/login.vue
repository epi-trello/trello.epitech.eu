<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  auth: {
    only: 'guest',
    redirectUserTo: '/boards'
  },
  layout: false
})

const { signIn } = useAuth()
const toast = useToast()

const show = ref(false)

const schema = z.object({
  email: z.email('Invalid email'),
  password: z
    .string('Password is required')
    .min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  const { error } = await signIn.email({
    email: data.email,
    password: data.password,
    callbackURL: '/boards'
  })

  if (error) {
    toast.add({
      title: 'Login Error',
      description: error.message,
      color: 'error'
    })
  }
}
</script>

<template>
  <UPage class="h-screen" :ui="{ center: 'flex flex-col' }">
    <UPageBody class="relative flex items-center flex-1">
      <ULink
        to="/"
        class="absolute top-0 left-4 sm:left-6 lg:left-8 inline-flex items-center gap-2 text-sm"
      >
        <UIcon name="i-ph-arrow-bend-down-left" />
        Go back
      </ULink>
      <UContainer class="flex flex-col items-center">
        <NuxtLink to="/" class="mb-8">
          <AppLogo class="w-auto" />
        </NuxtLink>
        <h2 class="text-3xl font-semibold mb-6 text-center">
          Welcome Back
        </h2>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 max-w-xs w-full"
          @submit.prevent="onSubmit"
        >
          <UFormField
            label="Email"
            name="email"
          >
            <UInput
              v-model="state.email"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="Password"
            name="password"
          >
            <UInput
              v-model="state.password"
              :type="show ? 'text' : 'password'"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="show ? 'i-ph-eye-closed' : 'i-ph-eye'"
                  :aria-label="show ? 'Hide password' : 'Show password'"
                  :aria-pressed="show"
                  aria-controls="password"
                  @click="show = !show"
                />
              </template>
            </UInput>
          </UFormField>

          <UButton
            type="submit"
            block
            loading-auto
          >
            Log In
          </UButton>
        </UForm>
        <p class="text-muted text-sm mt-8">
          Don't have an account?
          <ULink to="/sign-up">Sign up</ULink>
        </p>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
