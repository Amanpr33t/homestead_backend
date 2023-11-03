const nodemailer = require("nodemailer");

const sendEmail = async ({ from, to, subject, msg }) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ara58@ethereal.email',
            pass: '5S5eFdpJEZnZsxev56'
        }
    });
    await transporter.sendMail({
        from, to, subject, html: msg
    })
}
module.exports = sendEmail