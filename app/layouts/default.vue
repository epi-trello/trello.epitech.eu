<template>
  <UPage>
    <AppHeader />

    <UMain>
      <slot />
    </UMain>

    <USeparator class="h-px" />

    <UFooter>
      <template #left>
        <p class="text-muted text-sm">
          EpiTrello • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          icon="i-simple-icons-github"
          color="neutral"
          variant="ghost"
          to="https://github.com/epi-trello/trello.epitech.eu"
          target="_blank"
          aria-label="GitHub"
        />
      </template>
    </UFooter>
  </UPage>
</template>
