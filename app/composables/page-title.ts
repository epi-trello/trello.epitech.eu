export const usePageTitle = () => {
  return useState<string>('page:title', () => 'Loading...')
}
