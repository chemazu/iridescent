import React from "react";

const CoursePageCategoryListItem = ({
  category,
  categoryListItemClickHandler,
}) => {
  const handleItemClickHandler = () => {
    categoryListItemClickHandler(category.title);
  };
  return (
    <div className="category-list__item" onClick={handleItemClickHandler}>
      {category.title}
    </div>
  );
};

export default CoursePageCategoryListItem;
