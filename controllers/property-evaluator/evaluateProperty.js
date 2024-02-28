require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Property = require('../../models/property')
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

        let updatedData = {
            //This is done to reset tthe value to null if the property is sent back to evaluator by city manager
            sentToEvaluatorByCityManagerForReevaluation: {
                isSent: false,
                date: null
            }
        }

        if (isInformationComplete === 'true') {
            const propertyLocation = await Property.findOne({ _id: propertyId }).select('location.name.state location.name.district')

            let cityManagerId
            if (propertyLocation) {
                cityManagerId = await assignCityManagerForProperty(propertyLocation.location.name.district, propertyLocation.location.name.state)//id of evaluator to whom the property will be assigned for evaluation
            }

            //The if statement below is run when we get some evaluator from the database
            if (cityManagerId && cityManagerId === 'not-found') {
                throw new CustomAPIError('No city manager found', StatusCodes.BAD_REQUEST)
            } else if (cityManagerId) {
                //evaluate data 
                updatedData = {
                    ...updatedData,
                    cityManager: cityManagerId,
                    sentToEvaluatorByFieldAgentForEvaluation: {
                        isSent: false,
                        date: null
                    },
                    isEvaluatedSuccessfullyByEvaluator: {
                        isEvaluated: true,
                        date: new Date()
                    },
                    sentToCityManagerForApproval: {
                        isSent: true,
                        date: new Date()
                    },
                    evaluationData: req.body
                }
            }
        } else if (isInformationComplete === 'false') {
            //send back to field agent for reevaluation
            updatedData = {
                ...updatedData,
                $inc: { "numberOfReevaluationsReceivedByFieldAgent": 1 },
                sentBackTofieldAgentForReevaluation: {
                    isSent: true,
                    date: new Date(),
                    details: req.body.incompletePropertyDetails,
                    by: 'evaluator'
                },
                sentToEvaluatorByFieldAgentForEvaluation: {
                    isSent: false,
                    date: null
                }
            }
        }

        await Property.findOneAndUpdate({ _id: propertyId },
            updatedData,
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok' })

        return
    } catch (error) {
        next(error)
    }
}

module.exports = {
    evaluateProperty
}