"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const preProcessCommentOrReplyText = text => {
  const splitedText = text.split(" ");
  const filterTextWithSpecialCharacter = splitedText.filter(textToCheck => textToCheck.startsWith("@"));
  const parseTextWithoutSpecialChar = filterTextWithSpecialCharacter.map(textToTransform => textToTransform.substring(1));
  const filterOutPunctuation = parseTextWithoutSpecialChar.map(toBeCleansed => toBeCleansed.replace(/([.,\/#!$%\^&\*;:{}=\-_`~()\]\[])+$/g, "") + "");
  return filterOutPunctuation;
};

var _default = preProcessCommentOrReplyText;
exports.default = _default;