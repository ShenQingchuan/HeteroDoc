import { createPinia } from 'pinia'
import { createI18nPlugin } from '../../i18n'
import Playground from './playground.vue'

const mountEditor = () => {
  return cy.viewport(1200, 800)
    .mount(Playground, {
      extensions: {
        plugins: [createPinia(), createI18nPlugin()],
        stubs: {
          'transition': false,
          'transition-group': false,
        },
      },
    })
    .get('.ProseMirror')
    .focus()
    // clear all content
    .type('{selectAll}')
    .type('{del}')
}
type TestToggleToolbarMarkCallback = (ar: Cypress.Chainable<JQuery<HTMLElement>>) => void
const testToggleToolbarResult = (
  item: string,
  callback: TestToggleToolbarMarkCallback,
) => {
  const actionResult = mountEditor()
    .type(`Editor test, mark ${item}`)
    .type('{selectAll}')
    .get(`.editor-toolbar-item.${item}`)
    .click()
  callback(actionResult)
}
const markSelectorExists = (selectorName: string): TestToggleToolbarMarkCallback => {
  return ar => ar.get(`.ProseMirror > p > ${selectorName}`).should('exist')
}

describe('Editor playground test', () => {
  it('can make text bold by toolbar', () => {
    testToggleToolbarResult('bold', markSelectorExists('strong'))
  })
  it('can make text italic by toolbar', () => {
    testToggleToolbarResult('italic', markSelectorExists('em'))
  })
  it('can make text underline by toolbar', () => {
    testToggleToolbarResult('underline', markSelectorExists('u'))
  })
  it('can make inline code by toolbar', () => {
    testToggleToolbarResult('code', markSelectorExists('code'))
  })
})
