require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const CityManager = require('../../models/cityManager')

//The function is used to assign a city manager to aproeprty
const assignCityManagerForProperty = async (district, state) => {
    //The code below is used to assign the property to an evaluator
    try {
        // Find a random city manager in the specified district that is active
        let cityManager = await CityManager.aggregate([
            { $match: { district, isActive: true } },
            { $sample: { size: 1 } },
            { $project: { _id: 1 } }
        ])
        if (cityManager && cityManager.length === 0) {
            //The if statement is run when we get no evaluators with the same district
            cityManager = await CityManager.aggregate([
                { $match: { state, isActive: true } },
                { $sample: { size: 1 } },
                { $project: { _id: 1 } }
            ]); //We get all the evaluators with the same state and who are active
            if (cityManager.length === 0) {
                //The if statement is run when we get no evaluators with the same district and state
                cityManager = await CityManager.aggregate([
                    { $match: { isActive: true } },
                    { $sample: { size: 1 } },
                    { $project: { _id: 1 } }
                ])
                if (cityManager.length) {
                    return cityManager[0]._id
                } else {
                    return 'not-found'
                }
            } else if (cityManager.length) {
                return cityManager[0]._id
            }
        } else if (cityManager && cityManager.length) {
            return cityManager[0]._id
        }
    } catch (error) {
        throw new Error('Error occured while assigning city manager')
    }
}

//Update a property on successful evaluation of data
const evaluateProperty = async (req, res, next) => {
    try {
        const {
            propertyType,
            propertyId,
            isInformationComplete
        } = req.query

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

        if (isInformationComplete === 'true') {
            //evaluate data
            updatedData = {
                sentToEvaluatorByFieldAgentForEvaluation: {
                    isSent: false,
                    date: null
                },
                isEvaluatedSuccessfullyByEvaluator: {
                    isEvaluated: true,
                    date: new Date()
                },
                sentToCityManagerForApproval: {
                    by: 'evaluator',
                    isSent: true,
                    date: new Date()
                },
                evaluationData: req.body
            }
        } else if (isInformationComplete === 'false') {
            //send back to field agent for reevaluation
            updatedData = {
                $inc: { "numberOfReevaluationsReceivedByFieldAgent": 1 },
                sentBackTofieldAgentForReevaluation: {
                    by: 'evaluator',
                    isSent: true,
                    date: new Date()
                },
                sentToEvaluatorByFieldAgentForEvaluation: {
                    isSent: false,
                    date: null
                },
                evaluationData: req.body
            }
        }

        const propertyLocation = await selectedModel.findOne({ _id: propertyId }).select('location.name.state location.name.district')
        console.log(propertyLocation)
        let cityManagerId
        if(propertyLocation){
            cityManagerId = await assignPropertyEvaluatorForProperty(propertyLocation.district, propertyLocation.state)//id of evaluator to whom the property will be assigned for evaluation
        }

        //The if statement below is run when we get some evaluator from the database
        if (cityManagerId) {
            if (cityManagerId === 'not-found') {
                throw new CustomAPIError('No city manager found', StatusCodes.BAD_REQUEST)
            }

            await selectedModel.findOneAndUpdate({ _id: propertyId },
                updatedData,
                { new: true, runValidators: true })

            res.status(StatusCodes.OK).json({ status: 'ok' })
            return
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    evaluateProperty
}