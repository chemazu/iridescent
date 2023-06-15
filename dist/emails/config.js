"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mail = _interopRequireDefault(require("@sendgrid/mail"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import nodemailer from "nodemailer";
const initializeSendGrid_ENV_VAR = () => {
  _mail.default.setApiKey(process.env.SENDGRID_API_KEY);
};

const sendMail = async (recipient, subject, html) => {
  initializeSendGrid_ENV_VAR();
  await _mail.default.send({
    to: recipient,
    from: `Tuturly <${process.env.MAILUSER}>`,
    subject: subject,
    html: html
  });
}; // const transporter = nodemailer.createTransport({
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


var _default = sendMail;
exports.default = _default;