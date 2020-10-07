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
        "userId" : user.id,
        "userName" : user.fullname,
        "userEmail" : user.email,
        
        listingId,
        updatedAt: new Date().toISOString(),
        ...newListingRequest
    }

    return await listingsDao.createListing(newListing)
}

/**
 * Get all the Listings
 * @returns all the Listings
 */
export async function getListingsFull(): Promise<Listing[]> {
    return await listingsDao.getListingsFull()
}

/**
 * Get all the Listings of a user
 * @param 
 * @returns all the Listings
 */
export async function getListings(userId: string): Promise<Listing[]> {
    return await listingsDao.getListings(userId)
}

/**
 * Remove a LISTING by its id
 * @param todoId id of the listing to delete
 * @param userId id of the listing's owner
 */
export async function deleteListing(todoId: string, userId: string) {
    return await listingsDao.deleteListing(todoId, userId)
}