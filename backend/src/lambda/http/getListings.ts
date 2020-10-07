import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUser } from '../utils'
import { getListings } from '../../business/ListingsBusiness'
import { User } from '../../auth/user'

const logger = createLogger('getListings-function')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug("Processing event", event)

  // check authorization
  const user: User = getUser(event)
  logger.info("Get listings of user", user)

  const items = await getListings(user);

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

