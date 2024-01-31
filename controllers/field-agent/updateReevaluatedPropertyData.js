require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CustomAPIError = require('../../errors/custom-error')

//To update property data after reevaluation
const updateReevaluatedPropertyData = async (req, res, next) => {
    try {
        const { id, type } = req.query
        if (!id) {
            throw new CustomAPIError('property id not provided', StatusCodes.BAD_REQUEST)
        }

        const updatedData = {
            ...req.body,
            sentBackTofieldAgentForReevaluationByEvaluator: {
                isSent: false,
                date: null
            },
            sentToEvaluatorByFieldAgentForEvaluation: {
                isSent: true,
                date: new Date()
            }
        }

        let selectedModel
        if (type === 'residential') {
            selectedModel = ResidentialProperty
        } else if (type === 'agricultural') {
            selectedModel = AgriculturalProperty
        } else if (type === 'commercial') {
            selectedModel = CommercialProperty
        } else {
            throw new CustomAPIError('property type not provided', StatusCodes.BAD_REQUEST)
        }

        await selectedModel.findOneAndUpdate({ _id: id },
            updatedData,
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok' })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = { updateReevaluatedPropertyData }