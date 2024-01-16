require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')
const PropertyDealer = require('../../models/propertyDealer')
const CustomAPIError = require('../../errors/custom-error')

const sendRequestToPropertyDealer = async (req, res, next) => {
    try {
        const { propertyType, propertyId, dealerId, customerId } = req.query

        const propertyDealer = await PropertyDealer.findOne({ _id: dealerId })
        const isDuplicate = propertyDealer.requestsFromCustomer.find(data => data.propertyId === propertyId && data.customerId === customerId)
        if (isDuplicate) {
            throw new CustomAPIError('Customer has already sent a request for this property', StatusCodes.BAD_REQUEST)
        }

        const customer = await Customer.findOne({ _id: customerId })
        
        if (customer) {
            let updatedRequestsForCustomerDatabase
            if (propertyType === 'agricultural') {
                updatedRequestsForCustomerDatabase = [...customer.agriculturalPropertiesForWhichRequestSentToPropertyDealer, {
                    propertyId,
                    date: Date.now()
                }]
                const up = await Customer.findOneAndUpdate({ _id: customerId },
                    { agriculturalPropertiesForWhichRequestSentToPropertyDealer: updatedRequestsForCustomerDatabase },
                    { new: true, runValidators: true })
            } else if (propertyType === 'commercial') {
                updatedRequestsForCustomerDatabase = [...customer.commercialPropertiesForWhichRequestSentToPropertyDealer, {
                    propertyId,
                    date: Date.now()
                }]
                await Customer.findOneAndUpdate({ _id: customerId },
                    { commercialPropertiesForWhichRequestSentToPropertyDealer: updatedRequestsForCustomerDatabase },
                    { new: true, runValidators: true })
            } else if (propertyType === 'residential') {
                updatedRequestsForCustomerDatabase = [...customer.residentailPropertiesForWhichRequestSentToPropertyDealer, {
                    propertyId,
                    date: Date.now()
                }]
                await Customer.findOneAndUpdate({ _id: customerId },
                    { residentialPropertiesForWhichRequestSentToPropertyDealer: updatedRequestsForCustomerDatabase },
                    { new: true, runValidators: true })
            }

            const updatedCustomerRequests = [...propertyDealer.requestsFromCustomer, {
                propertyId,
                propertyType,
                customerId,
                customerName: customer.name,
                customerEmail: customer.email,
                customerContactNumber: customer.contactNumber,
                requestSeen: false,
                requestDate: Date.now()
            }]
            await PropertyDealer.findOneAndUpdate({ _id: dealerId },
                { requestsFromCustomer: updatedCustomerRequests },
                { new: true, runValidators: true })
            return res.status(StatusCodes.OK).json({ status: 'ok' })
        } else {
            throw new CustomAPIError('Customer not found', StatusCodes.BAD_REQUEST)
        }

    } catch (error) {
        next(error)
    }
}

module.exports = {
    sendRequestToPropertyDealer
}