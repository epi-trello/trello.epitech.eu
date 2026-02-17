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
            title: 'Bienvenue sur Epitrello',
            description:
              'Votre tableau de bord : accédez à vos tableaux (Boards) et aux paramètres depuis cette barre. Chaque tableau contient des listes (To do, En cours…) et des cartes à organiser.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="create-board"]',
          popover: {
            title: 'Créer un tableau',
            description:
              'Cliquez ici pour créer un nouveau tableau. Donnez-lui un nom (ex. nom de projet) puis validez. Vous pourrez ensuite y ajouter des listes et des cartes.',
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '[data-tour="boards-grid"]',
          popover: {
            title: 'Vos tableaux',
            description:
              "Tous vos tableaux s'affichent ici. Cliquez sur un tableau pour l'ouvrir. Au survol d'une carte, l'icône corbeille permet de supprimer le tableau (action irréversible).",
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '[data-tour="tour-trigger"]',
          popover: {
            title: 'Aide et rappel du guide',
            description:
              "Le bouton ? permet de revoir ce guide à tout moment. Utilisez-le si vous oubliez une fonctionnalité ou pour faire découvrir l'application à quelqu'un.",
            side: 'left',
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
            title: 'Retour aux tableaux',
            description:
              "Revenir à la liste de tous vos tableaux sans quitter l'application.",
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '[data-tour="board-title"]',
          popover: {
            title: 'Nom du tableau',
            description:
              "Le nom du tableau s'affiche ici. Cliquez sur l'icône crayon pour le modifier directement.",
            side: 'bottom',
            align: 'center'
          }
        },
        {
          element: '[data-tour="new-list"]',
          popover: {
            title: 'Nouvelle liste',
            description:
              "Ajoutez une liste (ex. « À faire », « En cours », « Terminé »). Vous pouvez choisir un titre et une couleur. Les cartes seront créées à l'intérieur des listes.",
            side: 'bottom',
            align: 'end'
          }
        },
        {
          element: '[data-tour="lists-area"]',
          popover: {
            title: 'Listes et cartes',
            description:
              "Glissez-déposez les listes pour les réordonner, et les cartes entre les listes pour mettre à jour l'avancement. Cliquez sur une carte pour voir ou modifier son détail : description, étiquettes (labels) et date d'échéance.",
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '[data-tour="tour-trigger"]',
          popover: {
            title: 'Revoir le guide',
            description:
              'Vous pouvez relancer ce guide à tout moment depuis le bouton ? dans la barre de navigation.',
            side: 'left',
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
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: "C'est parti",
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
