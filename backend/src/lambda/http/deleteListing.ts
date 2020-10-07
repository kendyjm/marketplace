import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { deleteListing } from '../../business/ListingsBusiness'

const logger = createLogger('delete-listing')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug("Processing delete listing event", {event})
  const listingId = event.pathParameters.listingId
  if (!listingId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing listingId' })
    }
  }

  const userId = getUserId(event)
  logger.info("Deleting listing for user", {listingId, userId})

  await deleteListing(listingId, userId)

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({})
  }
}
