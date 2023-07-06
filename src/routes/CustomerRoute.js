import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";

//importing context consumer here
import { UserContext } from "../contexts/User";

//functions
import { _t, getCookie } from "../functions/Functions";

//3rd party packages
const CustomerRoute = ({ children, ...rest }) => {
  //getting context values here
  const { authUserInfo } = useContext(UserContext);
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
            }}
          />
        );
      }}
    ></Route>
  );
};
export default CustomerRoute;
