const detectMentionInText = (text) => {
  const splitedText = text.split(" ");
  const filterTextWithSpecialCharacter = splitedText.filter((textToCheck) =>
    textToCheck.startsWith("@")
  );
  return filterTextWithSpecialCharacter;
};

export default detectMentionInText;
