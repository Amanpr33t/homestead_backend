require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const { uniqueIdGeneratorForProperty } = require('../../utils/uniqueIdGenerator')
const FieldAgent = require('../../models/fieldAgent')
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator");

const propertyDealerExists = async (req, res, next) => {
    try {
        const { email, contactNumber, dealerId: uniqueId } = req.query

        if ((email && !email.trim() && contactNumber && !contactNumber.trim() && uniqueId && !uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim()) || (contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim())) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        let dealer
        if (contactNumber && contactNumber.trim()) {
            dealer = await PropertyDealer.findOne({ contactNumber: contactNumber.trim() })
        } else if (email && email.trim()) {
            if (!emailValidator.validate(email.trim())) {
                throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_GATEWAY)
            }
            dealer = await PropertyDealer.findOne({ email: email.trim() })
        } else if (uniqueId && uniqueId.trim()) {
            dealer = await PropertyDealer.findOne({ uniqueId: uniqueId.trim() })
        }

        if (!dealer) {
            return res.status(StatusCodes.OK).json({ status: 'noDealerExists', message: 'No dealer with this email or contact number exists' })
        }
        req.body.email = dealer.email
        next()
    } catch (error) {
        next(error)
    }
}

const sendOtpToEmailForDealerVerification = async (req, res, next) => {
    try {
        const { email } = req.body

        //const otpForVerification = crypto.randomBytes(3).toString('hex')
        const otpForVerification = Math.floor(1000 + Math.random() * 9000).toString()
        const msg = `<p>OTP for dealer verification to add property is: <h2>${otpForVerification}</h2></p>`

        const emailData = {
            from: process.env.ADMIN_EMAIL,
            to: email.trim(),
            subject: "OTP for dealer verification",
            msg
        }

        await sendEmail(emailData)

        const tenMinutes = 1000 * 60 * 10

        const otpForVerificationExpirationDate = new Date(Date.now() + tenMinutes)
        await PropertyDealer.findOneAndUpdate({ email },
            { otpForVerification, otpForVerificationExpirationDate },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'A verification token has been sent to your email' })
    } catch (error) {
        next(error)
    }
}

