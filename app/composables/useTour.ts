import { driver, type DriveStep, type Driver } from 'driver.js'

const TOUR_STORAGE_KEY = 'epitrello-tour-done'
const HIGHLIGHT_CLASS = 'tour-step-highlighted'

export function useTour() {
  let driverInstance: Driver | null = null
  let completedFromLastStep = false
  let documentClickHandler: ((e: MouseEvent) => void) | null = null

  const stepsByPath = (path: string): DriveStep[] => {
    // Boards list page
    if (path === '/boards') {
      return [
        {
          element: '[data-tour="sidebar"]',
          popover: {
            title: 'Bienvenue sur Epitrello',
            description:
              'Votre tableau de bord : accédez à vos tableaux (Boards) et aux paramètres depuis cette barre. Chaque tableau contient des listes (To do, En cours…) et des cartes à organiser.<br><br><strong>⌨️ Raccourcis</strong> : flèches ← → pour naviguer, Échap pour fermer. Cliquez sur la zone sombre pour passer à l’étape suivante.',
            side: 'right',
            align: 'start',
            popoverClass: 'driver-popover--welcome'
          }
        },
        {
          element: '[data-tour="create-board"]',
          popover: {
            title: 'Créer un tableau',
            description:
              'Cliquez ici pour créer un nouveau tableau. Donnez-lui un nom (ex. nom de projet) puis validez. Vous pourrez ensuite y ajouter des listes et des cartes.<br><br>💡 <em>Astuce</em> : vous pouvez cliquer sur l’élément mis en avant pour essayer tout de suite.',
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
            title: 'Vous êtes prêt !',
            description:
              'Résumé : tableaux → listes → cartes, glisser-déposer pour réorganiser, clic sur une carte pour les détails (labels, date d’échéance). Le bouton ? permet de revoir ce guide à tout moment.',
            side: 'left',
            align: 'center',
            doneBtnText: "J'ai compris !"
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
              "Glissez-déposez les listes pour les réordonner, et les cartes entre les listes pour mettre à jour l'avancement. Cliquez sur une carte pour voir ou modifier son détail : description, étiquettes (labels) et date d'échéance.<br><br>💡 <em>Astuce</em> : le glisser-déposer fonctionne aussi au clavier dans la plupart des navigateurs.",
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '[data-tour="tour-trigger"]',
          popover: {
            title: 'Vous êtes prêt !',
            description:
              'Résumé : nom du tableau modifiable au crayon, listes avec couleurs, cartes avec labels et dates. Le bouton ? permet de revoir ce guide à tout moment.',
            side: 'left',
            align: 'center',
            doneBtnText: "J'ai compris !"
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

    completedFromLastStep = false

    driverInstance = driver({
      showProgress: true,
      progressText: '{{current}} / {{total}}',
      nextBtnText: 'Suivant',
      prevBtnText: 'Précédent',
      doneBtnText: "J'ai compris !",
      steps,
      overlayOpacity: 0.3,
      smoothScroll: true,
      allowClose: true,
      allowKeyboardControl: true,
      overlayClickBehavior: 'nextStep',
      stagePadding: 12,
      stageRadius: 8,
      animate: true,
      onPopoverRender(popover, { state, driver: dr }) {
        if (state.activeIndex === 0) {
          const skipBtn = document.createElement('button')
          skipBtn.type = 'button'
          skipBtn.className = 'driver-popover-skip-btn'
          skipBtn.textContent = 'Passer le guide'
          skipBtn.addEventListener('click', () => {
            try {
              localStorage.setItem(TOUR_STORAGE_KEY, 'true')
            } catch {
              // ignore
            }
            dr.destroy()
          })
          popover.footer.insertBefore(skipBtn, popover.footerButtons)
        }
      },
      onHighlighted(element, _step, { state: s }) {
        if (element) element.classList.add(HIGHLIGHT_CLASS)
      },
      onDeselected(element) {
        if (element) element.classList.remove(HIGHLIGHT_CLASS)
      },
      onDestroyStarted(_element, _step, { state: s, driver: dr }) {
        if (s.activeIndex === steps.length - 1) completedFromLastStep = true
        // onDestroyStarted interrompt la destruction : il faut appeler dr.destroy()
        // pour que la croix et "J'ai compris" ferment réellement le tour
        dr.destroy()
      },
      onDestroyed: () => {
        if (documentClickHandler) {
          document.body.removeEventListener(
            'click',
            documentClickHandler as EventListener,
            true
          )
          documentClickHandler = null
        }
        if (!force) {
          try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true')
          } catch {
            // ignore
          }
        }
        if (completedFromLastStep) {
          try {
            useToast().add({
              title: 'Guide terminé',
              description:
                'Vous pouvez relancer le guide avec le bouton ? à tout moment.',
              color: 'success'
            })
          } catch {
            // ignore
          }
        }
      }
    })

    driverInstance.drive()

    documentClickHandler = (e: MouseEvent) => {
      const dr = driverInstance
      if (!dr?.isActive()) return
      const target = e.target as Element
      if (target.closest('.driver-popover-close-btn')) {
        e.preventDefault()
        e.stopPropagation()
        dr.destroy()
        return
      }
      if (target.closest('.driver-popover-next-btn')) {
        e.preventDefault()
        e.stopPropagation()
        if (dr.hasNextStep()) dr.moveNext()
        else dr.destroy()
        return
      }
      if (target.closest('.driver-popover-prev-btn')) {
        e.preventDefault()
        e.stopPropagation()
        dr.movePrevious()
      }
    }
    document.body.addEventListener(
      'click',
      documentClickHandler as EventListener,
      true
    )
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
