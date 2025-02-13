const fs = require('fs')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const Tour = require('../../models/tourModel')
const Review = require('../../models/reviewModel')
const User = require('../../models/userModel')

const DB = process.env.MONGODB_URI.replace('<password>', process.env.MONGODB_PASSWORD)
mongoose.connect(DB).then((con) => {
    console.log('MongoDB Connected...')
    // console.log(con.connection) // all details of MONGODB database will be shown here
})


// Read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))

// IMPORT data to MongoDB
// Command on terminal : node ./dev-data/data/import-dev-data.js --import
const importData = async () => {
    try {
        await Tour.create(tours)
        // await User.create(users, { validationBeforesave: false })
        // await Review.create(reviews)
        console.log('Data imported successfully!')
        process.exit()
    } catch (error) {
        console.error('Error importing data:', error)
    }
}

// Delete all data from MongoDB
// Command on terminal : node ./dev-data/data/import-dev-data.js --delete
const deleteData = async () => {
    try {
        await Tour.deleteMany()
        // await User.deleteMany()
        // await Review.deleteMany()
        console.log('Data deleted successfully!')
        process.exit()
    } catch (error) {
        console.error('Error deleting data:', error)
    }
}

// console.log(process.argv)

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}

