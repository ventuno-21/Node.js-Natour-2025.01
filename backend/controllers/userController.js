const jwt = require('jsonwebtoken')
const User = require('./../models/userModel')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
const multer = require('multer')
const sharp = require('sharp')

// How we want to store our photo in DB
// const multerStorage = multer.diskStorage(
//     {
//         destination: (req, file, cb) => {
//             cb(null, 'public/img/users')
//         },
//         filename: (req, file, cb) => {
//             //image will be like: user-id-current time stamp.extension
//             const ext = file.mimetype.split('/')[1]
//             cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//         }
//     })

// we use memoryStorage instead of diskstorage=>
// therefore we will be able to user buffer
const multerStorage = multer.memoryStorage()

// only upload image type not other files
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        // first argument of cb function is error, if it is null it means no error
        cb(null, true)
    } else {
        cb(new AppError('Not an image, please upload only images!', 400), false)
    }
}

// const upload = multer({ dest: 'public/img/users' })
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})


// single: because only one picture will be updated & photo : is the name of a field in User model
exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = async (req, res, next) => {
    if (!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)
    next()
}


const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el]
        }
    })
    return newObj
}



exports.updateMe = async (req, res, next) => {
    // console.log('userController/updateMe/req.file = ', req.file)
    // console.log('userController/updateMe/req.body = ', req.body)
    try {
        // console.log('userController/updateME/user& email======', req.body.name, req.body.email)
        // Create Error if user Posts pasword Data
        if (req.body.password || req.body.passwordConfirm) {
            // console.log('usercontroller/updateme/if for password')
            return next(new AppError('This route is not for password updates, Please use path: /update-password', 400))
        }

        // from req.body only name and email are allowed to get changed
        const filteredBody = filterObj(req.body, 'name', 'email')
        if (req.file) filteredBody.photo = req.file.filename

        // console.log('userController/updateme/filteredBody=====', filteredBody)
        // console.log('userController/updateme/request user ID=====', req.userId)
        // console.log('userController/updateme/request user ID=====', req.user.id)



        // Update user document
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            filteredBody,
            { new: true, runValidators: true }
        )
        // console.log('usercontroller/updatedMe/updated user ===', updatedUser)
        res
            .status(200)
            .json({
                status: 'success',
                data: {
                    user: updatedUser
                }
            })

    } catch (error) {

        // console.log('usercontroller/updatedMe/ catch')
        res
            .status(400)
            .json({
                status: 'fail',
                message: error.message
            })
    }
}

exports.getMe = (req, res, next) => {
    req.params.id = req.userId
    next()
}

exports.deleteMe = async (req, res, next) => {
    try {
        // Soft delete: user will not get deleted completely, only will be deactivated 
        await User.findByIdAndUpdate(req.userId, { active: false })

        res
            .status(204)
            .json({
                status: 'success',
                message: ' User deleted successfully'
            })


    } catch (error) {
        console.log('error inside deleteMe function = ', error)
        res
            .status(404)
            .json({
                status: 'fail',
                message: error.message
            })
    }
}

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined, please use sign up instead'
    })
}

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)


// exports.getAllUsers = catchAsync(async (req, res, next) => {
//     const users = await User.find()

//     res
//         .status(200)
//         .json({
//             status: 'success',
//             results: users.length,
//             data: { users }
//         })

// })

// exports.getUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined'
//     })
// }

// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined'
//     })
// }

// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not defined'
//     })
// }