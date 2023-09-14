import sendMail from "../config";
import { siteUrl } from "../../globals";

const sendPasswordResetLink = async (to, token) => {
  const html = `<div style="width:100%;
    height:100%;
    background-color:'#c4c4c4';">
      <div style="width:80%;
      margin: 0 auto;
      height:100%; margin-top:20px">

         <h3 style="font-family:'Helvetical';
          text-align:'center';
          margin-top:'20px';
          margin-bottom:'20px';
          >Password Reset Request</h3>

          <p style="
          text-align:'center';
          margin-top:'10px';
          margin-bottom:'10px';
          font-family:'Helvetical';
          ">A Password reset Request has being Sent.</p>

          <p style="
          text-align:'center';
          margin-top:'10px';
          margin-bottom:'10px';
          font-family:'Helvetical';
          ">Click the link Below To Reset Your Account Password.</p>

         <p>Click <a href="${
           siteUrl + "/password/" + token
         }" target="_blank">Here</a> Update Password.</p>

      </div>
  </div>`;

  await sendMail(to, "Password Reset Request.", html);
};

export { sendPasswordResetLink };
