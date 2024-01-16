require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const CommercialProperty = require('../../models/commercialProperty')
const AgriculturalProperty = require('../../models/agriculturalProperty')
const ResidentialProperty = require('../../models/residentialProperty')
const PropertyEvaluator = require('../../models/propertyEvaluator')
const { uniqueIdGeneratorForProperty } = require('../../utils/uniqueIdGenerator')
const sendEmail = require('../../utils/sendEmail')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator");

//This function is used to check whether a property dealer exists
const propertyDealerExists = async (req, res, next) => {
    try {
        const { email, contactNumber, dealerId: uniqueId } = req.query

        //Out of email, contactNumber and uniqueId only 1 should be received. This if statement throws an error if more than 1 items are available
        if ((email && !email.trim() && contactNumber && !contactNumber.trim() && uniqueId && !uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim()) || (contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim())) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        let dealer //This variable will store the dealers data fetched from database

        //The if statements run depending upon the availability of email, uniqueId and contactNumber
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

        req.body.email = dealer.email //Here we add the email of property dealer to the body
        next()
    } catch (error) {
        next(error)
    }
}

//This function is used to send OTP to the registered email of the dealer.
const sendOtpToEmailForDealerVerification = async (req, res, next) => {
    try {
        const { email } = req.body

        //Here we generate a 4 digit OTP
        const otpForVerification = Math.floor(1000 + Math.random() * 9000).toString()
        const msg = `<p>OTP for dealer verification to add property is: <h2>${otpForVerification}</h2></p>`

        const emailData = {
            from: process.env.ADMIN_EMAIL,
            to: email.trim(),
            subject: "OTP for dealer verification",
            msg
        }

        await sendEmail(emailData) //sendEmail function is imported from utils folder

        const tenMinutes = 1000 * 60 * 10

        const otpForVerificationExpirationDate = new Date(Date.now() + tenMinutes) //This variable is used to set the expiration date of the OTP

        //The query below is used to update the otpForVerification and otpForVerificationExpirationDate fields in the dealers document
        await PropertyDealer.findOneAndUpdate({ email },
            { otpForVerification, otpForVerificationExpirationDate },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'A verification token has been sent to your email' })
    } catch (error) {
        next(error)
    }
}

//This function is used to confirm the OTP sent by the user
const confirmOtpForDealerVerification = async (req, res, next) => {
    try {
        const { email, contactNumber, dealerId: uniqueId, otp } = req.query

        //Out of email, contactNumber and uniqueId only 1 should be received. This if statement throws an error if more than 1 items are available
        if ((email && !email.trim() && contactNumber && !contactNumber.trim() && uniqueId && !uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim()) || (contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && uniqueId && uniqueId.trim()) || (email && email.trim() && contactNumber && contactNumber.trim() && uniqueId && uniqueId.trim())) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (otp && !otp.trim()) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let dealer //This variable will store the dealers data fetched from database

        //The if statements run depending upon the availability of email, uniqueId and contactNumber
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

        //The code below is used to update the dealer document in the database once the OTP has been successfully verified
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

//This function is used to add an agricultural property to database
const addAgriculturalProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id //Here we add the id of the fieldAgent to the body

        const { waterSource, reservoir, irrigationSystem, crops, road, legalRestrictions, propertyImagesUrl } = req.body

        //The if statements below are used to verify the content received in the body
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
        if (!propertyImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        //The code below is used to assign the property to an evaluator
        let propertyEvaluators
        propertyEvaluators = await PropertyEvaluator.find({ district: req.body.location.name.district.toLowerCase(), isActive: true }) //We get all the evaluators with the same district and who are active

        if (propertyEvaluators && propertyEvaluators.length === 0) {
            //The if statement is run when we get no evaluators with the same district
            propertyEvaluators = await PropertyEvaluator.find({ state: req.body.location.name.state.toLowerCase(), isActive: true }) //We get all the evaluators with the same state and who are active
            if (propertyEvaluators.length === 0) {
                //The if statement is run when we get no evaluators with the same district and state
                propertyEvaluators = await PropertyEvaluator.find()
            }
        }

        //The if statement below is run when we get some evaluators from the database
        if (propertyEvaluators && propertyEvaluators.length > 0) {
            const randomIndex = Math.floor(Math.random() * propertyEvaluators.length) // Generate a random index
            const randomPropertyEvaluator = propertyEvaluators[randomIndex]   // Retrieve the random evaluator
            req.body.propertyEvaluator = randomPropertyEvaluator._id //we add the ID of the evaluator to the body of the agricultural property

            const uniqueId = await uniqueIdGeneratorForProperty('agricultural', req.body.location.name.state) //The code is used to generate a unique Id for the agricultural property

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();

            await AgriculturalProperty.create({
                ...req.body,
                uniqueId,
                evaluationRequestDate: Date.now(),
                stateWherePropertyIsLocated: req.body.location.name.state,
                yearOfPropertyAddition: currentYear
            }) //A new agricultural proeprty is created

            return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Agricultural property has been added' })
        }
    } catch (error) {
        next(error)
    }
}

//This function is used to add a commercial property to database
const addCommercialProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id //Here we add the ID of field agent to the request body

        const { stateOfProperty, commercialPropertyType, legalRestrictions, propertyImagesUrl, shopPropertyType } = req.body

        //The if statements below are used to verify the data received in request body
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
        if (!propertyImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        //The code below is used to assign the property to an evaluator
        let propertyEvaluators
        propertyEvaluators = await PropertyEvaluator.find({ district: req.body.location.name.district.toLowerCase(), isActive: true }) //We get all the evaluators with the same district and who are active

        if (propertyEvaluators && propertyEvaluators.length === 0) {
            //The if statement is run when we get no evaluators with the same district
            propertyEvaluators = await PropertyEvaluator.find({ state: req.body.location.name.state.toLowerCase(), isActive: true }) //We get all the evaluators with the same state and who are active
            if (propertyEvaluators.length === 0) {
                //The if statement is run when we get no evaluators with the same district and state
                propertyEvaluators = await PropertyEvaluator.find()
            }
        }

        //The if statement below is run when we get some evaluators from the database
        if (propertyEvaluators && propertyEvaluators.length > 0) {
            const randomIndex = Math.floor(Math.random() * propertyEvaluators.length) // Generate a random index
            const randomPropertyEvaluator = propertyEvaluators[randomIndex]   // Retrieve the random evaluator
            req.body.propertyEvaluator = randomPropertyEvaluator._id //we add the ID of the evaluator to the body of the commercial property

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();

            const uniqueId = await uniqueIdGeneratorForProperty('commercial', req.body.location.name.state) //The code is used to generate a unique Id for the commercial property
            await CommercialProperty.create({
                ...req.body,
                uniqueId,
                evaluationRequestDate: Date.now(),
                stateWherePropertyIsLocated: req.body.location.name.state,
                yearOfPropertyAddition: currentYear
            }) //A new commercial proeprty is added to the database

            return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Commercial property has been added' })
        }
    } catch (error) {
        next(error)
    }
}

