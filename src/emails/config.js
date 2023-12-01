import sendGrid from "@sendgrid/mail";
import nodemailer from "nodemailer";
import axios from "axios";

// const initializeSendGrid_ENV_VAR = () => {
//   sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
// };

const elasticEmailAPIKey = process.env.ELASTIC_MAIL_API_KEY;
const sendMailConfig = {
  headers: {
    "Content-Type": "application/json",
    "X-ElasticEmail-ApiKey": elasticEmailAPIKey,
  },
};

const sendMail = async (recipient, subject, html) => {
  const requestBody = {
    Recipients: [
      {
        Email: recipient,
      },
    ],
    Content: {
      Body: [
        {
          ContentType: "HTML",
          Content: html,
          Charset: "utf-8",
        },
      ],
      From: "Tuturly <info@tuturly.com>",
      Subject: subject,
    },
  };

  try {
    const jsonBody = JSON.stringify(requestBody);
    const mailResponse = await axios.post(
      "https://api.elasticemail.com/v4/emails",
      jsonBody,
      sendMailConfig
    );
    console.log(mailResponse.data, "mail response...");
  } catch (error) {
    console.log(error.response.data, "error message");
  }
};

// const sendMail = async (recipient, subject, html) => {
//   initializeSendGrid_ENV_VAR();

//   await sendGrid.send({
//     to: recipient,
//     from: `Tuturly <${process.env.MAILUSER}>`,
//     subject: subject,
//     html: html,
//   });
// };

// const transporter = nodemailer.createTransport({
//   host: process.env.MAILHOST,
//   port: process.env.MAILPORT,
//   secure: true,
//   auth: {
//     user: process.env.MAILUSER,
//     pass: process.env.MAILPASSWORD,
//   },
// });

// const transport = nodemailer.createTransport({
//   host: "mail.privateemail.com",
//   port: 465,
//   pool: true,
//   // maxConnections: 20,

//   secure: true,
//   auth: {
//     user: process.env.mail_user,
//     pass: process.env.mail_pass,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// const sendMail = async (recipient, subject, html) => {
//   const mailOptions = {
//     from: "Deba from Tuturly <info@degraphe.com>",
//     to: recipient,
//     subject: subject,
//     html: html,
//   };

//   await transport.sendMail(mailOptions);
// };

export default sendMail;
