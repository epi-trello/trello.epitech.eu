import { describe, it, expect } from 'vitest'
import { getColors, colorClasses } from '../../app/utils/lib'

describe('getColors', () => {
  it('should return the correct classes for a known color key', () => {
    expect(getColors('RED')).toBe(colorClasses.RED)
    expect(getColors('SKY')).toBe(colorClasses.SKY)
  })

  it('should be case insensitive', () => {
    expect(getColors('red')).toBe(colorClasses.RED)
    expect(getColors('Blue')).toBe(colorClasses.BLUE)
    expect(getColors('vIoLeT')).toBe(colorClasses.VIOLET)
  })

  it('should return GRAY classes (default) for unknown colors', () => {
    expect(getColors('MAGENTA')).toBe(colorClasses.GRAY)
    expect(getColors('unknown-color')).toBe(colorClasses.GRAY)
  })

  it('should return GRAY classes for empty string', () => {
    expect(getColors('')).toBe(colorClasses.GRAY)
  })

  it.each(Object.keys(colorClasses))('should correctly retrieve %s', (colorKey) => {
    expect(getColors(colorKey)).toBe(colorClasses[colorKey])
  })
})
