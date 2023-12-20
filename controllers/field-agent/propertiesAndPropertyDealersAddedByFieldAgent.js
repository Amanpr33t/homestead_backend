require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const FieldAgent = require('../../models/fieldAgent')

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
        console.log('hello')
        const dealer = await PropertyDealer.findOne({ _id: req.params.id })
        return res.status(StatusCodes.OK).json({ status: 'ok', firmName: dealer.firmName })
    } catch (error) {
        console.log(error)
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

const numberOfPendingPropertyReevaluations = async (req, res, next) => {
    try {
        const numberOfPendingPropertyReevaluations = req.fieldAgent.propertyReceivedForReevaluation.agricultural.length + req.fieldAgent.propertyReceivedForReevaluation.residential.length + req.fieldAgent.propertyReceivedForReevaluation.commercial.length

        return res.status(StatusCodes.OK).json({ status: 'ok', numberOfPendingPropertyReevaluations })
    } catch (error) {
        next(error)
    }
}

const pendingPropertiesForReevaluationByFieldAgent = async (req, res, next) => {
    try {
        let agriculturalProperties = []
        if (req.fieldAgent.propertyReceivedForReevaluation.agricultural.length > 0) {
            agriculturalProperties = await AgriculturalProperty.find({
                sentBackTofieldAgentForReevaluation: true,
                addedByFieldAgent: req.fieldAgent._id
            }).select('propertyType location evaluationData')
        }

        let commercialProperties = []
        if (req.fieldAgent.propertyReceivedForReevaluation.commercial.length > 0) {
            commercialProperties = await CommercialProperty.find({
                sentBackTofieldAgentForReevaluation: true,
                addedByFieldAgent: req.fieldAgent._id
            }).select('propertyType location evaluationData')
        }

        let residentialProperties = []
        if (req.fieldAgent.propertyReceivedForReevaluation.residential.length > 0) {
            residentialProperties = await ResidentialProperty.find({
                sentBackTofieldAgentForReevaluation: true,
                addedByFieldAgent: req.fieldAgent._id
            }).select('propertyType location evaluationData')
        }

        const pendingPropertyReevaluations = [...agriculturalProperties, ...residentialProperties, ...commercialProperties]

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyReevaluations })

    } catch (error) {
        next(error)
    }
}

const getProperty = async (req, res, next) => {
    try {
        const { id, type } = req.query
        let propertyData
        if (type === 'agricultural') {
            propertyData = await AgriculturalProperty.findOne({ _id: id })
        } else if (type === 'residential') {
            propertyData = await ResidentialProperty.findOne({ _id: id })
        } else if (type === 'commercial') {
            propertyData = await CommercialProperty.findOne({ _id: id })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', propertyData })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    numberOfPropertyDealersAndPropertiesAddedByFieldAgent,
    propertyDealersAddedByFieldAgent,
    propertyDealerOfaProperty,
    agriculturalPropertiesAddedByFieldAgent,
    residentialPropertiesAddedByFieldAgent,
    commercialPropertiesAddedByFieldAgent,
    numberOfPendingPropertyReevaluations,
    pendingPropertiesForReevaluationByFieldAgent,
    getProperty
}