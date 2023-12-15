require('express-async-errors')
const express = require('express')
const app = express()
app.use(express.static('./public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
const connectDB = require('./db/connectDB')
const port = 3011
const mongoose = require('mongoose')
mongoose.set('strictQuery', true)
require('dotenv').config()
const notFound = require('./middleware/notFound')
const errorHandlerMiddleware = require('./middleware/errorHandlerMiddleware')
//const helmet=require('helmet')
//const xss=require('xss-clean')
//const rateLimit = require('express-rate-limit')
//const mongoSanitize= require('express-mongo-sanitize')
const fieldAgentRouter = require('./routes/fieldAgentRouter')
const propertyEvaluatorRouter = require('./routes/propertyEvaluatorRouter')

const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
})

//app.set('trust proxy',1)
//app.use(helmet())
const cors = require('cors');
app.use(cors())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    next()
})


//app.use(xss())
//app.use(mongoSanitize())

app.use('/field-agent', fieldAgentRouter)
app.use('/property-evaluator', propertyEvaluatorRouter)
app.use(notFound) //this middleware runs when no other route is matched
app.use(errorHandlerMiddleware) //the error handling middleware


const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`server running on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}
start()


