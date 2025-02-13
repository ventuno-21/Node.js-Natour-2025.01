const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const Email = require('./../utils/email')
const crypto = require('crypto')

const signToken = id => {
    return jwt.sign(
        { id: id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE_IN }
    )
}

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id)

    res.cookie('jwt', token,
        {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 1000),
            // secure: true,
            httpOnly: true,
            // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        }
    )
    // hashed password will not be shown as output
    user.password = undefined

    res
        .status(statusCode)
        .json({
            status: 'success',
            token: token,
            data: {
                user: user
            }

        })
}

exports.signup = catchAsync(async (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}/me`
    // console.log('authcontroller/signup/url = ', url)
    // We dont use below code because if a user wants to add his role to admin it will be possible
    // const newUser = await User.create(req.body)
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    })
    await new Email(newUser, url).sendWelcome()

    createSendToken(newUser, 201, req, res)
    // console.log('token = ', token)

})

exports.login = catchAsync(async (req, res, next) => {
    // const email = req.body.email // its better to use below line 
    const { email, password } = req.body

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400))
    }

    const user = await User.findOne({ email: email }).select('+password')
    // check email & password both are correct 
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401))
    }
    // if everything be ok, 
    req.user = await User.findOne({ email: email })
    console.log('req.user == ', req.user)
    createSendToken(user, 200, req, res)


    // req.user === user
    // console.log('req.user inside login func==', req.user)

})

exports.isLoggedIn = async (req, res, next) => {
    // Get token anc check if it is exist
    if (req.cookies.jwt) {
        try {
            const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
            // console.log('decoded ===', decoded)


            // check if user still exists
            const currentUser = await User.findById(decoded.id)
            if (!currentUser) {
                return next()
            }
            // Check if user changed password after the JWT Token is issued
            // if (currentUser.changePasswordAfter(decoded.iat)) {
            //     return next(new AppError('User recently changed password, login with new password', 401))
            // }

            // Thre is a logged in user 
            // now in frontend you can access to current user through => res.local.user
            res.locals.user = currentUser
            return next()


        } catch (error) {
            return next()
        }
    }
    next()
}


exports.protect = catchAsync(async (req, res, next) => {
    // Get token anc check if it is exist
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
        // console.log(token)
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new AppError('You are not logged in, please log in to get an access!', 401))
    }
    // Check the validation of token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log('decoded ===', decoded)


    // check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
        return next(new AppError('The user related to this token no longer exist', 401))
    }

    // Check if user changed password after the JWT Token is issued
    // if (currentUser.changePasswordAfter(decoded.iat)) {
    //     return next(new AppError('User recently changed password, login with new password', 401))
    // }

    // Grant access to protected route
    req.user = currentUser
    res.locals.user = currentUser

    next()
})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles are inside an array
        if (!roles.includes(req.user.role)) {
            // console.log("Your role is:", req.user.role)
            return next(new AppError('You are not authorized to do this action ', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })
    console.log('user in forgot password = ', user)
    if (!user) {
        next(new AppError('There is no user with that email address. ', 404))
    }
    // Generate Random reset Token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })


    try {
        // send email to user
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`

        // await sendEmail({
        //     email: user.email,
        //     subject: 'Your password reste token (is valid for ten inutes)',
        //     message
        // })

        await new Email(user, resetURL).sendPasswordReset()

        res
            .status(200)
            .json({
                status: "success",
                message: 'Token sent to email, please check your email'
            })

    } catch (err) {
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save({ validateBeforeSave: false })
        console.log("error inside catch part of reset password = ", err)
        return next(new AppError('There was an error sending the email, Try again later', 500))
    }

})


exports.logout = (req, res, next) => {
    // console.log('====================logout======================')
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({ status: 'success' })
}

exports.resetPassword = async (req, res, next) => {
    try {
        // Get user based on Token
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex')

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        })
        // console.log('User inside try of reset password = ', user)

        // If token has not expired & there is a userm set the new pass
        if (!user) {
            return next(new AppError('Token is invalid or expired', 400))
        }
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        user.passwordResetToken = undefined
        user.passwordResetExpires = undefined
        await user.save()

        createSendToken(user, 200, req, res)
        // const token = signToken(user._id)
        // res
        //     .status(200)
        //     .json({
        //         status: 'ok',
        //         token,
        //         message: 'You changed your password successfully'
        //     })


    } catch (error) {
        console.log('Error inside catch of reset password == ', error)
        res
            .status(400)
            .json({
                status: 'fail',
                error,
                message: error.message
            })
    }
}

exports.updatePassword = async (req, res, next) => {
    try {
        // console.log('req.user before = ', req.userId)
        // Get user from collection
        const user = await User.findById(req.user.id).select('+ password')
        // console.log('user after = ', user)


        // Check if the posted password is correct
        if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
            return next(new AppError('Your current password is wrong', 401))
        }
        // Update a password
        user.password = req.body.password
        user.passwordConfirm = req.body.passwordConfirm
        await user.save()

        createSendToken(user, 200, req, res)


    } catch (error) {
        console.log('Error inside catch of update password===', error)
        res
            .status(404)
            .json({
                status: 'fail',
                message: error.message,
                error
            })
    }

    // Log in the user with new password
}