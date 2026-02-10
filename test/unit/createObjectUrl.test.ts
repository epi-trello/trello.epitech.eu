import { describe, it, expect } from 'vitest'
import { createObjectUrl } from '../../app/utils/lib'

describe('createObjectUrl (Integration test)', () => {
  it('should return a valid blob URL string when a file is provided', () => {
    const content = 'hello world'
    const file = new File([content], 'hello.txt', { type: 'text/plain' })
    const result = createObjectUrl(file)

    expect(typeof result).toBe('string')
    expect(result.startsWith('blob:')).toBe(true)
  })

  it('should generate different URLs for different file instances', () => {
    const file1 = new File(['content1'], 'file1.txt')
    const file2 = new File(['content2'], 'file2.txt')

    const url1 = createObjectUrl(file1)
    const url2 = createObjectUrl(file2)

    expect(url1).not.toBe(url2)
  })

  it('should work with different MIME types', () => {
    const imageFile = new File(['fake-image-data'], 'image.png', { type: 'image/png' })
    const url = createObjectUrl(imageFile)

    expect(url).toContain('blob:')
  })
})
