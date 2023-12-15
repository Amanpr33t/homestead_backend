require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//The function provides the number of agricultural proeprties added by the field agent
const agriculturalPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const agriculturalProperties = await AgriculturalProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', agriculturalProperties })
    } catch (error) {
        next(error)
    }
}

//The function provides the number of commercial proeprties added by the field agent
const commercialPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const commercialProperties = await CommercialProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', commercialProperties })
    } catch (error) {
        next(error)
    }
}

//The function provides the number of residential proeprties added by the field agent
const residentialPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const residentialProperties = await ResidentialProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', residentialProperties })
    } catch (error) {
        next(error)
    }
}

//The function provides the number of property dealers added by the field agent
const propertyDealersAddedByFieldAgent = async (req, res, next) => {
    try {
        const propertyDealers = await PropertyDealer.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', propertyDealers })
    } catch (error) {
        next(error)
    }
}

//The function is used to get the firmName of property dealer of a property
const propertyDealerOfaProperty = async (req, res, next) => {
    try {
        const dealer = await PropertyDealer.findOne({ _id: req.params.id })
        return res.status(StatusCodes.OK).json({ status: 'ok', firmName: dealer.firmName })
    } catch (error) {
        next(error)
    }
}

////The function provides the number of proeprties and property dealers added by the field agent
const numberOfPropertyDealersAndPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const propertyDealersAddedByFieldAgent = req.fieldAgent.propertyDealersAdded.length
        const propertiesAddedByfieldAgent = req.fieldAgent.propertiesAdded.agricultural.length + req.fieldAgent.propertiesAdded.commercial.length + req.fieldAgent.propertiesAdded.residential.length

        return res.status(StatusCodes.OK).json({ status: 'ok', propertyDealersAddedByFieldAgent, propertiesAddedByfieldAgent })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    numberOfPropertyDealersAndPropertiesAddedByFieldAgent,
    propertyDealersAddedByFieldAgent,
    propertyDealerOfaProperty,
    agriculturalPropertiesAddedByFieldAgent,
    residentialPropertiesAddedByFieldAgent,
    commercialPropertiesAddedByFieldAgent
}