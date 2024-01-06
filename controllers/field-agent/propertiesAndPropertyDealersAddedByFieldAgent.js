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
        const dealer = await PropertyDealer.findOne({ _id: req.params.id }).select('firmName')
        return res.status(StatusCodes.OK).json({ status: 'ok', firmName: dealer.firmName })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

////The function provides the number of proeprties and property dealers added by the field agent
const numberOfPropertyDealersAndPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const agriculturalPropertiesAdded = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const residentialPropertiesAdded = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const commercialPropertiesAdded = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })
        const propertiesAddedByfieldAgent = agriculturalPropertiesAdded + residentialPropertiesAdded + commercialPropertiesAdded

        const propertyDealersAddedByFieldAgent = await PropertyDealer.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        })

        return res.status(StatusCodes.OK).json({ status: 'ok', propertyDealersAddedByFieldAgent, propertiesAddedByfieldAgent })
    } catch (error) {
        next(error)
    }
}

//The function fetches number of property pending for reevaluation by field agent
const numberOfPendingPropertyReevaluations = async (req, res, next) => {
    try {
        const agriculturalPropertiesPendingForReevaluation = await AgriculturalProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            sentBackTofieldAgentForReevaluation: true
        })
        const residentialPropertiesPendingForReevaluation = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            sentBackTofieldAgentForReevaluation: true
        })
        const commercialPropertiesPendingForReevaluation = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            sentBackTofieldAgentForReevaluation: true
        })

        const numberOfPendingPropertyReevaluations = agriculturalPropertiesPendingForReevaluation + residentialPropertiesPendingForReevaluation + commercialPropertiesPendingForReevaluation

        return res.status(StatusCodes.OK).json({ status: 'ok', numberOfPendingPropertyReevaluations })
    } catch (error) {
        next(error)
    }
}

//The function fetches properties pending for reevaluation by field agent
const pendingPropertiesForReevaluationByFieldAgent = async (req, res, next) => {
    try {
        const agriculturalProperties = await AgriculturalProperty.find({
            sentBackTofieldAgentForReevaluation: true,
            addedByFieldAgent: req.fieldAgent._id
        }).select('propertyType location evaluationData')

        const commercialProperties = await CommercialProperty.find({
            sentBackTofieldAgentForReevaluation: true,
            addedByFieldAgent: req.fieldAgent._id
        }).select('propertyType location evaluationData')

        const residentialProperties = await ResidentialProperty.find({
            sentBackTofieldAgentForReevaluation: true,
            addedByFieldAgent: req.fieldAgent._id
        }).select('propertyType location evaluationData')

        const pendingPropertyReevaluations = [...agriculturalProperties, ...residentialProperties, ...commercialProperties]

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyReevaluations })

    } catch (error) {
        next(error)
    }
}

//To get details about a property
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
        next(error)
    }
}

//To update property data after reevaluation
const reevaluateProperty = async (req, res, next) => {
    try {
        const { id, type } = req.query
        const updatedData = {
            isSentForEvaluation: true,
            sentBackTofieldAgentForReevaluation: false,
            propertyImagesUrl: req.body.imagesUrl,
            evaluationRequestDate: Date.now()
        }
        if (type === 'agricultural') {
            await AgriculturalProperty.findOneAndUpdate({ _id: id },
                updatedData,
                { new: true, runValidators: true })
        } else if (type === 'residential') {
            await ResidentialProperty.findOneAndUpdate({ _id: id },
                updatedData,
                { new: true, runValidators: true })
        } else if (type === 'commercial') {
            await CommercialProperty.findOneAndUpdate({ _id: id },
                updatedData,
                { new: true, runValidators: true })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok' })
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
    getProperty,
    reevaluateProperty
}