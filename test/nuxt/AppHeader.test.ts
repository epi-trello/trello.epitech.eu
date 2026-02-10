import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { AppHeader } from '#components'

const { useAuth } = vi.hoisted(() => ({
  useAuth: vi.fn()
}))

mockNuxtImport('useAuth', () => useAuth)

async function mountHeader(user: object | null = null) {
  useAuth.mockImplementation(() => ({ user }))

  return mountSuspended(AppHeader)
}

describe('AppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Layout', () => {
    it('renders a header element', async () => {
      const wrapper = await mountHeader()

      expect(wrapper.find('header').exists()).toBe(true)
    })

    it('renders a logo link pointing to the home page', async () => {
      const wrapper = await mountHeader()
      const link = wrapper.find('a[href="/"]')

      expect(link.exists()).toBe(true)
    })

    it('renders a color mode toggle button', async () => {
      const wrapper = await mountHeader()
      const button = wrapper.find('button[aria-label="Switch to dark mode"]')

      expect(button.exists()).toBe(true)
    })
  })

  describe('NavigationMenu', () => {
    it('renders a "Features" navigation link', async () => {
      const wrapper = await mountHeader()
      const link = wrapper.find('a[href="#features"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Features')
    })
  })

  describe('when user is NOT authenticated', () => {
    it('renders a "Log in" link', async () => {
      const wrapper = await mountHeader()
      const link = wrapper.find('a[href="/login"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Log in')
    })

    it('does NOT render a link to the dashboard', async () => {
      const wrapper = await mountHeader()
      const link = wrapper.find('a[href="/boards"]')

      expect(link.exists()).toBe(false)
    })
  })

  describe('when user IS authenticated', () => {
    const fakeUser = { id: 1, name: 'Mathieu' }

    it('renders a link to the dashboard', async () => {
      const wrapper = await mountHeader(fakeUser)
      const link = wrapper.find('a[href="/boards"]')

      expect(link.exists()).toBe(true)
      expect(link.text()).toBe('Go to Boards')
    })

    it('does NOT render a "Log in" link', async () => {
      const wrapper = await mountHeader(fakeUser)
      const link = wrapper.find('a[href="/login"]')

      expect(link.exists()).toBe(false)
    })
  })
})
