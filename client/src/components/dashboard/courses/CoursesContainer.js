import React from "react";
import { Row, Card } from "reactstrap";
import CourseItem from "./CourseItem";

export const CoursesContainer = ({ courses }) => {
  return (
    <>
      <div className="products-container">
        <Row
          style={{
            marginLeft: "0",
            marginRight: "0",
          }}
        >
          {courses.length === 0 ? (
            <>
              <Card
                style={{
                  margin: "10vh auto",
                  width: "70%",
                  padding: "20vh 10vw",
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <p className="lead text-center">
                  You Have not Uploaded A Course Yet
                </p>
              </Card>
            </>
          ) : (
            <>
              {courses.map((course) => (
                <CourseItem key={course._id} course={course} />
              ))}
            </>
          )}
        </Row>
      </div>
    </>
  );
};

export default CoursesContainer;
