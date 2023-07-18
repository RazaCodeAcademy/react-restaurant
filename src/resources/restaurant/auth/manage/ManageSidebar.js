import React, { useEffect, useContext } from "react";

//jQuery initialization
import $ from "jquery";

//functions
import {
  _t,
  getCookie,
  managePageHrefLink,
  managePageHrefLinkMobile,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";
import { SettingsContext } from "../../../../contexts/Settings";



const ManageSidebar = () => {

  const { t } = useTranslation();

  const {
    showManageStock,
  } = useContext(SettingsContext);

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
              <ul className="t-list fk-sm-nav__bar flex-row">
                {/* Foods */}
                {managePageHrefLinkMobile(
                  "/dashboard/manage/food/add-new",
                  _t(t("Add new item"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/food/all-items",
                  _t(t("All Items"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/food/groups",
                  _t(t("Groups"))
                )}
                {managePageHrefLinkMobile(
                  "/dashboard/manage/food/allergies",
                  _t(t("Allergies"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/food/properties",
                  _t(t("Properties"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/food/variations",
                  _t(t("Variations"))
                )}

                {/* User Management */}
                {managePageHrefLinkMobile(
                  "/dashboard/manage/user/admin-staff",
                  _t(t("Admin / Staff"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/user/customers",
                  _t(t("Customers"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/user/delivery-men",
                  _t(t("Delivery"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/user/waiters",
                  _t(t("Waiters"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/roles-and-permissions",
                  _t(t("Role Groups"))
                )}

                {/* Restaurant */}
                {managePageHrefLinkMobile(
                  "/dashboard/manage/restaurant/branches",
                  _t(t("Branches"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/restaurant/dept-tags",
                  _t(t("Dept Tags"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/restaurant/tables",
                  _t(t("Tables"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/restaurant/payment-type",
                  _t(t("Payment Types"))
                )}
                {/* website */}
                {managePageHrefLinkMobile(
                  "/dashboard/manage/website/hero-section",
                  _t(t("Hero Section"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/website/promotions",
                  _t(t("Promotions"))
                )}

                {/* Settings */}
                {managePageHrefLinkMobile(
                  "/dashboard/manage/settings/currencies",
                  _t(t("Currencies"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/settings/languages",
                  _t(t("Languages"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/settings/smtp-settings",
                  _t(t("Email / Smtp"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/settings/pos-screen",
                  _t(t("Pos Screen"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/settings/update-system",
                  _t(t("Update System"))
                )}

                {managePageHrefLinkMobile(
                  "/dashboard/manage/settings/general-settings",
                  _t(t("General Settings"))
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
            {/* Foods */}
            <li
              className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("/food/") ? "active" : ""
                }`}
            >
              <a
                className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                rel="noopener noreferrer"
                href="#"
              >
                {_t(t("Foods"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {managePageHrefLink(
                  "/dashboard/manage/food/add-new",
                  _t(t("Add new item"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/food/all-items",
                  _t(t("All Items"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/food/groups",
                  _t(t("Groups"))
                )}
                {managePageHrefLink(
                  "/dashboard/manage/food/allergies",
                  _t(t("Allergies"))
                )}

                {/* {managePageHrefLink(
                  "/dashboard/manage/food/units",
                  _t(t("Units"))
                )} */}

                {managePageHrefLink(
                  "/dashboard/manage/food/properties",
                  _t(t("Properties"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/food/variations",
                  _t(t("Variations"))
                )}
              </ul>
            </li>

            {/* stock Management */}
            {showManageStock ? (
              <li
                className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("stock") ? "active" : ""
                  }`}
              >
                <button
                  className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                  rel="noopener noreferrer"
                  href=""
                >
                  {_t(t("Manage Stock"))}
                </button>
                <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                  {managePageHrefLink(
                    "/dashboard/manage/stock/food-purchase",
                    _t(t("Food Purchase"))
                  )}
                  {managePageHrefLink(
                    "/dashboard/manage/stock/purchase-history-food",
                    _t(t("Purchase History"))
                  )}

                  {managePageHrefLink(
                    "/dashboard/manage/stock/ingredient-group",
                    _t(t("Ingredient Group"))
                  )}
                  {managePageHrefLink(
                    "/dashboard/manage/stock/ingredient-item",
                    _t(t("Ingredient Item"))
                  )}
                  {managePageHrefLink(
                    "/dashboard/manage/stock/ingredient-purchase",
                    _t(t("Ingredient Purchase"))
                  )}
                  {managePageHrefLink(
                    "/dashboard/manage/stock/purchase-history-ingredient",
                    _t(t("Purchase History"))
                  )}
                  {/* {managePageHrefLink(
       "/dashboard/manage/stock/ingredient-return",
       _t(t("Ingredient Usage"))
     )} */}
                  {/* {managePageHrefLink(
       "/dashboard/manage/stock/ingredient-usage",
       _t(t("Ingredient Return"))
     )} */}
                  {managePageHrefLink(
                    "/dashboard/manage/stock/manage-supplier",
                    _t(t("Manage Supplier"))
                  )}
                  {managePageHrefLink(
                    "/dashboard/manage/stock/supplier-history",
                    _t(t("Supplier History"))
                  )}
                  {/* {managePageHrefLink(
       "/dashboard/manage/stock/stock-out-food",
       _t(t("Stock Out Food"))
     )}
     {managePageHrefLink(
       "/dashboard/manage/stock/stock-out-ingredient",
       _t(t("Stock Out Ingredient"))
     )} */}
                </ul>
              </li>
            ) : ''}


            {/* User Management */}
            <li
              className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("/roles") ||
                window.location.pathname.includes("/user/")
                ? "active"
                : ""
                }`}
            >
              <a
                className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                rel="noopener noreferrer"
                href="#"
              >
                {_t(t("User Management"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {managePageHrefLink(
                  "/dashboard/manage/user/admin-staff",
                  _t(t("Admin / Staff"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/user/customers",
                  _t(t("Customers"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/user/waiters",
                  _t(t("Waiters"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/roles-and-permissions",
                  _t(t("Role Groups"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/user/delivery-men",
                  _t(t("Delivery User"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/user/delivery-request",
                  _t(t("New Delivery User"))
                )}
              </ul>
            </li>

            {/* Restaurant */}
            <li
              className={`fk-pos-nav__list fk-pos-nav__list-has-sub 
              ${window.location.pathname.includes("/restaurant") ? "active" : ""
                }`}
            >
              <a
                className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                rel="noopener noreferrer"
                href="#"
              >
                {_t(t("Restaurant"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {managePageHrefLink(
                  "/dashboard/manage/restaurant/branches",
                  _t(t("Branches"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/restaurant/dept-tags",
                  _t(t("Dept Tags"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/restaurant/tables",
                  _t(t("Tables"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/restaurant/payment-type",
                  _t(t("Payment Types"))
                )}
              </ul>
            </li>

            {/* website */}
            <li
              className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("/website/") ? "active" : ""
                }`}
            >
              <a
                className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                rel="noopener noreferrer"
                href="#"
              >
                {_t(t("Website"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {managePageHrefLink(
                  "/dashboard/manage/website/hero-section",
                  _t(t("Hero Section"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/website/promotions",
                  _t(t("Promotions"))
                )}
              </ul>
            </li>

            {/* Settings */}
            <li
              className={`fk-pos-nav__list fk-pos-nav__list-has-sub ${window.location.pathname.includes("/settings/") ? "active" : ""
                }`}
            >
              <a
                className="w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase rounded-0 text-left"
                rel="noopener noreferrer"
                href="#"
              >
                {_t(t("Settings"))}
              </a>
              <ul className="t-list fk-pos-nav__sub t-bg-white list-group">
                {managePageHrefLink(
                  "/dashboard/manage/settings/currencies",
                  _t(t("Currencies"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/languages",
                  _t(t("Languages"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/smtp-settings",
                  _t(t("Email / Smtp"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/pos-screen",
                  _t(t("Pos Screen"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/setup-payment",
                  _t(t("Payment Setup"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/update-system",
                  _t(t("Update System"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/general-settings",
                  _t(t("General Settings"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/show-delivery-menu",
                  _t(t("Show Deliverymen"))
                )}

                {managePageHrefLink(
                  "/dashboard/manage/settings/show-manage-stock-menu",
                  _t(t("Show Manage Stock"))
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
      {/* Navigation for large Screen End */}
    </>
  );
};

export default ManageSidebar;
