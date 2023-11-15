require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const PropertyDealer = require('../../models/propertyDealer')

const propertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK).json({ status: 'ok' })
    } catch (error) {
        next(error)
    }
}

const propertyDealersAddedByFieldAgent = async (req, res, next) => {
    try {
        const propertyDealers = await PropertyDealer.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: -1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', propertyDealers })
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
    numberOfPropertyDealersAndPropertiesAddedByFieldAgent, propertyDealersAddedByFieldAgent
}