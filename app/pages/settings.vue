<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const title = usePageTitle()

title.value = 'Settings'
</script>

<template>
  <UContainer class="py-8 max-w-3xl mx-auto space-y-4">
    <h2 class="font-medium">Account</h2>
    <UCard :ui="{ body: 'p-0 sm:p-0 divide-y divide-default' }">
      <div class="flex items-center justify-between px-6 py-4">
        <p class="text-sm">Profile picture</p>
        <UFileUpload variant="button" icon="ph:user" accept="image/*" />
      </div>
      <div class="flex items-center justify-between px-6 py-4">
        <p class="text-sm">First name</p>
        <UInput />
      </div>
      <div class="flex items-center justify-between px-6 py-4">
        <p class="text-sm">Last name</p>
        <UInput />
      </div>
    </UCard>
    <h2 class="font-medium">Appearance</h2>
    <UCard>
      <div class="flex items-center justify-between">
        <p class="text-sm">Theme preferences</p>
        <UColorModeSelect />
      </div>
    </UCard>
  </UContainer>
</template>
