import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppLogo } from '#components'

describe('AppLogo Component', () => {
  it('renders the component successfully', () => {
    const wrapper = mount(AppLogo)

    expect(wrapper.exists()).toBe(true)
  })

  it('displays the brand name "EpiTrello"', () => {
    const wrapper = mount(AppLogo)

    expect(wrapper.text()).toContain('EpiTrello')
  })

  it('renders the SVG logo icon', () => {
    const wrapper = mount(AppLogo)
    const svg = wrapper.find('svg')

    expect(svg.exists()).toBe(true)
    expect(svg.attributes('viewBox')).toBe('0 0 1000 1000')
    expect(svg.classes()).toContain('size-6')
  })

  it('applies the correct layout classes', () => {
    const wrapper = mount(AppLogo)
    const container = wrapper.find('div')

    expect(container.classes()).toEqual(
      expect.arrayContaining([
        'flex',
        'items-center',
        'gap-2',
        'text-lg',
        'font-semibold'
      ])
    )
  })
})
