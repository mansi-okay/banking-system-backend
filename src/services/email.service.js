import nodemailer from "nodemailer"
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking System" <${process.env.EMAIL_USER}>`, // sender address
      to, 
      subject, 
      text, 
      html, 
    });

    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

const registrationMail = async(to,name) => {
  const subject = 'BANKING SYSTEM ACCOUNT CREATION MAIL'
  const text = `Hello ${name},\n\nThank you for registering at Banking System.`
  const html = `<p>Hello ${name},\n\nThank you for registering at Banking System.</p>`
  await sendEmail(to, subject, text, html);
}

const transactionMail = async(to,name,amount,toAccount) => {
  const subject = 'TRANSACTION SUCCESSFUL';
  const text = `Hello ${name},\n\nYour transaction of ₹${amount} to account ${toAccount} was successful.`;
  const html = `<p>Hello ${name},</p><p>Your transaction of ₹${amount} to account ${toAccount} was successful.</p>`;
  await sendEmail(to, subject, text, html);
}

const transactionFaliureMail = async(to,name,amount,toAccount) => {
  const subject = 'TRANSACTION FALIURE';
  const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.`;
  const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p>`;
  await sendEmail(to, subject, text, html); 
}

export {transporter,sendEmail,registrationMail,transactionMail,transactionFaliureMail}