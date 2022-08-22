import type { mount } from 'cypress/vue'

type MountParams = Parameters<typeof mount>
type OptionsParam = MountParams[1]
type WaitUntilLog = Pick<Cypress.LogConfig, 'name' | 'message' | 'consoleProps'>
type ErrorMsgCallback<Subject = any> = (
  result: Subject,
  options: WaitUntilOptions<Subject>
) => string
interface WaitUntilOptions<Subject = any> {
  timeout?: number
  interval?: number
  errorMsg?: string | ErrorMsgCallback<Subject>
  description?: string
  customMessage?: string
  verbose?: boolean
  customCheckMessage?: string
  logger?: (logOptions: WaitUntilLog) => any
  log?: boolean
}

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
      loop: (times: number, callback: (chain: Chainable, index: number) => Chainable) => Chainable
      focusEditor: () => Chainable<JQuery<HTMLElement>>
      selectAll: () => Chainable<JQuery<HTMLElement>>
      deleteAll: () => Chainable<JQuery<HTMLElement>>
      shouldExistMarkSelector: (markSelector: string) => Chainable<JQuery<HTMLElement>>
      shouldNotExistMarkSelector: (markSelector: string) => Chainable<JQuery<HTMLElement>>
      fillInputBySelector: (inputSelector: string, content: string) => Chainable<JQuery<HTMLElement>>
      clickBySelector: (selector: string) => Chainable<JQuery<HTMLElement>>
      testMarkMenuBtnActiveState: (markName: string) => Chainable<JQuery<HTMLElement>>
      typeWithModKey: (content: string) => Chainable<JQuery<HTMLElement>>
      doFastPath: (optionClassTag: string) => Chainable<JQuery<HTMLElement>>
      waitUntil<ReturnType = any>(
        checkFunction: (
          subject: Subject | undefined
        ) => ReturnType | Chainable<ReturnType> | Promise<ReturnType>,
        options?: WaitUntilOptions<Subject>
      ): Chainable<Subject>
      waitUntilElementAttached: (selector: string, callback: (el: HTMLElement) => void) => Chainable<Subject>
    }
  }
}
