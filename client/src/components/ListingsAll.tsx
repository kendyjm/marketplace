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

import { getListingsAll } from '../api/listings-api'
import Auth from '../auth/Auth'
import { Listing } from '../types/Listing'

interface ListingsProps {
  auth: Auth,
  history: History
}

interface ListingsState {
  listings: Listing[],
  loadingListings: boolean
}

export class ListingsAll extends React.PureComponent<ListingsProps, ListingsState> {
  state: ListingsState = {
    listings: [],
    loadingListings: true
  }

  async componentDidMount() {
    try {
      const listings = await getListingsAll(this.props.auth.getIdToken())
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
        <Header as="h1">Listings</Header>

        {this.renderListings()}
      </div>
    )
  }

  renderListings() {
    if (this.state.loadingListings) {
      return this.renderLoading()
    }

    return this.renderLsitingsList()
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

  renderLsitingsList() {
    return (
      <Grid padded>
        {this.state.listings.map((listing, pos) => {
          return (
            <Grid.Row key={listing.listingId}>
              <Grid.Column width={2}>
                {listing.attachmentUrl && (
                  <Image src={listing.attachmentUrl} verticalAlign="middle" />
                )}
              </Grid.Column>
              <Grid.Column width={2} verticalAlign="middle" floated="left">
              <strong>      {listing.title} </strong>
            </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle" floated="left">
                {listing.description}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle" floated="left">
                {listing.price}$
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle" floated="left">
                {listing.userName}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle" floated="left">
                <a href={"mailto:" + listing.userEmail}>{listing.userEmail}</a>
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
