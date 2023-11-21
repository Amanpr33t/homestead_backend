require('express-async-errors')
class CustomAPIError extends Error{
    constructor(message,statusCode){
        super(message)
        this.statusCode=statusCode
    }
}
module.exports=CustomAPIError