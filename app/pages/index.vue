<script setup lang="ts">
definePageMeta({
  auth: false
})

type BoardCard = { title: string, badge?: string, label?: string, users?: string[] }
type BoardList = { title: string, color: string, cards: BoardCard[] }

const boardLists: BoardList[] = [
  {
    title: 'À faire',
    color: '#f59e0b',
    cards: [
      { title: 'Configurer l’authentification', badge: 'Prioritaire', label: '#f97316', users: ['AP', 'MT'] },
      { title: 'Atelier cadrage produit', label: '#0ea5e9', users: ['CL'] },
      { title: 'Créer le design system', users: ['AP'] }
    ]
  },
  {
    title: 'En cours',
    color: '#6366f1',
    cards: [
      { title: 'Implémenter le drag & drop', badge: 'En test', label: '#8b5cf6', users: ['MT', 'JD'] },
      { title: 'Mettre en place les labels', users: ['AP', 'MT'] }
    ]
  },
  {
    title: 'Relecture',
    color: '#10b981',
    cards: [
      { title: 'Page tableau responsive', badge: 'UI', label: '#14b8a6', users: ['CL'] },
      { title: 'Sécuriser les webhooks', users: ['JD'] }
    ]
  },
  {
    title: 'Fait',
    color: '#0ea5e9',
    cards: [
      { title: 'Setup Nuxt + Prisma', badge: 'V1', users: ['AP', 'MT'] },
      { title: 'Flux login / signup', users: ['MT'] }
    ]
  }
]

const features = [
  {
    title: 'Colonnes Kanban modulaires',
    description: 'Ajoutez, renommez ou réordonnez vos listes comme sur Trello, avec une base Nuxt prête pour le drag & drop.',
    icon: '🧩'
  },
  {
    title: 'Cartes enrichies',
    description: 'Badges, labels colorés, avatars et commentaires pour donner du contexte à chaque tâche.',
    icon: '📌'
  },
  {
    title: 'Collaboration fluide',
    description: 'Invitez l’équipe, partagez les responsabilités et suivez la progression en un coup d’œil.',
    icon: '🤝'
  },
  {
    title: 'Templates prêts à l’emploi',
    description: 'Démarrez avec des modèles projet, marketing ou produit directement inspirés de Trello.',
    icon: '📑'
  },
  {
    title: 'Vue clean et rapide',
    description: 'UI épurée, Tailwind + Nuxt UI pour garder des performances élevées.',
    icon: '⚡'
  },
  {
    title: 'Évolutif',
    description: 'Architecture componentisée pour ajouter des modules (labels, pièces jointes, automations).',
    icon: '🛠️'
  }
]
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <AppHeader />

    <main class="relative">
      <div class="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-50 via-white/40 to-transparent" />

      <div class="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 sm:gap-12 sm:py-16">
        <HomeHero>
          <BoardPreview
            board-title="Lancement produit"
            :lists="boardLists"
          />
        </HomeHero>

        <FeatureGrid
          title="Construite en composants Vue"
          subtitle="Chaque bloc est un composant Nuxt réutilisable : en-tête, hero, board, cartes et sections de call-to-action. Modifiez-les facilement selon vos besoins."
          :items="features"
        />

        <CalloutSection />
      </div>
    </main>

    <AppFooter />
  </div>
</template>
