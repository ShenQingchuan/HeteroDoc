type EventsMap<EventsDef> = {
  [key in keyof EventsDef]?: Array<EventHandler<EventsDef, key>>
}

type Optional<T> = T extends null ? null | undefined : T
type EventHandler<EventsDef, N extends keyof EventsDef> = (
  args: Optional<EventsDef[N]>
) => void

export class TypeEvent<EventsDef> {
  private _events: EventsMap<EventsDef> = {}

  on<N extends keyof EventsDef>(eventName: N, fn: EventHandler<EventsDef, N>) {
    const eventCallbacks = this._events[eventName]
    if (eventCallbacks) {
      eventCallbacks.push(fn)
    } else {
      this._events[eventName] = [fn]
    }
  }

  emit<N extends keyof EventsDef>(eventName: N, args: Optional<EventsDef[N]>) {
    const callbacks = this._events[eventName]
    callbacks?.forEach((fn) => {
      fn(args)
    })
  }

  once<N extends keyof EventsDef>(
    eventName: N,
    fn: EventHandler<EventsDef, N>
  ) {
    const onceFn = (args: Optional<EventsDef[N]>) => {
      fn(args)
      this.off(eventName, onceFn)
    }
    this.on(eventName, onceFn)
  }

  off<N extends keyof EventsDef>(
    eventName: N,
    fn?: EventHandler<EventsDef, N>
  ) {
    if (this._events[eventName]) {
      if (!fn) {
        delete this._events[eventName]
        return
      }
      // maybe this._events has one key to several same handlers
      this._events[eventName] = this._events[eventName]?.filter((f) => f !== fn)
    }
  }

  clean() {
    this._events = {}
  }
}
