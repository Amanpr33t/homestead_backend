require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer');
const Property = require('../../models/property');
const CustomAPIError = require('../../errors/custom-error');

//The function is used to fetch all requests by customers
const homePageData = async (req, res, next) => {
    try {
        const { dealerId } = req.query

        let propertyDealer
        if (dealerId) {
            propertyDealer = await PropertyDealer.findOne({ _id: dealerId })
        } else {
            propertyDealer = req.propertyDealer
        }

        let averageCustomerRatings = 0
        if (propertyDealer.reviewsFromCustomer.length > 0) {
            let totalCustomerRatings = 0
            propertyDealer.reviewsFromCustomer.forEach((review) => {
                totalCustomerRatings = totalCustomerRatings + review.rating
            })
            averageCustomerRatings = (totalCustomerRatings / propertyDealer.reviewsFromCustomer.length).toFixed(1)
        }

        const liveProperties = await Property.find({
            addedByPropertyDealer: propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: true,
            isClosed: false
        }).select('propertyType location propertyImagesUrl isApprovedByCityManager.date price title')
            .sort({ 'isApprovedByCityManager.date': -1 })
            .skip(0)
            .limit(5)

        const numberOfProperties = await Property.countDocuments({
            addedByPropertyDealer: propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: true,
            isClosed: false
        })

        const reviewsFromCustomer = propertyDealer.reviewsFromCustomer.sort((a, b) => new Date(b.date) - new Date(a.date));

        const requestsFromCustomer = propertyDealer.requestsFromCustomer.sort((a, b) => new Date(b.date) - new Date(a.date));

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            dealerInfo: {
                logoUrl: propertyDealer.firmLogoUrl,
                firmName: propertyDealer.firmName,
                reraNumber: propertyDealer.reraNumber,
                gstNumber: propertyDealer.gstNumber,
                id: propertyDealer._id,
                experience: propertyDealer.experience,
                about: propertyDealer.about,
                email: !dealerId ? null : propertyDealer.email,
                contactNumber: !dealerId ? null : propertyDealer.contactNumber,
                address: !dealerId ? null : propertyDealer.address,
                propertyDealerName:!dealerId ? null : propertyDealer.propertyDealerName
            },
            liveProperties,
            numberOfProperties,
            averageCustomerRatings,
            reviewsFromCustomer,
            requestsFromCustomer: dealerId ? null : requestsFromCustomer
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const fetchProperties = async (req, res, next) => {
    try {
        const { skip, liveOrSold, propertyType } = req.query
        const { dealerId } = req.query

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
            addedByPropertyDealer: dealerId || req.propertyDealer._id,
            "isApprovedByCityManager.isApproved": true,
            isLive: liveOrSold === 'live' ? true : false,
            isClosed: liveOrSold !== 'live' ? true : false
        }

        const totalNumberOfProperties = await Property.countDocuments(queryBody)

        if (propertyType) {
            queryBody = {
                ...queryBody,
                propertyType
            }
        }

        if (liveOrSold === 'sold') {
            queryBody = {
                ...queryBody,
                'reasonToCloseProperty.propertySoldByDealer': true
            }
        }

        const properties = await Property.find(queryBody)
            .select('propertyType location propertyImagesUrl isApprovedByCityManager.date price title')
            .sort({ 'isApprovedByCityManager.date': -1 })
            .skip(parseInt(skip) || 0)
            .limit(pageSize)

        const numberOfProperties = await Property.countDocuments(queryBody)

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            properties,
            numberOfProperties,
            totalNumberOfProperties
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    homePageData,
    fetchProperties
}