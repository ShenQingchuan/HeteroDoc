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
type CypressChainablePipeline = (ar: Cypress.Chainable<JQuery<HTMLElement>>) => Cypress.Chainable
const testToggleToolbarResult = (
  toolbarKeyClassName: string,
  callback: CypressChainablePipeline,
) => {
  const actionResult = mountEditor()
    .type(`Editor test, mark ${toolbarKeyClassName}`)
    .type('{selectAll}')
    .get(`.editor-toolbar-item.${toolbarKeyClassName}`)
    .click()
  return callback(actionResult)
}
const getMarkSelector = (markTagName: string) => `.ProseMirror > p > ${markTagName}`
const markSelectorExists = (markSelector: string): CypressChainablePipeline => {
  return ar => ar.get(markSelector).should('exist')
}

describe('Editor playground test', () => {
  it('can make text bold', () => {
    const markSelector = getMarkSelector('strong')
    testToggleToolbarResult('bold', markSelectorExists(markSelector))
    // Test keyboard shortcut
      .type('{selectAll}')
      .type('{meta}b')
      .get(markSelector).should('not.exist')
    // Test input rule
      .get('.ProseMirror').focus().type('{selectAll}').type('{del}')
      .type('**These text should be bold**')
      .get(markSelector).should('exist')
  })
  it('can make text italic', () => {
    const markSelector = getMarkSelector('em')
    testToggleToolbarResult('italic', markSelectorExists(markSelector))
    // Test keyboard shortcut
      .type('{selectAll}')
      .type('{meta}i')
      .get(markSelector).should('not.exist')
    // Test input rule
      .get('.ProseMirror').focus().type('{selectAll}').type('{del}')
      .type('*These text should be italic*')
      .get(markSelector).should('exist')
      .get('.ProseMirror').focus().type('{selectAll}').type('{del}')
      .type('_These text should be italic_')
      .get(markSelector).should('exist')
  })
  it('can make text underline', () => {
    const markSelector = getMarkSelector('u')
    testToggleToolbarResult('underline', markSelectorExists(markSelector))
    // Test keyboard shortcut
      .type('{selectAll}')
      .type('{meta}u')
      .get(markSelector).should('not.exist')
  })
  it('can make inline code', () => {
    const markSelector = getMarkSelector('code')
    testToggleToolbarResult('code', markSelectorExists(markSelector))
    // Test input rule
      .get('.ProseMirror').focus().type('{selectAll}').type('{del}')
      .type('`These text should be inline code` outside')
      .get(markSelector).should('exist')
  })
  it('can make text decoration strike-through', () => {
    const markSelector = getMarkSelector('del')
    testToggleToolbarResult('deleteLine', markSelectorExists(markSelector))
    // Test input rule
      .get('.ProseMirror').focus().type('{selectAll}').type('{del}')
      .type('~These text should be strike through~')
      .get(markSelector).should('exist')
  })
})
