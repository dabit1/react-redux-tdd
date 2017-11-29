import { mount } from 'enzyme'

export const setupJsdom = () => {
  const { JSDOM } = require('jsdom')
  const jsdom = new JSDOM('<!doctype html><html><body></body></html>')
  const { window } = jsdom

  function copyProps (src, target) {
    const props = Object.getOwnPropertyNames(src)
      .filter(prop => typeof target[prop] === 'undefined')
      .reduce((result, prop) => ({
        ...result,
        [prop]: Object.getOwnPropertyDescriptor(src, prop)
      }), {})
    Object.defineProperties(target, props)
  }

  global.window = window
  global.document = window.document
  global.navigator = {
    userAgent: 'node.js'
  }
  copyProps(window, global)
}

export const createMockStore = (reducer, preloadedState = null, middlewares = []) => {
  let mockState = preloadedState === null ? {} : preloadedState
  let listeners = []

  class MockStore {
    getState () {
      return mockState
    }

    dispatch (action) {
      /* middlewares = middlewares.slice()
      middlewares.reverse() */

      mockState = reducer(mockState, action)
      for (let i = 0, l = listeners.length; i < l; i++) {
        listeners[i](mockState)
      }
    }

    subscribe (listener) {
      listeners.push(listener)
      return () => {
        listeners = listeners.splice(listeners.indexOf(listener), 1)
      }
    }

    replaceReducer (nextReducer) {
      reducer = nextReducer
    }
  }

  return new MockStore()
}

export const createConnectedComponent = (mockStore, component, mapStateToProps = null, mapDispatchToProps = null) => {
  if (!mockStore) {
    throw new Error('You have not created the store!')
  }

  let comp = mount(component)

  if (mapStateToProps) {
    comp.setProps(mapStateToProps(mockStore.getState(), comp.instance().props))
  }

  if (mapDispatchToProps) {
    comp.setProps(mapDispatchToProps(mockStore.dispatch, comp.instance().props))
  }

  mockStore.subscribe(mockState => {
    if (mapStateToProps) {
      comp.setProps(mapStateToProps(mockState, comp.instance().props))
    }
  })

  return comp
}
