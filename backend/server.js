const mongoose = require('mongoose')
const dotenv = require('dotenv')

process.on('unhandledRejection', err => {
    console.log('Uncaught Exception! shutting down ... ')
    console.log(err.name, err.message)

    process.exit(1)
})

dotenv.config({ path: './config.env' })
const app = require('./app') // it has to be below of ENV file in order to read it
const DB = process.env.MONGODB_URI.replace('<password>', process.env.MONGODB_PASSWORD)

mongoose
    .connect(DB)
    .then((con) => {
        console.log('MongoDB Connected...')
        // console.log(con.connection) // all details of MONGODB database will be shown here
    })
// .catch(err => )


// Enviromental variable
// console.log(app.get('env'))
// console.log(process.env) // All enviromental variables including the ones that we added

// START SERVER
const port = process.env.PORT || 3000

const server = app.listen(port, () => {
    console.log(`App is running on port no. ${port}...`)
})

process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED, Shutting down gracefully!')
    server.close(() => {
        console.log('Proccess terminated!')
        // process.exit(1)
    })
})



