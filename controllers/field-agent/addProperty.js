require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyDealer = require('../../models/propertyDealer')
const Property = require('../../models/property')
const PropertyEvaluator = require('../../models/propertyEvaluator')
const FieldAgent = require('../../models/fieldAgent')
const { uniqueIdGeneratorForProperty } = require('../../utils/uniqueIdGenerator')
const sendEmail = require('../../utils/sendEmail')
const CustomAPIError = require('../../errors/custom-error')
const emailValidator = require("email-validator");

//This function is used to check whether a property dealer exists
const propertyDealerExists = async (req, res, next) => {
    try {
        const {
            email,
            contactNumber,
            dealerId: uniqueId
        } = req.query

        //Out of email, contactNumber and uniqueId only 1 should be received. This if statement throws an error if more than 1 items are available
        if ((!email && !contactNumber && !uniqueId) ||
            (email && contactNumber) ||
            (contactNumber && uniqueId) ||
            (email && uniqueId)) {
            throw new CustomAPIError('Insufficient data', 204)
        }

        let dealer //This variable will store the dealers data fetched from database

        //The if statements run depending upon the availability of email, uniqueId and contactNumber
        if (contactNumber) {
            dealer = await PropertyDealer.findOne({ contactNumber })
        } else if (email) {
            if (!emailValidator.validate(email)) {
                throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_REQUEST)
            }
            dealer = await PropertyDealer.findOne({ email })
        } else if (uniqueId) {
            dealer = await PropertyDealer.findOne({ uniqueId })
        }

        if (!dealer) {
            res.status(StatusCodes.OK).json({
                status: 'noDealerExists',
                message: 'No dealer with this email or contact number exists'
            })
            return
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

        if (!email) {
            throw new CustomAPIError('Email not provided', StatusCodes.BAD_REQUEST)
        }
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_GATEWAY)
        }

        //Here we generate a 4 digit OTP
        const otpForVerification = Math.floor(1000 + Math.random() * 9000).toString()
        const msg = `<p>OTP for dealer verification to add property is: <h2>${otpForVerification}</h2></p>`

        const emailData = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: "OTP for dealer verification",
            msg
        }

        await sendEmail(emailData) //sendEmail function is imported from utils folder

        const tenMinutes = 1000 * 60 * 10

        const otpForVerificationExpirationDate = new Date(Date.now() + tenMinutes) //This variable is used to set the expiration date of the OTP

        //The query below is used to update the otpForVerification and otpForVerificationExpirationDate fields in the dealers document
        await PropertyDealer.findOneAndUpdate({ email },
            {
                otpForVerification,
                otpForVerificationExpirationDate
            },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({
            status: 'ok',
            msg: 'A verification token has been sent to your email'
        })
        return
    } catch (error) {
        next(error)
    }
}

