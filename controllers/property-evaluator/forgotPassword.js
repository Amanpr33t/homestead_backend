require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const PropertyEvaluator = require('../../models/propertyEvaluator')
const CustomAPIError = require('../../errors/custom-error')
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
const bcrypt = require('bcryptjs');

//The function is used to generate a password verification token and sent that token to the proeprty evaluator
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new CustomAPIError('No email', StatusCodes.NO_CONTENT)
        }

        const propertyEvaluator = await PropertyEvaluator.findOne({ email })
        if (!propertyEvaluator) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'No property evaluator exists' })
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
        await PropertyEvaluator.findOneAndUpdate({ email },
            { passwordVerificationToken, passwordVerificationTokenExpirationDate },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'A verification token has been sent to your email' })
    } catch (error) {
        next(error)
    }
}

//The function is used to confirm the validity of the password verification token sent by the property evaluator
const confirmPasswordVerificationToken = async (req, res) => {
    try {
        const { email, passwordVerificationToken } = req.body
        if (!email || !passwordVerificationToken) {
            throw new CustomAPIError('insufficient data', 204)
        }
        const propertyEvaluator = await PropertyEvaluator.findOne({ email })

        if (!propertyEvaluator) {
            throw new CustomAPIError('Property evaluator with this email does not exist', StatusCodes.BAD_REQUEST)
        }

        if (propertyEvaluator.passwordVerificationToken !== passwordVerificationToken) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
        }

        if (propertyEvaluator.passwordVerificationTokenExpirationDate.getTime() <= Date.now()) {
            return res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password token has been verified' })
    } catch (error) {
        next(error)
    }
}

//The function is used to update the password for property evaluator
const updatePassword = async (req, res) => {
    try {
        const { email, newPassword, passwordVerificationToken } = req.body
        if (!email || !passwordVerificationToken || !newPassword) {
            throw new CustomAPIError('insufficient data', 204)
        }
        const propertyEvaluator = await PropertyEvaluator.findOne({ email })
        if (!propertyEvaluator) {
            throw new CustomAPIError('No property evaluator exists', StatusCodes.NO_CONTENT)
        }
        if (propertyEvaluator.passwordVerificationToken !== passwordVerificationToken) {
            throw new CustomAPIError('Incorrect verificationtoken', StatusCodes.BAD_REQUEST)
        }

        if (propertyEvaluator.passwordVerificationTokenExpirationDate.getTime() <= Date.now()) {
            throw new CustomAPIError('Verification token expired', StatusCodes.BAD_REQUEST)
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        await PropertyEvaluator.findOneAndUpdate({ email },
            {
                password: hashedPassword,
                passwordVerificationToken: null,
                passwordVerificationTokenExpirationDate: null
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password updated successfully' })
    } catch (error) {
        next(error)
    }
}

//The function is used to reset the value of the password verification token
const resetPasswordVerificationToken = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new CustomAPIError('insufficient data', 204)
        }
        await PropertyEvaluator.findOneAndUpdate({ email },
            {
                passwordVerificationToken: null,
                passwordVerificationTokenExpirationDate: null
            },
            { new: true, runValidators: true })

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password verification token has been reset successfully' })
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