const express = require('express')
const { getAllUsers, deleteMe, createUser, getUser, updateUser, deleteUser, updateMe, getMe, uploadUserPhoto, resizeUserPhoto } = require('./../controllers/userController')
const authController = require('./../controllers/authController')
// const multer = require('multer')

// const upload = multer({ dest: 'public/img/users' })

const router = express.Router()

// There are two delete routes, one is for admin, the other one is for Current user to delete her/his account

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.patch('/reset-password/:token', authController.resetPassword)



// Because middlrewares are run in sequence,
// then below middleware will only apply for routes wwitch are below the middleware
// Threfore all routes after below middleware are protected
router.use(authController.protect)
router.patch('/update-me', uploadUserPhoto, resizeUserPhoto, updateMe)
router.delete('/delete-me', deleteMe)
router.get('/me', getMe, getUser)
router.patch('/update-password', authController.updatePassword)


// Because middlrewares are run in sequence,
// Threfore all routes after below middleware are protected & restricted
router.use(authController.restrictTo('admin '))


router.route('/')
    .get(getAllUsers)
    .post(createUser)

router.route('/:d/')
    .get(getUser)
    .patch(updateUser)
    .delete(authController.restrictTo('admin'), deleteUser)



module.exports = router