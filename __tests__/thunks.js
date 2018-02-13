import { createMockStore } from '../src'
import thunk from 'redux-thunk'

/* ------ TESTS IMPLEMENTATION ------ */

// Action
const fetchSomethingRequest = () => ({type: 'FETCH_SOMETHING_REQUEST'})
const fetchSomethingSuccess = fetchedData => ({type: 'FETCH_SOMETHING_SUCCESS', fetchedData})
const fetchSomethingFailure = error => ({type: 'FETCH_SOMETHING_FAILURE', error})

const asyncFunction = result => {
  return new Promise((resolve, reject) => {
    (result && resolve('Fetched data')) || reject(new Error('something wrong'))
  })
}

const fetchSomething = promiseResult => {
  return (dispatch, getState) => {
    dispatch(fetchSomethingRequest())
    return asyncFunction(promiseResult)
      .then(data => dispatch(fetchSomethingSuccess(data)))
      .catch(error => dispatch(fetchSomethingFailure(error)))
  }
}

// Reducer
const something = (state, action) => {
  switch (action.type) {
    case 'FETCH_SOMETHING_REQUEST':
      return {...state, isLoading: true, data: '', error: ''}
    case 'FETCH_SOMETHING_SUCCESS':
      return {...state, isLoading: false, data: action.fetchedData}
    case 'FETCH_SOMETHING_FAILURE':
      return {...state, isLoading: false, error: action.error}
    default:
      return state
  }
}

// Initial state
const initialState = {
  isLoading: false,
  data: ''
}

/* ------ TESTS ------ */

it('should dispatch request and success actions when promise is resolved', () => {
  const store = createMockStore(something, initialState, [thunk])

  return store.dispatch(fetchSomething(true)).then(() => {
    expect(store.getDispatchedActions()).toEqual([
      expect.objectContaining({type: 'FETCH_SOMETHING_REQUEST'}),
      expect.objectContaining({type: 'FETCH_SOMETHING_SUCCESS'})
    ])
  })
})

it('should dispatch request and failure actions when promise is rejected', () => {
  const store = createMockStore(something, initialState, [thunk])

  return store.dispatch(fetchSomething(false)).then(() => {
    expect(store.getDispatchedActions()).toEqual([
      expect.objectContaining({type: 'FETCH_SOMETHING_REQUEST'}),
      expect.objectContaining({type: 'FETCH_SOMETHING_FAILURE'})
    ])
  })
})
