const connectDB = require("./src/config/connection");
const Student = require("./src/models/Student");
const StudentCourse = require("./src/models/StudentCourse");

connectDB();

const constGetStudents = () => {
  studentsArray.forEach(async (email) => {
    const student = await Student.findOne({ email: email });
    console.log(student._id);

    const studentCourse = new StudentCourse({
      student: student._id, // with the model instantiation
      coursebought: "",
      boughtfrom: "",
    });

    await studentCourse.save();
    console.log(studentCourse);
  });
};

constGetStudents();
// const axios = require("axios");

// const getUserIpAddress = async () => {
//   try {
//     const res = await axios.get("https://www.cloudflare.com/cdn-cgi/trace");
//     const parsedData = res.data
//       .trim()
//       .split("\n")
//       .reduce(function (obj, pair) {
//         pair = pair.split("=");
//         return (obj[pair[0]] = pair[1]), obj;
//       }, {});
//     return parsedData.ip;
//   } catch (error) {
//     const errors = error?.response?.data?.errors;
//     if (errors) {
//       errors.forEach((error) => {
//         alert.show(error.msg, {
//           type: "error",
//         });
//       });
//     }
//   }
// };

// getUserIpAddress().then((value) => console.log(value));

// connectDB();

// const findStudent = async () => {
//   const username = "ragnarloTHing";
//   const student = await Student.findOne({
//     username: new RegExp("^" + username + "$", "i"),
//   });
//   console.log(student);
// };

// findStudent();

// const nodemailer = require("nodemailer");
// const { google } = require("googleapis");

// const CLIENT_ID =
//   "490912283115-2hsofc62frnmf8quui279c4u9ccqu4ke.apps.googleusercontent.com";
// const CLIENT_SECRET = ]
// const REDIRECT_URI = "https://developers.google.com/oauthplayground";
// const REFRESH_TOKEN =

// const oAuth2Client = new google.auth.OAuth2(
//   CLIENT_ID,
//   CLIENT_SECRET,
//   REDIRECT_URI
// );
// oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const sendMail = async () => {
//   try {
//     const accessToken = await oAuth2Client.getAccessToken();

//     const transport = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: "degrapheng@gmail.com",
//         clientId: CLIENT_ID,
//         clientSecret: CLIENT_SECRET,
//         refreshToken: REFRESH_TOKEN,
//         accessToken: accessToken,
//       },
//     });

//     const mailOptions = {
//       from: "TUTURLY COnNECT <degrapheng@gmail.com>",
//       to: "kolaniyi3@gmail.com",
//       subject: "Hello from GMAIL, using google OAUTH2",
//       text: "Hello from gmail email, using API",
//       html: "<h1>Hello from gmail email, using API</h1>",
//     };

//     const result = await transport.sendMail(mailOptions);
//     return result;
//   } catch (error) {
//     console.log(error);
//   }
// };

// sendMail()
//   .then((result) => console.log("Email sent...", result))
//   .catch((err) => console.log(err.message, "error"));

// const cloudinary = require("cloudinary").v2;
// cloudinary.config({
//   force_version: false,
//   cloud_name: "dannyv",
//   api_key: "REDACTED",
//   api_secret: "REDACTED",
// });
// const edgeKey = "REDACTED";
// // I put yours in your upload presets. It starts with "686b" and ends "4e89"
// const public_id = "toktest/A/ctlwslrchkmqoe6ehxnb.jpg";
// console.log(
//   cloudinary.url(public_id, {
//     type: "authenticated",
//     auth_token: {
//       key: edgeKey,
//       acl: "/dannyv/image/authenticated/*",
//       acl: "/dannyv/image/authenticated/toktest/*",
//       acl: "/dannyv/image/authenticated/toktest/A/*",
//       acl: "/dannyv/image/authenticated/toktest/A/ctlwslrchkmqoe6ehxnb.jpg",
//       duration: 86400,
//     },
//     sign_url: true,
//     secure: true,
//   })
// );

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
// javascript
// const sgMail = require("@sendgrid/mail");
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: "kolniysoft@gmail.com", // Change to your recipient
//   from: "Tuturly <info@tuturly.com>", // Change to your verified sender
//   subject: "Sending with SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong> <a href='https://www.tuturly.com' target='_blank'>Tuturly here</a>",
// };

// sgMail
//   .send(msg)
//   .then(() => {
//     console.log("Email sent");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

const state = {
  modules: [
    {
      name: "kolawole",
      age: 26,
      id: 2,
      units: [
        {
          title: "learn to bake",
          id: 24,
        },
      ],
    },
    {
      name: "peter",
      age: 29,
      id: 40,
      units: [
        {
          title: "learn to cook",
          id: 23,
        },
        {
          title: "learn nothing",
          id: 25,
        },
      ],
    },
  ],
};

const updateStateModuleUnit = () => {
  const updatedModules = state.modules.map((module) => {
    if (module.id === 40) {
      const updatedUnit = module.units.map((unit) => {
        if (unit.id === 23) {
          return {
            ...unit,
            ...{ title: "learn to draw", id: 23 },
          };
        } else {
          return unit;
        }
      });
      return {
        ...module,
        units: updatedUnit,
      };
    } else {
      return module;
    }
  });

  return updatedModules;
};
