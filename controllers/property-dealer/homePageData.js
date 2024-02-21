require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer');
const AgriculturalProperty = require('../../models/agriculturalProperty');
const CommercialProperty = require('../../models/commercialProperty');
const ResidentialProperty = require('../../models/residentialProperty');
const CustomAPIError = require('../../errors/custom-error');

//The function is used to fetch all requests by customers
const homePageData = async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await PropertyDealer.updateOne(
            { _id: req.propertyDealer._id, 'requestsFromCustomer.requestDate': { $lt: thirtyDaysAgo } }, // Condition to match document by _id and requestDate older than 30 days
            { $pull: { 'requestsFromCustomer': { requestDate: { $lt: thirtyDaysAgo } } } } // Pull elements matching the condition from requestsFromCustomer array
        );

        let customerRequests
        if (result && result.modifiedCount > 0) {
            customerRequests = await PropertyDealer.findOne({ _id: req.propertyDealer._id }).select('requestsFromCustomer')
        } if (result && result.modifiedCount === 0) {
            customerRequests = req.propertyDealer.requestsFromCustomer
        }

        const agriculturalProperties = await AgriculturalProperty.countDocuments({ addedByPropertyDealer: req.propertyDealer._id })
        const residentialProperties = await ResidentialProperty.countDocuments({ addedByPropertyDealer: req.propertyDealer._id })
        const commercialProperties = await CommercialProperty.countDocuments({ addedByPropertyDealer: req.propertyDealer._id })

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            customerRequests,
            dealerInfo: {
                logoUrl: req.propertyDealer.firmLogoUrl,
                firmName: req.propertyDealer.firmName,
                reraNumber: req.propertyDealer.reraNumber,
                gstNumber: req.propertyDealer.gstNumber,
                id:req.propertyDealer._id
            },
            numberOfProperties: {
                agricultural: agriculturalProperties,
                residential: residentialProperties,
                commercial: commercialProperties
            }
        })
    } catch (error) {
        next(error)
    }
}

////The function is used to fetch number of customer requests
const fetchAllProperties = async (req, res, next) => {
    try {
        const { type } = req.query
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 5 // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        let selectedModel
        if (type === 'agricultural') {
            selectedModel = AgriculturalProperty
        } else if (type === 'residential') {
            selectedModel = ResidentialProperty
        } else if (type === 'commercial') {
            selectedModel = CommercialProperty
        } else {
            throw new CustomAPIError('No property type provided', StatusCodes.BAD_REQUEST)
        }

        const properties = await selectedModel.find({ addedByPropertyDealer: req.propertyDealer._id })
            .select('location.name isLive isApprovedByCityManager.isApproved createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await selectedModel.countDocuments({ addedByPropertyDealer: req.propertyDealer._id })
        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            properties,
            totalPages
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

const fetchNumberOfCustomerRequests = async (req, res, next) => {
    try {
        const filteredCustomerRequests = req.propertyDealer.requestsFromCustomer.filter(request => request.requestSeen === false)
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfCustomerRequests: filteredCustomerRequests.length
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    homePageData,
    fetchAllProperties
}