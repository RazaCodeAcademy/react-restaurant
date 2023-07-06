import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

//importing context consumer here
import { UserContext } from "../contexts/User";

//functions
import { _t, getCookie } from "../functions/Functions";

//3rd party packages
const RestaurantRoute = ({ children, ...rest }) => {
  //getting context values here
  const { authUserInfo } = useContext(UserContext);

  //redirect if customer
  if (authUserInfo.details && authUserInfo.details.user_type === "customer") {
    return (
      <Route
        render={() => {
          return (
            <Redirect
              to={{
                pathname: "/",
              }}
            />
          );
        }}
      ></Route>
    );
  }

  return (
    <Route
      {...rest}
      render={() => {
        return getCookie() !== undefined ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { alert: "You need to login first!" },
            }}
          />
        );
      }}
    ></Route>
  );
};
export default RestaurantRoute;
