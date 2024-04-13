require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

const sendRequestToPropertyDealer = async (req, res, next) => {
    try {
        const { propertyType, propertyId, dealerId, customerId } = req.query

        if (!propertyId || !dealerId || !customerId) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        const isDuplicate = await PropertyDealer.findOne(
            {
                'requestsFromCustomer': {
                    $elemMatch: {
                        customerId,
                        propertyId
                    }
                }
            },
            {
                'yourArrayField.$': 1 // This projects only the first matching element in the array 
            }
        )
        if (isDuplicate) {
            throw new CustomAPIError('Customer has already sent a request for this property', StatusCodes.BAD_REQUEST)
        }

        if (propertyType === 'agricultural') {
            await Customer.findOneAndUpdate({ _id: customerId },
                {
                    $push: {
                        agriculturalPropertiesForWhichRequestSentToPropertyDealer: {
                            propertyId,
                            date: Date.now()
                        }
                    }
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'commercial') {
            await Customer.findOneAndUpdate({ _id: customerId },
                {
                    $push: {
                        commercialPropertiesForWhichRequestSentToPropertyDealer: {
                            propertyId,
                            date: Date.now()
                        }
                    }
                },
                { new: true, runValidators: true })
        } else if (propertyType === 'residential') {
            await Customer.findOneAndUpdate({ _id: customerId },
                {
                    $push: {
                        residentailPropertiesForWhichRequestSentToPropertyDealer: {
                            propertyId,
                            date: Date.now()
                        }
                    }
                },
                { new: true, runValidators: true })
        } else {
            throw new CustomAPIError('No property type provided', StatusCodes.BAD_REQUEST)
        }

        const customer = await Customer.findOne({ _id: customerId })
        if (customer) {
            await PropertyDealer.findOneAndUpdate({ _id: dealerId },
                {
                    $push: {
                        requestsFromCustomer: {
                            propertyId,
                            propertyType,
                            customerId,
                            customerName: customer.name,
                            customerEmail: customer.email,
                            customerContactNumber: customer.contactNumber,
                            requestSeen: false,
                            requestDate: Date.now()
                        }
                    }
                },
                { new: true, runValidators: true })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    sendRequestToPropertyDealer
}