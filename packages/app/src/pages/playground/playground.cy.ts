import { createPinia } from 'pinia'
import { createI18nPlugin } from '../../i18n'
import Playground from './playground.vue'

// CONSTANTS:
const testHyperlinkURL = 'https://heterocube.top'
const enoughWaitTime = 360 // ms

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
    // clear all content
    .deleteAll()
}
const testToggleToolbarResult = (
  toolbarKeyClassName: string,
  resultMarkSelector?: string,
) => {
  const afterToolbarBtnClick = mountEditor()
    .type(`Editor test, mark ${toolbarKeyClassName}`)
    .typeWithModKey('a')
    .wait(enoughWaitTime)
    .get(`.hetero-editor__float-menu-item.${toolbarKeyClassName}`)
    .click()
  if (resultMarkSelector) {
    return afterToolbarBtnClick.shouldExistMarkSelector(resultMarkSelector)
  }
  return afterToolbarBtnClick
}
const getMarkSelector = (markTagName: string) => `.ProseMirror > p > ${markTagName}`

describe('Editor playground test', () => {
  it('can make text bold', () => {
    const markSelector = getMarkSelector('strong')
    testToggleToolbarResult('bold', markSelector)
    // Then test keyboard shortcut
      .selectAll().typeWithModKey('b')
      .shouldNotExistMarkSelector(markSelector)
    // Then test input rule
      .deleteAll()
      .type('**These text should be bold**')
      .shouldExistMarkSelector(markSelector)
  })
  it('can make text italic', () => {
    const markSelector = getMarkSelector('em')
    testToggleToolbarResult('italic', markSelector)
    // Then test keyboard shortcut
      .selectAll().typeWithModKey('i')
      .shouldNotExistMarkSelector(markSelector)
    // Then test input rule
      .deleteAll()
      .type('*These text should be italic*')
      .shouldExistMarkSelector(markSelector)
      .deleteAll()
      .type('_These text should be italic_')
      .shouldExistMarkSelector(markSelector)
  })
  it('can make text underline', () => {
    const markSelector = getMarkSelector('u')
    testToggleToolbarResult('underline', markSelector)
    // Then test keyboard shortcut
      .selectAll().typeWithModKey('u')
      .shouldNotExistMarkSelector(markSelector)
  })
  it('can make inline code', () => {
    const markSelector = getMarkSelector('code')
    testToggleToolbarResult('code', markSelector)
    // Then test input rule
      .deleteAll()
      .type('`These text should be inline code` outside')
      .shouldExistMarkSelector(markSelector)
  })
  it('can make text decoration strike-through', () => {
    const markSelector = getMarkSelector('del')
    testToggleToolbarResult('deleteLine', markSelector)
    // Then test input rule
      .deleteAll()
      .type('~These text should be strike through~')
      .shouldExistMarkSelector(markSelector)
  })
  it('can create hyperlink', () => {
    const markSelector = getMarkSelector(`a.hyperlink[href="${testHyperlinkURL}"]`)
    testToggleToolbarResult('hyperlink')
      .fillInputBySelector('.hetero-editor__link-edit.edit-link input', testHyperlinkURL)
      .clickBySelector('.hetero-editor__link-edit.confirm')
      .shouldExistMarkSelector(markSelector)
  })
  it('can create hyperlink from Markdown format', () => {
    const markSelector = getMarkSelector(`a.hyperlink[href="${testHyperlinkURL}"]`)
    const markdownFormat = `[test](${testHyperlinkURL})`
    mountEditor()
      .type(markdownFormat).wait(enoughWaitTime)
      .shouldExistMarkSelector(markSelector)
      .and('have.text', 'test')
      .and('have.attr', 'href', testHyperlinkURL)
  })
  it('can create headings', () => {
    const headingsSelectors = Array
      .from(
        { length: 5 },
        (_, i) => `.ProseMirror h${i + 1}`,
      )
      .join(',')
    mountEditor()
      .type('# Heading 1').type('{enter}')
      .type('## Heading 2').type('{enter}')
      .type('### Heading 3').type('{enter}')
      .type('#### Heading 4').type('{enter}')
      .type('##### Heading 5').type('{enter}')
      .get(headingsSelectors).should('exist')
  })
  it('can display marks\' active state on float menu', () => {
    let chain = mountEditor();
    ['bold', 'italic', 'underline', 'deleteLine', 'code'].forEach(
      (markName) => {
        chain = chain.testMarkMenuBtnActiveState(markName)
      },
    )
  })
})
