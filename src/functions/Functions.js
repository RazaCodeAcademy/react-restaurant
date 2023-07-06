import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../src/BaseUrl";

//3rd party packages
import ReactPaginate from "react-paginate";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import Cookies from "universal-cookie";
//importing ends
const cookies = new Cookies();

// functions starts here
//console functions, clear and dummy text like facebook
const consolee = () => {
  var cssStop = "color: Red; font-size: 50px; font-weight: bold;";
  var cssText = "color: Black; font-size: 18px; font-weight: bold;";
  console.clear();
  console.log("%cStop!", cssStop);
  console.log(
    "%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or hack someone's account, it is a scam.",
    cssText
  );
};

//translation functions
let _t = (text) => {
  // let localLang = localStorage.getItem("i18nextLng");
  // if (localLang.includes("en")) {
  //   const url = BASE_URL + `/settings/save-to-en`;
  //   let formData = {
  //     key: text,
  //   };
  //   axios.post(url, formData);
  // }
  return text;
};

//Get cookie of authentication
const getCookie = () => {
  if (cookies.get("_user") !== undefined) {
    let token =
      cookies.get("_user") +
      cookies.get("sbb") +
      cookies.get("frr") +
      cookies.get("xss");
    return token;
  }
};

//check permission
const checkPermission = (authUserPermissions, permission) => {
  if (authUserPermissions !== false)
    if (authUserPermissions.includes(permission)) {
      return true;
    } else {
      return false;
    }
};

//currency format price
const formatPrice = (price) => {
  let localCurrency = JSON.parse(localStorage.getItem("currency"));
  if (localCurrency !== null) {
    return (localCurrency.rate * price).toFixed(2);
  } else {
    return 0;
  }
};
const currencySymbolLeft = () => {
  let localCurrency = JSON.parse(localStorage.getItem("currency"));
  if (localCurrency !== null) {
    if (localCurrency.alignment === "left") {
      return localCurrency.symbol;
    } else {
      return "";
    }
  } else {
    return "";
  }
};
const currencySymbolRight = () => {
  let localCurrency = JSON.parse(localStorage.getItem("currency"));
  if (localCurrency !== null) {
    if (localCurrency.alignment === "right") {
      return localCurrency.symbol;
    } else {
      return "";
    }
  } else {
    return "";
  }
};

//general settings
const getSystemSettings = (settingsArray, checkType) => {
  let tempItem =
    settingsArray !== null &&
    settingsArray.find((item) => {
      return item.name === checkType;
    });
  if (tempItem !== undefined) {
    return tempItem.value;
  } else {
    return null;
  }
};

//Delete cookie of authentication
const deleteCookie = () => {
  const url = BASE_URL + `/auth/logout`;
  axios
    .get(url, {
      headers: { Authorization: `Bearer ${getCookie()}` },
    })
    .then(() => {
      window.location.reload();
      if (cookies.get("_user") !== undefined) {
        cookies.remove("_user", { path: "/" });
      }
      if (cookies.get("sbb") !== undefined) {
        cookies.remove("sbb", { path: "/" });
      }
      if (cookies.get("frr") !== undefined) {
        cookies.remove("frr", { path: "/" });
      }
      if (cookies.get("xss") !== undefined) {
        cookies.remove("xss", { path: "/" });
      }
    })
    .catch(() => {
      window.location.reload();
      if (cookies.get("_user") !== undefined) {
        cookies.remove("_user", { path: "/" });
      }
      if (cookies.get("sbb") !== undefined) {
        cookies.remove("sbb", { path: "/" });
      }
      if (cookies.get("frr") !== undefined) {
        cookies.remove("frr", { path: "/" });
      }
      if (cookies.get("xss") !== undefined) {
        cookies.remove("xss", { path: "/" });
      }
    });
};

//restaurant dashboard menu links
const restaurantMenuLink = (
  img,
  imgAlt,
  icon,
  infoTextColor,
  info,
  title,
  redirectTo
) => {
  return (
    <div className="col-md-6 col-lg-4 t-mb-15">
      <NavLink to={redirectTo} className="t-link product-card t-bg-white w-100">
        <div className="product-card__head w-100 text-center">
          <img src={img} alt={imgAlt} className="img-fluid" />
        </div>
        <div className="product-card__body w-100">
          <div className="product-card__add">
            <span className="product-card__add-icon">
              <span className="las la-plus"></span>
            </span>
          </div>
          <span
            className={`product-card__sub-title ${infoTextColor} text-uppercase`}
          >
            <span className={icon}></span> {info}
          </span>
          <span className="product-card__title text-capitalize">{title}</span>
        </div>
      </NavLink>
    </div>
  );
};

//manage page mobile screen link
const managePageHrefLinkMobile = (redirectTo, menuName) => {
  if (window.location.pathname === redirectTo) {
    return (
      <li
        className={`fk-sm-nav__list  ${window.location.href.includes(redirectTo) && "active"
          }`}
      >
        <NavLink
          to={{ pathname: "/refresh", state: redirectTo }}
          exact
          className={`t-link fk-sm-nav__link`}
        >
          {menuName}
        </NavLink>
      </li>
    );
  } else {
    return (
      <li
        className={`fk-sm-nav__list  ${window.location.href.includes(redirectTo) && "active"
          }`}
      >
        <NavLink to={redirectTo} exact className={`t-link fk-sm-nav__link`}>
          {menuName}
        </NavLink>
      </li>
    );
  }
};

