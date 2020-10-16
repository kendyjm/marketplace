import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('images-dao')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export class ImagesDao {
    constructor(
        private readonly bucketName = process.env.LISTINGS_IMAGES_BUCKET,
        private readonly urlExpiration: number = Number(process.env.SIGNED_URL_EXPIRATION)
    ) { }

    async getSignedUrl(listingId: string): Promise<string> {
        const signedUrl = s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: listingId,
            Expires: this.urlExpiration
        })
        logger.info("Retrieved signed url", {signedUrl, listingId})
        return signedUrl
    }
}
