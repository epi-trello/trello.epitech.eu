<script setup lang="ts">
definePageMeta({
  auth: {}
})
</script>

<template>
  <UContainer class="py-8">
    <div class="mb-6">
      <UButton
        to="/boards"
        variant="ghost"
        icon="i-ph-arrow-left"
        size="sm"
      >
        Retour
      </UButton>
    </div>
    
    <div class="flex items-center justify-center min-h-[60vh]">
      <h1 class="text-4xl font-bold">ok</h1>
    </div>
  </UContainer>
</template>
