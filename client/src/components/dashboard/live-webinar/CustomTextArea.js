// import React, { useState } from "react";

// export default function CustomTextArea({ text, setText, keyDown }) {
//   const [rows, setRows] = useState(1);
//   let maxRows = 4;
//   const handleChange = (e) => {
//     const textarea = e.target;
//     setText(textarea.value);

//     // Calculate the number of rows based on the content and a maximum of 4 rows
//     const numRows = Math.min(4, Math.ceil(textarea.scrollHeight / 20)); // Adjust 20 as needed for your font size and padding
//     setRows(numRows);
//   };
//   return (
//     <textarea
//       rows={rows}
//       value={text}
//       onChange={handleChange}
//       placeholder="Type a message"
//       onKeyDown={keyDown}
//     />
//   );
// }

// import React, { useState } from 'react';

// const ExpandingTextArea = ({ text, setText, keyDown }) => {

//   const [height, setHeight] = useState('auto'); // Set the initial height to 'auto'

//   const handleInput = (e) => {
//     const textarea = e.target;
//     setText(textarea.value);
//     setHeight('auto'); // Reset the height to 'auto' before calculating the new height
//     setHeight(`${textarea.scrollHeight}px`);
//   };

//   return (
//     <textarea
//       style={{ height }}
//       value={text}
//       onChange={handleInput}

//       placeholder="Type here..."
//       onKeyDown={keyDown}
//     />
//   );
// };

// export default ExpandingTextArea;

import React, { useState } from "react";

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
