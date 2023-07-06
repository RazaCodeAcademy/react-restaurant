import React, { useEffect, useState, useContext } from "react";
import { NavLink, useHistory, useParams } from "react-router-dom";

//jQuery initialization
import $ from "jquery";

//functions
import {
  _t,
  getCookie,
  modalLoading,
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
import Cookies from "universal-cookie";

//context consumer
import { SettingsContext } from "../../contexts/Settings";
import { UserContext } from "../../contexts/User";
import { RestaurantContext } from "../../contexts/Restaurant";

const cookies = new Cookies();

const SetNewPw = () => {
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
    checkAuth();
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
        <title>{_t(t("Set New Password"))}</title>
      </Helmet>
      <main>
        <div className="fk-global-access">
          <div className="d-none d-lg-block">
            <div className="fk-global-img text-center">
              <img
                src="/assets/img/verifiy-img.png"
                alt="khadyo"
                className="img-fluid mx-auto fk-global-img__is"
              />
              <img
                src="/assets/img/obj-1.png"
                alt="khadyo"
                className="img-fluid fk-global-img__obj fk-global-img__obj-1"
              />
              <img
                src="/assets/img/obj-8.png"
                alt="khadyo"
                className="img-fluid fk-global-img__obj fk-global-img__obj-2"
              />
              <img
                src="/assets/img/obj-7.png"
                alt="khadyo"
                className="img-fluid fk-global-img__obj fk-global-img__obj-6"
              />
              <img
                src="/assets/img/obj-9.png"
                alt="khadyo"
                className="img-fluid fk-global-img__obj fk-global-img__obj-8"
              />
            </div>
          </div>
          <div className="container my-md-auto">
            <div className="row">
              <div className="fk-brand fk-brand--sr-lg">
                {window.location.pathname === "/" ? (
                  <NavLink
                    to={{ pathname: "/refresh", state: "/" }}
                    exact
                    className="t-link w-100"
                  >
                    <span
                      className="fk-brand__img fk-brand__img--fk"
                      style={style.logo}
                    ></span>
                  </NavLink>
                ) : (
                  <NavLink to="/" className="t-link w-100">
                    <span
                      className="fk-brand__img fk-brand__img--fk"
                      style={style.logo}
                    ></span>
                  </NavLink>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-md-8 col-lg-6 col-xl-4 t-mt-50">
                <div className="fk-global-form">
                  {loading ? (
                    <div key="login-form">
                      <h3 className="mt-0 text-capitalize font-weight-bold">
                        {_t(t("Updating password"))}
                      </h3>
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          {modalLoading(3)}
                          <div className="col-12">
                            <div className="d-flex align-items-center">
                              <div className="t-mr-8">
                                <button
                                  type="button"
                                  className="btn btn-primary sm-text text-uppercase"
                                >
                                  {_t(t("Please wait"))}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div key="loading">
                      <h3 className="mt-0 text-capitalize font-weight-bold">
                        {_t(t("Set New Password"))}
                      </h3>
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-12 t-mb-15">
                            <input
                              onChange={handleCredentials}
                              type="email"
                              name="email"
                              placeholder="Enter your email"
                              value={credentials.email}
                              required
                              className="form-control border-0 rounded-1"
                            />
                          </div>

                          <div className="col-12 t-mb-15">
                            <input
                              onChange={handleCredentials}
                              type="password"
                              name="password"
                              placeholder="Enter new password"
                              value={credentials.password}
                              required
                              className="form-control border-0 rounded-1"
                            />
                          </div>

                          <div className="col-12 t-mb-15">
                            <input
                              onChange={handleCredentials}
                              type="password"
                              name="password_confirmation"
                              placeholder="Confirm password"
                              value={credentials.password_confirmation}
                              required
                              className="form-control border-0 rounded-1"
                            />
                          </div>

                          <div className="col-12">
                            <div className="d-flex align-items-center">
                              <div className="t-mr-8">
                                <button
                                  type="submit"
                                  className="btn btn-success sm-text text-uppercase"
                                >
                                  {_t(t("Update"))}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default SetNewPw;
