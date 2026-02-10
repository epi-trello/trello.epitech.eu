<script setup lang="ts">
import type { PageCardProps } from '@nuxt/ui'

definePageMeta({
  auth: false
})

const links = ref([
  {
    label: 'Get started',
    to: '/sign-up'
  }
])

const features = ref<PageCardProps[]>([
  {
    title: 'Visual Workflow',
    description:
      'Stop managing projects in TODO.txt. Visualize your roadmap, drag tasks from "To Do" to "Done", and get a clear view of your progress at a glance.',
    icon: 'i-ph-cards-three'
  },
  {
    title: 'Multi-Module Hub',
    description:
      'One board for Minishell, another for MyRPG. Keep your semester organized.',
    icon: 'i-ph-puzzle-piece'
  },
  {
    title: 'Deadline Tracking',
    description:
      'Never miss a deadline again. Set due dates on your cards and code with confidence.',
    icon: 'i-ph-alarm'
  }
])
</script>

<template>
  <div>
    <UPageHero
      title="Project Management, the Epitech Way"
      description="Don't let a bad workflow kill your GPA. Organize your team, track your unit tests, and secure your credits before the deadline hits."
      :links="links"
      :ui="{
        wrapper: 'flex flex-col items-center',
        header: 'flex flex-col items-center',
        title: 'sm:text-6xl max-w-xl',
        description: 'sm:text-lg max-w-3xl'
      }"
    >
      <template #headline>
        <UButton
          color="neutral"
          variant="subtle"
          to="https://github.com/epi-trello/trello.epitech.eu"
          label="Star on GitHub"
          icon="i-simple-icons-github"
          target="_blank"
          aria-label="GitHub"
        />
      </template>
    </UPageHero>
    <UPageSection
      id="features"
      title="Everything You Need"
      description="Stop losing track of your backlog. Focus on shipping clean code while this board handles the logistics with a workflow tailored for the Epitech curriculum."
    >
      <UPageGrid>
        <UPageCard
          v-for="feature in features"
          :key="feature.title"
          v-bind="feature"
          spotlight
        />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
