export interface Listing {
  userId: string
  listingId: string

  userName: string
  userEmail: string

  title: string
  description: string
  price: number
  updatedAt: string
  attachmentUrl?: string
}
