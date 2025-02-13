const express = require('express')
const morgan = require('morgan')
const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const compression = require('compression')
const User = require('./models/userModel')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const cookieParser = require('cookie-parser')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewsRoutes')
const bookingRouter = require('./routes/bookingRoutes')
const cors = require('cors')

const app = express()

app.enable('trust proxy')

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))


// All website are allow to send a request to our API
app.use(cors())
// access-control-allow-origin
// app.use(cors({
//     origin: 'https://www.natours.com',
// }))

app.options('*', cors())
// app.options('/api/v1/tours/:id', cors())

// Serving statuc files
// app.use(express.static(`${__dirname}/public`))
app.use(express.static(path.join(__dirname, 'public')))



// Set security Http headers
app.use(helmet({ contentSecurityPolicy: false, }))
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             ...helmet.contentSecurityPolicy.getDefaultDirectives(),
//             'default-src': ['\'unsafe-inline\'', '\'self\''],
//             'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', '*'],
//             'img-src': ['\'self\''],
//         },
//     })
// );

// app.use(function (req, res, next) {
//     res.setHeader("Content-Security-Policy", "script-src 'self' https://apis.google.com");
//     return next();
// });

//middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Limit request from same API: From each IP "100 request" can be sent in "one hour"
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour'
})
app.use('/api', limiter)

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }))
// with below middleware from our browser we can send information to our functiones(like information inside a form)
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
// parse a data form cookie

app.use(cookieParser())


// Data sanitization against noSql query injection
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss())

// prevent paramete pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingQunatity',
        'ratingAverage',
        'maxGroupSize',
        'difficulty',
        'price']
}))


app.use(compression())

app.use((req, res, next) => {
    // console.log('Hello from customized middleware !')
    // console.log('process.env.NODE_ENV=', process.env.NODE_ENV)
    req.requestTime = new Date().toISOString()
    // console.log('cookie parser = ', req.cookies)

    next()
})

// app.use((req, res, next) => {
//     req.requestTime = new Date().toISOString()
//     next()
// })


// app.use( (req, res, next) => {

//     // Get token anc check if it is exist
//     let token
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         token = req.headers.authorization.split(' ')[1]
//     }
//     if (token) {
//         const decoded = promisify(jwt.verify)(token, process.env.JWT_SECRET)
//         console.log('decoded in app.js ===', decoded)
//         // req.user = await User.findById(decoded.id)
//         req.user.id = decoded.id
//         console.log('app.js middlerware user = ', req.user.id)
//     }
//     next()
// })

// Defining middleware
const asyncMiddleware = async (req, res, next) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }
    if (token) {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        // console.log('decoded in app.js ===', decoded)
        // req.user = await User.findById(decoded.id)
        // console.log('app.js middlerware user before = ', decoded.id)

        req.userId = decoded.id
        // console.log('app.js middlerware user = ', req.userId)
    }
    next()
}
// Using it in an app for all routes (you can replace * with any route you want)
app.use('*', asyncMiddleware)


app.get('/favicon.ico', (req, res) => res.status(204));
app.use('/', viewRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/bookings', bookingRouter)

// below codes should be below of our other main routes 
// so in case there was a error it will be shown an error
app.all('*', (req, res, next) => {
    // res.
    //     status(404)
    //     .json({ status: 'fail', message: `Can't find ${req.originalUrl} on this server` })
    // const err = new Error(`Can't find ${req.originalUrl} on this server`)
    // err.status = 'fail'
    // err.statusCode = 404
    // It will be sent to our error handling middleware
    next(new AppError(`Can't find ${req.originalUrl} on this server`))
})

// Error handling middleware
app.use(globalErrorHandler)

module.exports = app