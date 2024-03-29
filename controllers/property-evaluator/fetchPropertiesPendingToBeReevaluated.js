require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
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

        if (type !== 'residential' && type !== 'agricultural' && type !== 'commercial') {
            throw new CustomAPIError('Property type not provided', StatusCodes.BAD_REQUEST)
        }

        pendingPropertyReevaluations = await Property.find({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: type
        }).select('_id propertyType location sentToEvaluatorByCityManagerForReevaluation.date')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        numberOfProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: type
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
        const numberOfAgriculturalProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: 'agricultural'
        })

        const numberOfCommercialProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: 'commercial'
        })

        const numberOfResidentialProperties = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: 'residential'
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