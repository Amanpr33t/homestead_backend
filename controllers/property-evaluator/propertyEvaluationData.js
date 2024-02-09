require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')

/*The function is used to send to the user the following data:
1) Number of properties successfully evaluated by the evaluator
2) Number of properties sent to the for reconsideration to the field agent by the evaluator
3) Number of pending property evaluations
*/
const propertyEvaluationData = async (req, res, next) => {
    try {
        const agriculturalPropertiesApprovedByCityManager = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'isApprovedByCityManager.isApproved': true,
        })
        const commercialPropertiesApprovedByCityManager = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'isApprovedByCityManager.isApproved': true,
        })
        const residentialPropertiesApprovedByCityManager = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'isApprovedByCityManager.isApproved': true,
        })
        const propertiesApprovedByCityManager = agriculturalPropertiesApprovedByCityManager + residentialPropertiesApprovedByCityManager + commercialPropertiesApprovedByCityManager

        const agriculturalPropertiesSentToCityManagerForApproval = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToCityManagerForApproval.isSent': true
        })
        const commercialPropertiesSentToCityManagerForApproval = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToCityManagerForApproval.isSent': true
        })
        const residentialPropertiesSentToCityManagerForApproval = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToCityManagerForApproval.isSent': true
        })
        const propertiesSentToCityManagerForApproval = residentialPropertiesSentToCityManagerForApproval + agriculturalPropertiesSentToCityManagerForApproval + commercialPropertiesSentToCityManagerForApproval


        const agriculturalPropertiesPendingForEvaluation = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })
        const commercialPropertiesPendingForEvaluation = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })
        const residentialPropertiesPendingForEvaluation = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByFieldAgentForEvaluation.isSent': true
        })
        const pendingPropertyEvaluations = residentialPropertiesPendingForEvaluation + agriculturalPropertiesPendingForEvaluation + commercialPropertiesPendingForEvaluation

        const agriculturalPropertiesReceivedForReevaluation = await AgriculturalProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
        })
        const commercialPropertiesReceivedForReevaluation = await CommercialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
        })
        const residentialPropertiesReceivedForReevaluation = await ResidentialProperty.countDocuments({
            propertyEvaluator: req.propertyEvaluator._id,
            'sentToEvaluatorByCityManagerForReevaluation.isSent': true
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