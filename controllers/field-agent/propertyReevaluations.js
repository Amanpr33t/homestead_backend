require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

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
        next(error)
    }
}

module.exports = {
    numberOfPendingPropertyReevaluations,
    pendingPropertiesForReevaluationByFieldAgent,
    reevaluateProperty
}