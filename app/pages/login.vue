<script setup lang="ts">
import { z } from 'zod'

import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  auth: {
    only: 'guest',
    redirectUserTo: '/'
  }
})

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

const show = ref(false)

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    description: 'The form has been submitted.',
    color: 'success'
  })
  console.log(event.data)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4 max-w-xs"
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
            size="md"
            :icon="show ? 'hugeicons:view-off' : 'hugeicons:view'"
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
      icon="i-hugeicons-login-01"
      block
    >
      Log In
    </UButton>
  </UForm>
</template>
