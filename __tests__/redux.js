import { createMockStore } from '../src'

/* ------ TESTS IMPLEMENTATION ------ */

// Action
const foo = () => ({type: 'FOO'})

// Reducer
const something = (state, action) => {
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
