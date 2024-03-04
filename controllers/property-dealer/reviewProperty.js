require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property');
const CustomAPIError = require('../../errors/custom-error')
const mongoose = require('mongoose');

//fetch details of a selected property
const reviewProperty = async (req, res, next) => {
    try {
        const { propertyId, user } = req.query
        if (!propertyId) {
            throw new CustomAPIError('data not provided', 204)
        }
        const property = await Property.findOne({ _id: propertyId })

        let averageCustomerRatings = 0

        if (req.propertyDealer.reviewsFromCustomer.length > 0) {
            let totalCustomerRatings = 0
            req.propertyDealer.reviewsFromCustomer.forEach((review) => {
                totalCustomerRatings = totalCustomerRatings + review.rating
            })
            averageCustomerRatings = totalCustomerRatings / req.propertyDealer.reviewsFromCustomer.length
        }

        const threePropertiesAddedByPropertyDealer = await Property.aggregate([
            {
                $match: {
                    addedByPropertyDealer: req.propertyDealer._id,
                    isLive: true,
                    isSold: false,
                    _id: { $ne: new mongoose.Types.ObjectId(propertyId) }//exclude this property
                }
            },
            { $sample: { size: 3 } },
            { $project: { 'isApprovedByCityManager.date': 1, propertyType: 1, location: 1, price: 1, priceData: 1, propertyImagesUrl: 1, _id: 1 } }
        ])

        let data = {
            status: 'ok',
            property
        }

        if (user === 'customer') {
            data = {
                ...data,
                dealerInfo: {
                    logoUrl: req.propertyDealer.firmLogoUrl,
                    firmName: req.propertyDealer.firmName,
                    id: req.propertyDealer._id,
                    address: req.propertyDealer.address,
                    contactNumber: req.propertyDealer.contactNumber,
                    averageCustomerRatings,
                    numberOfReviews: req.propertyDealer.reviewsFromCustomer.length,
                    threePropertiesAddedByPropertyDealer
                }
            }
        }

        return res.status(StatusCodes.OK).json(data)
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    reviewProperty
}