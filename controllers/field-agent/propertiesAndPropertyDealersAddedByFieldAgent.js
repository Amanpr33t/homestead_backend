require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')

const propertiesAndPropertyDealersAddedByFieldAgent = async (req, res, next) => {
    try {
        const fieldAgent = await FieldAgent.findOne({ _id: req.fieldAgent.fieldAgentId })

        const propertyDealersAddedByFieldAgent = fieldAgent && fieldAgent.propertyDealersAdded
        const propertiesAddedByfieldAgent = fieldAgent && fieldAgent.propertiesAdded

        return res.status(StatusCodes.OK).json({ status: 'ok', propertyDealersAddedByFieldAgent, propertiesAddedByfieldAgent })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertiesAndPropertyDealersAddedByFieldAgent
}