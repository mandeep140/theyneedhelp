const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
    if (error) {
        console.log("SMTP Connection Error:", error);
    } else {
        console.log("SMTP Server is ready to send emails.");
    }
});

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "OTP for verification | TheyNeedHelp",
    html: `<p>Your OTP code to verify your email in TheyNeedHelp is: <b>${otp}</b>. It will expire in 5 minutes.</p> <br> <h2> TheyNeedHelp </h2>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;