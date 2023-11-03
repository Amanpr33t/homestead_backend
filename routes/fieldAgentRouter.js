const express = require('express')
const router = express.Router()
const { signIn, logout, signup } = require('../controllers/field-agent/fieldAgentSignin')
const { forgotPassword, updatePassword, confirmPasswordVerificationToken, resetPasswordVerificationToken } = require('../controllers/field-agent/forgotPassword')
const authenticateFieldAgent = require('../middleware/authenticateFieldAgent')
const { addPropertyDealer } = require('../controllers/field-agent/addPropertyDealer')

router.post('/signIn', signIn)
router.patch('/logout', authenticateFieldAgent, logout)
router.post('/signUp', signup)
router.patch('/forgotPassword', forgotPassword)
router.patch('/updatePassword', updatePassword)
router.post('/confirmPasswordVerificationToken', confirmPasswordVerificationToken)
router.patch('/resetPasswordVerificationToken', resetPasswordVerificationToken)
router.post('/addPropertyDealer')


module.exports = router