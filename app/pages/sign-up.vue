<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false,
  auth: {
    only: 'guest',
    redirectUserTo: '/',
    redirectGuestTo: '/sign-up'
  }
})

const { signUp } = useAuth()
const toast = useToast()

const show = ref(false)

const schema = z
  .object({
    firstname: z.string('First name is required'),
    lastname: z.string('Last name is required'),
    email: z.email('Invalid email'),
    password: z
      .string('Password is required')
      .min(8, 'Must be at least 8 characters'),
    confirmPassword: z.string('Password confirmation is required')
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match',
    path: ['confirmPassword']
  })

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  firstname: undefined,
  lastname: undefined,
  email: undefined,
  password: undefined,
  confirmPassword: undefined
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  const { error } = await signUp.email({
    email: data.email,
    password: data.password,
    firstname: data.firstname,
    lastname: data.lastname,
    name: `${data.firstname} ${data.lastname}`
  })

  if (error) {
    toast.add({
      title: 'Sign Up Error',
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
          Get Started
        </h2>
        <UForm
          :schema="schema"
          :state="state"
          class="space-y-4 max-w-xs w-full"
          @submit.prevent="onSubmit"
        >
          <div class="flex gap-4">
            <UFormField
              label="First Name"
              name="firstname"
            >
              <UInput
                v-model="state.firstname"
                class="w-full"
              />
            </UFormField>
            <UFormField
              label="Last Name"
              name="lastname"
            >
              <UInput
                v-model="state.lastname"
                class="w-full"
              />
            </UFormField>
          </div>
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

          <UFormField
            label="Confirm Password"
            name="confirmPassword"
          >
            <UInput
              v-model="state.confirmPassword"
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
          >
            Sign Up
          </UButton>
        </UForm>
        <p class="text-muted text-sm mt-8">
          Do you already have an account?
          <ULink to="/login">Log in</ULink>
        </p>
      </UContainer>
    </UPageBody>
  </UPage>
</template>
