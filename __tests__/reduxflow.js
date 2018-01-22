import React from 'react'
import { createMockStore, mountConnectedComponent } from '../src'
import { connect } from 'react-redux'

/* ------ TESTS IMPLEMENTATION ------ */

// Component
class TodoListItem extends React.Component {
  render () {
    return (<span>{this.props.task}</span>)
  }
}

class TodoList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      newTaskValue: ''
    }
  }

  render () {
    return (
      <div>
        <div onClick={this.props.onAddTask}>
          {this.props.tasks && this.props.tasks.map((task, i) => <TodoListItem key={i} task={task} />)}
        </div>
        <input type='text' className='input-text' onChange={event => this.setState({newTaskValue: event.target.value})} />
        <button onClick={() => this.props.onAddTask(this.state.newTaskValue)}>Add task</button>
      </div>
    )
  }
}

// Action
const addTask = value => ({type: 'ADD_ITEM', task: value})

// Reducer
const todo = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {...state, todo: {...state.todo, tasks: [...state.todo.tasks, action.task]}}
    default:
      return state
  }
}

// Initial state
const initialState = {
  todo: {
    tasks: []
  }
}

// Connect
const mapStateToProps = state => {
  return {
    tasks: state.todo.tasks
  }
}

// Connect
const mapDispatchToProps = dispatch => {
  return {
    onAddTask: value => dispatch(addTask(value))
  }
}

/* ------ TESTS ------ */

const store = createMockStore(todo, initialState)
const ConnectedTodoList = connect(mapStateToProps, mapDispatchToProps)(TodoList)
const wrapper = mountConnectedComponent(store, ConnectedTodoList, { foo: 'bar' })

it('store should be the same at the initialState', () => {
  expect(store.getState()).toEqual(initialState)
})

it('connected component should have foo prop', () => {
  expect(wrapper.prop('foo')).toBe('bar')
})

it('component should have foo prop', () => {
  expect(wrapper.find(TodoList).prop('foo')).toBe('bar')
})

it('store should have one task', () => {
  store.dispatch(addTask('My first task'))
  expect(store.getState().todo.tasks).toHaveLength(1)
})

it('component should be updated after dispatch', () => {
  store.dispatch(addTask('My second task'))
  expect(wrapper.find(TodoListItem)).toHaveLength(2)
})

it('component should have two span tag', () => {
  expect(wrapper.find('span')).toHaveLength(2)
})

it('store should has three tasks', () => {
  wrapper.find('input').simulate('change', {target: {value: 'My third task'}})
  wrapper.find('button').simulate('click')

  expect(store.getState()).toHaveProperty('todo.tasks', ['My first task', 'My second task', 'My third task'])
})

it('component should have three span tags', () => {
  expect(wrapper.find('span')).toHaveLength(3)
})
