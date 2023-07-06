import sendMail from "../config";
import { siteUrl } from "../../globals";

const notifyAdminOnCourseVerificationRequest = async (
  to,
  courseDetails,
  userDetails
) => {
  const { firstname, lastname, username } = userDetails;
  const { validationRequestId, courseTitle } = courseDetails;

  const html = `<div style="width:100%;
        height:100%;
        background-color:'#c4c4c4';">
        <div style="width:80%;
        margin: 0 auto;
        height:100%; margin-top:20px">
            <p>
              This is to let you know that a verification Request sent By ${firstname} ${lastname}
              with username: ${username} has sent a verification Request for the following Course with title
              ${courseTitle}.
            </p>
            <p>Click Here to View in Dashboard
            <a style="width:60px; height:30px; padding:10px 5px; color:'#fff'; background-color:'#476EFA';" href="${
              siteUrl +
              "/signin?to=adminRedirect&validationRequestId=" +
              validationRequestId
            }" target="_blank">See in Dashboard</a>
            </p>
        </div>
    </div>`;

  await sendMail(to, "Course Validation Request.", html);
};

export { notifyAdminOnCourseVerificationRequest };
