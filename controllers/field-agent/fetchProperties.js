require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const CommercialProperty = require('../../models/commercialProperty')
const ResidentialProperty = require('../../models/residentialProperty')

//The function provides the number of agricultural proeprties added by the field agent
/*const agriculturalPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const agriculturalProperties = await AgriculturalProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 }).select('_id location createdAt')
        return res.status(StatusCodes.OK).json({ status: 'ok', agriculturalProperties })
    } catch (error) {
        next(error)
    }
}*/

//The function provides the number of commercial proeprties added by the field agent
/*const commercialPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const commercialProperties = await CommercialProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', commercialProperties })
    } catch (error) {
        next(error)
    }
}*/

//The function provides the number of residential proeprties added by the field agent
/*const residentialPropertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const residentialProperties = await ResidentialProperty.find({
            addedByFieldAgent: req.fieldAgent._id
        }).sort({ createdAt: 1 })
        return res.status(StatusCodes.OK).json({ status: 'ok', residentialProperties })
    } catch (error) {
        next(error)
    }
}*/

const propertiesAddedByFieldAgent = async (req, res, next) => {
    try {
        const type = req.query.type
        const page = req.query.page ? parseInt(req.query.page) : 1;  // Current page, default is 1
        const pageSize = 1;  // Number of items per page, default is 10

        const skip = (page - 1) * pageSize;

        let numberOfProperties
        let properties
        if (type === 'residential') {
            numberOfProperties = await ResidentialProperty.countDocuments({
                addedByFieldAgent: req.fieldAgent._id
            });
            properties = await ResidentialProperty.find({
                addedByFieldAgent: req.fieldAgent._id
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
        } else if (type === 'commercial') {
            numberOfProperties = await CommercialProperty.countDocuments({
                addedByFieldAgent: req.fieldAgent._id
            });
            properties = await CommercialProperty.find({
                addedByFieldAgent: req.fieldAgent._id
            })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(pageSize)
        } else if (type === 'agricultural') {
            numberOfProperties = await AgriculturalProperty.countDocuments({
                addedByFieldAgent: req.fieldAgent._id
            });
            properties = await AgriculturalProperty.find({
                addedByFieldAgent: req.fieldAgent._id
            })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(pageSize)
        }

        const totalPages = Math.ceil(numberOfProperties / pageSize);

        return res.status(StatusCodes.OK).json({
            status: 'ok',
            properties,
            totalPages,
            numberOfProperties
        })
    } catch (error) {
        next(error);
    }
};



module.exports = {
    propertiesAddedByFieldAgent
}