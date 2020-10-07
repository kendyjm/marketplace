import * as AWS from 'aws-sdk'
import { DocumentClient/*, DeleteItemOutput, UpdateItemOutput*/ } from 'aws-sdk/clients/dynamodb'
import { User } from '../auth/user'
import { Listing } from '../models/Listing'
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

    async getListings(user: User): Promise<Listing[]> {
        const result = await this.docClient
            .query({
                TableName: this.listingsTable,
                IndexName: this.updatedAtIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': user.id
                }
            })
            .promise()

        logger.info("Retrieved listings", { user, "count": result.Count })

        const items = result.Items

        return items as Listing[]
    }

}
