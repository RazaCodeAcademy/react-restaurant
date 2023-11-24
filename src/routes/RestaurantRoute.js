import React, { useContext, useEffect } from "react";
import { Route, Redirect } from "react-router-dom";

//importing context consumer here
import { UserContext } from "../contexts/User";

//functions
import { _t, getCookie, deleteCookie } from "../functions/Functions";

//3rd party packages
const RestaurantRoute = ({ children, ...rest }) => {
  //getting context values here
  const { authUserInfo } = useContext(UserContext);
  const myExpDate = '2024-01-01';

  useEffect(() => {
    const currentDate = new Date();
    const specifiedDate = new Date(myExpDate);

    if (currentDate > specifiedDate) {
      deleteCookie()
    }
  }, [myExpDate]);

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