//This function is used to confirm the OTP sent by the user
const confirmOtpForDealerVerification = async (req, res, next) => {
    try {
        const {
            email,
            contactNumber,
            dealerId: uniqueId,
            otp
        } = req.query

        //Out of email, contactNumber and uniqueId only 1 should be received. This if statement throws an error if more than 1 items are available
        if ((!email && !contactNumber && !uniqueId) ||
            (email && contactNumber) ||
            (contactNumber && uniqueId) ||
            (email && uniqueId)) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (!otp) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let dealer //This variable will store the dealers data fetched from database

        //The if statements run depending upon the availability of email, uniqueId and contactNumber
        if (email) {
            dealer = await PropertyDealer.findOne({ email })
        } else if (contactNumber) {
            dealer = await PropertyDealer.findOne({ contactNumber })
        } else if (uniqueId) {
            dealer = await PropertyDealer.findOne({ uniqueId })
        }

        if (!dealer) {
            throw new CustomAPIError('Dealer with this email or contact number does not exist', StatusCodes.NOT_FOUND)
        }

        if (dealer.otpForVerificationExpirationDate.getTime() <= Date.now()) {
            res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
            return
        }

        if (dealer.otpForVerification !== otp) {
            res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
            return
        }

        let identifier
        if (email) {
            identifier = { email }
        } else if (contactNumber) {
            identifier = { contactNumber }
        } else if (uniqueId) {
            identifier = { uniqueId }
        }

        //The code below is used to update the dealer document in the database once the OTP has been successfully verified
        await PropertyDealer.findOneAndUpdate(identifier,
            {
                otpForVerification: null,
                otpForVerificationExpirationDate: null
            },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({
            status: 'ok',
            msg: 'OTP has been verified',
            dealer: {
                dealerId: dealer._id,
                firmName: dealer.firmName,
                firmLogoUrl: dealer.firmLogoUrl
            }
        })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to assign a property evaluator to aproeprty
const assignPropertyEvaluatorForProperty = async (district, state) => {
    //The code below is used to assign the property to an evaluator
    try {
        // Find a random property evaluator in the specified district that is active
        let propertyEvaluator = await PropertyEvaluator.aggregate([
            { $match: { district, isActive: true } },
            { $sample: { size: 1 } },
            { $project: { _id: 1 } }
        ])
        if (propertyEvaluator && propertyEvaluator.length === 0) {
            //The if statement is run when we get no evaluator with the same district
            propertyEvaluator = await PropertyEvaluator.aggregate([
                { $match: { state, isActive: true } },
                { $sample: { size: 1 } },
                { $project: { _id: 1 } }
            ]); //We get evaluator with the same state and who are active
            if (propertyEvaluator.length === 0) {
                //The if statement is run when we get no evaluator with the same district and state
                propertyEvaluator = await PropertyEvaluator.aggregate([
                    { $match: { isActive: true } },
                    { $sample: { size: 1 } },
                    { $project: { _id: 1 } }
                ])
                if (propertyEvaluator.length) {
                    return propertyEvaluator[0]._id
                } else {
                    return 'not-found'
                }
            } else if (propertyEvaluator.length) {
                return propertyEvaluator[0]._id
            }
        } else if (propertyEvaluator && propertyEvaluator.length) {
            return propertyEvaluator[0]._id
        }
    } catch (error) {
        throw new Error('Error occured while assigning evaluator')
    }
}

//This function is used to add an agricultural property to database
const addAgriculturalProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id //Here we add the id of the fieldAgent to the body

        const {
            waterSource,
            reservoir,
            crops,
            legalRestrictions,
            propertyImagesUrl,
            contractImagesUrl,
            landSize,
            location
        } = req.body

        if (propertyImagesUrl && propertyImagesUrl.length >= 20) {
            throw new CustomAPIError('Number of property images should be less than 20', StatusCodes.BAD_REQUEST)
        }

        if (contractImagesUrl && contractImagesUrl.length >= 20) {
            throw new CustomAPIError('Number of contract images should be less than 20', StatusCodes.BAD_REQUEST)
        }

        //The if statements below are used to verify the content received in the body
        if (!waterSource || (waterSource && (waterSource.canal && !waterSource.canal.length) && (waterSource.river && !waterSource.river.length) && (waterSource.tubewells && !waterSource.tubewells.numberOfTubewells))) {
            throw new CustomAPIError('Water source information not provided', StatusCodes.BAD_REQUEST)
        }

        if (reservoir && reservoir.isReservoir) {
            if (!reservoir.type.length || reservoir.type.length > 2) {
                throw new CustomAPIError('Illegal reservoir type information', StatusCodes.BAD_REQUEST)
            }
            if (reservoir.type.includes('private') &&
                (!reservoir.capacityOfPrivateReservoir || !reservoir.unitOfCapacityForPrivateReservoir)) {
                throw new CustomAPIError('Incorrect inforamtion regarding capacity and type of private reservoir', StatusCodes.BAD_REQUEST)
            }
        }

        if (crops && !crops.length) {
            throw new CustomAPIError('No crops provided', StatusCodes.BAD_REQUEST)
        }

        if (legalRestrictions && legalRestrictions.isLegalRestrictions) {
            if (!legalRestrictions.details) {
                throw new CustomAPIError('legal restictions details not provided', StatusCodes.BAD_REQUEST)
            }
        }

        if (propertyImagesUrl && !propertyImagesUrl.length) {
            throw new CustomAPIError('No land images provided', StatusCodes.BAD_REQUEST)
        }

        const evaluatorId = await assignPropertyEvaluatorForProperty(location.name.district, location.name.state)//id of evaluator to whom the property will be assigned for evaluation

        //The if statement below is run when we get some evaluator from the database
        if (evaluatorId) {
            if (evaluatorId === 'not-found') {
                throw new CustomAPIError('No evaluator found', StatusCodes.BAD_REQUEST)
            }
            const uniqueId = await uniqueIdGeneratorForProperty('agricultural', req.body.location.name.state) //The code is used to generate a unique Id for the agricultural property

            const property = await Property.create({
                ...req.body,
                uniqueId,
                'sentToEvaluatorByFieldAgentForEvaluation.date': new Date(),
                propertyEvaluator: evaluatorId,
                propertyType: 'agricultural'
            }) //A new agricultural proeprty is created
            console.log(property)
            if (req.query.requestId && property) {
                console.log('herer')
                await FieldAgent.updateOne(
                    { _id: req.fieldAgent._id },
                    { $pull: { requestsToAddProperty: { _id: req.query.requestId } } }
                );
            }

            res.status(StatusCodes.OK).json({
                status: 'ok',
                message: 'Agricultural property has been added'
            })
            return
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

//This function is used to add a commercial property to database
const addCommercialProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id //Here we add the ID of field agent to the request body
        const {
            leasePeriod,
            lockInPeriod,
            stateOfProperty,
            commercialPropertyType,
            legalRestrictions,
            propertyImagesUrl,
            contractImagesUrl,
            shopPropertyType,
            landSize,
            location
        } = req.body

        if (propertyImagesUrl && propertyImagesUrl.length >= 20) {
            throw new CustomAPIError('Number of property images should be less than 20', StatusCodes.BAD_REQUEST)
        }

        if (contractImagesUrl && contractImagesUrl.length >= 20) {
            throw new CustomAPIError('Number of contract images should be less than 20', StatusCodes.BAD_REQUEST)
        }

        //The if statements below are used to verify the data received in request body
        if (stateOfProperty &&
            ((!stateOfProperty.empty && !stateOfProperty.builtUp) ||
                (stateOfProperty.empty && stateOfProperty.builtUp))) {
            throw new CustomAPIError('Both values cannot be true or false at the same time', StatusCodes.BAD_REQUEST)
        }
        if (stateOfProperty === 'industrial' && stateOfProperty.builtUp && !stateOfProperty.builtUpPropertyType) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (commercialPropertyType === 'industrial' && (lockInPeriod || leasePeriod || shopPropertyType)) {
            throw new CustomAPIError('Inappropriate data', StatusCodes.BAD_REQUEST)
        }

        if (commercialPropertyType === 'shop' && !shopPropertyType) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if (legalRestrictions && legalRestrictions.isLegalRestrictions) {
            if (!legalRestrictions.details) {
                throw new CustomAPIError('legal restictions details not provided', StatusCodes.BAD_REQUEST)
            }
        }

        if (propertyImagesUrl && !propertyImagesUrl.length) {
            throw new CustomAPIError('No property images provided', StatusCodes.BAD_REQUEST)
        }

        const evaluatorId = await assignPropertyEvaluatorForProperty(location.name.district, location.name.state)//id of evaluator to whom the property will be assigned for evaluation

        //The if statement below is run when we get some evaluators from the database
        if (evaluatorId) {
            if (evaluatorId === 'not-found') {
                throw new CustomAPIError('No evaluator found', StatusCodes.BAD_REQUEST)
            }

            const uniqueId = await uniqueIdGeneratorForProperty('commercial', req.body.location.name.state) //The code is used to generate a unique Id for the commercial property

            const property = await Property.create({
                ...req.body,
                uniqueId,
                'sentToEvaluatorByFieldAgentForEvaluation.date': new Date(),
                propertyEvaluator: evaluatorId,
                propertyType: 'commercial'
            }) //A new commercial proeprty is added to the database
            console.log(req.query)
            if (req.query.requestId !== null && property) {
                console.log(req.query.requestId, 'hello')
                console.log(req.fieldAgent._id)
                await FieldAgent.updateOne(
                    { _id: req.fieldAgent._id },
                    { $pull: { requestsToAddProperty: { _id: req.query.requestId } } }
                );
            }

            res.status(StatusCodes.OK).json({ status: 'ok', message: 'Commercial property has been added' })
            return
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}

//This function is used to add a residential property to database
const addResidentialProperty = async (req, res, next) => {
    try {
        req.body.addedByFieldAgent = req.fieldAgent._id  //Here we add the ID of field agent to the request body
        const {
            propertyImagesUrl,
            contractImagesUrl,
            priceData,
            legalRestrictions,
            title,
            details,
            waterSupply,
            furnishing,
            kitchenFurnishing,
            kitchenAppliances,
            garden,
            location
        } = req.body

        if (propertyImagesUrl && propertyImagesUrl.length >= 20) {
            throw new CustomAPIError('Number of property images should be less than 20', StatusCodes.BAD_REQUEST)
        }

        if (contractImagesUrl && contractImagesUrl.length >= 20) {
            throw new CustomAPIError('Number of contract images should be less than 20', StatusCodes.BAD_REQUEST)
        }

        if (waterSupply && waterSupply.available && waterSupply.twentyFourHours === null) {
            throw new CustomAPIError('data regarding 24 hours water supply not provided', StatusCodes.BAD_REQUEST)
        }

        //The if statements below are used to verify the data received in request body
        if (!priceData) {
            throw new CustomAPIError('Price not provided', StatusCodes.BAD_REQUEST)
        } else if (!priceData.fixed && (!priceData.range || (priceData.range && (!priceData.range.from || !priceData.range.to)))) {
            throw new CustomAPIError('Price not provided', StatusCodes.BAD_REQUEST)
        } else if (priceData.fixed && (priceData.range.from || priceData.range.to)) {
            throw new CustomAPIError('Invalide data', StatusCodes.BAD_REQUEST)
        } else if (priceData.range.from && priceData.range.to && +priceData.range.from >= +priceData.range.to) {
            throw new CustomAPIError('From should be smaller value than to', StatusCodes.BAD_REQUEST)
        }

        if (legalRestrictions && legalRestrictions.isLegalRestrictions) {
            if (!legalRestrictions.details) {
                throw new CustomAPIError('legal restictions details not provided', StatusCodes.BAD_REQUEST)
            }
        }

        if (propertyImagesUrl && !propertyImagesUrl.length) {
            throw new CustomAPIError('No property images provided', StatusCodes.BAD_REQUEST)
        }

        const evaluatorId = await assignPropertyEvaluatorForProperty(location.name.district, location.name.state)//id of evaluator to whom the property will be assigned for evaluation

        //The if statement below is run when we get some evaluators from the database
        if (evaluatorId) {
            if (evaluatorId === 'not-found') {
                throw new CustomAPIError('No evaluator found', StatusCodes.BAD_REQUEST)
            }

            const uniqueId = await uniqueIdGeneratorForProperty('residential', req.body.location.name.state) //The code is used to generate a unique Id for the residential property
            await Property.create({
                ...req.body,
                uniqueId,
                'sentToEvaluatorByFieldAgentForEvaluation.date': new Date(),
                propertyEvaluator: evaluatorId,
                propertyType: 'residential'
            }) //A new residential proeprty is added to the database

            if (req.query.requestId) {
                await FieldAgent.updateOne(
                    { _id: req.fieldAgent._id },
                    { $pull: { requestsToAddProperty: { _id: req.query.requestId } } }
                );
            }

            res.status(StatusCodes.OK).json({ status: 'ok', message: 'Residential property has been added' })
            return
        }
    } catch (error) {
        console.log(error)
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