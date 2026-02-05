<script setup lang="ts">
const { user } = useAuth()

const items = computed(() => [{
  label: 'Features',
  to: '#features'
}])
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto shrink-0" />
      </NuxtLink>
    </template>

    <template #right>
      <ClientOnly>
        <UNavigationMenu
          :items="items"
          variant="link"
          class="hidden lg:block"
        />
        <template #fallback>
          <nav class="hidden lg:flex items-center gap-1" aria-label="Navigation">
            <NuxtLink
              v-for="item in items"
              :key="item.label"
              :to="item.to"
              class="text-muted hover:text-highlighted text-sm font-medium px-3 py-2 rounded-md"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </template>
      </ClientOnly>

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