const confirmOtpForDealerVerification = async (req, res, next) => {
    try {
        const { email, contactNumber, dealerId: uniqueId, otp } = req.query

        if ((email && !email.trim() && contactNumber && !contactNumber.trim() && uniqueId && !uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim()) || (contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim())) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (otp && !otp.trim()) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let dealer
        if (email && email.trim()) {
            dealer = await PropertyDealer.findOne({ email: email.trim() })
        } else if (contactNumber && contactNumber.trim()) {
            dealer = await PropertyDealer.findOne({ contactNumber: contactNumber.trim() })
        } else if (uniqueId && uniqueId.trim()) {
            dealer = await PropertyDealer.findOne({ uniqueId: uniqueId.trim() })
        }

        if (!dealer) {
            throw new CustomAPIError('Dealer with this email or contact number does not exist', StatusCodes.NOT_FOUND)
        }
        if (dealer.otpForVerificationExpirationDate.getTime() <= Date.now()) {
            return res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
        }
        if (dealer.otpForVerification !== otp) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
        }

        let identifier
        if (email && email.trim()) {
            identifier = { email: email.trim() }
        } else if (contactNumber && contactNumber.trim()) {
            identifier = { contactNumber: contactNumber.trim() }
        } else if (uniqueId && uniqueId.trim()) {
            identifier = { uniqueId: uniqueId.trim() }
        }
        await PropertyDealer.findOneAndUpdate(identifier,
            {
                otpForVerification: null, otpForVerificationExpirationDate: null
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({
            status: 'ok', msg: 'OTP has been verified', dealer: {
                dealerId: dealer._id,
                firmName: dealer.firmName,
                firmLogoUrl: dealer.firmLogoUrl
            }
        })
    } catch (error) {
        next(error)
    }
}

const addAgriculturalProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id

        const { waterSource, reservoir, irrigationSystem, crops, road, legalRestrictions, agriculturalLandImagesUrl } = req.body

        if (!waterSource.canal.length && !waterSource.river.length && !waterSource.tubewells.numberOfTubewells) {
            throw new CustomAPIError('Water source information not provided', StatusCodes.BAD_REQUEST)
        }
        if (reservoir.isReservoir) {
            if (!reservoir.type.length) {
                throw new CustomAPIError('No reservoir type provided', StatusCodes.BAD_REQUEST)
            }
            if (reservoir.type.length > 2) {
                throw new CustomAPIError('Illegal reservoir type information', StatusCodes.BAD_REQUEST)
            }
            reservoir.type.forEach(type => {
                if (type.trim().toLowerCase() !== 'private' && type.trim().toLowerCase() !== 'public') {
                    throw new CustomAPIError('Incorrect type information', StatusCodes.BAD_REQUEST)
                }
            })
            if (reservoir.type.includes('private') && (!reservoir.capacityOfPrivateReservoir || (reservoir.unitOfCapacityForPrivateReservoir !== 'cusec' && reservoir.unitOfCapacityForPrivateReservoir !== 'litre'))) {
                throw new CustomAPIError('Incorrect inforamtion regarding capacity and ', StatusCodes.BAD_REQUEST)
            }
        }
        irrigationSystem.forEach(system => {
            if (system.trim() !== 'Sprinkler' && system.trim() !== 'Drip' && system.trim() !== 'Underground pipeline') {
                throw new CustomAPIError('Wrong irrigation sysyem information', StatusCodes.BAD_REQUEST)
            }
        })
        if (!crops.length) {
            throw new CustomAPIError('No crops provided', StatusCodes.BAD_REQUEST)
        }
        crops.forEach(crop => {
            if (crop.trim() !== 'Rice' && crop.trim() !== 'Maize' && crop.trim() !== 'Cotton' && crop.trim() !== 'Wheat') {
                throw new CustomAPIError('Wrong crop information', StatusCodes.BAD_REQUEST)
            }
        })
        if (!road.type.length || (road.type !== 'Unpaved road' && road.type !== 'Village road' && road.type !== 'District road' && road.type !== 'State highway' && road.type !== 'National highway')) {
            throw new CustomAPIError('Wrong road information', StatusCodes.BAD_REQUEST)
        }
        if (legalRestrictions.isLegalRestrictions && !legalRestrictions.details) {
            throw new CustomAPIError('Details of legal restrictions not provided', StatusCodes.BAD_REQUEST)
        }
        if (!agriculturalLandImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        const uniqueId = await uniqueIdGeneratorForProperty('agricultural', req.body.location.name.state)
        const property = await AgriculturalProperty.create({ ...req.body, uniqueId })

        const fieldAgent = req.fieldAgent
        const updatedAgriculturalPropertiesFieldAgent = [...fieldAgent.propertiesAdded.agricultural, property._id]
        const updatedPropertiesFieldAgent = {
            agricultural: updatedAgriculturalPropertiesFieldAgent,
            commercial: fieldAgent.propertiesAdded.commercial,
            residential: fieldAgent.propertiesAdded.residential
        }
        await FieldAgent.findOneAndUpdate({ _id: req.fieldAgent._id },
            { propertiesAdded: updatedPropertiesFieldAgent },
            { new: true, runValidators: true })

        const propertyDealer = await PropertyDealer.findOne({ id: req.body.addedByPropertyDealer })
        const updatedAgriculturalPropertiesPropertyDealer = [...propertyDealer.propertiesAdded.agricultural, property._id]
        const updatedPropertiesPropertyDealer = {
            agricultural: updatedAgriculturalPropertiesPropertyDealer,
            commercial: propertyDealer.propertiesAdded.commercial,
            residential: propertyDealer.propertiesAdded.residential
        }
        await PropertyDealer.findOneAndUpdate({ _id: req.body.addedByPropertyDealer },
            { propertiesAdded: updatedPropertiesPropertyDealer },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Agricultural property has been added' })
    } catch (error) {
        next(error)
    }
}

const addCommercialProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id
        const { stateOfProperty, commercialPropertyType, legalRestrictions, commercialLandImagesUrl, shopPropertyType } = req.body

        if (commercialPropertyType !== 'shop' && commercialPropertyType !== 'industrial') {
            throw new CustomAPIError('Commercial type details are wrong', StatusCodes.BAD_REQUEST)
        }
        if ((!stateOfProperty.empty && !stateOfProperty.builtUp) || (stateOfProperty.empty && stateOfProperty.builtUp)) {
            throw new CustomAPIError('Both values cannot be true or false at the same time', StatusCodes.BAD_REQUEST)
        }
        if (commercialPropertyType === 'industrial' && stateOfProperty.builtUp && !stateOfProperty.builtUpPropertyType) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (commercialPropertyType === 'shop' && !shopPropertyType) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (legalRestrictions.isLegalRestrictions && !legalRestrictions.details) {
            throw new CustomAPIError('Details of legal restrictions not provided', StatusCodes.BAD_REQUEST)
        }
        if (!commercialLandImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        const uniqueId = await uniqueIdGeneratorForProperty('commercial', req.body.location.name.state)
        const property = await CommercialProperty.create({ ...req.body, uniqueId })

        const fieldAgent = req.fieldAgent
        const updatedCommercialPropertiesFieldAgent = [...fieldAgent.propertiesAdded.commercial, property._id]
        const updatedPropertiesFieldAgent = {
            agricultural: fieldAgent.propertiesAdded.agricultural,
            commercial: updatedCommercialPropertiesFieldAgent,
            residential: fieldAgent.propertiesAdded.residential
        }
        await FieldAgent.findOneAndUpdate({ _id: req.fieldAgent._id },
            { propertiesAdded: updatedPropertiesFieldAgent },
            { new: true, runValidators: true })

        const propertyDealer = await PropertyDealer.findOne({ id: req.body.addedByPropertyDealer })
        const updatedCommercialPropertiesPropertyDealer = [...propertyDealer.propertiesAdded.commercial, property._id]
        const updatedPropertiesPropertyDealer = {
            agricultural: propertyDealer.propertiesAdded.agricultural,
            commercial: updatedCommercialPropertiesPropertyDealer,
            residential: propertyDealer.propertiesAdded.residential
        }
        await PropertyDealer.findOneAndUpdate({ _id: req.body.addedByPropertyDealer },
            { propertiesAdded: updatedPropertiesPropertyDealer },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Commercial property has been added' })
    } catch (error) {
        next(error)
    }
}

const addResidentialProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id

        const { residentialPropertyType, residentialLandImagesUrl, price, legalRestrictions } = req.body

        if (residentialPropertyType.toLowerCase() !== 'flat' && residentialPropertyType.toLowerCase() !== 'plot' && residentialPropertyType.toLowerCase() !== 'house') {
            throw new CustomAPIError('Residential type details are not present', StatusCodes.BAD_REQUEST)
        }

        if (!price.fixed && (!price.range.from && !price.range.to)) {
            throw new CustomAPIError('Price not provided', StatusCodes.BAD_REQUEST)
        } else if (price.range && (!price.range.from || !price.range.to)) {
            throw new CustomAPIError('Range of price not provided', StatusCodes.BAD_REQUEST)
        }

        if (legalRestrictions.isLegalRestrictions && !legalRestrictions.details) {
            throw new CustomAPIError('Details of legal restrictions not provided', StatusCodes.BAD_REQUEST)
        }

        if (!residentialLandImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        const uniqueId = await uniqueIdGeneratorForProperty('residential', req.body.location.name.state)
        const property = await ResidentialProperty.create({ ...req.body, uniqueId })

        const fieldAgent = req.fieldAgent
        const updatedResidentialPropertiesFieldAgent = [...fieldAgent.propertiesAdded.residential, property._id]
        const updatedPropertiesFieldAgent = {
            agricultural: fieldAgent.propertiesAdded.agricultural,
            commercial: fieldAgent.propertiesAdded.commercial,
            residential: updatedResidentialPropertiesFieldAgent
        }
        await FieldAgent.findOneAndUpdate({ _id: req.fieldAgent._id },
            { propertiesAdded: updatedPropertiesFieldAgent },
            { new: true, runValidators: true })

        const propertyDealer = await PropertyDealer.findOne({ id: req.body.addedByPropertyDealer })
        const updatedResidentialPropertiesPropertyDealer = [...propertyDealer.propertiesAdded.residential, property._id]
        const updatedPropertiesPropertyDealer = {
            agricultural: propertyDealer.propertiesAdded.agricultural,
            commercial: propertyDealer.propertiesAdded.commercial,
            residential: updatedResidentialPropertiesFieldAgent
        }
        await PropertyDealer.findOneAndUpdate({ _id: req.body.addedByPropertyDealer },
            { propertiesAdded: updatedPropertiesPropertyDealer },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Residential property has been added' })
    } catch (error) {
        next(error)
    }
}



module.exports = {
    propertyDealerExists, sendOtpToEmailForDealerVerification, confirmOtpForDealerVerification, addAgriculturalProperty, addCommercialProperty, addResidentialProperty
}