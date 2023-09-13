import React, { useState } from "react";
import StudentDashboardModuleUnitItem from "./StudentDashboardModuleUnitItem";

const StudentDashboardModuleItem = ({
  moduleItem,
  loadUnit,
  scrollToVideo,
  pauseVideoOnCourseUnitChange,
  idOfActiveCourseUnit,
  moduleInView,
  theme,
}) => {
  const [isActive, setIsActive] = useState(moduleInView === moduleItem._id); // code to ensure the module in view fallsdown in UI display

  return (
    <>
      <div
        style={
          {
            // border: `0.0000011111rem solid ${theme.themestyles.primarytextcolor}`
          }
        }
        className="student-dashboard__module-item"
      >
        <div
          onClick={(e) => setIsActive(!isActive)}
          className="student-dashboard__module-item-title"
        >
          <div
            style={{
              color: theme.themestyles.primarytextcolor,
            }}
            className="title-header"
          >
            {moduleItem.name}
          </div>{" "}
          <div
            className="title-expand-icon"
            style={{
              color: theme.themestyles.primarytextcolor,
            }}
          >
            {isActive ? "-" : "+"}
          </div>
        </div>
        {isActive && (
          <>
            <div className="student-dashboard__module-item-content">
              <>
                {moduleItem.courseunit.length === 0 ? (
                  <p
                    style={{
                      color: "#fff",
                    }}
                    className="text-center"
                  >
                    This Section Has No Unit
                  </p>
                ) : (
                  <>
                    {moduleItem.courseunit.map((unitItem) => (
                      <StudentDashboardModuleUnitItem
                        key={unitItem._id}
                        unitItem={unitItem}
                        loadUnit={loadUnit}
                        scrollToVideo={scrollToVideo}
                        pauseVideoOnCourseUnitChange={
                          pauseVideoOnCourseUnitChange
                        }
                        idOfActiveCourseUnit={idOfActiveCourseUnit}
                        theme={theme}
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

export default StudentDashboardModuleItem;
