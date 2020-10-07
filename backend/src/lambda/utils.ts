import { APIGatewayProxyEvent } from "aws-lambda";
import { User } from "../auth/user";
import { parseUser, parseUserId } from "../auth/utils";

/**
 * Get a user from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user from a JWT token
 */
export function getUser(event: APIGatewayProxyEvent): User {
  const jwtToken = getJwtToken(event)
  return parseUser(jwtToken)
}

/**
 * Get a user id from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const jwtToken = getJwtToken(event)
  return parseUserId(jwtToken)
}

/**
 * Get a Jwt Token from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a JWT token
 */
function getJwtToken(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return jwtToken
}