import { describe, it, expect } from 'vitest'
import { getCacheBustedUrl } from '../../app/utils/lib'

describe('getCacheBustedUrl', () => {
  it('should append the current timestamp query parameter to the URL', () => {
    const baseUrl = 'https://example.com/image.png'
    const result = getCacheBustedUrl(baseUrl)

    expect(result).toMatch(/^https:\/\/example\.com\/image\.png\?t=\d+$/)
  })

  it('should generate a timestamp close to the real current time', () => {
    const result = getCacheBustedUrl('test.jpg')
    const timestampStr = result.split('?t=')[1]
    const timestamp = Number(timestampStr)
    const now = Date.now()

    expect(Number.isNaN(timestamp)).toBe(false)
    expect(timestamp).toBeLessThanOrEqual(now)
    expect(timestamp).toBeGreaterThan(now - 100)
  })

  it('should work correctly with relative paths', () => {
    const path = '/assets/logo.svg'
    const result = getCacheBustedUrl(path)
    expect(result).toContain('/assets/logo.svg?t=')
  })
})
