import React, { useState } from "react";
// import "./Carousel.css";
import "../../custom-styles/carousel.css"

export const CarouselItem = ({ children, width }) => {
  return (
    <div className="courses-carousel-item" >
      {children}
    </div>
  );
};

const Carousel = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const updateIndex = (newIndex) => {
    const numItems = React.Children.count(children);
    if (newIndex < 0) {
      newIndex = numItems - 1;
    } else if (newIndex >= Math.ceil(numItems * 0.25)) {
      newIndex = 0;
    }
    setActiveIndex(newIndex);
  };

  const childrenArray = React.Children.toArray(children);
  const numItems = childrenArray.length;
  let loopCount = Math.ceil(numItems / 4);
  // let loopCount = Math.ceil(numItems / (screenWidth < 768 ? 2 : 4));
  let newArray = [];

  for (let i = 0; i < loopCount; i++) {
    newArray = newArray.concat(childrenArray);
  }
  newArray = newArray.slice(0, loopCount * 4);

  return (
    <div className="courses-carousel" style={{ position: "relative" }}>
      <div
        className="courses-inner"
        style={{
          transform: `translateX(-${activeIndex * 100}%)`,
          display: "flex",
        }}
      >
        {newArray.map((child, index) => {
          return React.cloneElement(child, { width: "25%", key: index });
        })}
      </div>

      {childrenArray.length > 4 ? (
        <div
          className="indicators"
          style={{ position: "absolute", right: 0, top: "30%" }}
        >
          <button
            onClick={() => {
              updateIndex(activeIndex + 1);
            }}
            style={{
              backgroundColor: "grey",
              borderRadius: "50%",
              color: "black",
              fontWeight: "bold",
              fontSize: "18px",
              padding: "10px 20px",
              border: "0px",
            }}
          >
            &gt;
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Carousel;
