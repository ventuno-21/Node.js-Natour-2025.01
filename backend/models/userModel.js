const mongoose = require('mongoose')
const slugify = require('slugify')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String, trim: true, unique: true,
        required: [true, 'Please enter your name'],
        // maxlength: [70, 'A tour name must have less or equal than 40 characters'],
        // minlength: [10, 'A tour name must have more or equal than 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain charactors']
    },
    email: {
        type: String, unique: true, lowecase: true,
        required: [true, 'Please provide your email'],
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'guide', 'lead-guide', 'admin'], message: 'Role is either:user,guide,leade-guide or admin'
        },
        default: 'user'
    },
    photo: { type: String, default: 'default.jpg' },
    password: {
        type: String, requires: [true, 'please provide a password'],
        minlength: [5, 'A password should have at least 5 characters'],
        select: false // it will not show up in any output
    },
    passwordConfirm: {
        type: String,
        // required: [true, 'Please confirm your password'],
        validate: {
            // function has to return only true or false
            // This only work on create() & save()
            validator: function (el) {
                return el === this.password // password = abd & passwordConfirm= abd then return true
            }, message: 'Passwords are not the same'
        }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
    // role: {
    //     type: String,
    //     enum: ['user', 'guide', 'lead-guide', 'admin'],
    //     // default: 'user'
    // },
    // createdAt: { type: Date, default: Date.now },
    // startDates: [Date],
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})


// 1) Document middleware/hook in mongoose run only before save() & .create() .validate() & .remove()
// save() middleware is not gonna work for sth like .insertMany() or update ...
userSchema.pre('save', async function (next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next()

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12)

    // Delete password confirm
    this.passwordConfirm = undefined
    next()

})

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next()
    this.passwordChangeAt = Date.now() - 1000
    next()
})


userSchema.pre(/^find/, function (next) {
    // this points to current query
    this.find({ active: { $ne: false } })
    next()
})



userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangeAt) {
        const changedTimestamp = parseInt(this.passwordChangeAt.getTime() / 1000, 10)
        console.log(changedTimestamp, JWTTimestamp)
    }
    return JWTTimestamp < changedTimestamp
}

userSchema.methods.createPasswordResetToken = function () {
    // Original reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    // Encrypting reset token
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    // console.log({ resetToken }, this.passwordResetToken)
    // console.log('original reset Token = ', resetToken)
    // console.log('Encrypted reset Token = ', this.passwordResetToken)

    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
