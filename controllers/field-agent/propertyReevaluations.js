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
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })
        const residentialPropertiesPendingForReevaluation = await ResidentialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })
        const commercialPropertiesPendingForReevaluation = await CommercialProperty.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })

        const numberOfPendingPropertyReevaluations = agriculturalPropertiesPendingForReevaluation + residentialPropertiesPendingForReevaluation + commercialPropertiesPendingForReevaluation

        res.status(StatusCodes.OK).json({ status: 'ok', numberOfPendingPropertyReevaluations })
        return
    } catch (error) {
        next(error)
    }
}

//The function fetches properties pending for reevaluation by field agent
const pendingPropertiesForReevaluationByFieldAgent = async (req, res, next) => {
    try {
        const agriculturalProperties = await AgriculturalProperty.find({
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true,
            addedByFieldAgent: req.fieldAgent._id
        }).select('propertyType location evaluationData')

        const commercialProperties = await CommercialProperty.find({
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true,
            addedByFieldAgent: req.fieldAgent._id
        }).select('propertyType location evaluationData')

        const residentialProperties = await ResidentialProperty.find({
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true,
            addedByFieldAgent: req.fieldAgent._id
        }).select('propertyType location evaluationData')

        const pendingPropertyReevaluations = [
            ...agriculturalProperties,
            ...residentialProperties,
            ...commercialProperties
        ]

        res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyReevaluations })
        return
    } catch (error) {
        next(error)
    }
}

//To update property data after reevaluation
const reevaluateProperty = async (req, res, next) => {
    try {
        const { id, type } = req.query
        const updatedData = {
            sentBackTofieldAgentForReevaluationByEvaluator: {
                isSent: false,
                date: null
            },
            propertyImagesUrl: req.body.imagesUrl,
            sentToEvaluatorByFieldAgentForEvaluation: {
                isSent: true,
                date: new Date()
            }
        }

        let selectedModel
        if (type === 'residential') {
            selectedModel = ResidentialProperty
        } else if (type === 'agricultural') {
            selectedModel = AgriculturalProperty
        } else if (type === 'commercial') {
            selectedModel = CommercialProperty
        } else {
            throw new CustomAPIError('Model name not provided', StatusCodes.BAD_REQUEST)
        }

        await selectedModel.findOneAndUpdate({ _id: id },
            updatedData,
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok' })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    numberOfPendingPropertyReevaluations,
    pendingPropertiesForReevaluationByFieldAgent,
    reevaluateProperty
}