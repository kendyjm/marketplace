import { APIGatewayProxyEvent } from "aws-lambda";
import { User } from "../auth/user";
import { parseUser } from "../auth/utils";

/**
 * Get a user from an API Gateway event
 * @param event an event from API Gateway
 *
 * @returns a user from a JWT token
 */
export function getUser(event: APIGatewayProxyEvent): User {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUser(jwtToken)
}