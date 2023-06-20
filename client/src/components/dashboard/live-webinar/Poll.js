import React, { useState } from "react";

export default function Poll({ pollOptions, pollResult }) {
  const [votes, setVotes] = useState(new Array(pollOptions.length).fill(0));
  const [selectedOption, setSelectedOption] = useState(null);
  function convertArrayToObject(array) {
    const result = {};

    if (!array || array.length === 0) {
      // Handle the case of an empty array
      result.A = 0;
      result.B = 0;
      result.C = 0;
      result.D = 0;
    } else {
      // Iterate over the array elements
      for (let i = 0; i < array.length; i++) {
        const key = array[i];
        result[key] = result[key] ? result[key] + 1 : 1; // Increment the value if the key exists, or set it to 1 if it doesn't
      }
    }

    return result;
  }
  let NewResult = convertArrayToObject(pollResult);
  // change NewResult

  const totalVotes = votes.reduce((sum, count) => sum + count, 0);

  // const handleVote = (optionIndex) => {
  //   if (selectedOption === null) {
  //     const newVotes = [...votes];
  //     newVotes[optionIndex] += 1;
  //     setVotes(newVotes);
  //     setSelectedOption(optionIndex);
  //   }
  // };
  function calculateSum(obj) {
    const values = Object.values(obj);
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum;
  }
  const calculatePercentage = (a, b) => {
    const percentage = ((a / calculateSum(b)) * 100).toFixed(0);
    return Number(percentage).toFixed(0);
  };

  return (
    <>
      {pollOptions.map((option, index) => {
        return (
          <div
            className="chat-poll-option"
            key={index}
            // onClick={() => handleVote(index)}
          >
            <p>{String.fromCharCode(65 + index)}</p>
            <p>{option}</p>
            <p>
              {`${
                isNaN(
                  calculatePercentage(
                    NewResult[String.fromCharCode(65 + index)],
                    NewResult
                  )
                )
                  ? 0
                  : calculatePercentage(
                      NewResult[String.fromCharCode(65 + index)],
                      NewResult
                    )
              }%`}
            </p>
          </div>
        );
      })}
    </>
  );
}
