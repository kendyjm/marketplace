/**
 * A payload of a JWT token
 */
export interface JwtPayload {
  iss: string // (issuer) claim identifies the principal that issued the JWT
  sub: string // userId (subject) claim identifies the principal that is the subject of the JWT
  iat: number // (issued at) claim identifies the time at which the JWT was issued
  exp: number // (expiration time) claim identifies the expiration time on or after which the JWT MUST NOT be accepted for processing.
  name: string // fullname
  email: string
}
