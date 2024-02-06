const express = require('express')
const router = express.Router()
require('express-async-errors')
const authenticateCityManager = require('../middleware/authenticateCityManager')

const {
    signIn,
    logout,
    signup
} = require('../controllers/city-manager/signIn')

const {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
} = require('../controllers/city-manager/forgotPassword')

router.post('/signIn', signIn) //to sign in an city manager
router.patch('/logout', authenticateCityManager, logout) //to logout an city manager
router.post('/signUp', signup)
router.patch('/forgotPassword', forgotPassword) //to generate an OTP and send to city manager in case the city manager forgets password
router.patch('/updatePassword', updatePassword) //to update the password
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP sent by the city manager
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the password verification token

module.exports = router