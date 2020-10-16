import * as AWS from 'aws-sdk'
import { DocumentClient, DeleteItemOutput, UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { Listing } from '../models/Listing'
import { UpdateListingRequest } from '../requests/UpdateListingRequest'
import { createLogger } from '../utils/logger'

const logger = createLogger('listings-dao')

const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)

export class ListingsDao {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly listingsTable = process.env.LISTINGS_TABLE,
        private readonly updatedAtIndex = process.env.LISTINGS_INDEX_UPDATED_AT
    ) { }

    async createListing(newListing: Listing): Promise<Listing> {
        await this.docClient
            .put({
                TableName: this.listingsTable,
                Item: newListing
            })
            .promise()

        logger.info("Saved new listing", { newListing })

        return newListing
    }

    async getListingsFull(): Promise<Listing[]> {
        const result = await this.docClient
            .scan({
                TableName: this.listingsTable
            })
            .promise()

        logger.info("Retrieved all listings", { "count": result.Count })

        const items = result.Items

        return items as Listing[]
    }

    async getListings(userId: string): Promise<Listing[]> {
        const result = await this.docClient
            .query({
                TableName: this.listingsTable,
                IndexName: this.updatedAtIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId
                }
            })
            .promise()

        logger.info("Retrieved listings", { userId, "count": result.Count })

        const items = result.Items

        return items as Listing[]
    }

    async deleteListing(listingId: string, userId: string) {
        const deleteItem:DeleteItemOutput = await this.docClient
            .delete({
                TableName: this.listingsTable,
                Key: {listingId, userId},
                ReturnValues: "ALL_OLD"
            })
            .promise()

        const deletedListing = deleteItem.Attributes

        logger.info("Deleted listing", {deletedListing})    
    }   
    
    async updateListing(listingId: string, userId: string, updatedProperties: UpdateListingRequest) {
        const updateItem: UpdateItemOutput = await this.docClient
            .update({
                TableName: this.listingsTable,
                Key: {listingId, userId},
                ReturnValues: "ALL_NEW",
                UpdateExpression:
                  'set #title = :title, #description = :description, #price = :price',
                ExpressionAttributeValues: {
                  ':title': updatedProperties.title,
                  ':description': updatedProperties.description,
                  ':price': updatedProperties.price
                },
                ExpressionAttributeNames: {
                  '#title': 'title',
                  '#description': 'description',
                  '#price': 'price'
                }
            })
            .promise()

        const updatedListing = updateItem.Attributes

        logger.info("Updated listing", {updatedListing} )
    }   
    
    async updateAttachmentUrl(attachmentUrl: string, listingId: string, userId: string) {
        const updateItem: UpdateItemOutput = await this.docClient
            .update({
                TableName: this.listingsTable,
                Key: {listingId, userId},
                ReturnValues: "ALL_NEW",
                UpdateExpression:
                  'set #attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues: {
                  ':attachmentUrl': attachmentUrl
                },
                ExpressionAttributeNames: {
                  '#attachmentUrl': 'attachmentUrl'
                }
            })
            .promise()

        const updatedListing = updateItem.Attributes

        logger.info("Updated attachmentUrl of listing", {updatedlisting: updatedListing} )
    }       

}
