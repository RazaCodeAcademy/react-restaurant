import React, { } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import "./App.css";
import App from "./App";
import SaasApp from "./SaasApp.";
import "./i18next";


//importing context provider here
import { UserProvider } from "./contexts/User";
import { SettingsProvider } from "./contexts/Settings";
import { RestaurantProvider } from "./contexts/Restaurant";
import { FoodProvider } from "./contexts/Food";


ReactDOM.render(
  // <React.StrictMode>
    <UserProvider>
      <SettingsProvider>
        <RestaurantProvider>
          <FoodProvider>
            <SaasApp key="saasAppKey" />
          </FoodProvider>
        </RestaurantProvider>
      </SettingsProvider>
    </UserProvider>,
  // </React.StrictMode>,
  document.getElementById("khadyo")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
