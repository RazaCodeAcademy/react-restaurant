import React from "react";
import { withRouter } from "react-router-dom";
import { consolee } from "../../functions/Functions";

const Refresh = (props) => {
  //redirect to intended url
  props.location.state
    ? props.history.replace(props.location.state)
    : props.history.replace("/");

  // consolee();
  return <></>;
};

export default withRouter(Refresh);
