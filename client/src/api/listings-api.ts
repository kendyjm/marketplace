import { apiEndpoint } from '../config'
import { Listing } from '../types/Listing';
import { CreateListingRequest } from '../types/CreateListingRequest';
import Axios from 'axios'
import { UpdateListingRequest } from '../types/UpdateListingRequest';

export async function getListingsAll(idToken: string): Promise<Listing[]> {
  console.log('Fetching listings')

  const response = await Axios.get(`${apiEndpoint}/listings/all`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('listings all:', response.data)
  return response.data.items
}

export async function getListingsUser(idToken: string): Promise<Listing[]> {
  console.log('Fetching listings')

  const response = await Axios.get(`${apiEndpoint}/listings`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('listings user:', response.data)
  return response.data.items
}

export async function createListing(
  idToken: string,
  newListing: CreateListingRequest
): Promise<Listing> {
  const response = await Axios.post(`${apiEndpoint}/listings`,  JSON.stringify(newListing), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchListing(
  idToken: string,
  listingId: string,
  updatedListing: UpdateListingRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/listings/${listingId}`, JSON.stringify(updatedListing), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteListing(
  idToken: string,
  listingId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/listings/${listingId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  listingId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/listings/${listingId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
