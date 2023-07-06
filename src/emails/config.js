import sendGrid from "@sendgrid/mail";
// import nodemailer from "nodemailer";

const initializeSendGrid_ENV_VAR = () => {
  sendGrid.setApiKey(process.env.SENDGRID_API_KEY);
};

const sendMail = async (recipient, subject, html) => {
  initializeSendGrid_ENV_VAR();

  await sendGrid.send({
    to: recipient,
    from: `Tuturly <${process.env.MAILUSER}>`,
    subject: subject,
    html: html,
  });
};

// const transporter = nodemailer.createTransport({
//   host: process.env.MAILHOST,
//   port: process.env.MAILPORT,
//   secure: true,
//   auth: {
//     user: process.env.MAILUSER,
//     pass: process.env.MAILPASSWORD,
//   },
// });

// const sendMail = async (recipient, subject, html) => {
//   const mailOptions = {
//     from: `Tuturly <${process.env.MAILUSER}>`,
//     to: recipient,
//     subject: subject,
//     html: html,
//   };

//   transporter.sendMail(mailOptions);
// };

export default sendMail;
