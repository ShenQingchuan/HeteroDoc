import { createPinia } from 'pinia'
import { createI18nPlugin } from '../../i18n'
import Playground from './playground.vue'

// CONSTANTS:
const testHyperlinkURL = 'https://heterocube.top'
const isMacOS = (): boolean => {
  return typeof navigator !== 'undefined'
    ? /Mac/.test(navigator.platform)
    : false
}
const withModKey = (...keys: string[]) => {
  const modKey = isMacOS() ? 'meta' : 'ctrl'
  return [`{${modKey}}`, ...keys].join('')
}

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
    .wait(100)
    .get(`.hetero-editor__float-menu-item.${toolbarKeyClassName}`)
    .click()
  return callback(actionResult)
}
const getMarkSelector = (markTagName: string) => `.ProseMirror > p > ${markTagName}`
const markSelectorExists = (markSelector: string): CypressChainablePipeline => {
  return chain => chain.get(markSelector).should('exist')
}

describe('Editor playground test', () => {
  it('can make text bold', () => {
    const markSelector = getMarkSelector('strong')
    testToggleToolbarResult('bold', markSelectorExists(markSelector))
    // Test keyboard shortcut
      .type('{selectAll}')
      .type(withModKey('b'))
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
      .type(withModKey('i'))
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
      .type(withModKey('u'))
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
  it('can create hyperlink', () => {
    const markSelector = getMarkSelector(`a.hyperlink[href="${testHyperlinkURL}"]`)
    testToggleToolbarResult('hyperlink', (chain) => {
      return chain.wait(100)
        .get('.hetero-editor__link-edit.edit-link input')
        .focus()
        .type(testHyperlinkURL)
        .get('.hetero-editor__link-edit.confirm')
        .click()
        .get(markSelector).should('exist')
    })
  })
  it('can create hyperlink from Markdown format', () => {
    const markSelector = getMarkSelector(`a.hyperlink[href="${testHyperlinkURL}"]`)
    const markdownFormat = `[test](${testHyperlinkURL})`
    mountEditor()
      .type(markdownFormat).wait(100)
      .get(markSelector)
      .should('exist').and('have.text', 'test').and('have.attr', 'href', testHyperlinkURL)
  })
})
