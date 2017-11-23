import React from 'react'
import { createMockStore, createConnectedComponent } from '../src'

/* ------ TESTS IMPLEMENTATION ------ */

// Component
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
          {this.props.tasks && this.props.tasks.map((task, i) => <span key={i}>{task}</span>)}
        </div>
        <input type='text' onChange={event => this.setState({newTaskValue: event.target.value})} />
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

const todoListComp = createConnectedComponent(
  mapStateToProps,
  mapDispatchToProps,
  <TodoList />
)

todoListComp.find('input').simulate('change', {target: {value: 'My first task'}})
todoListComp.find('button').simulate('click')

it('component should have one span tag', () => {
  expect(todoListComp.find('span')).toHaveLength(2)
})

todoListComp.find('input').simulate('change', {target: {value: 'My second task'}})
todoListComp.find('button').simulate('click')

it('store should has two tasks', () => {
  expect(store.getState()).toHaveProperty('todo.tasks', ['My first task', 'My second task'])
})

it('component should have two span tag', () => {
  expect(todoListComp.find('span')).toHaveLength(2)
})
