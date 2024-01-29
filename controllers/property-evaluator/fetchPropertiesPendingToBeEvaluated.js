require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//The function fetches some data regarding properties pending to be evaluated by the evaluator
const propertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const { type } = req.query
        if (!type || !req.query.page) {
            throw new CustomAPIError('type and page information not provided', StatusCodes.BAD_REQUEST)
        }
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
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        }).select('_id propertyType location sentToEvaluatorByFieldAgentForEvaluation.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await selectedModel.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })

        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations, totalPages })
    } catch (error) {
        next(error)
    }
}

//The function is used to tell the number of properties pending for evaluation
const numberOfPropertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const numberOfAgriculturalProperties = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })

        const numberOfCommercialProperties = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })

        const numberOfResidentialProperties = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfAgriculturalProperties,
            numberOfCommercialProperties,
            numberOfResidentialProperties
        })
    } catch (error) {
        next(error)
    }
}


module.exports = {
    propertiesPendingToBeEvaluated,
    numberOfPropertiesPendingToBeEvaluated
}