import {CustomAuthorizerResult, APIGatewayTokenAuthorizerEvent} from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth0Authorizer-function')

// Provide a URL (JWKS endpoint) that can be used to download a certificate that can be used to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-ut6kmzhz.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // Token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  // 1. Retrieve the JWKS 
  const response = await Axios.get(jwksUrl);
  const jwkset = response['data'] // A JSON object that represents a set of JWKs
  const keys = jwkset['keys'] // JWKS is a set of keys containing the public keys that should be used to verify any JWT issued by the authorization server

  // 2. Extract the JWT from the request's authorization header.
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // 3. Decode the JWT and grab the kid property from the header.
  const jwtKid = jwt.header.kid // kid is the unique identifier for the key
  logger.info(`JWT Kid : ${jwtKid}`)

  // 4. Find the _signature verification_ (use=sig) key in the filtered JWKS with a matching kid property.
  const signingKey = keys
    .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signature verification
      && key.kty === 'RSA' // We are only supporting RSA (RS256)
      && key.kid === jwtKid// The `kid` must be present and matching kid of the jwt
      && ((key.x5c && key.x5c.length) || (key.n && key.e)) // Has useful public keys
    ).map(key => {
  // 5. Using the x5c property build a certificate which will be used to verify the JWT signature.
      return { kid: key.kid, publicKey: certToPEM(key.x5c[0]) };
    });

  // If at least one signing key doesn't exist we have a problem... Kaboom.
  if (!signingKey.length) {
    throw new Error(`The JWKS endpoint did not contain any signature verification key matching kid = ${jwtKid}`)
  }

  return verify(token, signingKey[0].publicKey, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}
