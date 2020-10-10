import { Listing } from '../models/Listing'
import { ListingsDao } from '../dao/ListingsDao'
import { createLogger } from '../utils/logger'
import { CreateListingRequest } from '../requests/CreateListingRequest'
import * as uuid from 'uuid'
import { User } from '../auth/user'
import { UpdateListingRequest } from '../requests/UpdateListingRequest'
import { ImagesDao } from '../dao/ImagesDao'

const logger = createLogger('listings-business')
const listingsDao = new ListingsDao()
const imagesDao = new ImagesDao()

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
 * Remove a Listing by its id
 * @param listingId id of the listing to delete
 * @param userId id of the listing's owner
 */
export async function deleteListing(listingId: string, userId: string) {
    return await listingsDao.deleteListing(listingId, userId)
}

/**
 * Update a Listing by its id
 * @param listingId id of the Listing to update
 * @param userId id of the Listing's owner
 * @param updatedProperties new content for this Listing
 */
export async function updateListing(listingId: string, userId: string, updatedProperties: UpdateListingRequest) {
    return await listingsDao.updateListing(listingId, userId, updatedProperties)
}

/**
 * Get a generated signed url to put an image
 * @param listingId id of the listing to receive an attachment
 */
export async function getSignedUrl(listingId: string): Promise<string> {
    return await imagesDao.getSignedUrl(listingId)
}

/**
 * Update a listing with an attachmentUrl (image)
 * @param signedUrl generated signed url, from which we will retrieve the attachment url
 * @param listingId id of the listing to receive the attachmentUrl property
 * @param userId owner of the listing
 */
export async function updateAttachmentUrl(signedUrl: string, listingId: string, userId: string) {
    // the first part of the signed url is the attachment url
    const attachmentUrl: string = signedUrl.split("?")[0]
    logger.info("Found the attachment url from signed url", {attachmentUrl})
    return await listingsDao.updateAttachmentUrl(attachmentUrl, listingId, userId)
}