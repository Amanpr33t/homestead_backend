const express = require('express')
const router = express.Router()
require('express-async-errors')
const authenticatePropertyEvaluator = require('../middleware/authenticatePropertyEvaluator')

const {
    signIn,
    logout,
    signup
} = require('../controllers/property-evaluator/signIn')

const {
    forgotPassword,
    updatePassword,
    confirmPasswordVerificationToken,
    resetPasswordVerificationToken
} = require('../controllers/property-evaluator/forgotPassword')

const {
    propertyEvaluationData
} = require('../controllers/property-evaluator/propertyEvaluationData')

const {
    evaluateProperty
} = require('../controllers/property-evaluator/evaluateProperty')

const {
    propertiesPendingToBeEvaluated,
    numberOfPropertiesPendingToBeEvaluated
} = require('../controllers/property-evaluator/fetchPropertiesPendingToBeEvaluated')

const { fetchSelectedProperty } = require('../controllers/property-evaluator/fetchSelectedProperty')

router.post('/signIn', signIn) //to sign in an evaluator
router.patch('/logout', authenticatePropertyEvaluator, logout) //to logout an evaluator
router.post('/signUp', signup)
router.patch('/forgotPassword', forgotPassword) //to generate an OTP and send to evaluator in case the evaluator forgets password
router.patch('/updatePassword', updatePassword) //to update the password
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken) //to confirm the OTP sent by the evaluator
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken) //to reset the password verification token

router.get('/propertyEvaluationData', authenticatePropertyEvaluator, propertyEvaluationData) //to get data about properties evaluated by the the evaluator
router.get('/propertiesPendingToBeEvaluated', authenticatePropertyEvaluator, propertiesPendingToBeEvaluated) //fetches some data regarding properties pending to be evaluated
router.get('/numberOfPropertiesPendingToBeEvaluated', authenticatePropertyEvaluator, numberOfPropertiesPendingToBeEvaluated) //fetches number of properties pending to be evaluated
router.get('/fetch-selected-property', authenticatePropertyEvaluator, fetchSelectedProperty) //fetch details of selected property
router.post('/evaluateProperty', authenticatePropertyEvaluator, evaluateProperty) //evaluate property

module.exports = router