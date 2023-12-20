const nodemailer = require("nodemailer");
require('express-async-errors')

//This function is used to send an email
const sendEmail = async ({ from, to, subject, msg }) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'kailyn.vonrueden37@ethereal.email',
            pass: '662ZuFJ1ynqznfybvb'
        }
    });
    await transporter.sendMail({
        from, to, subject, html: msg
    })
}
module.exports = sendEmail