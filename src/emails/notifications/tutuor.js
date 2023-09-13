import sendMail from "../config";
import { siteUrl } from "../../globals";

const welcomeToTurtolyNotification = async (to) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
              welcome to tuturly
              Your registration was successful.
           </p>

           <p>Please Open Your Verification Email, to Verify Account and Proceed.</p>
           
       </div>
   </div>`;

  await sendMail(to, "Welcome To Tuturly", html);
};

const verifyAccountEmail = async (to, token) => {
  const html = `<div style="width:100%;
        height:100%;
        background-color:'#c4c4c4';">
          <div style="width:80%;
          margin: 0 auto;
          height:100%; margin-top:20px">

              <p style="font-family:'Helvetical';
              margin-top:'20px';
              margin-bottom:'20px';
              >Verify Your Tuturly Account</p>

              <p style="margin-top:'10px';
              margin-bottom:'10px';
              font-family:'Helvetical';
              ">Click the link Below To Verify Your Email</p>

              <p>Click <a href="${
                siteUrl + "/verify/" + token
              }" target="_blank">Here</a> Verify Account.</p>

          </div>
      </div>`;

  await sendMail(to, "Verify Tuturly Account", html);
};

const studentEnrolledNotification = async (to, studentName) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
              ${studentName} just enrolled in your school
           </p>
       </div>
   </div>`;

  await sendMail(to, "A new student has enrolled in your school", html);
};

const studentBoughtCourseNotification = async (
  to,
  studentName,
  purchasedCourse
) => {
  const purchasedCourseInfoAsHTML = purchasedCourse.map((course) => {
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
              ${studentName} just purchased the following Course(s)
           </p>
           <div>
            ${purchasedCourseInfoAsHTML}
           </div>
       </div>
   </div>`;

  await sendMail(to, "The following course(s) were purchased", html);
};

const studentAddedNewComment = async (
  to,
  commentUsername,
  commentText,
  courseUnitId,
  commentId,
  courseChapter
) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
              ${commentUsername} said:
           </p>
           <p>${commentText}</p>
           <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${
             siteUrl +
             "/signin?to=notificationRedirect&cuid=" +
             courseUnitId +
             "&cmid=" +
             commentId +
             "&ccpt=" +
             courseChapter
           }" target="_blank">See in Notification</a></p>
       </div>
   </div>`;

  await sendMail(to, "Someone posted a new comment", html);
};

const studentSentReplyToComment = async (
  to,
  replyUsername,
  replyText,
  courseUnitId,
  commentId,
  courseChapter,
  replyId
) => {
  const html = `<div style="width:100%;
    height:100%;
     background-color:'#c4c4c4';">
       <div style="width:80%;
       margin: 0 auto;
       height:100%; margin-top:20px">
           <p>
              ${replyUsername} said:
           </p>
           <p>${replyText}</p>
           <p style="margin-top: 10px;"><a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${
             siteUrl +
             "/signin?to=notificationRedirect&cuid=" +
             courseUnitId +
             "&cmid=" +
             commentId +
             "&ccpt=" +
             courseChapter +
             "&rplid=" +
             replyId
           }" target="_blank">See in Notification</a></p>
       </div>
   </div>`;

  await sendMail(to, "Someone replied a comment", html);
};

const emailNotificationForCourseVerification = async (to) => {
  const html = `<div style="width:100%;
    height:100%;
    background-color:'#c4c4c4';">
    <div style="width:80%;
    margin: 0 auto;
    height:100%; margin-top:20px">
        <p>
        This is to confirm that we recieved your 
        course verification application request and we'll
         give you updates shortly on the status of your application.
        </p>
    </div>
  </div>`;

  await sendMail(to, "Course Verification Request", html);
};

const emailNotificationForCourseVerificationCompleted = async (to) => {
  const html = `<div style="width:100%;
        height:100%;
        background-color:'#c4c4c4';">
          <div style="width:80%;
          margin: 0 auto;
          height:100%; margin-top:20px">
              <p>
              <h3>Congratulations!</h3
              <p>
              We're Glad to let you know that we have successfully reviewed your course
              And we've enlisted your course on the explore course pages.
              </p>
              <p>Other benefits for having your course verified include: </p>
              <ol>
                <li>Course Marketing by our team of marketing experts.</li>
                <li>Course Display on search Results on the Explore Courses Page.</li>
                <li>More Landing Page Visits.</li>
              </ol>
          </div>
      </div>`;

  await sendMail(to, "Course Verification Request Update", html);
};

const emailNotificationForCourseRejected = async (to, reason) => {
  const html = `<div style="width:100%;
  height:100%;
  background-color:'#c4c4c4';">
    <div style="width:80%;
    margin: 0 auto;
    height:100%; margin-top:20px">
      <p>Your course could not be verified at this time, This could be due to one of the following Reason(s).</p>
      <p>${reason}</p>
      <p>Please update your course content and try again!</p>
    </div>
</div>`;
  await sendMail(to, "Course Verification Request Update", html);
};

export {
  welcomeToTurtolyNotification,
  studentEnrolledNotification,
  studentBoughtCourseNotification,
  studentAddedNewComment,
  studentSentReplyToComment,
  verifyAccountEmail,
  emailNotificationForCourseVerification,
  emailNotificationForCourseVerificationCompleted,
  emailNotificationForCourseRejected,
};
