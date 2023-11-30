require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')

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

const propertyDealerOfaProperty = async (req, res, next) => {
    try {
        const dealer = await PropertyDealer.findOne({ _id: req.params.id })
        return res.status(StatusCodes.OK).json({ status: 'ok', firmName: dealer.firmName })
    } catch (error) {
        next(error)
    }
}

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
    agriculturalPropertiesAddedByFieldAgent,
    propertyDealerOfaProperty,
    commercialPropertiesAddedByFieldAgent
}