import React, { useEffect, useState, useContext } from "react";
import { NavLink, useHistory, useParams } from "react-router-dom";

//jQuery initialization
import $ from "jquery";

//functions
import {
  _t,
  getCookie,
  getSystemSettings,
} from "../../functions/Functions";
import { useTranslation } from "react-i18next";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../BaseUrl";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../contexts/Settings";

const NotFound = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { token } = useParams();

  //getting context values here
  let { loading, setLoading, generalSettings } = useContext(SettingsContext);

  //state hooks here
  const [credentials, setCredentials] = useState({
    token: token,
    email: null,
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    handleJquery();
  }, []);

  //jQuery
  const handleJquery = () => {
    //obj Image Animation
    var hoverLayer = $("body");
    var objImgOne = $(".fk-global-img__obj");

    //Animation Init
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      if (objImgOne.length) {
        objImgOne.css({
          transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
        });
      }
    });
  };

  //redirect if logged in
  const checkAuth = () => {
    getCookie() !== undefined && history.replace("/dashboard");
  };

  //set credentials here on input change
  const handleCredentials = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  //submit credentials to server to send token to email
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/auth/setNewPassword";
    return axios
      .post(url, credentials)
      .then((res) => {
        if (res.data === "noUser") {
          toast.error(
            `${_t(
              t("Sorry, email does not match or the link has been expired")
            )}`,
            {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            }
          );
        }
        if (res.data === "ok") {
          toast.success(`${_t(t("Please login to continue"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
          history.push("/login");
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response.data.errors.password) {
          error.response.data.errors.password.forEach((item) => {
            if (item === "The password confirmation does not match.") {
              toast.error(`${_t(t("Password confirmation does not match"))}`, {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              });
            }
            if (item === "The password must be at least 6 characters.") {
              toast.error(
                `${_t(t("The password must be at least 6 characters"))}`,
                {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                }
              );
            }
          });
        }
      });
  };

  const style = {
    logo: {
      backgroundColor: "none",
      // generalSettings &&
      // getSystemSettings(generalSettings, "type_background"),
      backgroundImage:
        generalSettings &&
        `url(${getSystemSettings(generalSettings, "type_logo")})`,
    },
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("404"))}</title>
      </Helmet>
      <main class="fk-page-404">
        <div class="fk-page-404__img mt-auto">
          <div class="container">
            <div class="row">
              <div class="col-12 text-center">
                <img src="/assets/img/404.png" class="img-fluid" />
              </div>
            </div>
          </div>
        </div>
        <div class="fk-page-404__return-home t-mt-30 mb-auto">
          <div class="container">
            <div class="row">
              <div class="col-12 text-center">
                <NavLink
                  to="/"
                  class="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-primary xsm-text text-uppercase text-center"
                >
                  go to homepage
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFound;
