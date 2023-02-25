import '@hetero/editor/dist/styles/index.css'
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
  const modKey = isMacOS() ? 'cmd' : 'ctrl'
  return cy.wrap(subject).type(`{${modKey}}${content}`)
})
Cypress.Commands.add('loop', { prevSubject: true }, (subject, times, callback) => {
  const cyWrap = cy.wrap(subject)
  let runningChain = cyWrap
  for (let i = 0; i < times; i++) {
    runningChain = callback(runningChain, i)
  }
  return runningChain
})
Cypress.Commands.add('doFastPath', { prevSubject: true }, (subject, optionClassTag) => {
  return cy.wrap(subject)
    .type('/').wait(enoughWaitTime)
    .get(`.hetero-editor__input-fastpath-option.${optionClassTag}`)
    .click().wait(enoughWaitTime)
    .focusEditor()
})
Cypress.Commands.add('waitUntil', { prevSubject: 'optional' }, (subject, checkFunction, originalOptions = {}) => {
  const logCommand = ({ options, originalOptions }) => {
    if (options.log) {
      options.logger({
        name: options.description,
        message: options.customMessage,
        consoleProps: () => originalOptions,
      })
    }
  }
  const logCommandCheck = ({ result, options, originalOptions }) => {
    if (!options.log || !options.verbose)
      return

    const message = [result]
    if (options.customCheckMessage) {
      message.unshift(options.customCheckMessage)
    }
    options.logger({
      name: options.description,
      message,
      consoleProps: () => originalOptions,
    })
  }

  if (!(checkFunction instanceof Function)) {
    throw new TypeError(`\`checkFunction\` parameter should be a function. Found: ${checkFunction}`)
  }

  const defaultOptions = {
    // base options
    interval: 200,
    timeout: 5000,
    errorMsg: 'Timed out retrying',

    // log options
    description: 'waitUntil',
    log: true,
    customMessage: undefined,
    logger: Cypress.log,
    verbose: false,
    customCheckMessage: undefined,
  }
  const options = { ...defaultOptions, ...originalOptions }

  // filter out a falsy passed "customMessage" value
  options.customMessage = [options.customMessage, originalOptions].filter(Boolean)

  let retries = Math.floor(options.timeout / options.interval)

  logCommand({ options, originalOptions })

  const check = (result) => {
    logCommandCheck({ result, options, originalOptions })
    if (result) {
      return result
    }
    if (retries < 1) {
      const msg
        = options.errorMsg instanceof Function ? options.errorMsg(result, options) : options.errorMsg
      throw new Error(msg)
    }
    cy.wait(options.interval, { log: false }).then(() => {
      retries--
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return resolveValue()
    })
  }

  const resolveValue = () => {
    const result = checkFunction(subject)

    if (result instanceof Promise) {
      return result.then(check)
    }
    else {
      return check(result)
    }
  }

  return resolveValue()
})
Cypress.Commands.add('waitUntilElementAttached', { prevSubject: true }, (subject, selector, callback) => {
  cy.wrap(subject)
    .waitUntil(() => cy.get(selector).then(el => Cypress.dom.isAttached(el) ? el : undefined))
    .then((el) => {
      if (el) {
        callback(el)
      }
    })
})
