require('express-async-errors')
const { StatusCodes } = require('http-status-codes')
const Customer = require('../../models/customer')
const CustomAPIError = require('../../errors/custom-error')

//The function is used to signIn a customer
const signIn = async (req, res, next) => {
    try {
        const {
            email,
            contactNumber,
            otp,
            password
        } = req.body

        console.log(req.body)

        if ((password && otp) || (!otp && !password)) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        if ((email && contactNumber) || (!email && !contactNumber)) {
            throw new CustomAPIError('Insufficient data', StatusCodes.BAD_REQUEST)
        }

        let identifier
        if (email) {
            identifier = { email }
        } else if (contactNumber) {
            identifier = { contactNumber }
        }

        let customer
        if (email) {
            customer = await Customer.findOne(identifier)
        } else {
            customer = await Customer.findOne(identifier)
        }

        if (!customer) {
            throw new CustomAPIError('No user found ', StatusCodes.BAD_REQUEST)
        }

        if (password) {
            const isPasswordCorrect = customer && await customer.comparePassword(password)
            if (!isPasswordCorrect) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_password', msg: 'Enter valid credentials' })
                return
            }
        } else if (otp) {
            if (customer.otpForVerification !== otp) {
                res.status(StatusCodes.OK).json({ status: 'incorrect_token', msg: 'Access denied' })
                return
            }

            await Customer.findOneAndUpdate(identifier,
                {
                    otpForVerification: null
                },
                { new: true, runValidators: true })
        }

        const authToken = await customer.createJWT()
        return res.status(StatusCodes.OK).json({
            status: 'ok',
            authToken
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

module.exports = {
    signIn
}