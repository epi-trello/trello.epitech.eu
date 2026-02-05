export function createObjectUrl(file: File) {
  return URL.createObjectURL(file)
}

export function getCacheBustedUrl(url: string) {
  return `${url}?t=${Date.now()}`
}

export const colorItems = [
  { label: 'Gray', value: 'GRAY' },
  { label: 'Red', value: 'RED' },
  { label: 'Yellow', value: 'YELLOW' },
  { label: 'Green', value: 'GREEN' },
  { label: 'Sky', value: 'SKY' },
  { label: 'Blue', value: 'BLUE' },
  { label: 'Violet', value: 'VIOLET' },
  { label: 'Pink', value: 'PINK' }
]

export const colorClasses: Record<string, string> = {
  GRAY: 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600',
  RED: 'bg-red-200 dark:bg-red-900 border-red-400 dark:border-red-600',
  YELLOW: 'bg-yellow-200 dark:bg-yellow-900 border-yellow-400 dark:border-yellow-600',
  GREEN: 'bg-green-200 dark:bg-green-900 border-green-400 dark:border-green-600',
  SKY: 'bg-sky-200 dark:bg-sky-900 border-sky-400 dark:border-sky-600',
  BLUE: 'bg-blue-200 dark:bg-blue-900 border-blue-400 dark:border-blue-600',
  VIOLET: 'bg-violet-200 dark:bg-violet-900 border-violet-400 dark:border-violet-600',
  PINK: 'bg-pink-200 dark:bg-pink-900 border-pink-400 dark:border-pink-600'
}

export function getColors(color: string) {
  return colorClasses[color.toUpperCase()] || colorClasses.GRAY
}
