require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property');
const PropertyDealer = require('../../models/propertyDealer');
const CustomAPIError = require('../../errors/custom-error')
const mongoose = require('mongoose');

//fetch details of a selected property
const reviewProperty = async (req, res, next) => {
    try {
        const { propertyId } = req.query
        if (!propertyId) {
            throw new CustomAPIError('data not provided', 204)
        }

        const property = await Property.findOne({ _id: propertyId })

        const propertyDealer = await PropertyDealer.findOne({ _id: property.addedByPropertyDealer })

        let averageCustomerRatings = 0

        if (propertyDealer.reviewsFromCustomer.length > 0) {
            let totalCustomerRatings = 0
            propertyDealer.reviewsFromCustomer.forEach((review) => {
                totalCustomerRatings = totalCustomerRatings + review.rating
            })
            averageCustomerRatings = (totalCustomerRatings / propertyDealer.reviewsFromCustomer.length).toFixed(1)
        }

        const threePropertiesAddedByPropertyDealer = await Property.aggregate([
            {
                $match: {
                    addedByPropertyDealer: propertyDealer._id,
                    isLive: true,
                    isClosed: false,
                    _id: { $ne: new mongoose.Types.ObjectId(propertyId) }//exclude this property
                }
            },
            { $sample: { size: 3 } },
            { $project: { 'isApprovedByCityManager.date': 1, propertyType: 1, location: 1, price: 1, propertyImagesUrl: 1, _id: 1 } }
        ])

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            property,
            dealerInfo: {
                id:propertyDealer._id,
                email:propertyDealer.email,
                propertyDealerName:propertyDealer.propertyDealerName,
                logoUrl: propertyDealer.firmLogoUrl,
                firmName: propertyDealer.firmName,
                address: propertyDealer.address,
                contactNumber: propertyDealer.contactNumber,
                averageCustomerRatings,
                numberOfReviews: propertyDealer.reviewsFromCustomer.length,
                threePropertiesAddedByPropertyDealer
            }
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    reviewProperty
}