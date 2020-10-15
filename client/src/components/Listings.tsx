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

import { createListing, deleteListing, getListingsUser } from '../api/listings-api'
import Auth from '../auth/Auth'
import { Listing } from '../types/Listing'

interface ListingsProps {
  auth: Auth,
  history: History
}

interface ListingsState {
  listings: Listing[],
  newListingTitle: string,
  loadingListings: boolean
}

export class Listings extends React.PureComponent<ListingsProps, ListingsState> {
  state: ListingsState = {
    listings: [],
    newListingTitle: '',
    loadingListings: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newListingTitle: event.target.value })
  }

  onEditButtonClick = (listingId: string) => {
    this.props.history.push(`/listings/${listingId}/edit`)
  }

  onListingCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newListing = await createListing(this.props.auth.getIdToken(), {
        title: this.state.newListingTitle,
        description: 'a corriger',
        price: 0.1
      })
      this.setState({
        listings: [...this.state.listings, newListing],
        newListingTitle: ''
      })
    } catch {
      alert('Listing creation failed')
    }
  }

  onListingDelete = async (listingId: string) => {
    try {
      await deleteListing(this.props.auth.getIdToken(), listingId)
      this.setState({
        listings: this.state.listings.filter(listing => listing.listingId != listingId)
      })
    } catch {
      alert('Listing deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const listings = await getListingsUser(this.props.auth.getIdToken())
      this.setState({
        listings: listings,
        loadingListings: false
      })
    } catch (e) {
      alert(`Failed to fetch listings: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">My Listings</Header>

        {this.renderCreateListingInput()}

        {this.renderListings()}
      </div>
    )
  }

  renderCreateListingInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onListingCreate
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

  renderListings() {
    if (this.state.loadingListings) {
      return this.renderLoading()
    }

    return this.renderListingsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading your Listings
        </Loader>
      </Grid.Row>
    )
  }

  renderListingsList() {
    return (
      <Grid padded>
        {this.state.listings.map((listing, pos) => {
          return (
            <Grid.Row key={listing.listingId}>
              <Grid.Column width={3}>
                {listing.attachmentUrl && (
                  <Image src={listing.attachmentUrl} verticalAlign="middle" />
                )}
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle" floated="left">
                {listing.title}<br></br>
                {listing.description}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle" floated="left">
                {listing.price}<br></br>
                {listing.userName}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(listing.listingId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onListingDelete(listing.listingId)}
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
