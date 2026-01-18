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
            content: 'w-(--reka-dropdown-menu-trigger-width)',
            label: 'font-medium'
          }"
        >
          <ClientOnly>
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

            <template #fallback>
              <UButton
                :avatar="{}"
                :label="user?.name"
                trailing-icon="i-ph-caret-up-down"
                color="neutral"
                variant="ghost"
                block
                class="w-full"
              />
            </template>
          </ClientOnly>
        </UDropdownMenu>
      </template>
    </UDashboardSidebar>
    <div class="flex-1">
      <UDashboardNavbar>
        <template #title>
          <ClientOnly>
            <h1 class="flex items-center gap-1.5 font-semibold text-highlighted truncate">
              {{ title }}
            </h1>

            <template #fallback>
              <USkeleton class="h-4 w-30" />
            </template>
          </ClientOnly>
        </template>
      </UDashboardNavbar>
      <slot />
    </div>
  </div>
</template>
