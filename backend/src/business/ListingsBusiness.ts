import { Listing } from '../models/Listing'
import { ListingsDao } from '../dao/ListingsDao'
import { createLogger } from '../utils/logger'
import { CreateListingRequest } from '../requests/CreateListingRequest'
import * as uuid from 'uuid'
import { User } from '../auth/user'

const logger = createLogger('listings-business')
const listingsDao = new ListingsDao()



/**
 * Create a LISTING
 * @param newListingRequest properties for this new LISTING
 * @param user the LISTING's owner
 */
export async function createListing(newListingRequest: CreateListingRequest, user: User): Promise<Listing> {
    const listingId = uuid.v4()
    logger.info('Create LISTING with generated uuid', { listingId })

    const newListing: Listing = {
        "userId" : "kendyjm" /*user.id*/,
        "userName" : "Kendy JEAN-MARIE" /*user.fullname*/,
        "userEmail" : "kendyjm@gmail.com" /*user.email*/,
        
        listingId,
        updatedAt: new Date().toISOString(),
        ...newListingRequest
    }


    return await listingsDao.createListing(newListing)
}
