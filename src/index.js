import React from 'react'
import { shallow, mount } from 'enzyme'
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

export function createMockStore (reducer = null, preloadedState = undefined, middlewares = []) {
  let mockState = reducer ? reducer(preloadedState, {action: null}) : (preloadedState !== undefined ? preloadedState : {});
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

const renderingConnectedComponent = (mockStore, connectedComponent, props, options, rendering) => {
  if (!mockStore) {
    throw new Error('You have not created the store!')
  }

  let componentOptions = { context: { store: mockStore } }
  if (options) {
    componentOptions = {
      ...options,
      context: {
        ...options.context,
        ...componentOptions.context
      }
    }
  }

  const component = rendering === 'mount'
                  ? mount(React.createElement(connectedComponent, props), componentOptions)
                  : shallow(React.createElement(connectedComponent, props), componentOptions)

  const oldDispatch = mockStore.dispatch
  mockStore.dispatch = function (action) {
    const result = oldDispatch(action)
    component.update()
    return result
  }

  return component
}

export const mountConnectedComponent = (mockStore, connectedComponent, props = {}, options = null) =>
  renderingConnectedComponent(mockStore, connectedComponent, props, options, 'mount')

export const shallowConnectedComponent = (mockStore, connectedComponent, props = {}, options = null) =>
  renderingConnectedComponent(mockStore, connectedComponent, props, options, 'shallow')
