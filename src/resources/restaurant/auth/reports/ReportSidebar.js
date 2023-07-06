import React, { useEffect, useContext } from "react";
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
import { SettingsContext } from "../../../../contexts/Settings";
const ReportSidebar = () => {
  const { t } = useTranslation();
  useEffect(() => {
    handleJquery();
  }, []);

  const {
    showManageStock,
  } = useContext(SettingsContext);

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
                {/* dashboard */}
                {managePageHrefLinkMobile(
                  "/dashboard/reports",
                  _t(t("Dashboard"))
                )}

                {/* daily */}
                {managePageHrefLinkMobile(
                  "/dashboard/daily-reports",
                  _t(t("Daily"))
                )}

                {/* monthly */}
                {managePageHrefLinkMobile(
                  "/dashboard/monthly-reports",
                  _t(t("Monthly"))
                )}

                {/* yearly */}
                {/* {managePageHrefLink(
                  "/dashboard/yearly-reports",
                  _t(t("Yearly"))
                )} */}

                {/* food item wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/food-items-reports",
                  _t(t("Item Wise"))
                )}

                {/* food group wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/food-group-reports",
                  _t(t("Group Wise"))
                )}

                {/* branch wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/branch-reports",
                  _t(t("Branch Wise"))
                )}

                {/* pos user wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/pos-user-reports",
                  _t(t("Pos User Wise"))
                )}

                {/* food item wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/dept-tag-reports",
                  _t(t("Department Wise"))
                )}

                {/* Service charge wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/service-charge-reports",
                  _t(t("Service Charge Wise"))
                )}

                {/* discount charge wise */}
                {managePageHrefLinkMobile(
                  "/dashboard/discount-reports",
                  _t(t("discount Wise"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/food-stock",
                  _t(t("Food Stock"))
                )}
                {managePageHrefLinkMobile(
                  "/dashboard/ingredient-stock",
                  _t(t("Ingredient Stock"))
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
                {_t(t("Sale's Reports"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {/* dashboard */}
                {managePageHrefLink("/dashboard/reports", _t(t("Dashboard")))}

                {/* daily */}
                {managePageHrefLink("/dashboard/daily-reports", _t(t("Daily")))}

                {/* monthly */}
                {managePageHrefLink(
                  "/dashboard/monthly-reports",
                  _t(t("Monthly"))
                )}

                {/* yearly */}
                {/* {managePageHrefLink(
                  "/dashboard/yearly-reports",
                  _t(t("Yearly"))
                )} */}

                {/* food item wise */}
                {managePageHrefLink(
                  "/dashboard/food-items-reports",
                  _t(t("Item Wise"))
                )}

                {/* food group wise */}
                {managePageHrefLink(
                  "/dashboard/food-group-reports",
                  _t(t("Group Wise"))
                )}

                {/* branch wise */}
                {managePageHrefLink(
                  "/dashboard/branch-reports",
                  _t(t("Branch Wise"))
                )}

                {/* pos user wise */}
                {managePageHrefLink(
                  "/dashboard/pos-user-reports",
                  _t(t("Pos User Wise"))
                )}

                {/* food item wise */}
                {managePageHrefLink(
                  "/dashboard/dept-tag-reports",
                  _t(t("Department Wise"))
                )}

                {/* Service charge wise */}
                {managePageHrefLink(
                  "/dashboard/service-charge-reports",
                  _t(t("Ser Charge Wise"))
                )}

                {/* discount charge wise */}
                {managePageHrefLink(
                  "/dashboard/discount-reports",
                  _t(t("discount Wise"))
                )}
              </ul>
            </li>
            {/* Stock */}
            {showManageStock ? (
              < li
                className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("stock") ? "active" : ""
                  }`}
              >
                <a
                  className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                  rel="noopener noreferrer"
                  href="#"
                >
                  {_t(t("Stocks's Reports"))}
                </a>
                <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                  {/* Stocks */}
                  {managePageHrefLink(
                    "/dashboard/food-stock",
                    _t(t("Food Stock"))
                  )}
                  {managePageHrefLink(
                    "/dashboard/ingredient-stock",
                    _t(t("Ingredient Stock"))
                  )}
                </ul>
              </li>

            ) : ''}
          </ul>
        </div>
      </div>
      {/* Navigation for large Screen End */}
    </>
  );
};

export default ReportSidebar;
