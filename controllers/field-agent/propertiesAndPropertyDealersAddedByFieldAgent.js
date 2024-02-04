require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//The function provides the number of property dealers added by the field agent
const propertyDealersAddedByFieldAgent = async (req, res, next) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        const numberOfPropertyDealers = await PropertyDealer.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })

        const propertyDealers = await PropertyDealer.find({
            addedByFieldAgent: req.fieldAgent._id
        })
            .sort({ createdAt: -1 })
            .select('_id firmName firmLogoUrl createdAt')
            .skip(skip)
            .limit(pageSize)

        const totalPages = Math.ceil(numberOfPropertyDealers / pageSize);

        res.status(StatusCodes.OK).json({
            status: 'ok',
            propertyDealers,
            numberOfPropertyDealers,
            totalPages
        })
        return
    } catch (error) {
        next(error)
    }
}

//the function is used to fetch proeprty dealer details
const dealerDetails = async (req, res, next) => {
    try {
        const { dealerId } = req.query
        if (!dealerId) {
            throw new CustomAPIError('dealer id not provided', StatusCodes.BAD_REQUEST)
        }
        const dealer = await PropertyDealer.findOne({
            _id: dealerId,
            addedByFieldAgent: req.fieldAgent._id
        }).select('-password -addedByFieldAgent -otpForVerification -otpForVerificationExpirationDate -authTokenExpiration -passwordVerificationToken -isActive -passwordVerificationTokenExpirationDate -requestsFromCustomer')
        res.status(StatusCodes.OK).json({ status: 'ok', dealer })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to get the firmName of property dealer of a property
const propertyDealerOfaProperty = async (req, res, next) => {
    try {
        const { id } = req.params
         if(!id){
            throw new CustomAPIError('dealer id not provided', StatusCodes.BAD_REQUEST)
         }
        const dealer = await PropertyDealer.findOne({ _id: id }).select('firmName')
        res.status(StatusCodes.OK).json({ status: 'ok', firmName: dealer.firmName })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertyDealersAddedByFieldAgent,
    propertyDealerOfaProperty,
    dealerDetails
}