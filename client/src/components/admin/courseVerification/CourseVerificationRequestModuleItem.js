import React from "react";

import CourseVerificationRequestUnitItem from "./CourseVerificationRequestUnitItem";

const CourseVerificationRequestModuleItem = ({
  moduleItem,
  setActiveCourseHandler,
}) => {
  return (
    <>
      <div className="verification-request-module__item">
        <h4>{moduleItem.name}</h4>
        <hr className="verification-request-module__hr" />
      </div>
      {moduleItem.courseunit.length === 0 ? (
        <p className="mt-2 text-center">module units not found!</p>
      ) : (
        <>
          {moduleItem.courseunit.map((unitItem) => (
            <CourseVerificationRequestUnitItem
              key={unitItem._id}
              unitItem={unitItem}
              setActiveCourseHandler={setActiveCourseHandler}
            />
          ))}
        </>
      )}
    </>
  );
};

export default CourseVerificationRequestModuleItem;
