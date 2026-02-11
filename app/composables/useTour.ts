import { driver, type DriveStep, type Driver } from 'driver.js'

const TOUR_STORAGE_KEY = 'epitrello-tour-done'

export function useTour() {
  let driverInstance: Driver | null = null

  const stepsByPath = (path: string): DriveStep[] => {
    // Boards list page
    if (path === '/boards') {
      return [
        {
          element: '[data-tour="sidebar"]',
          popover: {
            title: 'Welcome to Epitrello',
            description:
              "Navigate between your boards and access settings. Let's take a quick tour!",
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="create-board"]',
          popover: {
            title: 'Create a board',
            description:
              'Click here to create a new board. Each board can contain multiple lists and cards.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '[data-tour="boards-grid"]',
          popover: {
            title: 'Your boards',
            description:
              'Your boards appear here. Click a board to open it and manage your lists and cards.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    }

    // Board detail page
    if (path.startsWith('/boards/') && !path.includes('/cards/')) {
      return [
        {
          element: '[data-tour="back-board"]',
          popover: {
            title: 'Back',
            description: 'Return to the list of all your boards.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-tour="new-list"]',
          popover: {
            title: 'New list',
            description:
              'Add a list (e.g. "To do", "In progress", "Done"). Each list will contain cards.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '[data-tour="lists-area"]',
          popover: {
            title: 'Lists and cards',
            description:
              'Drag and drop lists to reorder them, and cards between lists. Click a card to see details, labels and dates.',
            side: 'top',
            align: 'center'
          }
        }
      ]
    }

    return []
  }

  function getSteps(): DriveStep[] {
    if (import.meta.client) {
      const path = useRoute().path
      return stepsByPath(path)
    }
    return []
  }

  function startTour(force = false) {
    if (import.meta.server) return

    const steps = getSteps()
    if (steps.length === 0) return

    if (driverInstance?.isActive()) {
      driverInstance.destroy()
    }

    driverInstance = driver({
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Previous',
      doneBtnText: 'Get started',
      steps,
      overlayOpacity: 0.25,
      smoothScroll: true,
      allowClose: true,
      onDestroyed: () => {
        if (!force) {
          try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true')
          } catch {
            // ignore
          }
        }
      }
    })

    driverInstance.drive()
  }

  function markTourAsNotDone() {
    if (import.meta.client) {
      try {
        localStorage.removeItem(TOUR_STORAGE_KEY)
      } catch {
        // ignore
      }
    }
  }

  const hasSeenTour = computed(() => {
    if (import.meta.server) return true
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) === 'true'
    } catch {
      return true
    }
  })

  const canRunTourOnPage = computed(() => {
    if (import.meta.server) return false
    const path = useRoute().path
    return (
      path === '/boards' ||
      (path.startsWith('/boards/') && !path.includes('/cards/'))
    )
  })

  return {
    startTour,
    markTourAsNotDone,
    getSteps,
    hasSeenTour,
    canRunTourOnPage,
    TOUR_STORAGE_KEY
  }
}
