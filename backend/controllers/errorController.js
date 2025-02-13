const AppError = require('./../utils/appError')

const handleCasetErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400)
}


const handleDuplicateFieldsDB = err => {

    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]
    console.log(value)
    const message = `Duplicate field value: ${value} .Please use another value!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid inpit data. ${errors.join(':::: ')}`
    return new AppError(message, 400)
}

const handleJWTError = () =>
    new AppError('Invalid token, please try to log in again.', 401)

const handleJWTExpiredError = () =>
    new AppError('Your token has expired, please log in again.', 401)

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res
            .status(err.statusCode)
            .json({
                status: err.status,
                error: err,
                name: err.name,
                message: err.message,
                stack: err.stack,
                moreInfo: 'Error handling middleware inside errorController on development enviroment',
            })
    } else {
        return res
            .status(err.statusCode)
            .render('error',
                { title: 'Something went wrong!', msg: err.message })
    }
}

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {

        if (err.isOperational) {
            return res
                .status(err.statusCode)
                .json({
                    status: err.status,
                    message: err.message,
                    error: 'Error handling middleware inside errorController on production enviroment'
                })
        } else {
            console.error('Error', err)
            return res.status(500).json({
                status: 'error',
                message: 'sth went wrong on Error production else part'
            })
        }
    } else {
        if (err.isOperational) {
            return res
                .status(err.statusCode)
                .render('error', {
                    title: 'Something went wrong',
                    status: err.status,
                    msg: err.message,
                    error: 'Error handling middleware inside errorController on production enviroment'
                })
        } else {
            // console.error('Error', err)
            return res.status(500).render('error', {
                title: 'Something went wrong',
                status: 'error',
                msg: 'sth went wrong on Error production else part'
            })
        }

    }
}


module.exports = (err, req, res, next) => {
    console.log('error.stack in errorController = ', err.stack)
    console.log('error.stack item 1 in errorController = ', err.stack.key)

    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        // let error = { ...err }
        // console.log('error.stack ====', error.stack)
        // console.log('error.message ====', error.message)
        // console.log('error.name ====', error.name)

        // if (error.name === 'CastError') error = handleCasetErrorDB(error)
        // if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        // if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        // if (error.name === 'JsonWebTokenError') error = handleJWTError()
        // if (error.message === 'jwt expired') error = handleJWTExpiredError() // Below line are same as this line
        // if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()
        sendErrorDev(err, req, res)

    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err }
        error.message = err.message
        error.name = err.name
        error.code = err.code
        error.stack = err.stack

        console.log('error.stack ====', error.stack)
        console.log('error.message ====', error.message)
        console.log('error.name ====', error.name)

        if (error.name === 'CastError') error = handleCasetErrorDB(error)
        if (error.code === 11000) error = handleDuplicateFieldsDB(error)
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
        if (error.name === 'JsonWebTokenError') error = handleJWTError()
        if (error.message === 'jwt expired') error = handleJWTExpiredError()

        sendErrorProd(error, req, res)
    }
} 