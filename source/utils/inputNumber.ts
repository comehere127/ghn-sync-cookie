import * as React from "react";
const allowChar = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "backspace",
];
const funcKey = ["a", "c", "v"];
export function isInputNumber(event: React.KeyboardEvent) {
  const code = event.which || event.keyCode;
  const isFuncKey = event.ctrlKey || event.metaKey;

  const charCode = String.fromCharCode(code).toLowerCase();
  if (
    isFuncKey &&
    (funcKey.includes(charCode) || funcKey.includes(event.key.toLowerCase()))
  ) {
    return true;
  } else if (
    allowChar.includes(charCode) ||
    allowChar.includes(event.key.toLowerCase())
  ) {
    return true;
  } else {
    event.preventDefault();
  }
  return false;
}