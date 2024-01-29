require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const CustomAPIError = require('../../errors/custom-error')
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
const bcrypt = require('bcryptjs');
const emailValidator = require("email-validator")

//The function is used to generate a password verification token and sent that token to the field agent
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new CustomAPIError('No email', StatusCodes.NO_CONTENT)
        }
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_REQUEST)
        }

        const fieldAgent = await FieldAgent.findOne({ email })
        if (!fieldAgent) {
            res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'No field agent exists' })
            return
        }

        const passwordVerificationToken = crypto.randomBytes(3).toString('hex')
        const msg = `<p>Authentication token for password updation is:<h2>${passwordVerificationToken}</h2></p>`
        const emailData = {
            from: process.env.ADMIN_EMAIL,
            to: email,
            subject: "Password change for Homestead",
            msg
        }
        await sendEmail(emailData)

        const tenMinutes = 1000 * 60 * 10

        const passwordVerificationTokenExpirationDate = new Date(Date.now() + tenMinutes)
        await FieldAgent.findOneAndUpdate({ email },
            { passwordVerificationToken, passwordVerificationTokenExpirationDate },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok', msg: 'A verification token has been sent to your email' })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to confirm the validity of the password verification token sent by the field agent
const confirmPasswordVerificationToken = async (req, res) => {
    try {
        const { email, passwordVerificationToken } = req.body
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_REQUEST)
        }
        const fieldAgent = await FieldAgent.findOne({ email })

        if (!fieldAgent) {
            throw new CustomAPIError('Field agent with this email does not exist', StatusCodes.BAD_REQUEST)
        }

        if (fieldAgent.passwordVerificationToken !== passwordVerificationToken) {
            res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
            return
        }

        if (fieldAgent.passwordVerificationTokenExpirationDate.getTime() <= Date.now()) {
            res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
            return
        }

        res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password token has been verified' })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to update the password
const updatePassword = async (req, res) => {
    try {
        const { email, newPassword, passwordVerificationToken } = req.body
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_REQUEST)
        }
        const fieldAgent = await FieldAgent.findOne({ email })
        if (!fieldAgent) {
            throw new CustomAPIError('No field agent exists', StatusCodes.NO_CONTENT)
        }
        if (fieldAgent.passwordVerificationToken !== passwordVerificationToken) {
            throw new CustomAPIError('Incorrect verificationtoken', StatusCodes.BAD_REQUEST)
        }

        if (fieldAgent.passwordVerificationTokenExpirationDate.getTime() <= Date.now()) {
            throw new CustomAPIError('Verification token expired', StatusCodes.BAD_REQUEST)
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await FieldAgent.findOneAndUpdate({ email },
            {
                password: hashedPassword,
                passwordVerificationToken: null,
                passwordVerificationTokenExpirationDate: null
            },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password updated successfully' })
        return
    } catch (error) {
        next(error)
    }
}

//The function is used to reset the value of the password verification token
const resetPasswordVerificationToken = async (req, res) => {
    try {
        const { email } = req.body
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_REQUEST)
        }

        await FieldAgent.findOneAndUpdate({ email },
            {
                passwordVerificationToken: null,
                passwordVerificationTokenExpirationDate: null
            },
            { new: true, runValidators: true })

        res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password verification token has been reset successfully' })
        if (!emailValidator.validate(email)) {
            throw new CustomAPIError('Email not in correct format', StatusCodes.BAD_REQUEST)
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
}