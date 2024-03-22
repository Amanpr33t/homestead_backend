require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
const CustomAPIError = require('../../errors/custom-error')

//To update property data after reevaluation
const updateReevaluatedPropertyData = async (req, res, next) => {
    try {
        const { id } = req.query
        if (!id) {
            throw new CustomAPIError('property id not provided', StatusCodes.BAD_REQUEST)
        }

        let updatedData = {
            ...req.body,
            sentBackTofieldAgentForReevaluation: {
                isSent: false,
                date: null
            }
        }

        const reevaluationRequestedBy = await Property.findOne({ _id: id }).select('sentBackTofieldAgentForReevaluation.by')

        if (reevaluationRequestedBy && reevaluationRequestedBy.sentBackTofieldAgentForReevaluation.by) {
            if (reevaluationRequestedBy.sentBackTofieldAgentForReevaluation.by === 'evaluator') {
                updatedData = {
                    ...updatedData,
                    sentToEvaluatorByFieldAgentForEvaluation: {
                        isSent: true,
                        date: new Date()
                    }
                }
            } else if (reevaluationRequestedBy.sentBackTofieldAgentForReevaluation.by === 'city-manager') {
                updatedData = {
                    ...updatedData,
                    sentToCityManagerForApproval: {
                        isSent: true,
                        date: new Date()
                    }
                }
            }
        }

        if (reevaluationRequestedBy) {
            if (reevaluationRequestedBy.sentBackTofieldAgentForReevaluation.by) {
                await Property.findOneAndUpdate({ _id: id },
                    updatedData,
                    { new: true, runValidators: true })

                res.status(StatusCodes.OK).json({ status: 'ok' })
            }
        }
        return
    } catch (error) {
        next(error)
    }
}

module.exports = { updateReevaluatedPropertyData }