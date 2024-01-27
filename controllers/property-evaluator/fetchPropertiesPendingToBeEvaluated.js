require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//The function fetches some data regarding properties pending to be evaluated by the evaluator
const propertiesPendingToBeEvaluated = async (req, res, next) => {
    try {
        const agriculturalPropertyPendingEvaluations = await AgriculturalProperty.find({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        }).select('_id propertyType location  evaluationRequestDate')

        const commercialPropertyPendingEvaluations = await CommercialProperty.find({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        }).select('_id propertyType location  evaluationRequestDate')

        const residentailPropertyPendingEvaluations = await ResidentialProperty.find({
            propertyEvaluator: req.propertyEvaluator._id,
            isSentForEvaluation: true
        }).select('_id propertyType location  evaluationRequestDate')

        const pendingPropertyEvaluations = [...agriculturalPropertyPendingEvaluations, ...commercialPropertyPendingEvaluations, ...residentailPropertyPendingEvaluations]

        return res.status(StatusCodes.OK).json({ status: 'ok', pendingPropertyEvaluations })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertiesPendingToBeEvaluated
}