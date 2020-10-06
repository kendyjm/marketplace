import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateListingRequest } from '../../requests/CreateListingRequest'
import { createLogger } from '../../utils/logger'
import { getUser } from '../utils'
import { createListing } from '../../business/ListingsBusiness'
import { User } from '../../auth/user'

const logger = createLogger('create-listing')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newListingRequest: CreateListingRequest = JSON.parse(event.body)
  logger.info("Processing create listing event", {newListingRequest: newListingRequest})

  const user: User = undefined//getUser(event)
  logger.info("Adding new listing for user", {user})

  const newListing = await createListing(newListingRequest, user)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      item: newListing
    })
  }
}
