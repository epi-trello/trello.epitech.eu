<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const { user, signOut } = useAuth()
const colorMode = useColorMode()
const title = usePageTitle()

const navItems: NavigationMenuItem[] = [
  {
    label: 'Boards',
    to: '/boards',
    icon: 'i-ph-kanban'
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: 'i-ph-gear-fine'
  }
]

const dropdownItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Themes',
      type: 'label'
    },
    {
      label: 'System',
      icon: 'i-ph-monitor',
      type: 'checkbox',
      checked: colorMode.preference === 'system',
      onUpdateChecked(checked: boolean) {
        if (checked) {
          colorMode.preference = 'system'
        }
      }
    },
    {
      label: 'Light',
      icon: 'i-ph-sun',
      type: 'checkbox',
      checked: colorMode.preference === 'light',
      onUpdateChecked(checked: boolean) {
        if (checked) {
          colorMode.preference = 'light'
        }
      }
    },
    {
      label: 'Dark',
      icon: 'i-ph-moon',
      type: 'checkbox',
      checked: colorMode.preference === 'dark',
      onUpdateChecked(checked: boolean) {
        if (checked) {
          colorMode.preference = 'dark'
        }
      }
    }
  ],
  [
    {
      label: 'Settings',
      to: '/settings',
      icon: 'i-ph-gear-fine'
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-ph-sign-out',
      color: 'error',
      onSelect() {
        signOut({ redirectTo: '/' })
      }
    }
  ]
])
</script>

<template>
  <div class="flex">
    <UDashboardSidebar class="w-64">
      <template #header>
        <NuxtLink
          to="/"
          class="inline-flex"
        >
          <AppLogo class="h-5 w-auto shrink-0" />
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
      />

      <template #footer>
        <ClientOnly>
          <UDropdownMenu
            :items="dropdownItems"
            :ui="{
              content: 'w-(--reka-dropdown-menu-trigger-width)',
              label: 'font-medium'
            }"
          >
            <UButton
              :avatar="{
                src: user?.image ? getCacheBustedUrl(user.image) : undefined,
                icon: 'i-ph-user'
              }"
              :label="user?.name"
              trailing-icon="i-ph-caret-up-down"
              color="neutral"
              variant="ghost"
              block
              class="w-full"
            />
          </UDropdownMenu>

          <template #fallback>
            <UDropdownMenu
              :items="dropdownItems"
              :ui="{
                content: 'w-(--reka-dropdown-menu-trigger-width)',
                label: 'font-medium'
              }"
            >
              <UButton
                :avatar="{}"
                :label="user?.name"
                trailing-icon="i-ph-caret-up-down"
                color="neutral"
                variant="ghost"
                block
                class="w-full"
              />
            </UDropdownMenu>
          </template>
        </ClientOnly>
      </template>
    </UDashboardSidebar>
    <div class="flex flex-col flex-1 min-w-0">
      <UDashboardNavbar :ui="{ left: 'gap-0' }">
        <template #left>
          <div id="navbar-left" />

          <ClientOnly>
            <h1 class="flex items-center gap-1.5 font-semibold text-highlighted truncate">
              {{ title }}
            </h1>

            <template #fallback>
              <USkeleton class="h-4 w-30" />
            </template>
          </ClientOnly>
        </template>

        <template #right>
          <div id="navbar-right" />
        </template>
      </UDashboardNavbar>
      <slot />
    </div>
  </div>
</template>
