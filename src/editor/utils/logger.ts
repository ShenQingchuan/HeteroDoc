/* eslint-disable no-console */

type LogMethodFunc = (...args: any[]) => void

export class EditorLogger {
  name: string
  constructor(name: string) {
    this.name = name
  }

  info: LogMethodFunc = (...args) => { console.log(...args) }
  warn: LogMethodFunc = (...args) => { console.warn(...args) }
  error: LogMethodFunc = (...args) => { console.error(...args) }
}

export function getLogger(loggerName: string) {
  return new EditorLogger(loggerName)
}
