import React from "react";
import moment from "moment";

const StudentDataItem = ({ student, refVariable }) => {
  return (
    <tr key={student._id} ref={refVariable}>
      <td>{moment(student?.createdAt).format("MMMM Do YYYY, h:m:ss a")}</td>
      <td>{`${student?.firstname} ${student?.lastname}`}</td>
      <td>{student?.email}</td>
    </tr>
  );
};

export default StudentDataItem;
