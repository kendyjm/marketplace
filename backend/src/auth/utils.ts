import { decode } from 'jsonwebtoken'

import { JwtPayload } from './JwtPayload'
import { User } from './user'


import { createLogger } from '../utils/logger'
const logger = createLogger('auth-utils')

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUser(jwtToken: string): User {
  const decodedJwt = decode(jwtToken) as JwtPayload
  logger.info("Decoded jwt", {decodedJwt})
  logger.info("Decoded user id", decodedJwt.sub)
  logger.info("Decoded user name", decodedJwt.name)
  logger.info("Decoded user email", decodedJwt.email)

  const decodedUser: User = {
    "id" : decodedJwt.sub,
    "fullname" : decodedJwt.name,
    "email": decodedJwt.email
  }

  logger.info("Decoded user", {decodedUser})

  return decodedUser
}
