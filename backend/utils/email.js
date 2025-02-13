const nodemailer = require('nodemailer')
const pug = require('pug')
const { htmlToText } = require('html-to-text')


// new Email(user, url).sendWelcome()
module.exports = class Email {

    constructor(user, url) {
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.url = url
        this.from = `Ventuno <${process.env.EMAIL_FROM}>`
    }

    newTransport() {
        if (process.env.NODEENV === 'production') {
            // Sendgrid
            return 1
        }


        return nodemailer.createTransport({
            service: "Gmail",
            host: process.env.GMAIL_HOST,
            port: process.env.GMAIL_PORT,
            secure: true,
            auth: {
                user: process.env.GMAIL_USERNAME,
                pass: process.env.GMAIL_PASSWORD
            }
        })
    }

    // send the actual email
    async send(template, subject) {
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject
            }
        )

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            // text: htmlToText.fromString(html)
            text: htmlToText(html)
        }
        await this.newTransport().sendMail(mailOptions)


    }
    async sendWelcome() {
        await this.send('Welcome', 'Welcome to the natours Family!')
    }

    async sendPasswordReset() {
        await this.send('passwordReset', 'Your password reset Token (Valid for 10 minutes)')
    }
}


//  // Send EMail via MAILTRAP
// const sendEmail = async options => {

// create transponter with ==> MAILTRAP

// const transporter = nodemailer.createTransport({
//     host: process.env.MAILTRAP_HOST,
//     port: process.env.MAILTRAP_PORT,
//     auth: {
//         user: process.env.MAILTRAP_USERNAME,
//         pass: process.env.MAILTRAP_PASSWORD
//     }
// })
// define email options
//      const mailOptions = {
//         from: `Ventuno <${process.env.EMAIL_FROM}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }


//     // send email wil nodemailer
//     await transporter.sendMail(mailOptions)

// }



// // send Email via GMAIL
// const sendEmail = async options => {
//     const transporter = nodemailer.createTransport({
//         service: "Gmail",
//         host: process.env.GMAIL_HOST,
//         port: process.env.GMAIL_PORT,
//         secure: true,
//         auth: {
//             user: process.env.GMAIL_USERNAME,
//             pass: process.env.GMAIL_PASSWORD
//         }
//     })

//     // define email options
//     const mailOptions = {
//         from: `Ventuno <${process.env.EMAIL_FROM}>`,
//         to: options.email,
//         subject: options.subject,
//         text: options.message
//     }


//     // send email wil nodemailer
//     await transporter.sendMail(mailOptions)

// }

// module.exports = sendEmail

