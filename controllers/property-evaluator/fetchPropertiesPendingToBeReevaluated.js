require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//The function fetches some data regarding properties pending to be evaluated by the evaluator
const propertiesPendingToBeReevaluated = async (req, res, next) => {
    try {
        const { type } = req.query
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        let pendingPropertyReevaluations = []
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

        pendingPropertyReevaluations = await selectedModel.find({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
        }).select('_id propertyType location sentToEvaluatorByCityManagerForReevaluation.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await selectedModel.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
        })

        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyReevaluations, totalPages })
    } catch (error) {
        next(error)
    }
}

//The function is used to tell the number of properties pending for evaluation
const numberOfPropertiesPendingToBeReevaluated = async (req, res, next) => {
    try {
        const numberOfAgriculturalProperties = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
        })

        const numberOfCommercialProperties = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
        })

        const numberOfResidentialProperties = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
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
    propertiesPendingToBeReevaluated,
    numberOfPropertiesPendingToBeReevaluated
}