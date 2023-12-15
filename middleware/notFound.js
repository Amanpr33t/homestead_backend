require('express-async-errors')
const { StatusCodes } = require('http-status-codes')

//The function is executed when none of the routes match the request
const notFound = (req, res) => {
        res.status(StatusCodes.NOT_FOUND).send('Route does not exist')
}
module.exports = notFound