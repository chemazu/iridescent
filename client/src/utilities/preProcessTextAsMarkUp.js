const preProcessTextAsMarkUp = (text) => {
  let textBuild = "";
  const splitedText = text.split(" ");
  textBuild += "<p className='comment-build-container'>";
  splitedText.forEach((textItem, index) => {
    if (textItem.startsWith("@")) {
      textBuild +=
        index !== splitedText.indexOf(splitedText[splitedText.length - 1])
          ? `<span className="comment-mention-span">${textItem.substr(
              1
            )} </span>`
          : `<span className="comment-mention-span">${textItem.substr(
              1
            )}</span>`;
    } else {
      textBuild +=
        index !== splitedText.indexOf(splitedText[splitedText.length - 1])
          ? `${textItem} `
          : textItem;
    }
  });
  textBuild += "</p>";
  return textBuild;
};

export default preProcessTextAsMarkUp;
