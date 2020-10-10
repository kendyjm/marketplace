import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'

import { getSignedUrl, updateAttachmentUrl } from '../../business/ListingsBusiness'
import { getUserId } from '../utils'

const logger = createLogger('generate-upload-url')

/**
 * Return a presigned URL to upload a file for a Listing item with the provided id
 * @param event API Gateway Proxy Event
 */
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug("Processing generateUploadUrl event", {event})
  const listingId = event.pathParameters.listingId

  
  if (!listingId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'listingId parameter is required' })
    }
  }

  const userId = getUserId(event)
  logger.info("Getting signed URL for listing", {listingId, userId})

  const signedUrl: string = await getSignedUrl(listingId)
  logger.info("Got signed URL for listing", {signedUrl})

  await updateAttachmentUrl(signedUrl, listingId, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },    
    body: JSON.stringify({
      uploadUrl: signedUrl
    })
  }
}

