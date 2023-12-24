const express = require('express')
const router = express.Router()
require('express-async-errors')
const authenticatePropertyEvaluator = require('../middleware/authenticatePropertyEvaluator')

const { signIn, logout, signup } = require('../controllers/property-evaluator/signIn')
const { forgotPassword, updatePassword, confirmPasswordVerificationToken, resetPasswordVerificationToken } = require('../controllers/property-evaluator/forgotPassword')

const { propertyEvaluationData, propertiesPendingToBeEvaluated, fetchSelectedProperty, propertyReevaluationOfData, successfulEvaluationOfData } = require('../controllers/property-evaluator/propertyEvaluationData')


router.post('/signIn', signIn) //to sign in an evaluator
router.patch('/logout', authenticatePropertyEvaluator, logout) //to logout an evaluator
router.post('/signUp', signup)
router.patch('/forgotPassword', forgotPassword) //to generate an OTP and send to evaluator in case the evaluator forgets password
router.patch('/updatePassword', updatePassword) //to update the password
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP sent by the evaluator
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the password verification token

router.get('/propertyEvaluationData', authenticatePropertyEvaluator, propertyEvaluationData) //to get data about properties evaluated by the the evaluator
router.get('/propertiesPendingToBeEvaluated', authenticatePropertyEvaluator, propertiesPendingToBeEvaluated)
router.get('/fetch-selected-property', authenticatePropertyEvaluator, fetchSelectedProperty)
router.post('/property-evaluation-data-update', authenticatePropertyEvaluator, propertyReevaluationOfData)
router.post('/successful-evaluation-of-data', authenticatePropertyEvaluator, successfulEvaluationOfData)

module.exports = router