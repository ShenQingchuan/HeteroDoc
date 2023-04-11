import { createPinia } from 'pinia'
import { createI18nPlugin } from '../../i18n'
import PlaygroundE2E from './playground.test.vue'

// CONSTANTS:
const testHyperlinkURL = 'https://heterocube.top'
const enoughWaitTime = 360 // ms
const headingsSelectors = Array.from(
  { length: 5 },
  (_, i) => `.ProseMirror h${i + 1}`
).join(',')
const codeblockTestCode = `function test() {
  console.log('hello world');
}`

function mountEditor() {
  const mounted = cy.viewport(1368, 1000).mount(PlaygroundE2E, {
    extensions: {
      plugins: [createPinia(), createI18nPlugin()],
      stubs: {
        transition: false,
        'transition-group': false,
      },
    },
  })
  // clear all content
  return (
    mounted
      .focusEditor()
      // Delete mock test data
      .typeWithModKey('a')
      .type('{backspace}')
      .type('{backspace}')
  )
}
function testToggleToolbarResult(
  toolbarKeyClassName: string,
  resultMarkSelector?: string
) {
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
function getMarkSelector(markTagName: string) {
  return `.ProseMirror > p > ${markTagName}`
}

describe('Editor playground test', () => {
  it('can make text bold', () => {
    const markSelector = getMarkSelector('strong')
    testToggleToolbarResult('bold', markSelector)
      // Then test keyboard shortcut
      .selectAll()
      .typeWithModKey('b')
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
      .selectAll()
      .typeWithModKey('i')
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
      .selectAll()
      .typeWithModKey('u')
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
    const markSelector = getMarkSelector(
      `a.hyperlink[href="${testHyperlinkURL}"]`
    )
    testToggleToolbarResult('hyperlink')
      .fillInputBySelector(
        '.hetero-editor__link-edit.edit-link input',
        testHyperlinkURL
      )
      .clickBySelector('.hetero-editor__link-edit.confirm')
      .shouldExistMarkSelector(markSelector)
  })
  it('can create hyperlink from Markdown shortcut', () => {
    const markSelector = getMarkSelector(
      `a.hyperlink[href="${testHyperlinkURL}"]`
    )
    const markdownFormat = `[test](${testHyperlinkURL})`
    mountEditor()
      .type(markdownFormat)
      .wait(enoughWaitTime)
      .shouldExistMarkSelector(markSelector)
      .and('have.text', 'test')
      .and('have.attr', 'href', testHyperlinkURL)
  })
  it('can toggle headings by toolbar menu', () => {
    mountEditor().loop(5, (chain, i) => {
      const hLevel = i + 1
      return chain
        .type(`test toggle heading ${hLevel}`)
        .selectAll()
        .wait(enoughWaitTime)
        .get('.hetero-editor__float-menu-item.heading')
        .click()
        .get(`.hetero-editor__float-menu-item.heading-${hLevel}`)
        .click()
        .get(`.ProseMirror h${hLevel}`)
        .should('exist')
        .deleteAll()
    })
  })
  it('can create headings by Markdown shortcut', () => {
    mountEditor()
      .loop(5, (chain, i) => {
        const prefix = Array.from({ length: i + 1 })
          .fill('#')
          .join('')
        return chain.type(`${prefix} Heading ${i + 1}`).type('{enter}')
      })
      .get(headingsSelectors)
      .should('exist')
  })
  it("can display marks' active state on float menu", () => {
    let chain = mountEditor()
    ;['bold', 'italic', 'underline', 'deleteLine', 'code'].forEach(
      (markName) => {
        chain = chain.testMarkMenuBtnActiveState(markName)
      }
    )
  })
  it("can set block's text alignment", () => {
    let chain = mountEditor()
    ;['left', 'center', 'right', 'justify'].forEach((alignDirection) => {
      chain = chain
        .type('test text alignment')
        .selectAll()
        .wait(enoughWaitTime)
        .get(`.hetero-editor__float-menu-item.align-${alignDirection}`)
        .click()
        .get('.ProseMirror > p')
        .should('have.css', 'text-align', alignDirection)
        .deleteAll()
    })
  })
  it('can use slash to activate input fast-path', () => {
    mountEditor()
      .doFastPath('heading-2')
      .type('test input after fast path')
      .get('.ProseMirror > h2')
      .should('exist')
  })
  it('can create blockquote by Markdown shortcut', () => {
    mountEditor()
      .type('> ')
      .wait(enoughWaitTime)
      .type('test quote content{enter}test quote content')
      .get('.ProseMirror blockquote')
      .should('exist')
  })
  it('can create blockquote by fast-path', () => {
    mountEditor()
      .doFastPath('quote')
      .type('test input after fast path')
      .get('.ProseMirror blockquote')
      .should('exist')
  })
  it('can create code block by Markdown shortcut', () => {
    mountEditor()
      .type('```ts ')
      .wait(enoughWaitTime)
      .type(codeblockTestCode)
      .get('.ProseMirror pre[class="hljs"] code span[class="hljs-keyword"]')
      .should('exist')
  })
  it('can undo/redo in offline mode', () => {
    const undoTimeGap = 1000
    mountEditor()
      .type('test input first part ')
      .wait(undoTimeGap)
      .type('test input second part')
      .wait(undoTimeGap)
      .typeWithModKey('z') // mock undo action
      .get('.ProseMirror > p')
      .should('have.text', 'test input first part ')
      .get('.ProseMirror')
      .typeWithModKey('{Shift}z') // mock redo action
      .waitUntilElementAttached('.ProseMirror > p', (el) => {
        expect(el).to.text('test input first part test input second part')
      })
  })
  it('can increase/decrease text ident of text block', () => {
    mountEditor()
      .type('test text ident')
      .typeWithModKey(']')
      .wait(2 * enoughWaitTime)
      .get('.ProseMirror > p')
      .should('have.css', 'padding-left', '16px')
      .typeWithModKey(']')
      .wait(2 * enoughWaitTime)
      .get('.ProseMirror > p')
      .should('have.css', 'padding-left', '32px')
      .typeWithModKey('[')
      .wait(2 * enoughWaitTime)
      .get('.ProseMirror > p')
      .should('have.css', 'padding-left', '16px')
  })
  it('can create horizontal line in shortcut', () => {
    mountEditor()
      .type('--- ')
      .get('.ProseMirror > .heterodoc-horizontal-line')
      .should('exist')
  })
})
