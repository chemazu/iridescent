import React from "react";
import ReactDOM from "react-dom";
import { transitions, positions, Provider as AlertProvider } from "react-alert";
import "./index.css";
import App from "./App";
import aos from "aos";
import reportWebVitals from "./reportWebVitals";
import AlertTemplate from "react-alert-template-basic";

const options = {
  position: positions.BOTTOM_RIGHT,
  timeout: 3000,
  offset: "30px",
  transtion: transitions.SCALE,
};

aos.init({
  delay: 6,
  duration: 1600,
  once: true,
});

ReactDOM.render(
  <React.StrictMode>
    <AlertProvider template={AlertTemplate} {...options}>
      <App />
    </AlertProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
