import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUser } from '../utils'
import { getListingsFull } from '../../business/ListingsBusiness'

const logger = createLogger('getListings-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug("Processing event", event)

  // check authorization
  getUser(event)
  logger.info(`Get all the listings`)

  const items = await getListingsFull();

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}

