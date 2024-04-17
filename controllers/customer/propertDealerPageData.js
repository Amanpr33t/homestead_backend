require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer');
const Customer = require('../../models/customer')
const Property = require('../../models/property');
const jwt = require('jsonwebtoken')
require('dotenv').config()

//The function is used to fetch all requests by customers
const propertyDealerPageData = async (req, res, next) => {
    try {
        const { dealerId } = req.query

        const authHeader = req.headers.authorization

        let customerId
        let customersOwnReview

        if (authHeader && authHeader.startsWith('Bearer')) {

            const token = authHeader.split(' ')[1]
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            const customer = await Customer.findOne({ _id: payload.customerId }).select('_id')
            customerId = customer._id

            const customersOwnReviewObject = await PropertyDealer.findOne(
                {
                    _id: dealerId,
                    "reviewsFromCustomer": { $elemMatch: { customerId: customerId } }
                },
                { "reviewsFromCustomer.$": 1 }
            )

            if (customersOwnReviewObject && customersOwnReviewObject.reviewsFromCustomer && customersOwnReviewObject.reviewsFromCustomer.length) {
                customersOwnReview = customersOwnReviewObject.reviewsFromCustomer[0]
            }

        } else {
            customersOwnReview = null
            const reviewsFromCustomersArray = await PropertyDealer.find(
                { _id: dealerId }
            ).select('reviewsFromCustomer').sort({ 'reviewsFromCustomer.date': -1 });
            if (reviewsFromCustomersArray && reviewsFromCustomersArray.length && reviewsFromCustomersArray[0].reviewsFromCustomer && reviewsFromCustomersArray[0].reviewsFromCustomer.length) {
                reviewsFromOtherCustomers = reviewsFromCustomersArray[0].reviewsFromCustomer
            }
        }

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
                propertyDealerName: !dealerId ? null : propertyDealer.propertyDealerName
            },
            liveProperties,
            numberOfProperties,
            averageCustomerRatings,
            customersOwnReview,
            reviewsFromCustomers: propertyDealer.reviewsFromCustomer
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    propertyDealerPageData
}