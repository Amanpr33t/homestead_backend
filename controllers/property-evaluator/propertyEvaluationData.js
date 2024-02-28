require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')

/*The function is used to send to the user the following data:
1) Number of properties successfully evaluated by the evaluator
2) Number of properties sent to the for reconsideration to the field agent by the evaluator
3) Number of pending property evaluations
*/
const propertyEvaluationData = async (req, res, next) => {
    try {
        const agriculturalPropertiesApprovedByCityManager = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'isApprovedByCityManager.isApproved': true,
            propertyType: 'agricultural'
        })
        const commercialPropertiesApprovedByCityManager = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'isApprovedByCityManager.isApproved': true,
            propertyType: 'commercial'
        })
        const residentialPropertiesApprovedByCityManager = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'isApprovedByCityManager.isApproved': true,
            propertyType: 'residential'
        })
        const propertiesApprovedByCityManager = agriculturalPropertiesApprovedByCityManager + residentialPropertiesApprovedByCityManager + commercialPropertiesApprovedByCityManager

        const agriculturalPropertiesSentToCityManagerForApproval = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: 'agricultural'
        })
        const commercialPropertiesSentToCityManagerForApproval = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: 'commercial'
        })
        const residentialPropertiesSentToCityManagerForApproval = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToCityManagerForApproval.isSent': true,
            propertyType: 'residential'
        })
        const propertiesSentToCityManagerForApproval = residentialPropertiesSentToCityManagerForApproval + agriculturalPropertiesSentToCityManagerForApproval + commercialPropertiesSentToCityManagerForApproval


        const agriculturalPropertiesPendingForEvaluation = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: 'agricultural'
        })
        const commercialPropertiesPendingForEvaluation = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: 'commercial'
        })
        const residentialPropertiesPendingForEvaluation = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true,
            propertyType: 'residential'
        })
        const pendingPropertyEvaluations = residentialPropertiesPendingForEvaluation + agriculturalPropertiesPendingForEvaluation + commercialPropertiesPendingForEvaluation

        const agriculturalPropertiesReceivedForReevaluation = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: 'agricultural'
        })
        const commercialPropertiesReceivedForReevaluation = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: 'commercial'
        })
        const residentialPropertiesReceivedForReevaluation = await Property.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true,
            propertyType: 'residential'
        })
        const pendingPropertiesReceivedForReevaluation = residentialPropertiesReceivedForReevaluation + agriculturalPropertiesReceivedForReevaluation + commercialPropertiesReceivedForReevaluation

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            propertiesApprovedByCityManager,
            propertiesSentToCityManagerForApproval,
            pendingPropertyEvaluations,
            pendingPropertiesReceivedForReevaluation
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertyEvaluationData
}