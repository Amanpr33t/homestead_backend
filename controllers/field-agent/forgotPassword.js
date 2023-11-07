require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const FieldAgent = require('../../models/fieldAgent')
const CustomAPIError = require('../../errors/custom-error')
const crypto = require('crypto')
const sendEmail = require('../../utils/sendEmail')
const bcrypt = require('bcryptjs');

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        if (!email) {
            throw new CustomAPIError('No email', 204)
        }

        const fieldAgent = await FieldAgent.findOne({ email })
        if (!fieldAgent) {
            return res.status(StatusCodes.OK).json({ status: 'not_found', msg: 'No field agent exists' })
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

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'A verification token has been sent to your email' })
    } catch (error) {
        next(error)
    }
}

const confirmPasswordVerificationToken = async (req, res) => {
    try {
        const { email, passwordVerificationToken } = req.body
        const fieldAgent = await FieldAgent.findOne({ email })
        
        if (!fieldAgent) {
            throw new CustomAPIError('Field agent with this email does not exist', 204)
        }

        if (fieldAgent.passwordVerificationToken !== passwordVerificationToken) {
            return res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
        }

        if (fieldAgent.passwordVerificationTokenExpirationDate.getTime() <= Date.now()) {
            return res.status(StatusCodes.OK).json({ status: 'token_expired', msg: 'Token expired' })
        }

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password token has been verified' })
    } catch (error) {
        next(error)
    }
}



const updatePassword = async (req, res) => {
    try {
        const { email, newPassword, passwordVerificationToken } = req.body
        const fieldAgent = await FieldAgent.findOne({ email })
        if (!fieldAgent) {
            throw new CustomAPIError('No field agent exists', 204)
        }
        if (fieldAgent.passwordVerificationToken !== passwordVerificationToken) {
            throw new CustomAPIError('Incorrect verificationtoken', 400)
        }

        if (fieldAgent.passwordVerificationTokenExpirationDate.getTime() <= Date.now()) {
            throw new CustomAPIError('Verification token expired', 400)
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

        return res.status(StatusCodes.OK).json({ status: 'ok', msg: 'Password updated successfully' })
    } catch (error) {
        next(error)
    }
}

const resetPasswordVerificationToken = async (req, res) => {
    try {
        const { email } = req.body

        await FieldAgent.findOneAndUpdate({ email },
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
    forgotPassword, updatePassword, confirmPasswordVerificationToken, resetPasswordVerificationToken
}