import React from 'react'
import { mount } from 'enzyme'
import { applyMiddleware } from 'redux'

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

export function createMockStore (reducer = null, preloadedState = null, middlewares = []) {
  let mockState = preloadedState === null ? {} : preloadedState
  let listeners = []
  let actions = []

  function mockStore () {
    return {
      getState () {
        return mockState
      },

      dispatch (action) {
        if (reducer) {
          mockState = reducer(mockState, action)
        }
        
        for (let i = 0, l = listeners.length; i < l; i++) {
          listeners[i](mockState)
        }
        actions.push(action)
      },

      subscribe (listener) {
        listeners.push(listener)
        return () => {
          listeners.splice(listeners.indexOf(listener), 1)
        }
      },

      replaceReducer (nextReducer) {
        reducer = nextReducer
      },

      getDispatchedActions () {
        return actions
      }
    }
  }

  const MockStoreWithMiddleware = applyMiddleware(
    ...middlewares
  )(mockStore)

  return new MockStoreWithMiddleware()
}

export const mountConnectedComponent = (mockStore, connectedComponent, props = {}) => {
  if (!mockStore) {
    throw new Error('You have not created the store!')
  }

  const component = mount(React.createElement(connectedComponent, props), { context: { store: mockStore } })

  const oldDispatch = mockStore.dispatch
  mockStore.dispatch = function (action) {
    const result = oldDispatch(action)
    component.update()
    return result
  }

  return component
}
