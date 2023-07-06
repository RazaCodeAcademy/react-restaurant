import React, { useContext, useState, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";

//importing context consumer here
import { UserContext } from "../../../contexts/User";
import { FoodContext } from "../../../contexts/Food";
import { RestaurantContext } from "../../../contexts/Restaurant";
import { SettingsContext } from "../../../contexts/Settings";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../BaseUrl";

//functions
import {
  _t,
  modalLoading,
  restaurantMenuLink,
  getSystemSettings,
  getCookie,
  deleteCookie,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
} from "../../../functions/Functions";

//3rd party packages
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//jQuery initialization
import $ from "jquery";

const CustomerProfile = () => {
  const { t } = useTranslation();
  const history = useHistory();

  //getting context values here
  let { generalSettings } = useContext(SettingsContext);
  //auth user
  const { authUserInfo, setAuthUserInfo } = useContext(UserContext);
  //use state
  const [loading, setLoading] = useState(false);
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

  //handle change
  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  //handle change file
  const handleChangeFile = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.files[0],
    });
  };

  //submit details form
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/website/update-user-profile";
    let formData = new FormData();
    formData.append("name", userDetails.name);
    formData.append("email", userDetails.email);
    formData.append("phn_no", userDetails.phn_no);
    formData.append("address", userDetails.address);
    formData.append("onlyPassword", "no");
    if (userDetails.image !== null) {
      formData.append("image", userDetails.image);
    }
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAuthUserInfo({
          ...authUserInfo,
          details: res.data,
        });
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        toast.success(`${_t(t("Your profile has been updated"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
        setLoading(false);
      })
      .catch((error) => {
        if (error && error.response.data.errors) {
          if (error.response.data.errors.email) {
            error.response.data.errors.email.forEach((item) => {
              if (item === "An user exists with this email") {
                toast.error(`${_t(t("An user exists with this email"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }

          if (error.response.data.errors.phn_no) {
            error.response.data.errors.phn_no.forEach((item) => {
              if (item === "An user exists with this phone number") {
                toast.error(
                  `${_t(t("An user exists with this phone number"))}`,
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

          if (error.response.data.errors.image) {
            error.response.data.errors.image.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
        }
        setLoading(false);
      });
  };

  //submit password form
  const handleSubmitPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/website/update-user-profile";
    let formData = new FormData();
    formData.append("password", userDetails.password);
    formData.append("password_confirmation", userDetails.password_confirmation);
    formData.append("onlyPassword", "yes");
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        handleLogout();
      })
      .catch((error) => {
        if (error && error.response.data.errors) {
          if (error.response.data.errors.password) {
            error.response.data.errors.password.forEach((item) => {
              if (item === "Password confirmation does not match") {
                toast.error(
                  `${_t(t("Password confirmation does not match"))}`,
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
        }
        setLoading(false);
      });
  };

  //logout
  const handleLogout = () => {
    deleteCookie();
  };

  return (
    <>
      <Helmet>
        <title>
          {generalSettings &&
            getSystemSettings(generalSettings, "siteName") +
              " | " +
              _t(t("Profile"))}
        </title>
        <link rel="stylesheet" href="/website/css/animate.css" />
        <link rel="stylesheet" href="/website/css/meanmenu.min.css" />
        <link rel="stylesheet" href="./website/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/website/css/font-awsome-all.min.css" />
        <link rel="stylesheet" href="/website/css/magnific-popup.css" />
        <link rel="stylesheet" href="/website/css/slick.css" />
        <link rel="stylesheet" href="/website/css/jquery-ui.css" />
        <link rel="stylesheet" href="/website/css/style.css" />

        <script src="/website/js/vendor/jquery-2.2.4.min.js"></script>
        <script src="/website/js/vendor/bootstrap.min.js"></script>
        <script src="./website/js/vendor/jquery.meanmenu.min.js"></script>
        <script src="/website/js/vendor/jquery.magnific-popup.min.js"></script>
        <script src="/website/js/vendor/slick.min.js"></script>
        <script src="/website/js/vendor/counterup.min.js"></script>
        <script src="/website/js/vendor/countdown.js"></script>
        <script src="/website/js/vendor/waypoints.min.js"></script>
        <script src="/website/js/vendor/jquery-ui.js"></script>
        <script src="/website/js/vendor/isotope.pkgd.min.js"></script>
        <script src="/website/js/vendor/easing.min.js"></script>
        <script src="/website/js/vendor/wow.min.js"></script>
        <script src="/website/js/simplebar.js"></script>
        <script src="/website/js/main.js"></script>
      </Helmet>

      <header class="header3">
        {/* header-bottom  */}
        <div className="header-bottom home2-header-bottom margin-top-20">
          <div className="container position-relative">
            <div className="row d-flex align-items-center">
              <div className="col-lg-2 col-md-2 col-sm-2 col-6 margin-bottom-20">
                <div className="logo">
                  {window.location.pathname === "/" ? (
                    <NavLink
                      to={{ pathname: "/refresh", state: "/" }}
                      exact
                      className="t-link w-100"
                      key="logokey"
                    >
                      <img
                        src={getSystemSettings(generalSettings, "type_logo")}
                        alt="logo"
                      />
                    </NavLink>
                  ) : (
                    <NavLink
                      to="/"
                      exact
                      className="t-link w-100"
                      key="logokey"
                    >
                      <img
                        src={getSystemSettings(generalSettings, "type_logo")}
                        alt="logo"
                      />
                    </NavLink>
                  )}
                </div>
              </div>
              <div className="col-lg-5 d-none d-lg-block ml-auto"></div>
              <div className="col-lg-5 col-md-9 col-12">
                <div className="customer-area2 d-flex align-items-center justify-content-end">
                  <NavLink
                    to="/"
                    className="btn"
                    style={{
                      background: "transparent",
                      border: "1px solid #cc3333",
                      color: "#cc3333",
                    }}
                  >
                    {_t(t("home"))}
                  </NavLink>
                  {getCookie() === undefined ? (
                    <NavLink to="/login" className="btn">
                      {_t(t("Login"))}
                    </NavLink>
                  ) : (
                    <>
                      {authUserInfo &&
                      authUserInfo.details &&
                      authUserInfo.details.user_type !== "customer" ? (
                        <NavLink to="/dashboard" className="btn">
                          {_t(t("Dashboard"))}
                        </NavLink>
                      ) : (
                        <button className="btn" onClick={handleLogout}>
                          {_t(t("Logout"))}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main  */}
      <main className="kh-user my-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="kh-user__sidebar">
                <div className="kh-user__sidebar-head text-center">
                  <div className="d-flex justify-content-center">
                    <img
                      src={
                        authUserInfo.details && authUserInfo.details.image
                          ? BASE_URL + authUserInfo.details.image
                          : "/assets/img/user.jpg"
                      }
                      alt=""
                      className="rounded-circle"
                      style={{ height: "100px", width: "100px" }}
                    />
                  </div>
                  <h5 className="kh-user__name mt-3">
                    {authUserInfo.details && authUserInfo.details.name}
                  </h5>
                  <span className="kh-user__phn sm-text">
                    <i className="fa fa-phone-square-alt"></i>{" "}
                    {authUserInfo.details && authUserInfo.details.phn_no}
                  </span>
                </div>
                <div className="kh-user__sidebar-list mt-3">
                  <ul className="kh-user__list">
                    <li className="kh-user__list-item">
                      <NavLink
                        to="/profile"
                        className="kh-user__link d-flex align-items-center"
                        activeClassName="active"
                      >
                        <span className="kh-user__icon">
                          <i className="fas fa-user-circle"></i>
                        </span>
                        <span className="kh-user__text text-capitalize sm-text">
                          {_t(t("Profile"))}
                        </span>
                      </NavLink>
                    </li>
                    <li className="kh-user__list-item">
                      <NavLink
                        to="/my-orders"
                        className="kh-user__link d-flex align-items-center"
                      >
                        <span className="kh-user__icon">
                          <i className="fas fa-store"></i>
                        </span>
                        <span className="kh-user__text text-capitalize sm-text">
                          {_t(t("My Orders"))}
                        </span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="kh-user__body h-100">
                <div className="kh-user__body-box">
                  <div className="row justify-content-center">
                    <div className="col-xl-8">
                      <h6 className="kh-user__body-title text-center text-uppercase">
                        {_t(t("my profile"))}
                      </h6>
                      {loading ? (
                        modalLoading(5)
                      ) : (
                        <>
                          <form className="mt-4" onSubmit={handleSubmit}>
                            <div className="form-group">
                              <label
                                for="firstName"
                                className="sm-text text-capitalize"
                              >
                                {_t(t("name"))}
                              </label>
                              <input
                                type="text"
                                className="form-control rounded-0 sm-text"
                                id="firstName"
                                name="name"
                                value={userDetails.name}
                                onChange={handleChange}
                                required
                                placeholder={_t(t("name"))}
                              />
                            </div>
                            <div className="form-group">
                              <label
                                for="email"
                                className="sm-text text-capitalize"
                              >
                                {_t(t("email"))}
                              </label>
                              <input
                                type="text"
                                className="form-control rounded-0 sm-text"
                                id="email"
                                name="email"
                                required
                                value={userDetails.email}
                                onChange={handleChange}
                                placeholder={_t(t("email"))}
                              />
                            </div>

                            <div className="form-group">
                              <label
                                for="address"
                                className="sm-text text-capitalize"
                              >
                                {_t(t("address"))}
                              </label>
                              <textarea
                                className="form-control rounded-0 sm-text"
                                id="address"
                                name="address"
                                rows="4"
                                value={userDetails.address}
                                onChange={handleChange}
                                required
                                placeholder={_t(t("address"))}
                              />
                            </div>

                            <div className="form-group mb-0">
                              <label
                                for="phone"
                                className="sm-text text-capitalize"
                              >
                                {_t(t("mobile number"))}
                              </label>
                              <input
                                type="text"
                                className="form-control rounded-0 sm-text"
                                id="phone"
                                name="phn_no"
                                value={userDetails.phn_no}
                                required
                                onChange={handleChange}
                                placeholder={_t(t("mobile number"))}
                              />
                            </div>
                            <div className="form-group mt-3">
                              <label
                                for="image"
                                className="sm-text text-capitalize"
                              >
                                {_t(t("Image"))}
                              </label>
                              <input
                                type="file"
                                name="image"
                                onChange={handleChangeFile}
                                className="form-control-file rounded-0 sm-text"
                                id="image"
                              />
                            </div>
                            <div className="text-right">
                              <button
                                type="submit"
                                className="btn text-uppercase btn--save mt-3"
                              >
                                {_t(t("save"))}
                              </button>
                            </div>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="kh-user__body-box mt-3">
                  <div className="row justify-content-center">
                    <div className="col-xl-8">
                      <h6 className="kh-user__body-title text-center text-uppercase">
                        {_t(t("password"))}
                      </h6>
                      <form className="mt-4" onSubmit={handleSubmitPassword}>
                        <div className="form-group">
                          <label
                            for="currentpass"
                            className="sm-text text-capitalize"
                          >
                            {_t(t("password"))}
                          </label>
                          <input
                            type="password"
                            name="password"
                            value={userDetails.password}
                            onChange={handleChange}
                            className="form-control rounded-0 sm-text"
                            placeholder={_t(t("password"))}
                            id="currentpass"
                          />
                        </div>
                        <div className="form-group mb-0">
                          <label
                            for="newpass"
                            className="sm-text text-capitalize"
                          >
                            {_t(t("Confirm password"))}
                          </label>
                          <input
                            type="password"
                            name="password_confirmation"
                            value={userDetails.password_confirmation}
                            onChange={handleChange}
                            placeholder={_t(t("Confirm password"))}
                            className="form-control rounded-0 sm-text"
                            id="newpass"
                          />
                        </div>
                        <div className="text-right">
                          <button
                            type="submit"
                            className="btn text-uppercase btn--save mt-3"
                          >
                            {_t(t("save"))}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Main End */}

      {/* <!-- footer area --> */}
      <footer
        className="padding-top-40 padding-bottom-40 footer2"
        id="language"
      >
        <div className="fo-shapes">
          <span className="fs-1 item-animateTwo">
            <img src="/website/images/shapes/capsicam.png" alt="" />
          </span>
          <span className="fss-2">
            <img src="/website/images/shapes/fshape1.png" alt="" />
          </span>
          <span className="fss-3">
            <img src="/website/images/shapes/41.png" alt="" />
          </span>
          <span className="fss-4 item-bounce">
            <img src="/website/images/shapes/sauce.png" alt="" />
          </span>
          <span className="fss-5 item-bounce">
            <img src="/website/images/shapes/scatter.png" alt="" />
          </span>
          <span className="fss-6 item-animateTwo">
            <img src="/website/images/shapes/layer.png" alt="" />
          </span>
        </div>
        <div className="footer-top">
          <div className="container">
            <hr />
          </div>
        </div>
        <div className="copyright-area text-center">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6 justify-content-self-center">
                <div className="copyright-content">
                  <div className="f-logo">
                    <NavLink
                      to={{ pathname: "/refresh", state: "/" }}
                      exact
                      className="t-link w-100"
                      key="logokey"
                    >
                      <img
                        src={getSystemSettings(generalSettings, "type_logo")}
                        alt="logo"
                      />
                    </NavLink>
                  </div>

                  <p>{getSystemSettings(generalSettings, "type_footer")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* <!-- ToTop Button --> */}
      <button
        className="scrollup"
        onClick={() => {
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }}
      >
        <i className="fas fa-angle-up"></i>
      </button>
    </>
  );
};

export default CustomerProfile;