//manage page navlink
const managePageHrefLink = (redirectTo, menuName) => {
  if (window.location.pathname === redirectTo) {
    return (
      <li className="fk-pos-nav__sub-list border-bottom">
        <NavLink
          to={{ pathname: "/refresh", state: redirectTo }}
          exact
          className={`w-100 sm-text t-text-dark btn font-weight-bold text-capitalize rounded-0 text-left ${window.location.href.includes(redirectTo) && "active"
            }`}
        >
          - {menuName}
        </NavLink>
      </li>
    );
  } else {
    return (
      <li className="fk-pos-nav__sub-list border-bottom">
        <NavLink
          to={redirectTo}
          exact
          className={`w-100 sm-text t-text-dark btn font-weight-bold text-capitalize rounded-0 text-left ${window.location.href.includes(redirectTo) && "active"
            }`}
        >
          - {menuName}
        </NavLink>
      </li>
    );
  }
};

//pagination
const pagination = (data, customFunction) => {
  return (
    <ReactPaginate
      pageCount={data && data.last_page}
      initialPage={0}
      marginPagesDisplayed={5}
      pageRangeDisplayed={2}
      onPageChange={(page) => {
        customFunction(page.selected + 1);
      }}
      breakLabel={". . ."}
      breakClassName={"px-2"}
      containerClassName={"t-list d-flex"}
      pageClassName={"t-list__item mr-0"}
      previousLabel={<i className="las la-angle-double-left"></i>}
      nextLabel={<i className="las la-angle-double-right"></i>}
      pageLinkClassName={
        "t-link t-pt-5 t-pb-5 t-pl-10 t-pr-10 paginav__link paginav__link--light border text-capitalize sm-text"
      }
      previousClassName={
        "t-link t-pt-5 t-pb-5 t-pl-10 t-pr-10 paginav__link paginav__link--light border text-capitalize sm-text"
      }
      nextClassName={
        "t-link t-pt-5 t-pb-5 t-pl-10 t-pr-10 paginav__link paginav__link--light border text-capitalize sm-text"
      }
      activeClassName={"pagination-active"}
      activeLinkClassName={"text-white"}
    />
  );
};

// pagination loading
const paginationLoading = () => {
  return <Skeleton style={{ height: "40px" }} className="card bg-white" />;
};

// modal loading
const modalLoading = (count) => {
  return (
    <SkeletonTheme color="#ff7675" highlightColor="#dfe4ea">
      <p>
        <Skeleton count={count} />
      </p>
    </SkeletonTheme>
  );
};

// manage page table loading
const tableLoading = () => {
  return (
    <SkeletonTheme color="#f1f2f6" highlightColor="#dfe4ea">
      <p>
        <Skeleton style={{ height: `calc(100vh - 222px)` }} />
      </p>
    </SkeletonTheme>
  );
};

// table loading
const pageLoading = () => {
  return (
    <SkeletonTheme color="#f1f2f6" highlightColor="#dfe4ea">
      <p>
        <Skeleton style={{ height: `calc(100vh - 187px)` }} />
      </p>
    </SkeletonTheme>
  );
};

// data count details of tables
const showingData = (data) => {
  return (
    <>
      {/* todo:: translation function call */}
      Showing {data && data.from} - {data && data.to} of {data && data.total}
    </>
  );
};

// searched data count details of table
const searchedShowingData = (data, allData) => {
  return (
    <>
      {/* todo:: translation function call */}
      Showing {data && data.list.length} of {allData && allData.length}
    </>
  );
};

//pagination of order history
const paginationOrderHistory = (data, customFunction) => {
  return (
    <ReactPaginate
      pageCount={data && data.meta.last_page}
      initialPage={0}
      marginPagesDisplayed={5}
      pageRangeDisplayed={2}
      onPageChange={(page) => {
        customFunction(page.selected + 1);
      }}
      breakLabel={". . ."}
      breakClassName={"px-2"}
      containerClassName={"t-list d-flex"}
      pageClassName={"t-list__item mr-0"}
      previousLabel={<i className="las la-angle-double-left"></i>}
      nextLabel={<i className="las la-angle-double-right"></i>}
      pageLinkClassName={
        "t-link t-pt-5 t-pb-5 t-pl-10 t-pr-10 paginav__link paginav__link--light border text-capitalize sm-text"
      }
      previousClassName={
        "t-link t-pt-5 t-pb-5 t-pl-10 t-pr-10 paginav__link paginav__link--light border text-capitalize sm-text"
      }
      nextClassName={
        "t-link t-pt-5 t-pb-5 t-pl-10 t-pr-10 paginav__link paginav__link--light border text-capitalize sm-text"
      }
      activeClassName={"pagination-active"}
      activeLinkClassName={"text-white"}
    />
  );
};

// data count details of tables of order history
const showingDataOrderHistory = (data) => {
  return (
    <>
      {/* todo:: translation function call */}
      Showing {data && data.meta.from} - {data && data.meta.to} of{" "}
      {data && data.meta.total}
    </>
  );
};

// searched data count details of table of order history
const searchedShowingDataOrderHistory = (data, allData) => {
  return (
    <>
      {/* todo:: translation function call */}
      Showing {data && data.list.length} of {allData && allData.data.length}
    </>
  );
};

//export here
export {
  // common & necessary
  _t,
  consolee,
  getCookie,
  deleteCookie,
  checkPermission,
  formatPrice,
  currencySymbolLeft,
  currencySymbolRight,
  getSystemSettings,
  // common & necessary

  //navLink
  restaurantMenuLink,
  managePageHrefLinkMobile,
  managePageHrefLink,
  //navLink

  //loading
  pageLoading,
  modalLoading,
  tableLoading,
  paginationLoading,
  //loading

  //pagination and datacounting
  pagination,
  paginationOrderHistory,
  showingData,
  searchedShowingData,
  showingDataOrderHistory,
  searchedShowingDataOrderHistory,
  //pagination and datacounting
};
/*
----------------------------------------------
                      Ends
----------------------------------------------
*/
