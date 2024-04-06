require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to add a property dealer
const addReviewForDealer = async (req, res, next) => {
    try {
        const {
            review,
            rating,
            dealerId
        } = req.body

        const operation = req.query.operation

        let customersOwnReview = null
        let reviewsFromOtherCustomers = []

        if (operation === 'add') {
            const reviewFromCustomerExists = await PropertyDealer.countDocuments({
                _id: dealerId,
                'reviewsFromCustomer.customerId': req.customer._id
            })

            if (reviewFromCustomerExists > 0) {
                return res.status(StatusCodes.OK).json({
                    status: 'alreadyReviewed'
                })
            }

            const reviewToBeAdded = {
                review,
                rating,
                customerName: req.customer.name,
                customerId: req.customer._id,
                date: new Date()
            }

            await PropertyDealer.updateOne(
                { _id: dealerId },
                {
                    $push: {
                        reviewsFromCustomer: reviewToBeAdded
                    }
                }
            )

            customersOwnReview = reviewToBeAdded
            reviewsFromOtherCustomers = req.customer.reviewsFromCustomer

        } else if (operation === 'edit') {
            await PropertyDealer.findOneAndUpdate(
                { _id: dealerId, 'reviewsFromCustomer.customerId': req.customer._id },
                {
                    $set: {
                        'reviewsFromCustomer.$.review': review,
                        'reviewsFromCustomer.$.rating': rating
                    }
                },
                { new: true }
            )

            const customersOwnReviewObject = await PropertyDealer.findOne(
                { _id: dealerId, 'reviewsFromCustomer.customerId': { $eq: req.customer._id } }
            ).select('reviewsFromCustomer');
            if (customersOwnReviewObject && customersOwnReviewObject.reviewsFromCustomer && customersOwnReviewObject.reviewsFromCustomer.length) {
                customersOwnReview = customersOwnReviewObject.reviewsFromCustomer[0]
            }

            const reviewsFromOtherCustomersArray = await PropertyDealer.find(
                { _id: dealerId, 'reviewsFromCustomer.customerId': { $ne: req.customer._id } }
            ).select('reviewsFromCustomer').sort({ 'reviewsFromCustomer.date': -1 });
            if (reviewsFromOtherCustomersArray && reviewsFromOtherCustomersArray.length && reviewsFromOtherCustomersArray[0].reviewsFromCustomer && reviewsFromOtherCustomersArray[0].reviewsFromCustomer.length) {
                reviewsFromOtherCustomers = reviewsFromOtherCustomersArray[0].reviewsFromCustomer
            }

        } else {
            throw new Error('Some error occured')
        }

        const propertyDealer = await PropertyDealer.findOne({ _id: dealerId })

        let averageCustomerRatings = 0
        if (propertyDealer.reviewsFromCustomer.length > 0) {
            let totalCustomerRatings = 0
            propertyDealer.reviewsFromCustomer.forEach((review) => {
                totalCustomerRatings = totalCustomerRatings + review.rating
            })
            averageCustomerRatings = (totalCustomerRatings / propertyDealer.reviewsFromCustomer.length).toFixed(1)
        }

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            customersOwnReview,
            reviewsFromOtherCustomers,
            averageCustomerRatings
        })

    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    addReviewForDealer
}