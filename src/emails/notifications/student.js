import sendMail from "../config";
import { subdomainSiteUrl } from "../../globals";

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

  await sendMail(to, `welcome to ${schoolName}`, html);
};

const coursePurchaseNotification = async (to, purchasedCourses) => {
  const purchasedCoursesAsHTML = purchasedCourses.map((course) => {
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

  await sendMail(to, "course purchase", html);
};

const replyToCommentAdded = async (
  to,
  replyUser,
  replyText,
  courseUnitId,
  commentId,
  courseChapter,
  replyId,
  schoolname
) => {
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
            <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${
              subdomainSiteUrl(schoolname) +
              "/login?to=notificationRedirect&cuid=" +
              courseUnitId +
              "&cmid=" +
              commentId +
              "&ccpt=" +
              courseChapter +
              "&rplid=" +
              replyId
            }" target="_blank">See in Notification</a></p>
           </div>
       </div>
   </div>`;

  await sendMail(to, "A reply was added", html);
};

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

  await sendMail(to, "A reply was added", html);
};

const sendReplyMentionStudentNotification = async (
  to,
  replyUser,
  replyText,
  courseUnitId,
  commentId,
  courseChapter,
  replyId,
  schoolname
) => {
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
            <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${
              subdomainSiteUrl(schoolname) +
              "/login?to=notificationRedirect&cuid=" +
              courseUnitId +
              "&cmid=" +
              commentId +
              "&ccpt=" +
              courseChapter +
              "&rplid=" +
              replyId
            }" target="_blank">See in Notification</a></p>
           </div>
       </div>
   </div>`;

  await sendMail(to, "Someone Mentioned you in a reply.", html);
};

const sendCommentMentionStudentNotification = async (
  to,
  replyUser,
  replyText,
  courseUnitId,
  commentId,
  courseChapter,
  replyId,
  schoolname
) => {
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
            <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${
              subdomainSiteUrl(schoolname) +
              "/login?to=notificationRedirect&cuid=" +
              courseUnitId +
              "&cmid=" +
              commentId +
              "&ccpt=" +
              courseChapter +
              "&rplid=" +
              replyId
            }" target="_blank">See in Notification</a></p>
           </div>
       </div>
   </div>`;

  await sendMail(to, "Someone Mentioned you in a Comment.", html);
};

export {
  welcomeToSchool,
  coursePurchaseNotification,
  replyToCommentAdded,
  replyToCommentUpdate,
  sendCommentMentionStudentNotification,
  sendReplyMentionStudentNotification,
};
