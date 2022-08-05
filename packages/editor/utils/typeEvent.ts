type EventsMap<EventsDef> = {
  [key in keyof EventsDef]?: Array<(args?: EventsDef[key]) => void>
}

export class TypeEvent<EventsDef> {
  private _events: EventsMap<EventsDef> = {}

  on<N extends keyof EventsDef>(eventName: N, fn: (args?: EventsDef[N]) => void) {
    const eventCallbacks = this._events[eventName]
    if (eventCallbacks) {
      eventCallbacks.push(fn)
    }
    else {
      this._events[eventName] = [fn]
    }
  }

  emit<N extends keyof EventsDef>(eventName: N, args?: EventsDef[N]) {
    const fns = this._events[eventName]
    fns?.forEach(fn => fn(args))
  }

  once<N extends keyof EventsDef>(eventName: N, fn: (args?: EventsDef[N]) => void) {
    const onceFn = (args?: EventsDef[N]) => {
      fn(args)
      this.off(eventName, onceFn)
    }
    this.on(eventName, onceFn)
  }

  off<N extends keyof EventsDef>(eventName: N, fn?: (args?: EventsDef[N]) => void) {
    if (this._events[eventName]) {
      if (!fn) {
        delete this._events[eventName]
        return
      }
      // maybe this._events has one key to several same handlers
      this._events[eventName] = this._events[eventName]?.filter(f => f !== fn)
    }
  }

  clean() {
    this._events = {}
  }
}
