import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL,
    pass: process.env.PASSWORD,
  },
})

const registrationMail = async(to,name) => {
    await transporter.sendMail({
      from: process.env.MAIL,
      to,
      subject:"Account creation mail",
      html: `<b>${name}, your account has been created successfully. </b>`
    })
}

export {registrationMail}