import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createListing, deleteTodo, getListingsAll, patchTodo } from '../api/listings-api'
import Auth from '../auth/Auth'
import { Listing } from '../types/Listing'

interface ListingsProps {
  auth: Auth
  history: History
}

interface ListingsState {
  listings: Listing[]
  newTodoName: string
  loadingListings: boolean
}

export class Listings extends React.PureComponent<ListingsProps, ListingsState> {
  state: ListingsState = {
    listings: [],
    newTodoName: '',
    loadingListings: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newListing = await createListing(this.props.auth.getIdToken(), {
        title: this.state.newTodoName,
        description: 'a corriger',
        price: 0.1
      })
      this.setState({
        listings: [...this.state.listings, newListing],
        newTodoName: ''
      })
    } catch {
      alert('Listing creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        listings: this.state.listings.filter(todo => todo.listingId != todoId)
      })
    } catch {
      alert('Listing deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.listings[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.listingId, {
        title: todo.title,
        description: todo.description,
        price: todo.price
      })
      this.setState({
        //todos: update(this.state.todos, {
        //  [pos]: { done: { $set: !todo.done } }
        //})
      })
    } catch {
      alert('Listing update failed')
    }
  }

  async componentDidMount() {
    try {
      const listings = await getListingsAll(this.props.auth.getIdToken())
      this.setState({
        listings: listings,
        loadingListings: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }
  
  render() {
    return (
      <div>
        <Header as="h1">Listings</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingListings) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Listings
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.listings.map((todo, pos) => {
          return (
            <Grid.Row key={todo.listingId}>
              <Grid.Column width={3}>
                {todo.attachmentUrl && (
                  <Image src={todo.attachmentUrl} verticalAlign="middle" />
                )}
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle" floated="left">
                {todo.title}<br></br>
                {todo.description}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle" floated="left">
                {todo.price}<br></br>
                {todo.userName}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.listingId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.listingId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>


            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
