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
  Loader,
  Form, TextArea
} from 'semantic-ui-react'

import { createListing, deleteListing, getListingsUser } from '../api/listings-api'
import Auth from '../auth/Auth'
import { Listing } from '../types/Listing'
import { InputOnChangeData } from 'semantic-ui-react/dist/commonjs/elements/Input/Input'
import { TextAreaProps } from 'semantic-ui-react/dist/commonjs/addons/TextArea/TextArea'

interface ListingsProps {
  auth: Auth,
  history: History
}

interface ListingsState {
  loadingListings: boolean,
  listings: Listing[],
  newListingTitle: string,
  newListingDescription: string,
  newListingPrice: number
}

export class Listings extends React.PureComponent<ListingsProps, ListingsState> {
  state: ListingsState = {
    loadingListings: true,
    listings: [],
    newListingTitle: '',
    newListingDescription: '',
    newListingPrice: 0,
  }



  onEditButtonClick = (listingId: string) => {
    this.props.history.push(`/listings/${listingId}/edit`)
  }

  onListingCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      const newListing = await createListing(this.props.auth.getIdToken(), {
        title: this.state.newListingTitle,
        description: this.state.newListingDescription,
        price: this.state.newListingPrice
      })
      this.setState({
        listings: [...this.state.listings, newListing],
        newListingTitle: '',
        newListingDescription: '',
        newListingPrice: 0,
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
    const { newListingTitle, newListingDescription, newListingPrice } = this.state

    // @ts-ignore
    // @ts-ignore
    return (
      <Grid.Row>
        <Grid.Column width={16}>

          <Form onSubmit={this.onListingCreate}>
            <Form.Group>
              <Form.Input required label='Title'  placeholder='title' width={5}
                          name="newListingTitle" value={newListingTitle}
                          onChange={this.handleListingTitleChange}/>
              <TextArea required label='Description' placeholder='Describe your item(s)...' width={8}
                        name="newListingDescription" value={newListingDescription}
                        onChange={this.handleListingDescriptionChange}
                />
              <Form.Input required label='Price ($)' placeholder='price' width={3}
                          name="newListingPrice" value={newListingPrice}
                          onChange={this.handleListingPriceChange}
                  />
            </Form.Group>
            <Form.Button content='Add Listing' />
          </Form>

        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  handleListingTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newListingTitle: event.target.value })
  }
  handleListingPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newListingPrice: +event.target.value })
  }
  handleListingDescriptionChange = (event: React.FormEvent<HTMLTextAreaElement>, data: TextAreaProps) => {
    this.setState({ newListingDescription: String(data.value) })
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
              <Grid.Column width={4} verticalAlign="middle" floated="left">
                <strong>   {listing.title}    </strong>
              </Grid.Column>
              <Grid.Column width={6} verticalAlign="middle" floated="left">
                {listing.description}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle" floated="left">
                {listing.price}$
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle" floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(listing.listingId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle" floated="right">
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
}
