require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

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

        res.status(StatusCodes.OK).json({
            status: 'ok',
            agricultural: agriculturalPropertiesPendingForReevaluation,
            residential: residentialPropertiesPendingForReevaluation,
            commercial: commercialPropertiesPendingForReevaluation
        })
        return
    } catch (error) {
        console.log(error)
        next(error)
    }
}

//The function fetches properties pending for reevaluation by field agent
const pendingPropertiesForReevaluation = async (req, res, next) => {
    try {
        console.log(req.query)
        const { type } = req.query
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        let pendingPropertyEvaluations = []
        let numberOfProperties

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

        pendingPropertyEvaluations = await selectedModel.find({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        }).select('_id propertyType location sentBackTofieldAgentForReevaluationByEvaluator.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await selectedModel.countDocuments({
            addedByFieldAgent: req.fieldAgent._id,
            'sentBackTofieldAgentForReevaluationByEvaluator.isSent': true
        })

        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations, totalPages })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    numberOfPendingPropertyReevaluations,
    pendingPropertiesForReevaluation
}