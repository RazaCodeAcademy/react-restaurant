import React, { useEffect, useContext, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
  modalLoading,
  pageLoading,
  paginationLoading,
  pagination,
  showingData,
  searchedShowingData,
  getSystemSettings,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Moment from "react-moment";
import { useReactToPrint } from "react-to-print";

//importing context consumer here
import { SettingsContext } from "../../../../contexts/Settings";
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { each } from "jquery";

const Settled = () => {
  //getting context values here
  const {
    //common
    loading,
    setLoading,
    generalSettings,
  } = useContext(SettingsContext);

  const {
    //submitted orders
    settledOrders,
    setSettledOrders,
    setPaginatedSettledOrders,
    settledOrdersForSearch,

    //payment-type
    paymentTypeForSearch,

    //pagination
    dataPaginating,
  } = useContext(RestaurantContext);

  const { t } = useTranslation();
  //print bills
  const componentRef = useRef();

  // States hook here
  // paidMoney
  const [paidMoney, setPaidMoney] = useState(0);
  //return
  const [returnMoneyUsd, setReturnMoneyUsd] = useState(0);

  //settle order
  const [checkOrderDetails, setCheckOrderDetails] = useState({
    item: null,
    settle: false,
    uploading: false,
    payment_type: null,
    payment_amount: null,
  });

  //search result
  const [searchedOrder, setSearchedOrder] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => { }, []);
  //show price of each item in print
  const showPriceOfEachOrderItemPrint = (thisItem) => {
    let price = 0;
    let tempPropertyPrice = 0;
    if (thisItem.properties !== null) {
      let propertyItems = JSON.parse(thisItem.properties);
      propertyItems.forEach((propertyItem, thisIndex) => {
        let temp =
          propertyItem.quantity *
          propertyItem.price_per_qty *
          thisItem.quantity;
        tempPropertyPrice = tempPropertyPrice + temp;
      });
    }
    price = thisItem.price - tempPropertyPrice;
    return formatPrice(price);
  };

  //search submitted orders here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedOrder({ ...searchedOrder, searched: false });
    } else {
      let searchedList = settledOrdersForSearch.filter((item) => {
        //token
        let lowerCaseItemToken = JSON.stringify(item.token.id);

        //customer
        let lowerCaseItemCustomer = item.customer_name.toLowerCase();

        //table
        let lowerCaseItemTable = item.table_name.toLowerCase();

        //branch
        let lowerCaseItemBranch = item.branch_name.toLowerCase();
        return (
          lowerCaseItemToken.includes(searchInput) ||
          lowerCaseItemCustomer.includes(searchInput) ||
          lowerCaseItemTable.includes(searchInput) ||
          (lowerCaseItemBranch && lowerCaseItemBranch.includes(searchInput))
        );
      });
      setSearchedOrder({
        ...searchedOrder,
        list: searchedList,
        searched: true,
      });
    }
  };

  //print here
  const handleOnlyPrint = useReactToPrint({
    content: () => componentRef.current,
  });

  //ready here
  const handleReadyOrder = (id) => {
    let tempSettledOrders = settledOrders;
    let tempSearchedItems = searchedOrder.list;
    const url = BASE_URL + "/settings/settle-order-ready/" + id;
    let theItems = settledOrders.data.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          is_ready: 1,
          orderedItems: item.orderedItems.map((eachItem) => {
            return {
              ...eachItem,
              is_cooking: 1,
              is_ready: 1,
            };
          }),
        };
      } else {
        return item;
      }
    });
    if (searchedOrder.list !== null && searchedOrder.list.length > 0) {
      let searchedItems = searchedOrder.list.map((searchedItem) => {
        if (searchedItem.id === id) {
          return {
            ...searchedItem,
            is_ready: 1,
            orderedItems: searchedItem.orderedItems.map((eachorderItem) => {
              return {
                ...eachorderItem,
                is_cooking: 1,
                is_ready: 1,
              };
            }),
          };
        } else {
          return searchedItem;
        }
      });
      setSearchedOrder({
        ...searchedOrder,
        list: searchedItems,
      });
    }
    setSettledOrders({ ...settledOrders, data: theItems });
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => { })
      .catch((error) => {
        setSettledOrders(tempSettledOrders);
        setSearchedOrder({
          ...searchedOrder,
          list: tempSearchedItems,
        });
      });
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Settled orders"))}</title>
      </Helmet>

      {/* Print bill */}
      <div className="d-none">
        <div ref={componentRef}>
          {checkOrderDetails && checkOrderDetails.item && (
            <div className="fk-print">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <span className="d-block fk-print-text font-weight-bold text-uppercase text-center sm-text">
                      {getSystemSettings(generalSettings, "siteName")}
                      {","}
                      {checkOrderDetails.item.branch_name}
                    </span>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {checkOrderDetails.item.theBranch !== null &&
                        checkOrderDetails.item.theBranch.address
                        ? checkOrderDetails.item.theBranch.address
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {_t(t("call"))}:{" "}
                      {checkOrderDetails.item.theBranch !== null &&
                        checkOrderDetails.item.theBranch.phn_no
                        ? checkOrderDetails.item.theBranch.phn_no
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_heading")}
                    </p>
                    <span className="d-block fk-print-text text-uppercase text-center lg-text myBorderTopCustomer">
                      {_t(t("Token No"))}-{checkOrderDetails.item.token.id}
                    </span>

                    <p className="mb-0 fk-print-text text-capitalize lg-text">
                      {checkOrderDetails.item.dept_tag_name}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-capitalize lg-text">
                      {checkOrderDetails.dept_tag_name}
                    </p>
                    <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize text-center">
                      {_t(t("Customer Copy"))}
                    </p>

                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("date"))}:{" "}
                      <Moment format="LL">
                        {checkOrderDetails.item.created_at}
                      </Moment>
                      {", "}
                      <Moment format="LT">
                        {checkOrderDetails.item.token.time}
                      </Moment>
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Total guests"))}:{" "}
                      {checkOrderDetails.item.total_guest}
                    </p>

                    {checkOrderDetails.item.waiter_name !== "-" && (
                      <p className="mb-0 xsm-text fk-print-text text-capitalize">
                        {_t(t("waiter name"))}:{" "}
                        {checkOrderDetails.item.waiter_name}
                      </p>
                    )}

                    <p className="mb-0 sm-text fk-print-text text-capitalize lg-text">
                      NOT PAID
                    </p>

                    <table className="table mb-0 table-borderless akash-table-for-print-padding">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="fk-print-text xsm-text text-capitalize"
                          >
                            {_t(t("qty"))} {_t(t("item"))}
                          </th>
                          <th
                            scope="col"
                            className="fk-print-text xsm-text text-capitalize text-right"
                          >
                            {_t(t("T"))}.{_t(t("price"))}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.orderedItems.map(
                            (thisItem, indexThisItem) => {
                              return (
                                <tr>
                                  <td className="fk-print-text xsm-text text-capitalize">
                                    <div className="d-flex flex-wrap">
                                      <span className="d-inline-block xsm-text">
                                        -{thisItem.quantity}{" "}
                                        {thisItem.food_item}
                                        {thisItem.variation !== null &&
                                          "(" + thisItem.variation + ")"}
                                      </span>
                                    </div>

                                    {/* properties */}
                                    {thisItem.properties !== null && (
                                      <div className="d-block">
                                        {JSON.parse(thisItem.properties).map(
                                          (propertyItem, thisIndex) => {
                                            return (
                                              <span className="text-capitalize xsm-text d-inline-block mr-1">
                                                -{thisItem.quantity}
                                                {propertyItem.quantity > 1
                                                  ? "*" + propertyItem.quantity
                                                  : ""}{" "}
                                                {propertyItem.property}
                                              </span>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    <div className="d-block xsm-text">
                                      {showPriceOfEachOrderItemPrint(thisItem)}
                                    </div>

                                    {/* properties */}
                                    {thisItem.properties !== null && (
                                      <div className="d-block">
                                        {JSON.parse(thisItem.properties).map(
                                          (propertyItem, thisIndex) => {
                                            return (
                                              <div
                                                className="d-block"
                                                className={`text-capitalize xsm-text`}
                                              >
                                                <span>
                                                  {formatPrice(
                                                    thisItem.quantity *
                                                    propertyItem.quantity *
                                                    propertyItem.price_per_qty
                                                  )}
                                                  <br />
                                                </span>
                                              </div>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </table>

                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">{_t(t("total"))}</span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {formatPrice(checkOrderDetails.item.order_bill)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {parseFloat(checkOrderDetails.item.vat) > 0 && (
                      <table className="table mb-0 table-borderless">
                        <tbody>
                          {checkOrderDetails.item.vat_system === "igst" ? (
                            <tr>
                              <th className="fk-print-text xsm-text">
                                <span className="d-block xsm-text">VAT</span>
                              </th>
                              <td className="fk-print-text xsm-text text-capitalize text-right">
                                {formatPrice(checkOrderDetails.item.vat)}
                              </td>
                            </tr>
                          ) : (
                            <>
                              <tr>
                                <th className="fk-print-text xsm-text">
                                  <span className="d-block xsm-text">CGST</span>
                                </th>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  {formatPrice(
                                    parseFloat(checkOrderDetails.item.cgst)
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th className="fk-print-text xsm-text">
                                  <span className="d-block xsm-text">SGST</span>
                                </th>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  {formatPrice(
                                    parseFloat(checkOrderDetails.item.sgst)
                                  )}
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "flat" && (
                        <>
                          {parseFloat(checkOrderDetails.item.service_charge) >
                            0 && (
                              <table className="table mb-0 table-borderless">
                                <tbody>
                                  <tr>
                                    <th className="fk-print-text xsm-text text-capitalize">
                                      <span className="d-block">
                                        {_t(t("S.Charge"))}
                                      </span>
                                    </th>

                                    <td className="fk-print-text xsm-text text-capitalize text-right">
                                      {formatPrice(
                                        checkOrderDetails.item.service_charge
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            )}

                          {parseFloat(checkOrderDetails.item.discount) > 0 && (
                            <table className="table mb-0 table-borderless">
                              <tbody>
                                <tr>
                                  <th className="fk-print-text xsm-text text-capitalize">
                                    <span className="d-block">
                                      {_t(t("discount"))}
                                    </span>
                                  </th>
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(checkOrderDetails.item.discount)}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                        </>
                      )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "percentage" && (
                        <>
                          {parseFloat(checkOrderDetails.item.service_charge) >
                            0 && (
                              <table className="table mb-0 table-borderless">
                                <tbody>
                                  <tr>
                                    <th className="fk-print-text xsm-text text-capitalize">
                                      <span className="d-block">
                                        {_t(t("S.Charge"))}
                                        {checkOrderDetails.item &&
                                          "(" +
                                          checkOrderDetails.item.service_charge +
                                          "%)"}
                                      </span>
                                    </th>

                                    <td className="fk-print-text xsm-text text-capitalize text-right">
                                      {formatPrice(
                                        checkOrderDetails.item.order_bill *
                                        (checkOrderDetails.item.service_charge /
                                          100)
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            )}

                          {parseFloat(checkOrderDetails.item.discount) > 0 && (
                            <table className="table mb-0 table-borderless">
                              <tbody>
                                <tr>
                                  <th className="fk-print-text xsm-text text-capitalize">
                                    <span className="d-block">
                                      {_t(t("discount"))}
                                      {checkOrderDetails.item &&
                                        "(" +
                                        checkOrderDetails.item.discount +
                                        "%)"}
                                    </span>
                                  </th>
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(
                                      checkOrderDetails.item.order_bill *
                                      (checkOrderDetails.item.discount / 100)
                                    )}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          )}
                        </>
                      )}

                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("grand total"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {formatPrice(checkOrderDetails.item.total_payable)}
                          </td>
                        </tr>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("Return Amount"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {checkOrderDetails.item.paid_amount -
                              checkOrderDetails.item.total_payable >
                              0
                              ? formatPrice(
                                parseFloat(
                                  checkOrderDetails.item.paid_amount -
                                  checkOrderDetails.item.total_payable
                                )
                              )
                              : formatPrice(0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="myBorder"></div>
                    <p className="mb-0 xsm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_footer")}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize text-center">
                      {_t(t("bill prepared by"))}:{" "}
                      {checkOrderDetails.item &&
                        checkOrderDetails.item.user_name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settle modal */}
      <div className="modal fade" id="orderDetails" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {/* show order token on modal header */}
                  {_t(t("Order details, Token"))}: #
                  {checkOrderDetails.item && checkOrderDetails.item.token.id}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {/* if loading true show loading effect */}
            {loading ? (
              <div className="modal-body">{modalLoading(5)}</div>
            ) : (
              <div className="modal-body">
                {checkOrderDetails.item &&
                  parseInt(checkOrderDetails.item.is_settled) === 0 ? (
                  // if this item is not settled then show settle-cancel button
                  <>
                    {checkOrderDetails.item &&
                      parseInt(checkOrderDetails.item.is_cancelled) !== 1 && (
                        <div className="text-right">
                          {checkOrderDetails.settle &&
                            paidMoney >
                            parseFloat(
                              checkOrderDetails.item.total_payable
                            ) && (
                              <span className="mr-2 text-secondary font-weight-bold">
                                Return: {currencySymbolLeft()}
                                {formatPrice(returnMoneyUsd)}
                                {currencySymbolRight()}{" "}
                              </span>
                            )}
                          {checkOrderDetails.settle ? (
                            <button
                              className="btn btn-primary px-3 rounded-md text-uppercase"
                              onClick={() => {
                                setCheckOrderDetails({
                                  ...checkOrderDetails,
                                  settle: false,
                                  payment_amount: null,
                                  payment_type: null,
                                });
                                setReturnMoneyUsd(0);
                                setPaidMoney(0);
                              }}
                            >
                              {_t(t("Cancel"))}
                            </button>
                          ) : (
                            <button
                              className="btn btn-success px-3 rounded-md text-uppercase"
                              onClick={() => {
                                setCheckOrderDetails({
                                  ...checkOrderDetails,
                                  settle: true,
                                  payment_amount: null,
                                  payment_type: null,
                                });
                                setReturnMoneyUsd(0);
                                setPaidMoney(0);
                              }}
                            >
                              {_t(t("Settle order"))}
                            </button>
                          )}
                        </div>
                      )}
                  </>
                ) : (
                  // if this item is not settled then show settle-cancel button else, show this notification
                  ""
                )}
                {checkOrderDetails.item &&
                  //show this if order is cancelled
                  parseInt(checkOrderDetails.item.is_cancelled) === 1 && (
                    <div className="text-center bg-secondary text-white py-2">
                      {_t(t("This order has been cancelled"))}
                    </div>
                  )}
                {/* show this if order settle is not true, if true show payment input field */}
                {!checkOrderDetails.settle ? (
                  <div class="col-12 filtr-item">
                    <div class="fk-order-token t-bg-white">
                      <div class="fk-order-token__body">
                        <div class="fk-addons-table">
                          <div class="fk-addons-table__head text-center">
                            {_t(t("order token"))}: #
                            {checkOrderDetails.item &&
                              checkOrderDetails.item.token.id}
                          </div>
                          <div class="fk-addons-table__info">
                            <div class="row g-0">
                              <div class="col-2 text-center border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("S/L"))}
                                </span>
                              </div>
                              <div class="col-3 text-center border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("food"))}
                                </span>
                              </div>
                              <div class="col-4 text-left pl-2 border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("Additional Info"))}
                                </span>
                              </div>
                              <div class="col-2 text-center border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("QTY"))}
                                </span>
                              </div>
                              <div class="col-1 text-center">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("Status"))}
                                </span>
                              </div>
                            </div>
                          </div>
                          {checkOrderDetails.item &&
                            checkOrderDetails.item.orderedItems.map(
                              (thisItem, indexThisItem) => {
                                return (
                                  <div class="fk-addons-table__body-row">
                                    <div class="row g-0">
                                      <div class="col-2 text-center border-right d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {indexThisItem + 1}
                                        </span>
                                      </div>
                                      <div class="col-3 text-center border-right d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {thisItem.food_item} (
                                          {thisItem.food_group})
                                        </span>
                                      </div>
                                      <div class="col-4 text-center border-right t-pl-10 t-pr-10">
                                        {thisItem.variation !== null && (
                                          <span class="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                            <span class="font-weight-bold mr-1">
                                              {_t(t("variation"))}:
                                            </span>
                                            {thisItem.variation}
                                          </span>
                                        )}

                                        {thisItem.properties !== null && (
                                          <span class="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                            <span class="font-weight-bold mr-1">
                                              {_t(t("properties"))}:
                                            </span>
                                            {JSON.parse(
                                              thisItem.properties
                                            ).map((propertyItem, thisIndex) => {
                                              if (
                                                thisIndex !==
                                                JSON.parse(thisItem.properties)
                                                  .length -
                                                1
                                              ) {
                                                return (
                                                  propertyItem.property +
                                                  `${propertyItem.quantity > 1
                                                    ? "(" +
                                                    propertyItem.quantity +
                                                    ")"
                                                    : ""
                                                  }` +
                                                  ", "
                                                );
                                              } else {
                                                return (
                                                  propertyItem.property +
                                                  `${propertyItem.quantity > 1
                                                    ? "(" +
                                                    propertyItem.quantity +
                                                    ")"
                                                    : ""
                                                  }`
                                                );
                                              }
                                            })}
                                          </span>
                                        )}
                                      </div>
                                      <div class="col-2 text-center border-right d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {thisItem.quantity}
                                        </span>
                                      </div>

                                      <div class="col-1 text-center d-flex">
                                        <label class="mx-checkbox mx-checkbox--empty m-auto">
                                          <span class="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text">
                                            {parseInt(thisItem.is_cooking) ===
                                              1 ? (
                                              [
                                                parseInt(thisItem.is_ready) ===
                                                  1 ? (
                                                  <i
                                                    className="fa fa-check text-success"
                                                    title={_t(t("Ready"))}
                                                  ></i>
                                                ) : (
                                                  <i
                                                    className="fa fa-cutlery text-secondary"
                                                    title={_t(t("Cooking"))}
                                                  ></i>
                                                ),
                                              ]
                                            ) : (
                                              <i
                                                className="fa fa-times text-primary"
                                                title={_t(t("Pending"))}
                                              ></i>
                                            )}
                                          </span>
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
                <table className="table table-striped table-sm text-center mt-3">
                  <thead className="bg-info text-white text-uppercase">
                    <tr>
                      <th scope="col" colSpan="2">
                        {_t(t("Order details"))}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Received by"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.user_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Customer"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.customer_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Branch"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.branch_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Department"))}
                      </td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.dept_tag_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Table"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.table_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Waiter"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.waiter_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Subtotal"))}</td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(checkOrderDetails.item.order_bill)}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

                    {checkOrderDetails.item &&
                      checkOrderDetails.item.vat_system === "igst" ? (
                      <tr>
                        <td className="text-capitalized">{_t(t("VAT"))}</td>
                        <td>
                          {checkOrderDetails.item && (
                            <>
                              {currencySymbolLeft()}
                              {formatPrice(checkOrderDetails.item.vat)}
                              {currencySymbolRight()}
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <>
                        <tr>
                          <td className="text-capitalized">{_t(t("CGST"))}</td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  parseFloat(checkOrderDetails.item.cgst)
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-capitalized">{_t(t("SGST"))}</td>
                          <td>
                            {checkOrderDetails.item && (
                              <>
                                {currencySymbolLeft()}
                                {formatPrice(
                                  parseFloat(checkOrderDetails.item.sgst)
                                )}
                                {currencySymbolRight()}
                              </>
                            )}
                          </td>
                        </tr>
                      </>
                    )}

                    {/* sdiscount */}
                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "flat" && (
                        <>
                          <tr>
                            <td className="text-capitalized">
                              {_t(t("Service charge"))}
                            </td>
                            <td>
                              {checkOrderDetails.item && (
                                <>
                                  {currencySymbolLeft()}
                                  {formatPrice(
                                    checkOrderDetails.item.service_charge
                                  )}
                                  {currencySymbolRight()}
                                </>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-capitalized">
                              {_t(t("Discount"))}
                            </td>
                            <td>
                              {checkOrderDetails.item && (
                                <>
                                  {currencySymbolLeft()}
                                  {formatPrice(checkOrderDetails.item.discount)}
                                  {currencySymbolRight()}
                                </>
                              )}
                            </td>
                          </tr>
                        </>
                      )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "percentage" && (
                        <>
                          <tr>
                            <td className="text-capitalized">
                              {_t(t("Service charge"))}
                              {checkOrderDetails.item &&
                                "(" +
                                checkOrderDetails.item.service_charge +
                                "%)"}
                            </td>
                            <td>
                              {checkOrderDetails.item && (
                                <>
                                  {currencySymbolLeft()}
                                  {formatPrice(
                                    checkOrderDetails.item.order_bill *
                                    (checkOrderDetails.item.service_charge /
                                      100)
                                  )}
                                  {currencySymbolRight()}
                                </>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-capitalized">
                              {_t(t("Discount"))}
                              {checkOrderDetails.item &&
                                "(" + checkOrderDetails.item.discount + "%)"}
                            </td>
                            <td>
                              {checkOrderDetails.item && (
                                <>
                                  {currencySymbolLeft()}
                                  {formatPrice(
                                    checkOrderDetails.item.order_bill *
                                    (checkOrderDetails.item.discount / 100)
                                  )}
                                  {currencySymbolRight()}
                                </>
                              )}
                            </td>
                          </tr>
                        </>
                      )}
                    {/* sDiscount */}
                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Department Commission"))}
                      </td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(
                              checkOrderDetails.item.dept_commission
                            )}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Total bill"))}
                      </td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(checkOrderDetails.item.total_payable)}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Paid amount"))}
                      </td>
                      <td>
                        {checkOrderDetails.item && (
                          <>
                            {currencySymbolLeft()}
                            {formatPrice(checkOrderDetails.item.paid_amount)}
                            {currencySymbolRight()}
                          </>
                        )}
                      </td>
                    </tr>

                    {checkOrderDetails.item &&
                      parseFloat(
                        checkOrderDetails.item.total_payable -
                        checkOrderDetails.item.paid_amount
                      ) >= 0 ? (
                      <tr>
                        <td className="text-capitalized">
                          {_t(t("Due amount"))}
                        </td>
                        <td>
                          {checkOrderDetails.item && (
                            <>
                              {currencySymbolLeft()}
                              {formatPrice(
                                parseFloat(
                                  checkOrderDetails.item.total_payable -
                                  checkOrderDetails.item.paid_amount
                                )
                              )}
                              {currencySymbolRight()}
                            </>
                          )}
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td className="text-capitalized">
                          {_t(t("Return amount"))}
                        </td>
                        <td>
                          {checkOrderDetails.item && (
                            <>
                              {currencySymbolLeft()}
                              {formatPrice(
                                parseFloat(
                                  checkOrderDetails.item.paid_amount -
                                  checkOrderDetails.item.total_payable
                                )
                              )}
                              {currencySymbolRight()}
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Settle modal Ends*/}

      {/* main body */}
      <main id="main" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            <div className="col-12 t-mb-30 mb-lg-0">
              {checkOrderDetails.uploading === true || loading === true ? (
                pageLoading()
              ) : (
                <div className="t-bg-white ">
                  {/* next page data spin loading */}
                  <div className={`${dataPaginating && "loading"}`}></div>
                  {/* spin loading ends */}
                  <div className="row gx-2 align-items-center t-pt-15 t-pb-15 t-pl-15 t-pr-15 t-shadow">
                    <div className="col-12 t-mb-15">
                      <ul className="t-list fk-breadcrumb">
                        <li className="fk-breadcrumb__list">
                          <span className="t-link fk-breadcrumb__link text-capitalize">
                            {!searchedOrder.searched
                              ? _t(t("Settled orders"))
                              : _t(t("Search Result"))}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                      <ul className="t-list fk-sort align-items-center">
                        <div className="input-group col">
                          <div className="form-file">
                            <input
                              type="text"
                              className="form-control border-0 form-control--light-1 rounded-0"
                              placeholder={
                                _t(t("Search by token, customer, branch")) +
                                ".."
                              }
                              onChange={handleSearch}
                            />
                          </div>
                          <button className="btn btn-primary" type="button">
                            <i className="fa fa-search" aria-hidden="true"></i>
                          </button>
                        </div>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-7">
                      <div className="row align-items-center gx-2">
                        <div className="col"></div>
                        <div className="col">
                          <NavLink
                            to="/dashboard/pos"
                            className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-secondary xsm-text text-uppercase text-center w-100"
                          >
                            {_t(t("POS"))}
                          </NavLink>
                        </div>
                        <div className="col">
                          <NavLink
                            to="/dashboard/pos/submitted"
                            className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-primary xsm-text text-uppercase text-center w-100"
                          >
                            {_t(t("Submitted"))}
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="fk-scroll--order-history" data-simplebar>
                    <div className="t-pl-15 t-pr-15">
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover min-table-height mt-4">
                          <thead className="align-middle">
                            <tr>
                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("S/L"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Token"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Time"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Customer"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Table"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Branch"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Status"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Action"))}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="align-middle">
                            {/* loop here, logic === !search && haveData && haveDataLegnth > 0*/}
                            {!searchedOrder.searched
                              ? [
                                settledOrders && [
                                  settledOrders.data.length === 0 ? (
                                    <tr className="align-middle">
                                      <td
                                        scope="row"
                                        colSpan="8"
                                        className="xsm-text align-middle text-center"
                                      >
                                        {_t(t("No data available"))}
                                      </td>
                                    </tr>
                                  ) : (
                                    settledOrders.data.map((item, index) => {
                                      return (
                                        <tr
                                          className="align-middle"
                                          key={index}
                                        >
                                          <th
                                            scope="row"
                                            className="xsm-text text-capitalize align-middle text-center"
                                          >
                                            {index +
                                              1 +
                                              (settledOrders.current_page -
                                                1) *
                                              settledOrders.per_page}
                                          </th>

                                          <td className="xsm-text text-capitalize align-middle text-center text-secondary">
                                            #{item.token.id}
                                          </td>

                                          <td className="xsm-text text-capitalize align-middle text-center">
                                            <Moment format="LT">
                                              {item.token.time}
                                            </Moment>
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.customer_name}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.table_name}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.branch_name || "-"}
                                          </td>

                                          <td class="xsm-text text-capitalize align-middle text-center">
                                            {parseInt(item.is_cancelled) ===
                                              0 ? (
                                              [
                                                parseInt(item.is_ready) ===
                                                  0 ? (
                                                  <span
                                                    class="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                      });
                                                      setReturnMoneyUsd(0);
                                                      setPaidMoney(0);
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("processing"))}
                                                  </span>
                                                ) : (
                                                  <span
                                                    class="btn btn-transparent btn-success xsm-text text-capitalize px-4"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                      });
                                                      setReturnMoneyUsd(0);
                                                      setPaidMoney(0);
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("Ready"))}
                                                  </span>
                                                ),
                                              ]
                                            ) : (
                                              <span
                                                class="btn btn-transparent btn-primary xsm-text text-capitalize px-3"
                                                onClick={() => {
                                                  setCheckOrderDetails({
                                                    ...checkOrderDetails,
                                                    item: item,
                                                    settle: false,
                                                  });
                                                  setReturnMoneyUsd(0);
                                                  setPaidMoney(0);
                                                }}
                                                data-toggle="modal"
                                                data-target="#orderDetails"
                                              >
                                                {_t(t("Cancelled"))}
                                              </span>
                                            )}
                                          </td>
                                          <td className="xsm-text align-middle text-center">
                                            <button
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => {
                                                setCheckOrderDetails({
                                                  ...checkOrderDetails,
                                                  item: item,
                                                  settle: false,
                                                });
                                                handleOnlyPrint();
                                              }}
                                            >
                                              <i className="fa fa-print"></i>
                                            </button>

                                            {parseInt(item.is_ready) ===
                                              0 && (
                                                <button
                                                  className="btn btn-success btn-sm ml-2"
                                                  title="Served"
                                                  onClick={() => {
                                                    handleReadyOrder(item.id);
                                                  }}
                                                >
                                                  <i className="fa fa-check text-"></i>
                                                </button>
                                              )}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ),
                                ],
                              ]
                              : [
                                /* searched data, logic === haveData*/
                                searchedOrder && [
                                  searchedOrder.list.length === 0 ? (
                                    <tr className="align-middle">
                                      <td
                                        scope="row"
                                        colSpan="8"
                                        className="xsm-text align-middle text-center"
                                      >
                                        {_t(t("No data available"))}
                                      </td>
                                    </tr>
                                  ) : (
                                    searchedOrder.list.map((item, index) => {
                                      return (
                                        <tr
                                          className="align-middle"
                                          key={index}
                                        >
                                          <th
                                            scope="row"
                                            className="xsm-text text-capitalize align-middle text-center"
                                          >
                                            {index +
                                              1 +
                                              (settledOrders.current_page -
                                                1) *
                                              settledOrders.per_page}
                                          </th>

                                          <td className="xsm-text text-capitalize align-middle text-center text-secondary">
                                            #{item.token.id}
                                          </td>

                                          <td className="xsm-text text-capitalize align-middle text-center">
                                            <Moment format="LT">
                                              {item.token.time}
                                            </Moment>
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.customer_name}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.table_name}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.branch_name || "-"}
                                          </td>

                                          <td class="xsm-text text-capitalize align-middle text-center">
                                            {parseInt(item.is_cancelled) ===
                                              0 ? (
                                              [
                                                parseInt(item.is_ready) ===
                                                  0 ? (
                                                  <span
                                                    class="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                      });
                                                      setReturnMoneyUsd(0);
                                                      setPaidMoney(0);
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("processing"))}
                                                  </span>
                                                ) : (
                                                  <span
                                                    class="btn btn-transparent btn-success xsm-text text-capitalize px-4"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                      });
                                                      setReturnMoneyUsd(0);
                                                      setPaidMoney(0);
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("Ready"))}
                                                  </span>
                                                ),
                                              ]
                                            ) : (
                                              <span
                                                class="btn btn-transparent btn-primary xsm-text text-capitalize px-3"
                                                onClick={() => {
                                                  setCheckOrderDetails({
                                                    ...checkOrderDetails,
                                                    item: item,
                                                    settle: false,
                                                  });
                                                  setReturnMoneyUsd(0);
                                                  setPaidMoney(0);
                                                }}
                                                data-toggle="modal"
                                                data-target="#orderDetails"
                                              >
                                                {_t(t("Cancelled"))}
                                              </span>
                                            )}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            <button
                                              className="btn btn-secondary btn-sm"
                                              onClick={() => {
                                                setCheckOrderDetails({
                                                  ...checkOrderDetails,
                                                  item: item,
                                                  settle: false,
                                                });
                                                handleOnlyPrint();
                                              }}
                                            >
                                              <i className="fa fa-print"></i>
                                            </button>
                                            {parseInt(item.is_ready) ===
                                              0 && (
                                                <button
                                                  className="btn btn-success btn-sm ml-2"
                                                  title="Served"
                                                  onClick={() => {
                                                    handleReadyOrder(item.id);
                                                  }}
                                                >
                                                  <i className="fa fa-check text-"></i>
                                                </button>
                                              )}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ),
                                ],
                              ]}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* pagination loading effect */}
              {checkOrderDetails.uploading === true || loading === true
                ? paginationLoading()
                : [
                  // logic === !searched
                  !searchedOrder.searched ? (
                    <div key="fragment4">
                      <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                        <div className="row align-items-center t-pl-15 t-pr-15">
                          <div className="col-md-7 t-mb-15 mb-md-0">
                            {/* pagination function */}
                            {pagination(
                              settledOrders,
                              setPaginatedSettledOrders
                            )}
                          </div>
                          <div className="col-md-5">
                            <ul className="t-list d-flex justify-content-md-end align-items-center">
                              <li className="t-list__item">
                                <span className="d-inline-block sm-text">
                                  {showingData(settledOrders)}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // if searched
                    <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                      <div className="row align-items-center t-pl-15 t-pr-15">
                        <div className="col-md-7 t-mb-15 mb-md-0">
                          <ul className="t-list d-flex">
                            <li className="t-list__item no-pagination-style">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  setSearchedOrder({
                                    ...searchedOrder,
                                    searched: false,
                                  })
                                }
                              >
                                {_t(t("Clear Search"))}
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="col-md-5">
                          <ul className="t-list d-flex justify-content-md-end align-items-center">
                            <li className="t-list__item">
                              <span className="d-inline-block sm-text">
                                {searchedShowingData(
                                  searchedOrder,
                                  settledOrdersForSearch
                                )}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ),
                ]}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Settled;
