import { createMockStore } from '../src'

/* ------ TESTS IMPLEMENTATION ------ */

// Action
const foo = () => ({type: 'FOO'})

// Reducer
const something = (state = initialState, action) => {
  switch (action.type) {
    case 'FOO':
      return {...state, called: true}
    default:
      return state
  }
}

// Initial state
const initialState = {
  called: false
}

/* ------ TESTS ------ */

it('should have the state as the initial state if there is no preloaded state', () => {
  const store = createMockStore(something, undefined)

  expect(store.getState()).toEqual(initialState)
})

it('should have the state as the initial state if it is passed as an argument', () => {
  const store = createMockStore(something, { initialState: true })

  expect(store.getState()).toEqual({ initialState: true })
})

it('should be the store subscribable', () => {
  const store = createMockStore(something, initialState)

  let iWasCalled = false
  store.subscribe(() => {
    iWasCalled = true
  })
  store.dispatch(foo())

  expect(iWasCalled).toBeTruthy()
})

it('should be the subcription unsubscribable', () => {
  const store = createMockStore(something, initialState)

  let iWasCalled = false
  const unsubscribe = store.subscribe(() => {
    iWasCalled = true
  })
  unsubscribe()
  store.dispatch(foo())

  expect(iWasCalled).toBeFalsy()
})
