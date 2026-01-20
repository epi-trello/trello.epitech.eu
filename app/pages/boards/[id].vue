<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { params } = useRoute()
const title = usePageTitle()

const { data: board } = await useFetch(`/api/boards/${params.id}`)

title.value = board.value ? board.value.name : 'Unknown'
</script>

<template></template>
