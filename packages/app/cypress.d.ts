import type { mount } from 'cypress/vue'

type MountParams = Parameters<typeof mount>
type OptionsParam = MountParams[1]

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      focusEditor: () => Chainable<JQuery<HTMLElement>>
      deleteAll: () => Chainable<JQuery<HTMLElement>>
      shouldExistMarkSelector: (markSelector: string) => Chainable<JQuery<HTMLElement>>
      shouldNotExistMarkSelector: (markSelector: string) => Chainable<JQuery<HTMLElement>>
      selectAllAndRunShortcut: (shortcutCmd: string) => Chainable<JQuery<HTMLElement>>
      fillInputBySelector: (inputSelector: string, content: string) => Chainable<JQuery<HTMLElement>>
      clickBySelector: (selector: string) => Chainable<JQuery<HTMLElement>>
    }
  }
}
