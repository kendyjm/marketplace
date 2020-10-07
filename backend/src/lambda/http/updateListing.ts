import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateListingRequest } from '../../requests/UpdateListingRequest'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateListing } from '../../business/ListingsBusiness'

const logger = createLogger('update-listing')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const listingId = event.pathParameters.listingId
  const updatedProperties: UpdateListingRequest = JSON.parse(event.body)
  logger.info("Processing update listing event", {updatedProperties})

  if (!listingId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing listingId' })
    }
  }

  const userId = getUserId(event)
  logger.info("Updating a listing of user", {userId, listingId})

  await updateListing(listingId, userId, updatedProperties)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
}
