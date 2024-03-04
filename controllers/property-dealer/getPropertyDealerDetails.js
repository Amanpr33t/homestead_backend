require('express-async-errors')
const { StatusCodes } = require('http-status-codes')

//The function is used to fetch dealer details
const getDealerDetails = async (req, res, next) => {
    try {
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            details: {
                firmName: req.propertyDealer.firmName,
                propertyDealerName: req.propertyDealer.propertyDealerName,
                firmLogoUrl: req.propertyDealer.firmLogoUrl,
                about: req.propertyDealer.about,
                experience: req.propertyDealer.experience,
                address: req.propertyDealer.address,
                gstNumber: req.propertyDealer.gstNumber,
                reraNumber: req.propertyDealer.reraNumber,
                email: req.propertyDealer.email,
                contactNumber: req.propertyDealer.contactNumber,
                uniqueId: req.propertyDealer.uniqueId
            }
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    getDealerDetails
}