//This function is used to add a residential property to database
const addResidentialProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id  //Here we add the ID of field agent to the request body

        const { residentialPropertyType, propertyImagesUrl, price, legalRestrictions } = req.body

        //The if statements below are used to verify the data received in request body
        if (residentialPropertyType.toLowerCase() !== 'flat' && residentialPropertyType.toLowerCase() !== 'plot' && residentialPropertyType.toLowerCase() !== 'house') {
            throw new CustomAPIError('Residential type details are not present', StatusCodes.BAD_REQUEST)
        }

        if (!price.fixed && (!price.range.from && !price.range.to)) {
            throw new CustomAPIError('Price not provided', StatusCodes.BAD_REQUEST)
        } else if (price.fixed && (price.range.from || price.range.to)) {
            throw new CustomAPIError('Invalide data', StatusCodes.BAD_REQUEST)
        } else if ((price.range.from && !price.range.to) || (!price.range.from && price.range.to)) {
            throw new CustomAPIError('Range of price not provided', StatusCodes.BAD_REQUEST)
        }

        if (legalRestrictions.isLegalRestrictions && !legalRestrictions.details) {
            throw new CustomAPIError('Details of legal restrictions not provided', StatusCodes.BAD_REQUEST)
        }

        if (!propertyImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        //The code below is used to assign the property to an evaluator
        let propertyEvaluators

        propertyEvaluators = await PropertyEvaluator.find({ district: req.body.location.name.district.toLowerCase(), isActive: true }) //We get all the evaluators with the same district and who are active

        if (propertyEvaluators && propertyEvaluators.length === 0) {
            //The if statement is run when we get no evaluators with the same district
            propertyEvaluators = await PropertyEvaluator.find({ state: req.body.location.name.state.toLowerCase(), isActive: true }) //We get all the evaluators with the same state and who are active
            if (propertyEvaluators.length === 0) {
                //The if statement is run when we get no evaluators with the same district and state is found
                propertyEvaluators = await PropertyEvaluator.find()
            }
        }

        //The if statement below is run when we get some evaluators from the database
        if (propertyEvaluators && propertyEvaluators.length > 0) {
            const randomIndex = Math.floor(Math.random() * propertyEvaluators.length) // Generate a random index
            const randomPropertyEvaluator = propertyEvaluators[randomIndex] // Retrieve the random evaluator
            req.body.propertyEvaluator = randomPropertyEvaluator._id //we add the ID of the evaluator to the body of the residential property

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();

            const uniqueId = await uniqueIdGeneratorForProperty('residential', req.body.location.name.state) //The code is used to generate a unique Id for the residential property
            await ResidentialProperty.create({
                ...req.body,
                uniqueId,
                evaluationRequestDate: Date.now(),
                stateWherePropertyIsLocated: req.body.location.name.state,
                yearOfPropertyAddition: currentYear
            }) //A new residential proeprty is added to the database

            return res.status(StatusCodes.OK).json({ status: 'ok', message: 'Residential property has been added' })
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    propertyDealerExists,
    sendOtpToEmailForDealerVerification,
    confirmOtpForDealerVerification,
    addAgriculturalProperty,
    addCommercialProperty,
    addResidentialProperty
}