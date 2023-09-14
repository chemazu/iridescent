import React, { useState } from "react";
import TutorUnitItem from "./TutorUnitItem";

const TutorCourseUnitInPageContent = ({
  moduleInView,
  moduleItem,
  idOfActiveCourseUnit,
  loadUnit,
  scrollToVideo,
  pauseVideoOnCourseUnitChange,
}) => {
  const [isActive, setIsActive] = useState(moduleInView === moduleItem._id); // code to ensure the module in view fallsdown in UI display

  return (
    <>
      <div className="tutor-module-item-student-dashboard">
        <div
          onClick={(e) => setIsActive(!isActive)}
          className="tutor-module-item-student-dashboard-title"
        >
          <div className="title-header">{moduleItem.name}</div>{" "}
          <div className="title-expand-icon">{isActive ? "-" : "+"}</div>
        </div>
        {isActive && (
          <>
            <div className="tutor-module-item-student-dashboard-item-content">
              <>
                {moduleItem.courseunit.length === 0 ? (
                  <p
                    style={{
                      color: "#000000",
                      fontSize: "13px",
                    }}
                    className="text-center"
                  >
                    This Module Has No Unit
                  </p>
                ) : (
                  <>
                    {moduleItem.courseunit.map((unitItem) => (
                      <TutorUnitItem
                        key={unitItem._id}
                        unitItem={unitItem}
                        loadUnit={loadUnit}
                        scrollToVideo={scrollToVideo}
                        pauseVideoOnCourseUnitChange={
                          pauseVideoOnCourseUnitChange
                        }
                        idOfActiveCourseUnit={idOfActiveCourseUnit}
                      />
                    ))}
                  </>
                )}
              </>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TutorCourseUnitInPageContent;
