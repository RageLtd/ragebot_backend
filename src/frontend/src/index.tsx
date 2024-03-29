import React from 'react';
import ReactDOM from "react-dom";
import "./normalize.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import Auth0Provider from "./auth/Auth0ProviderWithHistory";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
  <BrowserRouter>
    <Auth0Provider>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </Auth0Provider>
  </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
