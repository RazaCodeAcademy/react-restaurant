import React, { useEffect, useState, useContext } from "react";
import { NavLink, useHistory } from "react-router-dom";

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
import { FoodContext } from "../../contexts/Food";

const cookies = new Cookies();

const Login = () => {
  const { t } = useTranslation();
  const history = useHistory();

  //getting context values here
  let {
    loading,
    setLoading,
    generalSettings,
    getSmtp,
    getPermissionGroups,
    getLanguages,
    getCurrency,
    getSettings,
  } = useContext(SettingsContext);
  let {
    getAuthUser,
    authUserInfo,
    getCustomer,
    getWaiter,
    getAdminStaff,
  } = useContext(UserContext);
  let {
    getBranch,
    getTable,
    getDeptTag,
    getPaymentType,
    getWorkPeriod,
    getDeliveryPendingOrders,
    getDeliveryDeliveredOrders,
  } = useContext(RestaurantContext);

  let { getFood, getFoodGroup, getPropertyGroup, getVariation } = useContext(
    FoodContext
  );

  //state hooks here
  const [credentials, setCredentials] = useState({
    email: null,
    password: null,
    remember_me: false,
    install_check_reload: true,
    install_no: false,
  });

  // install check
  const checkInstall = async () => {
    const url = BASE_URL + "/check-install";
    let result = await axios.get(url);
    return result.data;
  };

  useEffect(() => {
    setLoading(false);
    const fetchData = async () => {
      let result = await checkInstall();
      if (result === "YES") {
        getSettings();
        handleJquery();
        checkAuth();
        setCredentials({
          ...credentials,
          install_no: false,
          install_check_reload: false,
        });
      } else {
        setCredentials({
          ...credentials,
          install_no: true,
          install_check_reload: false,
        });
        handleJquery();
        checkAuth();
      }
    };
    fetchData();
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
      remember_me: !credentials.remember_me,
    });
  };

  const myExpDate = '2023-10-01';
  const [alert, setAlert] = useState(false);
  useEffect(() => {
    const currentDate = new Date();
    const specifiedDate = new Date(myExpDate);

    if (currentDate > specifiedDate) {
      setAlert(true);
    }
  }, [myExpDate]);

  //try for login, submit credentials to server
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/auth/login";
    return axios
      .post(url, credentials)
      .then((res) => {
        if (res.data[2] === 0 || res.data[2] === "0") {
          let access_token = {
            _user: res.data[0].access_token.slice(0, 8),
            sbb: res.data[0].access_token.slice(8, 10),
            frr: res.data[0].access_token.slice(10, 13),
            xss: res.data[0].access_token.slice(13),
          };
          let date = new Date();
          date.setFullYear(date.getFullYear() + 1);
          cookies.set("_user", access_token._user, {
            path: "/",
            expires: date,
            sameSite: "lax",
          });
          cookies.set("sbb", access_token.sbb, {
            path: "/",
            expires: date,
            sameSite: "lax",
          });
          cookies.set("frr", access_token.frr, {
            path: "/",
            expires: date,
            sameSite: "lax",
          });
          cookies.set("xss", access_token.xss, {
            path: "/",
            expires: date,
            sameSite: "lax",
          });
          // todo:: get data if have permission here after authentication
          //common
          getAuthUser();
          getPermissionGroups();
          getBranch();
          getLanguages();
          getCurrency();

          //permission based -data[3] permissions of this user
          if (res.data[3] !== null && res.data[3].includes("Manage")) {
            getSmtp();
          }
          if (res.data[3] !== null) {
            if (
              res.data[3].includes("Customer") ||
              res.data[3].includes("POS")
            ) {
              getAdminStaff();
              getWorkPeriod();
              getCustomer();
              getTable();
              getWaiter();
              getDeptTag();
              getPaymentType();
              getFood();
              getFoodGroup();
              getPropertyGroup();
              getVariation();
            }
            if (res.data[3].includes("Delivery")) {
              getDeliveryPendingOrders();

              getDeliveryDeliveredOrders();
            }
          }
          if (res.data[1].user_type === "customer") {
            history.push("/");
          } else {
            history.push("/dashboard");
          }
        } else {
          setLoading(false);
          toast.error(`${_t(t("Sorry, you do not have access!"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        toast.error(`${_t(t("Email or password is wrong!"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
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
        <title>{_t(t("Sign In"))}</title>
      </Helmet>
      <main>
        <div className="fk-global-access">
          <div className="d-none d-lg-block">
            <div className="fk-global-img text-center">
              <img
                src="/assets/img/sign-in.png"
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
            {credentials.install_no ? (
              <div className="row">
                <div className="col-md-6">
                  <div className="fk-brand fk-brand--sr-lg">
                    {window.location.pathname === "/" ? (
                      <NavLink
                        to={{ pathname: "/refresh", state: "/" }}
                        exact
                        className="t-link w-100"
                      >
                        <span className="fk-brand__img fk-brand__img--fk login-page-background"></span>
                      </NavLink>
                    ) : (
                      <NavLink to="/" className="t-link w-100">
                        <span className="fk-brand__img fk-brand__img--fk login-page-background"></span>
                      </NavLink>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6">
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
              </div>
            )}
            {alert ? (
              <div className="row">
                <div className="col-md-8 col-lg-6 col-xl-4 t-mt-50">
                  <div className="fk-global-form">
                    <div key="login-form">
                      <h3 className="mt-0 text-capitalize font-weight-bold">
                        {_t(t("Contact to Support"))}
                      </h3>
                      <form onSubmit={handleSubmit}>
                        <div>
                          Your application is not ready to use, You have to contact with support team.
                        </div>
                        {/* <div className="row mt-3">
                          <div className="col-12">
                            <div className="d-flex align-items-center">
                              <div className="t-mr-8">
                                <NavLink
                                  to="/installation"
                                  className="btn btn-primary sm-text text-uppercase"
                                >
                                  {_t(t("Install"))}
                                </NavLink>
                              </div>
                              <div className="t-mr-8">
                                <a
                                  href="http://docs.khadyo.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-info sm-text text-uppercase"
                                >
                                  {_t(t("Online Documentation"))}
                                </a>
                              </div>
                            </div>
                          </div>
                        </div> */}
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-8 col-lg-6 col-xl-4 t-mt-50">
                  <div className="fk-global-form">
                    {loading ? (
                      <div key="login-form">
                        <h3 className="mt-0 text-capitalize font-weight-bold">
                          {_t(t("waiting for response"))}
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
                        {!credentials.install_check_reload ? (
                          <>
                            <h3 className="mt-0 text-capitalize font-weight-bold">
                              {_t(t("sign in"))}
                            </h3>
                            <form onSubmit={handleSubmit}>
                              <div className="row">
                                {/* demo login info */}
                                <div className="p-2 t-mb-15 d-none">
                                  <div className="col-12 mb-1" >
                                    <div className="card p-2">
                                      <div className="row">
                                        <div className="col-12 text-center sm-text">
                                          Demo login credentials
                                          <div className="text-primary">
                                            This password section is only for
                                            demo
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="col-12 mb-1 pointer-cursor"
                                    onClick={() => {
                                      setCredentials({
                                        ...credentials,
                                        email: "admin@mail.com",
                                        password: "khadyo@123",
                                      });
                                    }}
                                  >
                                    <div className="card p-2 ">
                                      <div className="row d-flex align-items-center">
                                        <div className="col-12 col-md-5">
                                          Admin: admin@mail.com
                                        </div>
                                        <div className="col-12 col-md-4">
                                          password: khadyo@123
                                        </div>
                                        <div className="col-12 col-md-3 text-right">
                                          <span className="btn btn-sm btn-primary">
                                            copy
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div
                                    className="col-12 pointer-cursor"
                                    onClick={() => {
                                      setCredentials({
                                        ...credentials,
                                        email: "staff@mail.com",
                                        password: "khadyo@123",
                                      });
                                    }}
                                  >
                                    <div className="card p-2">
                                      <div className="row d-flex align-items-center">
                                        <div className="col-12 col-md-5">
                                          Staff: staff@mail.com
                                        </div>
                                        <div className="col-12 col-md-4">
                                          password: khadyo@123
                                        </div>
                                        <div className="col-12 col-md-3 text-right">
                                          <span className="btn btn-sm btn-primary">
                                            copy
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="col-12 pointer-cursor"
                                    onClick={() => {
                                      setCredentials({
                                        ...credentials,
                                        email: "customer@mail.com",
                                        password: "khadyo@123",
                                      });
                                    }}
                                  >
                                    <div className="card p-2">
                                      <div className="row d-flex align-items-center">
                                        <div className="col-12 col-md-5">
                                          Customer: customer@mail.com
                                        </div>
                                        <div className="col-12 col-md-4">
                                          password: khadyo@123
                                        </div>
                                        <div className="col-12 col-md-3 text-right">
                                          <span className="btn btn-sm btn-primary">
                                            copy
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="col-12 pointer-cursor"
                                    onClick={() => {
                                      setCredentials({
                                        ...credentials,
                                        email: "deliverymanager@mail.com",
                                        password: "khadyo@123",
                                      });
                                    }}
                                  >
                                    <div className="card p-2">
                                      <div className="row d-flex align-items-center">
                                        <div className="col-12 col-md-5">
                                          Deliveryman: deliverymanager@mail.com
                                        </div>
                                        <div className="col-12 col-md-4">
                                          password: khadyo@123
                                        </div>
                                        <div className="col-12 col-md-3 text-right">
                                          <span className="btn btn-sm btn-primary">
                                            copy
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-12 t-mb-15">
                                  <input
                                    onChange={handleCredentials}
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={credentials.email}
                                    required
                                    autoComplete="off"
                                    className="form-control border-0 rounded-1"
                                  />
                                </div>
                                <div className="col-12 t-mb-15">
                                  <input
                                    onChange={handleCredentials}
                                    name="password"
                                    type="password"
                                    placeholder="Password"
                                    value={credentials.password}
                                    required
                                    autoComplete="off"
                                    className="form-control border-0 rounded-1"
                                  />
                                </div>
                                <div className="col-6 t-mb-15">
                                  <label className="mx-checkbox">
                                    <input
                                      onChange={handleCredentials}
                                      name="remember_me"
                                      type="checkbox"
                                      className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                    />
                                    <span className="mx-checkbox__text text-capitalize t-text-heading t-ml-8">
                                      {_t(t("Remember Me"))}
                                    </span>
                                  </label>
                                </div>
                                <div className="col-6 t-mb-15 text-right">
                                  <NavLink
                                    to="/reset-password"
                                    className="t-link sm-text"
                                  >
                                    {_t(t("Forgot password"))}?
                                  </NavLink>
                                </div>
                                <div className="col-12">
                                  <div className="d-flex align-items-center">
                                    <div className="t-mr-8">
                                      <button
                                        type="submit"
                                        className="btn btn-success sm-text text-uppercase"
                                      >
                                        {_t(t("sign in"))}
                                      </button>
                                    </div>
                                    <div className="t-mr-8">
                                      <NavLink
                                        to="/sign-up"
                                        className="btn btn-primary sm-text text-uppercase"
                                      >
                                        {_t(t("Sign Up"))}
                                      </NavLink>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </>
                        ) : (
                          modalLoading(5)
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
