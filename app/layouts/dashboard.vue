<script setup lang="ts">
import type { NavigationMenuItem, DropdownMenuItem } from '@nuxt/ui'

const { signOut } = useAuth()
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
      icon: 'i-ph-desktop',
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
        <AppLogo class="h-5 w-auto shrink-0" />
      </template>

      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
      />

      <template #footer>
        <UDropdownMenu
          :items="dropdownItems"
          :ui="{
            content: 'w-(--reka-dropdown-menu-trigger-width)'

          }"
        >
          <UButton
            :avatar="{
              src: 'https://github.com/davidabou.png'
            }"
            label="David Abou"
            trailing-icon="i-ph-caret-up-down"
            color="neutral"
            variant="ghost"
            block
            class="w-full"
          />
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>
    <div class="flex-1">
      <UDashboardNavbar :title="title" />
      <slot />
    </div>
  </div>
</template>
