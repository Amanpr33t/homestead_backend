require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to assign a property field agent to aproeprty
const findFieldAgent = async (district) => {
    //The code below is used to assign the property to an field agent
    try {
        // Find a random property field agent in the specified district that is active
        let fieldAgent = await FieldAgent.aggregate([
            { $match: { district, isActive: true } },
            { $sample: { size: 1 } },
            { $project: { _id: 1 } }
        ])
        if (fieldAgent && fieldAgent.length === 0) {
            //The if statement is run when we get no field agent with the same district
            return 'not-found'
        } else if (fieldAgent && fieldAgent.length) {
            return fieldAgent[0]._id
        }
    } catch (error) {
        throw new Error('Error occured while assigning field agent')
    }
}

//The function is used to fetch properties added by a property dealer
const assignFieldAgentForPropertyAddition = async (req, res, next) => {
    try {
        const { dealerId, location, propertyType } = req.body
        const district = req.body.location.district

        if (!dealerId || !district || !location || !propertyType) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        const fieldAgent = await findFieldAgent(district)
        if (fieldAgent && fieldAgent === 'not-found') {
            res.status(StatusCodes.OK).json({
                status: 'not_found'
            })
        } else if (fieldAgent) {
            await FieldAgent.findOneAndUpdate({ _id: fieldAgent },
                {
                    $push: {
                        requestsToAddProperty: {
                            ...req.body,
                            requestDate: new Date()
                        }
                    }
                },
                { new: true, runValidators: true })
            res.status(StatusCodes.OK).json({
                status: 'ok'
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    assignFieldAgentForPropertyAddition
}

