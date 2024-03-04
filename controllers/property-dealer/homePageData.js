require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer');
const Property = require('../../models/property');
const CustomAPIError = require('../../errors/custom-error');

//The function is used to fetch all requests by customers
const homePageData = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await PropertyDealer.updateOne(
            { _id: req.propertyDealer._id, 'requestsFromCustomer.requestDate': { $lt: thirtyDaysAgo } }, // Condition to match document by _id and requestDate older than 30 days
            { $pull: { 'requestsFromCustomer': { requestDate: { $lt: thirtyDaysAgo } } } } // Pull elements matching the condition from requestsFromCustomer array
        )

        let averageCustomerRatings = 0
        if (req.propertyDealer.reviewsFromCustomer.length > 0) {
            let totalCustomerRatings = 0
            req.propertyDealer.reviewsFromCustomer.forEach((review) => {
                totalCustomerRatings = totalCustomerRatings + review.rating
            })
            averageCustomerRatings = totalCustomerRatings / req.propertyDealer.reviewsFromCustomer.length
        }

        const liveProperties = await Property.find({
            addedByPropertyDealer: req.propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: true,
            isSold: false
        }).select('propertyType location propertyImagesUrl isApprovedByCityManager.date priceData price title')
            .sort({ 'isApprovedByCityManager.date': -1 })
            .skip(0)
            .limit(5)

        const numberOfLiveProperties = await Property.countDocuments({
            addedByPropertyDealer: req.propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: true,
            isSold: false
        })
        console.log(req.propertyDealer)
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            dealerInfo: {
                logoUrl: req.propertyDealer.firmLogoUrl,
                firmName: req.propertyDealer.firmName,
                reraNumber: req.propertyDealer.reraNumber,
                gstNumber: req.propertyDealer.gstNumber,
                id: req.propertyDealer._id,
                experience: req.propertyDealer.experience,
                about: req.propertyDealer.about,
            },
            liveProperties,
            numberOfLiveProperties,
            averageCustomerRatings,
            reviewsFromCustomer: req.propertyDealer.reviewsFromCustomer,
            requestsFromCustomer: req.propertyDealer.requestsFromCustomer
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const fetchProperties = async (req, res, next) => {
    try {
        const { skip, liveOrSold, propertyType } = req.query

        if (skip && isNaN(parseInt(skip))) {
            throw new CustomAPIError('Skip number not provided', StatusCodes.BAD_REQUEST)
        }

        if (liveOrSold !== 'sold' && liveOrSold !== 'live') {
            throw new CustomAPIError('No type provided', StatusCodes.BAD_REQUEST)
        }

        if (propertyType && propertyType !== 'agricultural' && propertyType !== 'residential' && propertyType !== 'commercial') {
            throw new CustomAPIError('No property type provided', StatusCodes.BAD_REQUEST)
        }

        const pageSize = 5

        let queryBody = {
            addedByPropertyDealer: req.propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: liveOrSold === 'live' ? true : false,
            isSold: liveOrSold !== 'live' ? true : false
        }

        if (propertyType) {
            queryBody = {
                ...queryBody,
                propertyType
            }
        }

        const properties = await Property.find(queryBody)
            .select('propertyType location propertyImagesUrl isApprovedByCityManager.date priceData price title')
            .sort({ 'isApprovedByCityManager.date': -1 })
            .skip(parseInt(skip) || 0)
            .limit(pageSize)

        let queryBodyToFetchNumberOfProperties = {
            addedByPropertyDealer: req.propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: liveOrSold === 'live' ? true : false,
            isSold: liveOrSold !== 'live' ? true : false
        }

        /*if (propertyType) {
            queryBodyToFetchNumberOfProperties = {
                ...queryBodyToFetchNumberOfProperties,
                propertyType
            }
        }*/

        const numberOfProperties = await Property.countDocuments(queryBodyToFetchNumberOfProperties)

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            properties,
            numberOfProperties
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    homePageData,
    fetchProperties
}