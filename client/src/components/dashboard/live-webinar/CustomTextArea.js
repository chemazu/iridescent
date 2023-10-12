

import React from "react";

const CustomTextArea = ({ text, setText, keyDown, height, setHeight }) => {
  // Set the initial height to 'auto'

  const handleTextAreaInput = (e) => {
    const textarea = e.target;
    setText(textarea.value);

    // Calculate the new height, but limit it to 4 rows
    const newHeight = `${Math.min(4 * 20, textarea.scrollHeight)}px`; // Adjust 20 as needed for your font size and padding
    setHeight(newHeight);
  };

  return (
    <textarea
      //   style={{ height }}
      style={{ height: text === "" ? "40px" : height }}
      value={text}
      onChange={handleTextAreaInput}
      placeholder="Type here..."
      onKeyDown={keyDown}
    />
  );
};

export default CustomTextArea;
