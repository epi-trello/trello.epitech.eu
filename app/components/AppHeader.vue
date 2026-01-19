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
  <UHeader :toggle="false">
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

      <UDropdownMenu
        :items="[
          [
            ...items.map(item => ({
              label: item.label,
              to: item.to,
              icon: item.to === '/boards' ? 'i-ph-cards-three' : 'i-ph-star'
            })),
            {
              type: 'divider'
            },
            user
              ? {
                  label: 'Tableaux',
                  to: '/boards',
                  icon: 'i-ph-cards-three'
                }
              : {
                  label: 'Se connecter',
                  to: '/login',
                  icon: 'i-ph-sign-in'
                }
          ]
        ]"
        :popper="{ placement: 'bottom-end' }"
        class="lg:hidden"
      >
        <UButton
          icon="i-ph-list"
          color="neutral"
          variant="ghost"
          class="lg:hidden"
        />
      </UDropdownMenu>
    </template>
  </UHeader>
</template>
