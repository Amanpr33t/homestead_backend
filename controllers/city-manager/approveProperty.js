require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CityManager = require('../../models/cityManager')

//Update a property on successful evaluation of data
const approveProperty = async (req, res, next) => {
    try {
        const {
            propertyType,
            propertyId
        } = req.query

        const {
            sendBackToFieldAgent,
            sendBackToPropertyEvaluator,
            approveProperty,
            incompleteDetailsArray
        } = req.body

        if ((!sendBackToFieldAgent && !sendBackToPropertyEvaluator && !approveProperty) || (sendBackToFieldAgent && sendBackToPropertyEvaluator) || (sendBackToFieldAgent && approveProperty) || (sendBackToPropertyEvaluator && approveProperty)) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (!propertyId) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        let selectedModel
        if (propertyType === 'residential') {
            selectedModel = ResidentialProperty
        } else if (propertyType === 'agricultural') {
            selectedModel = AgriculturalProperty
        } else if (propertyType === 'commercial') {
            selectedModel = CommercialProperty
        } else {
            throw new CustomAPIError('Model name not provided', StatusCodes.BAD_REQUEST)
        }

        let updatedData
        if (sendBackToFieldAgent) {
            updatedData = {
                sentToCityManagerForApproval: {
                    date: null,
                    isSent: false
                },
                $inc: { "numberOfReevaluationsReceivedByFieldAgent": 1 },
                sentBackTofieldAgentForReevaluation: {
                    isSent: true,
                    date: new Date(),
                    details:incompleteDetailsArray,
                    by:'city-manager'
                }
            }
        } else if (sendBackToPropertyEvaluator) {
            updatedData = {
                sentToCityManagerForApproval: {
                    date: null,
                    isSent: false
                },
                isEvaluatedSuccessfullyByEvaluator: {
                    isEvaluated: false,
                    date: null
                },
                $inc: { "numberOfReevaluationsReceivedByEvaluator": 1 },
                sentToEvaluatorByCityManagerForReevaluation: {
                    isSent: true,
                    date: new Date(),
                    details: incompleteDetailsArray
                }
            }
        } else if (approveProperty) {
            updatedData = {
                isApprovedByCityManager: {
                    isApproved: true,
                    date: new Date()
                },
                isLive: true
            }
        }

        await selectedModel.findOneAndUpdate({ _id: propertyId },
            updatedData,
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok' })
        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    approveProperty
}