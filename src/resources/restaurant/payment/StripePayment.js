import React, { useContext, useState, useEffect } from "react";


//importing context consumer here
import { UserContext } from "../../../contexts/User";

import { SettingsContext } from "../../../contexts/Settings";

//functions
import { _t, getSystemSettings } from "../../../functions/Functions";

//3rd party packages
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";

//jQuery initialization
import $ from "jquery";

// -----------------------------------stripe payment method-----------------------------------
// import StripeCheckout from "react-stripe-checkout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeForm  from "./StripeForm"

const public_key =
  "pk_test_51HeMxMGahXUsew7kgRWCjly9sFZQOImZzSHExaYqxd8jmFUl8psNrqhq5BXVZvNQ427YUQNpxwmoPX3gHRlY58lr00d78CtYbD";

const stripeTestPromise = loadStripe(public_key);

// -----------------------------------stripe payment method-----------------------------------

const StripePayment = () => {
  const { t } = useTranslation();

  //getting context values here
  let { generalSettings } = useContext(SettingsContext);
  //auth user
  const { authUserInfo, setAuthUserInfo } = useContext(UserContext);

  //personal details
  const [userDetails, setUserDetails] = useState({
    name: null,
    address: null,
    email: null,
    phn_no: null,
    image: null,
    password: null,
    password_confirmation: null,
    uploading: false,
  });

  //useeffect == componentDidMount()
  useEffect(() => {
    handleJquery();
    if (authUserInfo.details) {
      setUserDetails({
        ...userDetails,
        name: authUserInfo.details.name,
        address: authUserInfo.details.address,
        email: authUserInfo.details.email,
        phn_no: authUserInfo.details.phn_no,
      });
    }
  }, [authUserInfo]);

  //handle jQuery
  const handleJquery = () => {
    $(window).on("scroll", function () {
      var toTopVisible = $("html").scrollTop();
      if (toTopVisible > 500) {
        $(".scrollup").fadeIn();
      } else {
        $(".scrollup").fadeOut();
      }
    });
  };
  //dynamic style
  const style = {
    logo: {
      backgroundImage:
        generalSettings &&
        `url(${getSystemSettings(generalSettings, "type_logo")})`,
    },
    currency: {
      backgroundColor:
        generalSettings && getSystemSettings(generalSettings, "type_clock"),
      color:
        generalSettings && getSystemSettings(generalSettings, "type_color"),
    },
  };

  // const onToken = (token) => {
  //   console.log(token);
  // };

  return (
    <>
      <Elements stripe={stripeTestPromise}>
          <StripeForm />
      </Elements>
    </>
  );
};

export default StripePayment;
