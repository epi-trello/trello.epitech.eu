export function createObjectUrl(file: File) {
  return URL.createObjectURL(file)
}

export function getCacheBustedUrl(url: string) {
  return `${url}?t=${Date.now()}`
}
