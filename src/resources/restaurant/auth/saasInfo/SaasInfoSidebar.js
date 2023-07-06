import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";

//jQuery initialization
import $ from "jquery";

//functions
import {
  _t,
  managePageHrefLink,
  managePageHrefLinkMobile,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

const SaasInfoSidebar = () => {
  const { t } = useTranslation();
  useEffect(() => {
    handleJquery();
  }, []);

  //jQuery goes here
  const handleJquery = () => {
    var posHasSub = $(".fk-pos-nav__list-has-sub");
    var posSub = $(".fk-pos-nav__sub");
    $(".fk-pos-nav__list-has-sub > a").on("click", function (e) {
      e.preventDefault();
    });
    posHasSub.on("click", function () {
      $(this).find(posSub).slideDown();
      $(this).siblings().find(posSub).slideUp();
      $(this).addClass("active").siblings().removeClass("active");
    });
  };

  return (
    <>
      {/* Navigation for Small Screen  */}
      <div className="d-lg-none">
        <div className="row">
          <div className="col-12">
            <div className="fk-sm-nav" data-simplebar>
              {/* Reports */}
              <ul className="t-list fk-sm-nav__bar flex-row">
                {/* Profile */}
                {managePageHrefLinkMobile(
                  "/dashboard/saas-profile",
                  _t(t("Profile"))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation for Small Screen  End*/}

      {/* Navigation for large Screen  */}
      <div className="d-none d-lg-block">
        <div className="fk-scroll--pos-menu" data-simplebar>
          <ul className="t-list fk-pos-nav">
            {/* Sales */}
            <li
              className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("reports") ? "active" : ""
                }`}
            >
              <a
                className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                rel="noopener noreferrer"
                href="#"
              >
                {_t(t("Saas Menu"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {/* dashboard */}
                {managePageHrefLink("/dashboard/saas-profile", _t(t("Saas Profile")))}

              </ul>
            </li>
          </ul>
        </div>
      </div>
      {/* Navigation for large Screen End */}
    </>
  );
};

export default SaasInfoSidebar;
