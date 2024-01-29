require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

const propertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const propertyType = req.query.type
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 10;  // Number of items per page, default is 10

        const skip = (page - 1) * pageSize;

        let numberOfProperties //number of all properties added by field agent
        let properties //content about properties added by field agent

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

        numberOfProperties = await selectedModel.countDocuments({
            addedByFieldAgent: req.fieldAgent._id
        });
        properties = await ResidentialProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize)

        const totalPages = Math.ceil(numberOfProperties / pageSize);

        res.status(StatusCodes.OK).json({
            status: 'ok',
            properties,
            totalPages,
            numberOfProperties
        })
        return
    } catch (error) {
        next(error);
    }
};

module.exports = {
    propertiesAddedByFieldAgent
}