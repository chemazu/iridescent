import React, { useState, useEffect } from "react";
import UnitItem from "./UnitItem";

export const ModuleItem = ({ module, theme }) => {
  const [courseUnits, setCourseUnits] = useState([]);

  useEffect(() => {
    const units = module.courseunit.sort((a, b) => {
      return a.position - b.position;
    });
    setCourseUnits(units);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="module-item">
        <h5
          style={{
            color: theme.themestyles.primarytextcolor,
          }}
        >
          {module.name}
        </h5>
        {module.courseunit.length === 0 ? (
          <p
            style={{
              color: theme.themestyles.coursecardtextcolor,
            }}
          >
            module has no units
          </p>
        ) : (
          <>
            {courseUnits.map((moduleUnit, index) => (
              <UnitItem
                key={moduleUnit._id}
                unitItem={moduleUnit}
                theme={theme}
                index={index}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default ModuleItem;
