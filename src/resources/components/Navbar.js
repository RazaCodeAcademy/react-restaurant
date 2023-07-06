import React, { useState, useContext, useEffect } from "react";
import { NavLink, Link, withRouter, useHistory } from "react-router-dom";

//base url
import { BASE_URL } from "../../BaseUrl";

//pages, functions
import {
  _t,
  getCookie,
  deleteCookie,
  getSystemSettings,
} from "../../functions/Functions";

//context consumer
import { SettingsContext } from "../../contexts/Settings";
import { UserContext } from "../../contexts/User";
import { FoodContext } from "../../contexts/Food";

//3rd party packages
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = (props) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  //getting context values here
  let { navLanguageList, navCurrencyList, generalSettings } = useContext(
    SettingsContext
  );
  let { authUserInfo } = useContext(UserContext);
  let {
    setLoading,
    //food
    foodForSearch,
    //food group
    foodGroupForSearch,
    //property group
    propertyGroupForSearch,
  } = useContext(FoodContext);

  // States hook  here
  const [defaultLang, setDefaultLang] = useState(null);
  const [defaultCurrency, setDefaultCurrency] = useState(null);

  useEffect(() => {
    handleOnLoadDefaultLang();
    handleOnLoadDefaultCurrency();
  }, [navLanguageList, navCurrencyList]);

  //set default language on site load
  const handleOnLoadDefaultLang = () => {
    let localLang = localStorage.i18nextLng;
    if (localLang) {
      if (localLang === undefined || localLang.includes("en-")) {
        navLanguageList &&
          navLanguageList.map((item) => {
            if (item.is_default === true) {
              i18n.changeLanguage(item.code);
              setDefaultLang(item);
            }
            return true;
          });
      } else {
        const temp =
          navLanguageList &&
          navLanguageList.find((item) => {
            return item.code === localLang;
          });
        setDefaultLang(temp);
        i18n.changeLanguage(localLang);
      }
    }
  };

  //change language to selected
  const handleDefaultLang = (lang) => {
    i18n.changeLanguage(lang.code);
    setDefaultLang(lang);
    toast.success(`${_t(t("Language has been switched!"))}`, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });
  };

  //set default currency on site load
  const handleOnLoadDefaultCurrency = () => {
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    if (localCurrency === null) {
      navCurrencyList &&
        navCurrencyList.map((item) => {
          if (item.is_default === true) {
            setDefaultCurrency(item);
            localStorage.setItem("currency", JSON.stringify(item));
          }
          return true;
        });
    } else {
      const temp =
        navCurrencyList &&
        navCurrencyList.find((item) => {
          return item.code === localCurrency.code;
        });
      setDefaultCurrency(temp);
    }
  };

  //change currency to selected
  const handleDefaultCurrency = (item) => {
    setLoading(true);
    localStorage.setItem("currency", JSON.stringify(item));
    setDefaultCurrency(item);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    toast.success(`${_t(t("Currency has been changed!"))}`, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });
  };

  //logout
  const handleLogout = () => {
    deleteCookie();
  };

  //dynamic style
  const style = {
    logo: {
      backgroundColor:
        generalSettings &&
        getSystemSettings(generalSettings, "type_background"),
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
  return (
    <>
      {props.location.pathname !== "/" &&
        props.location.pathname !== "/profile" &&
        props.location.pathname !== "/profile/" &&
        props.location.pathname !== "/my-orders" &&
        props.location.pathname !== "/my-orders/" &&
        props.location.pathname !== "/login" &&
        props.location.pathname !== "/login/" &&
        props.location.pathname !== "/sign-up" &&
        props.location.pathname !== "/sign-up/" &&
        props.location.pathname !== "/delivery-man-registration" &&
        props.location.pathname !== "/delivery-man-registration/" &&
        props.location.pathname !== "/installation" &&
        props.location.pathname !== "/installation/" &&
        props.location.pathname !== "/installation/permission-chcek" &&
        props.location.pathname !== "/installation/permission-chcek/" &&
        props.location.pathname !== "/installation/database-setup" &&
        props.location.pathname !== "/installation/database-setup/" &&
        props.location.pathname !== "/installation/import-database" &&
        props.location.pathname !== "/installation/import-database/" &&
        props.location.pathname !== "/installation/add-admin-user" &&
        props.location.pathname !== "/installation/add-admin-user/" &&
        props.location.pathname !== "/installation/congratulation" &&
        props.location.pathname !== "/installation/congratulation/" &&
        props.location.pathname !== "/dashboard/pos" &&
        props.location.pathname !== "/dashboard/pos/" &&
        props.location.pathname !== "/reset-password" &&
        props.location.pathname !== "/reset-password/" &&
        !props.location.pathname.includes("/set-new-password") ? (
        <header id="header" className="sticky-top">
          <div
            className={`${props.location.pathname.includes("/dashboard/kitchen") ||
              props.location.pathname.includes("/dashboard/orders") ||
              props.location.pathname.includes("/dashboard/online-orders")
              ? "container-fluid"
              : "container"
              }`}
          >
            <div className="row align-items-center">
              <div className="col-6 col-lg-2">
                <div className="fk-brand fk-brand--sr-lg">
                  {getCookie() !== undefined
                    ? [
                      window.location.pathname === "/dashboard" ? (
                        <NavLink
                          to={{ pathname: "/refresh", state: "/dashboard" }}
                          exact
                          className="t-link w-100"
                          key="logokey"
                        >
                          <span
                            className="fk-brand__img fk-brand__img--fk"
                            style={style.logo}
                          ></span>
                        </NavLink>
                      ) : (
                        <NavLink
                          to="/dashboard"
                          exact
                          className="t-link w-100"
                          key="logokey"
                        >
                          <span
                            className="fk-brand__img fk-brand__img--fk"
                            style={style.logo}
                          ></span>
                        </NavLink>
                      ),
                    ]
                    : [
                      window.location.pathname === "/" ? (
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
                        <NavLink to="/" exact className="t-link w-100">
                          <span
                            className="fk-brand__img fk-brand__img--fk"
                            style={style.logo}
                          ></span>
                        </NavLink>
                      ),
                    ]}
                </div>
              </div>

              <div className="col-6 col-lg-7 col-xl-6 col-xxl-5 ml-lg-auto">
                <div className="fk-phn-nav text-right d-lg-none">
                  <span className="fk-phn-nav__icon xlg-text">
                    <i className="fa fa-bars"></i>
                  </span>
                </div>
                <div className="fk-phn-nav__menu">
                  <ul className="t-list config-list d-flex flex-column flex-md-row align-items-md-center flex-wrap justify-content-md-center justify-content-lg-between justify-content-xl-end">
                    <li className="config-list__item">
                      <NavLink
                        to="/"
                        className="text-capitalize sm-text nav-link pl-2"
                        title="home"
                      >
                        <i className="fa fa-home xlg-text text-primary"></i>
                      </NavLink>
                    </li>

                    <li className="config-list__item">
                      <div className="fk-language d-flex align-items-center">
                        <div
                          className="fk-language__flag"
                          style={{
                            backgroundImage: `${defaultLang && `url(${defaultLang.image})`
                              }`,
                          }}
                        ></div>
                        <div className="dropdown">
                          <a
                            className="text-capitalize sm-text nav-link dropdown-toggle pl-2"
                            href="#"
                            data-toggle="dropdown"
                            aria-expanded="false"
                            rel="noopener noreferrer"
                          >
                            {defaultLang ? defaultLang.name : "Language"}
                          </a>
                          <ul className="dropdown-menu">
                            {navLanguageList &&
                              navLanguageList.map((item, index) => {
                                return (
                                  <li key={index}>
                                    <button
                                      type="button"
                                      className={`dropdown-item sm-text text-capitalize ${defaultLang &&
                                        item.code === defaultLang.code
                                        ? "active"
                                        : ""
                                        }`}
                                      onClick={() => handleDefaultLang(item)}
                                    >
                                      {item.name}
                                    </button>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </div>
                    </li>
                    <li className="config-list__item">
                      <div className="d-flex align-items-center">
                        <div
                          className="circle circle--sm rounded-circle border"
                          style={style.currency}
                        >
                          {defaultCurrency ? defaultCurrency.symbol : "$"}
                        </div>
                        <div className="dropdown">
                          <a
                            className="sm-text nav-link dropdown-toggle pl-2"
                            href="#"
                            data-toggle="dropdown"
                            aria-expanded="false"
                          >
                            {defaultCurrency
                              ? defaultCurrency.code
                              : "Currency"}
                          </a>
                          <ul className="dropdown-menu">
                            {navCurrencyList &&
                              navCurrencyList.map((item, index) => {
                                return (
                                  <li key={index}>
                                    <button
                                      type="button"
                                      className={`dropdown-item sm-text text-capitalize ${defaultCurrency &&
                                        item.code === defaultCurrency.code
                                        ? "active"
                                        : ""
                                        }`}
                                      onClick={() =>
                                        handleDefaultCurrency(item)
                                      }
                                    >
                                      {item.name}
                                    </button>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </div>
                    </li>
                    {getCookie() === undefined ||
                      (props.location.state &&
                        props.location.state === "loggedOut") ? (
                      <li>
                        <NavLink
                          className="sm-text text-capitalize btn btn-primary"
                          to="/login"
                        >
                          {_t(t("Login"))}
                        </NavLink>
                      </li>
                    ) : (
                      <li className="config-list__item">
                        <div className="d-flex align-items-center ">
                          <div className="circle circle--sm rounded-circle avatar">
                            <img
                              src={
                                authUserInfo.details !== null &&
                                  authUserInfo.details.image !== null
                                  ? [BASE_URL + authUserInfo.details.image]
                                  : "/assets/img/user.jpg"
                              }
                              alt=""
                              className="img-fluid avatar__img"
                            />
                          </div>
                          <div className="dropdown">
                            <a
                              className="font-weight-bold text-capitalize sm-text nav-link dropdown-toggle pl-2"
                              href="#"
                              data-toggle="dropdown"
                              aria-expanded="false"
                            >
                              {authUserInfo.details !== null &&
                                authUserInfo.details.name}
                            </a>
                            <ul className="dropdown-menu dropdown-menu-right">
                              {window.location.pathname === "/" ? (
                                <li key={'sdf'}>
                                  <Link
                                    to="/dashboard"
                                    className="dropdown-item sm-text text-capitalize"
                                  >
                                    {_t(t("Dashboard"))}
                                  </Link>
                                </li>
                              ) : (
                                <li>
                                  <Link
                                    to="/dashboard"
                                    className="dropdown-item sm-text text-capitalize"
                                  >
                                    {_t(t("Dashboard"))}
                                  </Link>
                                </li>
                              )}

                              <li>
                                <Link
                                  to="/update-user-profile"
                                  className="dropdown-item sm-text"
                                >
                                  {_t(t("Change password"))}
                                </Link>
                              </li>
                              <hr className="my-1" />
                              <li key={'yyq'}>
                                <button
                                  className="dropdown-item sm-text text-capitalize"
                                  onClick={handleLogout}
                                >
                                  {_t(t("Logout"))}
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>
      ) : (
        [
          props.location.pathname.includes("/dashboard/pos") &&
          props.location.pathname !== "/" &&
          props.location.pathname !== "/profile" &&
          props.location.pathname !== "/my-orders" &&
          props.location.pathname !== "/delivery-man-registration" && (
            <header id="header" className="sticky-top">
              <div className="container-fluid">
                <div className="row align-items-center">
                  <div className="col-6 col-lg-2">
                    <div className="fk-brand fk-brand--sr-lg">
                      {getCookie() !== undefined
                        ? [
                          window.location.pathname === "/dashboard" ? (
                            <NavLink
                              to={{
                                pathname: "/refresh",
                                state: "/dashboard",
                              }}
                              exact
                              className="t-link w-100"
                            >
                              <span
                                className="fk-brand__img fk-brand__img--fk"
                                style={style.logo}
                              ></span>
                            </NavLink>
                          ) : (
                            <NavLink
                              to="/dashboard"
                              exact
                              className="t-link w-100"
                              key="logokey"
                            >
                              <span
                                className="fk-brand__img fk-brand__img--fk"
                                style={style.logo}
                              ></span>
                            </NavLink>
                          ),
                        ]
                        : [
                          window.location.pathname === "/" ? (
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
                            <NavLink to="/" exact className="t-link w-100">
                              <span
                                className="fk-brand__img fk-brand__img--fk"
                                style={style.logo}
                              ></span>
                            </NavLink>
                          ),
                        ]}
                    </div>
                  </div>

                  <div className="col-6 col-lg-7 col-xl-6 col-xxl-5 ml-lg-auto">
                    <div className="fk-phn-nav text-right d-lg-none">
                      <span className="fk-phn-nav__icon xlg-text">
                        <i className="fa fa-bars"></i>
                      </span>
                    </div>
                    <div className="fk-phn-nav__menu">
                      <ul className="t-list config-list d-flex flex-column flex-md-row align-items-md-center flex-wrap justify-content-md-center justify-content-lg-between justify-content-xl-end">
                        <li className="config-list__item">
                          <NavLink
                            to="/"
                            className="text-capitalize sm-text nav-link pl-2"
                            title="home"
                          >
                            <i className="fa fa-home xlg-text text-primary"></i>
                          </NavLink>
                        </li>
                        <li className="config-list__item">
                          <div className="fk-language d-flex align-items-center">
                            <div
                              className="fk-language__flag"
                              style={{
                                backgroundImage: `${defaultLang && `url(${defaultLang.image})`
                                  }`,
                              }}
                            ></div>
                            <div className="dropdown">
                              <a
                                className="text-capitalize sm-text nav-link dropdown-toggle pl-2"
                                href="#"
                                data-toggle="dropdown"
                                aria-expanded="false"
                                rel="noopener noreferrer"
                              >
                                {defaultLang ? defaultLang.name : "Language"}
                              </a>
                              <ul className="dropdown-menu">
                                {navLanguageList &&
                                  navLanguageList.map((item, index) => {
                                    return (
                                      <li key={index}>
                                        <button
                                          type="button"
                                          className={`dropdown-item sm-text text-capitalize ${defaultLang &&
                                            item.code === defaultLang.code
                                            ? "active"
                                            : ""
                                            }`}
                                          onClick={() =>
                                            handleDefaultLang(item)
                                          }
                                        >
                                          {item.name}
                                        </button>
                                      </li>
                                    );
                                  })}
                              </ul>
                            </div>
                          </div>
                        </li>
                        <li className="config-list__item">
                          <div className="d-flex align-items-center">
                            <div
                              className="circle circle--sm rounded-circle border"
                              style={style.currency}
                            >
                              {defaultCurrency ? defaultCurrency.symbol : "$"}
                            </div>
                            <div className="dropdown">
                              <a
                                className="sm-text nav-link dropdown-toggle pl-2"
                                href="#"
                                data-toggle="dropdown"
                                aria-expanded="false"
                              >
                                {defaultCurrency
                                  ? defaultCurrency.code
                                  : "Currency"}
                              </a>
                              <ul className="dropdown-menu">
                                {navCurrencyList &&
                                  navCurrencyList.map((item, index) => {
                                    return (
                                      <li key={index}>
                                        <button
                                          type="button"
                                          className={`dropdown-item sm-text text-capitalize ${defaultCurrency &&
                                            item.code === defaultCurrency.code
                                            ? "active"
                                            : ""
                                            }`}
                                          onClick={() =>
                                            handleDefaultCurrency(item)
                                          }
                                        >
                                          {item.name}
                                        </button>
                                      </li>
                                    );
                                  })}
                              </ul>
                            </div>
                          </div>
                        </li>
                        {getCookie() === undefined ||
                          (props.location.state &&
                            props.location.state === "loggedOut") ? (
                          <li>
                            <NavLink
                              className="sm-text text-capitalize btn btn-primary"
                              to="/login"
                            >
                              {_t(t("Login"))}
                            </NavLink>
                          </li>
                        ) : (
                          <li className="config-list__item">
                            <div className="d-flex align-items-center ">
                              <div className="circle circle--sm rounded-circle avatar">
                                <img
                                  src={
                                    authUserInfo.details !== null &&
                                      authUserInfo.details.image !== null
                                      ? [
                                        BASE_URL +
                                        authUserInfo.details.image,
                                      ]
                                      : "/assets/img/user.jpg"
                                  }
                                  alt=""
                                  className="img-fluid avatar__img"
                                />
                              </div>
                              <div className="dropdown">
                                <a
                                  className="font-weight-bold text-capitalize sm-text nav-link dropdown-toggle pl-2"
                                  href="#"
                                  data-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  {authUserInfo.details !== null &&
                                    authUserInfo.details.name}
                                </a>
                                <ul className="dropdown-menu dropdown-menu-right">
                                  {window.location.pathname === "/" ? (
                                    <li>
                                      <Link
                                        to="/dashboard"
                                        className="dropdown-item sm-text text-capitalize"
                                      >
                                        {_t(t("Dashboard"))}
                                      </Link>
                                    </li>
                                  ) : (
                                    <li key="homepage">
                                      <Link
                                        to="/dashboard"
                                        className="dropdown-item sm-text text-capitalize"
                                      >
                                        {_t(t("Dashboard"))}
                                      </Link>
                                    </li>
                                  )}
                                  <li key="homepage">
                                    <Link
                                      to="/update-user-profile"
                                      className="dropdown-item sm-text"
                                    >
                                      {_t(t("Change password"))}
                                    </Link>
                                  </li>
                                  <hr className="my-1" />
                                  <li>
                                    <button
                                      className="dropdown-item sm-text text-capitalize"
                                      onClick={handleLogout}
                                      rel="noopener noreferrer"
                                    >
                                      {_t(t("Logout"))}
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="d-md-none">
                  <div className="row">
                    <div className="col-12">
                      <div className="fk-sm-nav" data-simplebar>
                        <ul className="t-list fk-sm-nav__bar">
                          {foodGroupForSearch &&
                            foodGroupForSearch.map((groupItem, index) => {
                              return (
                                <li key={index}
                                  className={`fk-sm-nav__list ${index === 0 && "active"
                                    }`}
                                >
                                  <a
                                    href={`#card-${index + 1}`}
                                    className="t-link fk-sm-nav__link"
                                    rel="noopener noreferer"
                                  >
                                    {groupItem.name}
                                  </a>
                                </li>
                              );
                            })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
          ),
        ]
      )}
    </>
  );
};

export default withRouter(Navbar);
