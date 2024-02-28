require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const CustomAPIError = require('../../errors/custom-error')

//The function fetches some data regarding properties pending to be evaluated by the evaluator
const propertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const { type } = req.query
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10
        const skip = (page - 1) * pageSize;

        let pendingPropertyEvaluations = []
        let numberOfProperties

        if (type !== 'residential' && type !== 'agricultural' && type !== 'commercial') {
            throw new CustomAPIError('Property type not provided', StatusCodes.BAD_REQUEST)
        }

        pendingPropertyEvaluations = await Property.find({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: type
        }).select('_id propertyType location sentToEvaluatorByFieldAgentForEvaluation.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: type
        })

        const totalPages = Math.ceil(numberOfProperties / pageSize)

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations, totalPages })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

//The function is used to tell the number of properties pending for evaluation
const numberOfPropertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const numberOfAgriculturalProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: 'agricultural'
        })

        const numberOfCommercialProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: 'commercial'
        })

        const numberOfResidentialProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: 'residential'
        })

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            numberOfAgriculturalProperties,
            numberOfCommercialProperties,
            numberOfResidentialProperties
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}


module.exports = {
    propertiesPendingToBeEvaluated,
    numberOfPropertiesPendingToBeEvaluated
}