require('express-async-errors')
const { StatusCodes } = require('http-status-codes')

/*The function is used to send to the user the following data:
1) Number of properties successfully evaluated by the evaluator
2) Number of properties sent to the for reconsideration to the field agent by the evaluator
3) Number of pending property evaluations
*/
const propertyEvaluationData = async (req, res, next) => {
    try {
        const propertiesSuccessfullyEvaluated = req.propertyEvaluator.propertiesSuccessfullyEvaluated.length
        const propertiesSentToFieldAgentForReconsideration = req.propertyEvaluator.propertiesSentToFieldAgentForReconsideration.length
        const pendingPropertyEvaluations = req.propertyEvaluator.pendingPropertyEvaluations.length

        return res.status(StatusCodes.OK).json({ status: 'ok', propertiesSuccessfullyEvaluated, propertiesSentToFieldAgentForReconsideration, pendingPropertyEvaluations })
    } catch (error) {
        next(error)
    }
}

module.exports = {
   propertyEvaluationData
}