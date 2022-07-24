import '../../src/styles/prosemirror.css'
import 'uno.css'

import { mount } from 'cypress/vue'
Cypress.Commands.add('mount', mount)
Cypress.Commands.add('focusEditor', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).get('.ProseMirror').focus()
})
Cypress.Commands.add('deleteAll', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).focusEditor().type('{selectAll}').type('{del}')
})
Cypress.Commands.add('shouldExistMarkSelector', { prevSubject: true }, (subject, markSelector) => {
  return cy.wrap(subject).get(markSelector).should('exist')
})
Cypress.Commands.add('shouldNotExistMarkSelector', { prevSubject: true }, (subject, markSelector) => {
  return cy.wrap(subject).get(markSelector).should('not.exist')
})
Cypress.Commands.add('selectAllAndRunShortcut', { prevSubject: true }, (subject, shortcutCmd) => {
  return cy.wrap(subject).type('{selectAll}').type(shortcutCmd)
})
Cypress.Commands.add('fillInputBySelector', { prevSubject: true }, (subject, inputSelector, content) => {
  return cy.wrap(subject).get(inputSelector).focus().type(content)
})
Cypress.Commands.add('clickBySelector', { prevSubject: true }, (subject, selector) => {
  return cy.wrap(subject).get(selector).click()
})
