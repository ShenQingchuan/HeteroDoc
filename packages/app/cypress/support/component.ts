import '../../src/styles/prosemirror.css'
import 'uno.css'
import { mount } from 'cypress/vue'

const enoughWaitTime = 360 // ms
const isMacOS = (): boolean => {
  return typeof navigator !== 'undefined'
    ? /Mac/.test(navigator.platform)
    : false
}

Cypress.Commands.add('mount', mount)
Cypress.Commands.add('focusEditor', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).get('.ProseMirror').focus()
})
Cypress.Commands.add('selectAll', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).focusEditor().typeWithModKey('a')
})
Cypress.Commands.add('deleteAll', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).focusEditor().typeWithModKey('a').type('{del}')
})
Cypress.Commands.add('shouldExistMarkSelector', { prevSubject: true }, (subject, markSelector) => {
  return cy.wrap(subject).get(markSelector).should('exist')
})
Cypress.Commands.add('shouldNotExistMarkSelector', { prevSubject: true }, (subject, markSelector) => {
  return cy.wrap(subject).get(markSelector).should('not.exist')
})
Cypress.Commands.add('fillInputBySelector', { prevSubject: true }, (subject, inputSelector, content) => {
  return cy.wrap(subject).get(inputSelector).focus().type(content)
})
Cypress.Commands.add('clickBySelector', { prevSubject: true }, (subject, selector) => {
  return cy.wrap(subject).get(selector).click()
})
Cypress.Commands.add('testMarkMenuBtnActiveState', { prevSubject: true }, (subject, markName) => {
  const menuBtnSelector = `.hetero-editor__float-menu-item.${markName}`
  return cy.wrap(subject)
    .deleteAll() // clear content
    .type('test mark menu btn active state content')
    .typeWithModKey('a').wait(enoughWaitTime) // waiting for showing menu
    .get(menuBtnSelector).click().wait(enoughWaitTime)
    .get(menuBtnSelector).should('have.class', 'active')
})
Cypress.Commands.add('typeWithModKey', { prevSubject: true }, (subject, content) => {
  const modKey = isMacOS() ? 'meta' : 'ctrl'
  return cy.wrap(subject).type(`{${modKey}}${content}`)
})
