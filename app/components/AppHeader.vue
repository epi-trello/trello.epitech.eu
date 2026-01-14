<script setup lang="ts">
const { user } = useAuth()

const items = computed(() => {
  const baseItems = [{
    label: 'Features',
    to: '#features'
  }]

  if (user.value) {
    return [
      {
        label: 'Tableaux',
        to: '/boards'
      },
      ...baseItems
    ]
  }

  return baseItems
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:block"
      />

      <UButton
        v-if="user"
        to="/boards"
        label="Go to Boards"
        variant="subtle"
        class="hidden lg:block"
      />
      <UButton
        v-else
        to="/login"
        label="Log in"
        variant="subtle"
        class="hidden lg:block"
      />

      <UColorModeButton />
    </template>
  </UHeader>
</template>
