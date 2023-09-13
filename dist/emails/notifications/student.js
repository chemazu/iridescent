"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendReplyMentionStudentNotification = exports.sendCommentMentionStudentNotification = exports.replyToCommentUpdate = exports.replyToCommentAdded = exports.coursePurchaseNotification = exports.welcomeToSchool = void 0;

var _config = _interopRequireDefault(require("../config"));

var _globals = require("../../globals");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const welcomeToSchool = async (to, schoolName) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
              welcome to ${schoolName}
              Your registration was successful.
           </p>
       </div>
   </div>`;
  await (0, _config.default)(to, `welcome to ${schoolName}`, html);
};

exports.welcomeToSchool = welcomeToSchool;

const coursePurchaseNotification = async (to, purchasedCourses) => {
  const purchasedCoursesAsHTML = purchasedCourses.map(course => {
    return `<div style="display:flex; justify-content:'center'; align-contents:'center'">
        <div style="margin-right:5px;">
        <img height="300" width="300" src=${course.itemImg} /></div>  
         <p style="font-weight:500">${course.itemName}</p>
        </div>`;
  });
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
              You have successfully purchased the following course(s)/Product(s)
              Purchased Course(s) :
           </p>
           <p>
            ${purchasedCoursesAsHTML}
           </p>
           <p>Enjoy your learning..</p>
       </div>
   </div>`;
  await (0, _config.default)(to, "course purchase", html);
};

exports.coursePurchaseNotification = coursePurchaseNotification;

const replyToCommentAdded = async (to, replyUser, replyText, courseUnitId, commentId, courseChapter, replyId, schoolname) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
             ${replyUser} Added a reply to your Comment
           </p>
           <div>
            reply:
            <br/>
            <p>${replyText}</p>
            <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${(0, _globals.subdomainSiteUrl)(schoolname) + "/login?to=notificationRedirect&cuid=" + courseUnitId + "&cmid=" + commentId + "&ccpt=" + courseChapter + "&rplid=" + replyId}" target="_blank">See in Notification</a></p>
           </div>
       </div>
   </div>`;
  await (0, _config.default)(to, "A reply was added", html);
};

exports.replyToCommentAdded = replyToCommentAdded;

const replyToCommentUpdate = async (to, replyUser, replyText) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
             ${replyUser} Added a reply to a Comment you're following
           </p>
           <div>
            reply:
            <br/>
            <p>${replyText}</p>
           </div>
       </div>
   </div>`;
  await (0, _config.default)(to, "A reply was added", html);
};

exports.replyToCommentUpdate = replyToCommentUpdate;

const sendReplyMentionStudentNotification = async (to, replyUser, replyText, courseUnitId, commentId, courseChapter, replyId, schoolname) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
             ${replyUser} mentioned you in a reply
           </p>
           <div>
            reply:
            <br/>
            <p>${replyText}</p>
            <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${(0, _globals.subdomainSiteUrl)(schoolname) + "/login?to=notificationRedirect&cuid=" + courseUnitId + "&cmid=" + commentId + "&ccpt=" + courseChapter + "&rplid=" + replyId}" target="_blank">See in Notification</a></p>
           </div>
       </div>
   </div>`;
  await (0, _config.default)(to, "Someone Mentioned you in a reply.", html);
};

exports.sendReplyMentionStudentNotification = sendReplyMentionStudentNotification;

const sendCommentMentionStudentNotification = async (to, replyUser, replyText, courseUnitId, commentId, courseChapter, replyId, schoolname) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
             ${replyUser} mentioned you in a Comment
           </p>
           <div>
            reply:
            <br/>
            <p>${replyText}</p>
            <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${(0, _globals.subdomainSiteUrl)(schoolname) + "/login?to=notificationRedirect&cuid=" + courseUnitId + "&cmid=" + commentId + "&ccpt=" + courseChapter + "&rplid=" + replyId}" target="_blank">See in Notification</a></p>
           </div>
       </div>
   </div>`;
  await (0, _config.default)(to, "Someone Mentioned you in a Comment.", html);
};

exports.sendCommentMentionStudentNotification = sendCommentMentionStudentNotification;