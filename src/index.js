import { shallow } from 'enzyme'

let mockStore = null
export const createMockStore = (reducer, preloadedState = null, middlewares = []) => {
  let mockState = preloadedState === null ? {} : preloadedState
  let listeners = []

  class MockStore {
    getState () {
      return mockState
    }

    dispatch (action) {

      /*middlewares = middlewares.slice()
      middlewares.reverse()*/

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

  mockStore = new MockStore()

  return mockStore
}

export const createConnectedComponent = (mapStateToProps = null, mapDispatchToProps = null, component) => {
  if (!mockStore) {
    throw new Error('You have not created the store!')
  }

  let comp = shallow(component)

  if (mapStateToProps) {
    comp.setProps(mapStateToProps(mockStore.getState()))
  }

  if (mapDispatchToProps) {
    comp.setProps(mapDispatchToProps(mockStore.dispatch))
  }

  mockStore.subscribe(mockState => {
    if (mapStateToProps) {
      comp.setProps(mapStateToProps(mockState))
    }
  })

  return comp
}
