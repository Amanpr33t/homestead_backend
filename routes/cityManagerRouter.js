const express = require('express')
const router = express.Router()
require('express-async-errors')
const authenticateCityManager = require('../middleware/authenticateCityManager')

const {
    signIn
} = require('../controllers/city-manager/signIn')

const {
    sendVerificationCodeForCityManagerVerification,
    confirmVerificationCodeForCityManagerVerification
} = require('../controllers/city-manager/sendVerificationCodeForLogin')

const {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
} = require('../controllers/city-manager/forgotPassword')

const { numberOfPropertiesPendingForApproval } = require('../controllers/city-manager/numberOfPropertiesPendingForApproval')

const { propertiesPendingForApproval } = require('../controllers/city-manager/propertiesPendingForApproval')

const { approveProperty } = require('../controllers/city-manager/approveProperty')

router.post('/signIn', signIn) //to sign in an city manager
router.patch('/forgotPassword', forgotPassword) //to generate an OTP and send to city manager in case the city manager forgets password
router.patch('/updatePassword', updatePassword) //to update the password
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP sent by the city manager
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the password verification token

router.get('/numberOfPropertiesPendingForApproval', authenticateCityManager, numberOfPropertiesPendingForApproval)
router.get('/propertiesPendingForApproval', authenticateCityManager, propertiesPendingForApproval)

router.patch('/approveProperty', authenticateCityManager, approveProperty)

router.post('/sendOtpForVerification', sendVerificationCodeForCityManagerVerification)

router.post('/confirmVerificationCode', confirmVerificationCodeForCityManagerVerification)

module.exports = router