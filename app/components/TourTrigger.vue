<script setup lang="ts">
const { startTour, canRunTourOnPage, hasSeenTour } = useTour()
</script>

<template>
  <UButton
    v-if="canRunTourOnPage"
    variant="ghost"
    color="neutral"
    size="sm"
    icon="i-ph-question"
    aria-label="Start the tour"
    class="relative"
    @click="startTour(true)"
  >
    <span class="sr-only">Discovery tour</span>
    <span
      v-if="!hasSeenTour"
      class="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary"
      aria-hidden="true"
    />
  </UButton>
</template>
