import React, { useEffect, useContext, useState } from "react";
import { NavLink, Link } from "react-router-dom";
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

//importing context consumer here
import { UserContext } from "../../../../contexts/User";
import { SettingsContext } from "../../../../contexts/Settings";
import { RestaurantContext } from "../../../../contexts/Restaurant";

const Submitted = () => {
  //getting context values here
  const {
    //common
    loading,
    setLoading,
    generalSettings,
  } = useContext(SettingsContext);

  const {
    //submitted orders
    submittedOrders,
    setPaginatedSubmittedOrders,
    submittedOrdersForSearch,

    //payment-type
    paymentTypeForSearch,

    //pagination
    dataPaginating,
  } = useContext(RestaurantContext);

  const { t } = useTranslation();

  // States hook here

  // show settle
  const [showSettle, setShowSettle] = useState(false);

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

  //payment type
  const handleSetpaymentType = (payment_type) => {
    setCheckOrderDetails({
      ...checkOrderDetails,
      payment_type,
    });

    //calculate paid amount to set return amount
    handleCalculatePaid(checkOrderDetails.payment_amount, payment_type);
  };

  //payment type for screen 2
  const handleSetpaymentTypeSingle = (payment_type) => {
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    let theUsdPaid = paidMoney / localCurrency.rate;
    if (checkOrderDetails && checkOrderDetails.item !== null) {
      if (
        theUsdPaid <
        checkOrderDetails.item.total_payable -
        checkOrderDetails.item.paid_amount
      ) {
        setReturnMoneyUsd(0);
        toast.error(
          `${_t(
            t("Please enter paid amount atleast equal to the total bill amount")
          )}`,
          {
            position: "bottom-center",
            closeButton: false,
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          }
        );
      } else {
        setCheckOrderDetails({
          ...checkOrderDetails,
          payment_type: [payment_type],
        });
        let theReturnMoney =
          theUsdPaid -
          (checkOrderDetails.item.total_payable -
            checkOrderDetails.item.paid_amount);
        setReturnMoneyUsd(theReturnMoney);
      }
    }
  };

  //payment type amount
  const handlePaymentTypeAmount = (e) => {
    let tempPaymentAmount = {
      ...checkOrderDetails.payment_amount,
      [e.target.name]: e.target.value,
    };

    setCheckOrderDetails({
      ...checkOrderDetails,
      payment_amount: tempPaymentAmount,
    });

    //calculate paid amount to set return amount
    handleCalculatePaid(tempPaymentAmount, checkOrderDetails.payment_type);
  };

  //calculate paid amount
  const handleCalculatePaid = (paymentAmount, paymentType) => {
    let paidAmount = 0;
    if (paymentAmount !== null && paymentType !== null) {
      let thePaymentArray = [];
      if (paymentAmount) {
        thePaymentArray = Object.entries(paymentAmount);
      }
      thePaymentArray.map((eachPaymentItem) => {
        let thePaymentType = paymentType.find((paymentTypeItem) => {
          return paymentTypeItem.id === parseInt(eachPaymentItem[0]);
        });
        if (eachPaymentItem[1] !== "") {
          if (
            thePaymentType &&
            thePaymentType.id === parseInt(eachPaymentItem[0])
          ) {
            paidAmount = paidAmount + parseFloat(eachPaymentItem[1]);
          }
        }
      });
      let localCurrency = JSON.parse(localStorage.getItem("currency"));
      paidAmount = paidAmount / localCurrency.rate;
      let theReturnMoney = 0;
      if (checkOrderDetails.item) {
        theReturnMoney =
          paidAmount - parseFloat(checkOrderDetails.item.total_payable);
      }
      setReturnMoneyUsd(theReturnMoney);
    } else {
      setReturnMoneyUsd(0);
    }
    setPaidMoney(paidAmount);
  };

  // handleSettleOrder
  const handleSettleOrder = (e) => {
    e.preventDefault();
    if (checkOrderDetails && checkOrderDetails.payment_type !== null) {
      setLoading(true);
      if (
        paidMoney <
        parseFloat(
          checkOrderDetails.item.total_payable -
          checkOrderDetails.item.paid_amount
        )
      ) {
        setLoading(false);
        toast.error(
          `${_t(
            t("Please enter paid amount atleast equal to the total due amount")
          )}`,
          {
            position: "bottom-center",
            closeButton: false,
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          }
        );
      } else {
        handleSettleOrderAxiosReq();
      }
    } else {
      toast.error(`${_t(t("Please select a payment method"))}`, {
        position: "bottom-center",
        closeButton: false,
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //settle order server request
  const handleSettleOrderAxiosReq = () => {
    let url = BASE_URL + "/settings/settle-submitted-order";
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    let formData = {
      order_group_id: checkOrderDetails.item.id,
      payment_type: checkOrderDetails.payment_type,
      payment_amount: checkOrderDetails.payment_amount,
      paidMoney:
        getSystemSettings(generalSettings, "pos_screen") === "0"
          ? paidMoney
          : paidMoney / localCurrency.rate,
      localCurrency: localCurrency,
    };
    axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data !== "paymentIssue") {
          setCheckOrderDetails({
            ...checkOrderDetails,
            item: res.data[2],
            payment_type: null,
            payment_amount: null,
            settle: false,
          });
          setSearchedOrder({
            ...searchedOrder,
            searched: false,
          });
          setPaidMoney("");
          setLoading(false);
          setShowSettle(false);
        } else {
          setLoading(false);
          toast.error(
            `${_t(
              t(
                "Please enter paid amount atleast equal to the total due amount"
              )
            )}`,
            {
              position: "bottom-center",
              closeButton: false,
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            }
          );
        }
      })
      .catch(() => {
        setLoading(false);
        toast.error(`${_t(t("Please try again"))}`, {
          position: "bottom-center",
          closeButton: false,
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //search submitted orders here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedOrder({ ...searchedOrder, searched: false });
    } else {
      let searchedList = submittedOrdersForSearch.filter((item) => {
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

  //cancel order confirmation modal
  const handleCancelOrderConfirmation = (orderGroup) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">
              {_t(t("You want to cancel this order?"))}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleCancelOrder(orderGroup);
                  onClose();
                }}
              >
                {_t(t("Yes, cancel it!"))}
              </button>
              <button className="btn btn-success ml-2 px-3" onClick={onClose}>
                {_t(t("No"))}
              </button>
            </div>
          </div>
        );
      },
    });
  };

  //cancel order here
  const handleCancelOrder = (orderGroup) => {
    if (parseInt(orderGroup.is_accepted) === 0) {
      let url = BASE_URL + "/settings/cancel-submitted-order";
      let formData = {
        id: orderGroup.id,
      };
      setLoading(true);
      axios
        .post(url, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setLoading(false);
          if (res.data === "accepted") {
            toast.error(
              `${_t(t("Can not cancel this order, this is being cooked"))}`,
              {
                position: "bottom-center",
                closeButton: false,
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              }
            );
          }
        })
        .catch(() => {
          setLoading(false);
          toast.error(`${_t(t("Please try again"))}`, {
            position: "bottom-center",
            closeButton: false,
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        });
    } else {
      toast.error(
        `${_t(t("Can not cancel this order, this is being cooked"))}`,
        {
          position: "bottom-center",
          closeButton: false,
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        }
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Submitted orders"))}</title>
      </Helmet>
      <div className={showSettle && "d-none"}>
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
                                  setPaidMoney("");
                                }}
                              >
                                {_t(t("Cancel"))}
                              </button>
                            ) : (
                              <>
                                {getSystemSettings(
                                  generalSettings,
                                  "pos_screen"
                                ) === "0" ? (
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
                                      setPaidMoney("");
                                    }}
                                  >
                                    {_t(t("Settle order"))}
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-success px-3 rounded-md text-uppercase"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => {
                                      setCheckOrderDetails({
                                        ...checkOrderDetails,
                                        settle: false,
                                        payment_amount: null,
                                        payment_type: null,
                                      });
                                      setReturnMoneyUsd(0);
                                      setPaidMoney("");
                                      setShowSettle(true);
                                    }}
                                  >
                                    {_t(t("Settle order"))}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                    </>
                  ) : (
                    // if this item is not settled then show settle-cancel button else, show this notification
                    <div className="text-center bg-success text-white py-2">
                      {_t(t("Order has been settled, you can close this now"))}
                    </div>
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
                    <div className="col-12 filtr-item">
                      <div className="fk-order-token t-bg-white">
                        <div className="fk-order-token__body">
                          <div className="fk-addons-table">
                            <div className="fk-addons-table__head text-center">
                              {_t(t("order token"))}: #
                              {checkOrderDetails.item &&
                                checkOrderDetails.item.token.id}
                            </div>
                            <div className="fk-addons-table__info">
                              <div className="row g-0">
                                <div className="col-2 text-center border-right">
                                  <span className="fk-addons-table__info-text text-capitalize">
                                    {_t(t("S/L"))}
                                  </span>
                                </div>
                                <div className="col-3 text-center border-right">
                                  <span className="fk-addons-table__info-text text-capitalize">
                                    {_t(t("food"))}
                                  </span>
                                </div>
                                <div className="col-4 text-left pl-2 border-right">
                                  <span className="fk-addons-table__info-text text-capitalize">
                                    {_t(t("Additional Info"))}
                                  </span>
                                </div>
                                <div className="col-2 text-center border-right">
                                  <span className="fk-addons-table__info-text text-capitalize">
                                    {_t(t("QTY"))}
                                  </span>
                                </div>
                                <div className="col-1 text-center">
                                  <span className="fk-addons-table__info-text text-capitalize">
                                    {_t(t("Status"))}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {checkOrderDetails.item &&
                              checkOrderDetails.item.orderedItems.map(
                                (thisItem, indexThisItem) => {
                                  return (
                                    <div className="fk-addons-table__body-row">
                                      <div className="row g-0">
                                        <div className="col-2 text-center border-right d-flex">
                                          <span className="fk-addons-table__info-text text-capitalize m-auto">
                                            {indexThisItem + 1}
                                          </span>
                                        </div>
                                        <div className="col-3 text-center border-right d-flex">
                                          <span className="fk-addons-table__info-text text-capitalize m-auto">
                                            {thisItem.food_item} (
                                            {thisItem.food_group})
                                          </span>
                                        </div>
                                        <div className="col-4 text-center border-right t-pl-10 t-pr-10">
                                          {thisItem.variation !== null && (
                                            <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                              <span className="font-weight-bold mr-1">
                                                {_t(t("variation"))}:
                                              </span>
                                              {thisItem.variation}
                                            </span>
                                          )}

                                          {thisItem.properties !== null && (
                                            <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                              <span className="font-weight-bold mr-1">
                                                {_t(t("properties"))}:
                                              </span>
                                              {JSON.parse(
                                                thisItem.properties
                                              ).map(
                                                (propertyItem, thisIndex) => {
                                                  if (
                                                    thisIndex !==
                                                    JSON.parse(
                                                      thisItem.properties
                                                    ).length -
                                                    1
                                                  ) {
                                                    return (
                                                      propertyItem.property +
                                                      `${propertyItem.quantity >
                                                        1
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
                                                      `${propertyItem.quantity >
                                                        1
                                                        ? "(" +
                                                        propertyItem.quantity +
                                                        ")"
                                                        : ""
                                                      }`
                                                    );
                                                  }
                                                }
                                              )}
                                            </span>
                                          )}
                                        </div>
                                        <div className="col-2 text-center border-right d-flex">
                                          <span className="fk-addons-table__info-text text-capitalize m-auto">
                                            {thisItem.quantity}
                                          </span>
                                        </div>

                                        <div className="col-1 text-center d-flex">
                                          <label className="mx-checkbox mx-checkbox--empty m-auto">
                                            <span className="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text">
                                              {parseInt(thisItem.is_cooking) ===
                                                1 ? (
                                                [
                                                  parseInt(
                                                    thisItem.is_ready
                                                  ) === 1 ? (
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
                    <div className="my-2 payment-type-parent">
                      <Select
                        options={paymentTypeForSearch && paymentTypeForSearch}
                        components={makeAnimated()}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.name}
                        classNamePrefix="select"
                        className="xsm-text"
                        backspaceRemovesValue={false}
                        onChange={handleSetpaymentType}
                        maxMenuHeight="200px"
                        isMulti
                        clearIndicator={null}
                        placeholder={_t(t("Select payment methods")) + ".."}
                      />
                      {checkOrderDetails.payment_type !== null && (
                        <form
                          className="border my-2 change-background rounded-lg"
                          onSubmit={handleSettleOrder}
                        >
                          <div className="sm-text text-center text-white py-2">
                            {_t(t("Amount"))}
                          </div>
                          {checkOrderDetails.payment_type.map(
                            (eachPaymentType, paymentTypeIndex) => {
                              return (
                                <div className="addons-list__item mx-2 mb-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    name={eachPaymentType.id}
                                    autoComplete="off"
                                    className="form-control xsm-text pl-2"
                                    onChange={handlePaymentTypeAmount}
                                    placeholder={eachPaymentType.name}
                                    value={
                                      checkOrderDetails.payment_amount &&
                                      checkOrderDetails.payment_amount[
                                      eachPaymentType.id
                                      ]
                                    }
                                  />
                                </div>
                              );
                            }
                          )}
                          <div className="pb-2 pl-2 my-2">
                            <button
                              className="btn btn-sm btn-warning text-dark px-3 text-uppercase"
                              type="submit"
                            >
                              {_t(t("Settle order"))}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
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
                        <td className="text-capitalized">
                          {_t(t("Customer"))}
                        </td>
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
                        <td className="text-capitalized">
                          {_t(t("Subtotal"))}
                        </td>
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
                            <td className="text-capitalized">
                              {_t(t("CGST"))}
                            </td>
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
                            <td className="text-capitalized">
                              {_t(t("SGST"))}
                            </td>
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
                              {formatPrice(
                                checkOrderDetails.item.total_payable
                              )}
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
                                ? _t(t("Submitted orders"))
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
                              <i
                                className="fa fa-search"
                                aria-hidden="true"
                              ></i>
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
                              to="/dashboard/pos/settled"
                              className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-success xsm-text text-uppercase text-center w-100"
                            >
                              {_t(t("Settled"))}
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
                                  submittedOrders && [
                                    submittedOrders.data.length === 0 ? (
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
                                      submittedOrders.data.map(
                                        (item, index) => {
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
                                                  (submittedOrders.current_page -
                                                    1) *
                                                  submittedOrders.per_page}
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

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {parseInt(
                                                  item.is_cancelled
                                                ) === 0 ? (
                                                  [
                                                    parseInt(
                                                      item.is_ready
                                                    ) === 0 ? (
                                                      <span
                                                        className="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                        onClick={() => {
                                                          setCheckOrderDetails(
                                                            {
                                                              ...checkOrderDetails,
                                                              item: item,
                                                              settle: false,
                                                            }
                                                          );
                                                          setReturnMoneyUsd(
                                                            0
                                                          );
                                                          setPaidMoney("");
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#orderDetails"
                                                      >
                                                        {_t(t("processing"))}
                                                      </span>
                                                    ) : (
                                                      <span
                                                        className="btn btn-transparent btn-success xsm-text text-capitalize px-4"
                                                        onClick={() => {
                                                          setCheckOrderDetails(
                                                            {
                                                              ...checkOrderDetails,
                                                              item: item,
                                                              settle: false,
                                                            }
                                                          );
                                                          setReturnMoneyUsd(
                                                            0
                                                          );
                                                          setPaidMoney("");
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
                                                    className="btn btn-transparent btn-primary xsm-text text-capitalize px-3"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                      });
                                                      setReturnMoneyUsd(0);
                                                      setPaidMoney("");
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("Cancelled"))}
                                                  </span>
                                                )}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {parseInt(
                                                  item.is_cancelled
                                                ) === 0 ? (
                                                  <div className="dropdown text-capitalize">
                                                    <button
                                                      className="btn t-bg-clear t-text-dark--light-40"
                                                      type="button"
                                                      data-toggle="dropdown"
                                                    >
                                                      <i className="fa fa-ellipsis-h"></i>
                                                    </button>
                                                    <div className="dropdown-menu">
                                                      {getSystemSettings(
                                                        generalSettings,
                                                        "pos_screen"
                                                      ) === "0" ? (
                                                        <button
                                                          // send state- order group id
                                                          className="dropdown-item sm-text text-capitalize"
                                                          onClick={() => {
                                                            setCheckOrderDetails(
                                                              {
                                                                ...checkOrderDetails,
                                                                item: item,
                                                                settle: true,
                                                                payment_amount:
                                                                  null,
                                                                payment_type:
                                                                  null,
                                                              }
                                                            );
                                                            setReturnMoneyUsd(
                                                              0
                                                            );
                                                            setPaidMoney("");
                                                          }}
                                                          data-toggle="modal"
                                                          data-target="#orderDetails"
                                                        >
                                                          <span className="t-mr-8">
                                                            <i className="fa fa-refresh"></i>
                                                          </span>
                                                          {_t(
                                                            t("Settle order")
                                                          )}
                                                        </button>
                                                      ) : (
                                                        <button
                                                          // send state- order group id
                                                          className="dropdown-item sm-text text-capitalize"
                                                          onClick={() => {
                                                            setCheckOrderDetails(
                                                              {
                                                                ...checkOrderDetails,
                                                                item: item,
                                                                settle: true,
                                                                payment_amount:
                                                                  null,
                                                                payment_type:
                                                                  null,
                                                              }
                                                            );
                                                            setReturnMoneyUsd(
                                                              0
                                                            );
                                                            setPaidMoney("");
                                                            setShowSettle(
                                                              true
                                                            );
                                                          }}
                                                        >
                                                          <span className="t-mr-8">
                                                            <i className="fa fa-refresh"></i>
                                                          </span>
                                                          {_t(
                                                            t("Settle order")
                                                          )}
                                                        </button>
                                                      )}

                                                      {parseInt(
                                                        item.is_ready
                                                      ) !== 1 && [
                                                          parseInt(
                                                            item.is_accepted
                                                          ) === 0 ? (
                                                            <button
                                                              className="dropdown-item sm-text text-capitalize"
                                                              onClick={() => {
                                                                handleCancelOrderConfirmation(
                                                                  item
                                                                );
                                                              }}
                                                            >
                                                              <span className="t-mr-8">
                                                                <i className="fa fa-trash"></i>
                                                              </span>
                                                              {_t(
                                                                t(
                                                                  "Cancel Order"
                                                                )
                                                              )}
                                                            </button>
                                                          ) : (
                                                            <button
                                                              className="dropdown-item sm-text text-capitalize"
                                                              onClick={() => {
                                                                toast.error(
                                                                  `${_t(
                                                                    t(
                                                                      "This is being cooked, can not cancel now"
                                                                    )
                                                                  )}`,
                                                                  {
                                                                    position:
                                                                      "bottom-center",
                                                                    closeButton: false,
                                                                    autoClose: 10000,
                                                                    hideProgressBar: false,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    className:
                                                                      "text-center toast-notification",
                                                                  }
                                                                );
                                                              }}
                                                            >
                                                              <span className="t-mr-8">
                                                                <i className="fa fa-trash"></i>
                                                              </span>
                                                              {_t(
                                                                t(
                                                                  "Cancel Order"
                                                                )
                                                              )}
                                                            </button>
                                                          ),
                                                        ]}


                                                      {/* working on edit order */}
                                                      {/* {parseInt(
                                                        item.is_ready
                                                      ) !== 1 && [
                                                          parseInt(
                                                            item.is_accepted
                                                          ) === 0 ? (
                                                            <Link
                                                              className="dropdown-item sm-text text-capitalize"
                                                              // to="/dashboard/edit-submit-order"
                                                              to={`/dashboard/edit-submit-order/${item.id}`}
                                                            >
                                                              <span className="t-mr-8">
                                                                <i className="fa fa-pencil-square-o"></i>
                                                              </span>
                                                              {_t(
                                                                t(
                                                                  "Edit Order"
                                                                )
                                                              )}
                                                            </Link>
                                                          ) : (
                                                            <button
                                                              className="dropdown-item sm-text text-capitalize"
                                                              onClick={() => {
                                                                toast.error(
                                                                  `${_t(
                                                                    t(
                                                                      "This is being cooked, can not Edit now"
                                                                    )
                                                                  )}`,
                                                                  {
                                                                    position:
                                                                      "bottom-center",
                                                                    closeButton: false,
                                                                    autoClose: 10000,
                                                                    hideProgressBar: false,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    className:
                                                                      "text-center toast-notification",
                                                                  }
                                                                );
                                                              }}
                                                            >
                                                              <span className="t-mr-8">
                                                                <i className="fa fa-trash"></i>
                                                              </span>
                                                              {_t(
                                                                t(
                                                                  "Edit Order"
                                                                )
                                                              )}
                                                            </button>
                                                          ),
                                                        ]} */}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  _t(t("Not allowed"))
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )
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
                                      searchedOrder.list.map(
                                        (item, index) => {
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
                                                  (submittedOrders.current_page -
                                                    1) *
                                                  submittedOrders.per_page}
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

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {parseInt(
                                                  item.is_cancelled
                                                ) === 0 ? (
                                                  [
                                                    parseInt(
                                                      item.is_ready
                                                    ) === 0 ? (
                                                      <span
                                                        className="btn btn-transparent btn-secondary xsm-text text-capitalize"
                                                        onClick={() => {
                                                          setCheckOrderDetails(
                                                            {
                                                              ...checkOrderDetails,
                                                              item: item,
                                                              settle: false,
                                                            }
                                                          );
                                                          setReturnMoneyUsd(
                                                            0
                                                          );
                                                          setPaidMoney("");
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#orderDetails"
                                                      >
                                                        {_t(t("processing"))}
                                                      </span>
                                                    ) : (
                                                      <span
                                                        className="btn btn-transparent btn-success xsm-text text-capitalize px-4"
                                                        onClick={() => {
                                                          setCheckOrderDetails(
                                                            {
                                                              ...checkOrderDetails,
                                                              item: item,
                                                              settle: false,
                                                            }
                                                          );
                                                          setReturnMoneyUsd(
                                                            0
                                                          );
                                                          setPaidMoney("");
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
                                                    className="btn btn-transparent btn-primary xsm-text text-capitalize px-3"
                                                    onClick={() => {
                                                      setCheckOrderDetails({
                                                        ...checkOrderDetails,
                                                        item: item,
                                                        settle: false,
                                                      });
                                                      setReturnMoneyUsd(0);
                                                      setPaidMoney("");
                                                    }}
                                                    data-toggle="modal"
                                                    data-target="#orderDetails"
                                                  >
                                                    {_t(t("Cancelled"))}
                                                  </span>
                                                )}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {parseInt(
                                                  item.is_cancelled
                                                ) === 0 ? (
                                                  <div className="dropdown text-capitalize">
                                                    <button
                                                      className="btn t-bg-clear t-text-dark--light-40"
                                                      type="button"
                                                      data-toggle="dropdown"
                                                    >
                                                      <i className="fa fa-ellipsis-h"></i>
                                                    </button>
                                                    <div className="dropdown-menu">
                                                      <button
                                                        // send state- order group id
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() => {
                                                          setCheckOrderDetails(
                                                            {
                                                              ...checkOrderDetails,
                                                              item: item,
                                                              settle: true,
                                                              payment_amount:
                                                                null,
                                                              payment_type:
                                                                null,
                                                            }
                                                          );
                                                          setReturnMoneyUsd(
                                                            0
                                                          );
                                                          setPaidMoney("");
                                                        }}
                                                        data-toggle="modal"
                                                        data-dismiss="modal"
                                                        aria-label="Close"
                                                        data-target="#orderDetails"
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-refresh"></i>
                                                        </span>
                                                        {_t(
                                                          t("Settle order")
                                                        )}
                                                      </button>

                                                      {parseInt(
                                                        item.is_ready
                                                      ) !== 1 && [
                                                          parseInt(
                                                            item.is_accepted
                                                          ) === 0 ? (
                                                            <button
                                                              className="dropdown-item sm-text text-capitalize"
                                                              onClick={() => {
                                                                handleCancelOrderConfirmation(
                                                                  item
                                                                );
                                                              }}
                                                            >
                                                              <span className="t-mr-8">
                                                                <i className="fa fa-trash"></i>
                                                              </span>
                                                              {_t(
                                                                t(
                                                                  "Cancel Order"
                                                                )
                                                              )}
                                                            </button>
                                                          ) : (
                                                            <button
                                                              className="dropdown-item sm-text text-capitalize"
                                                              onClick={() => {
                                                                toast.error(
                                                                  `${_t(
                                                                    t(
                                                                      "This is being cooked, can not cancel now"
                                                                    )
                                                                  )}`,
                                                                  {
                                                                    position:
                                                                      "bottom-center",
                                                                    closeButton: false,
                                                                    autoClose: 10000,
                                                                    hideProgressBar: false,
                                                                    closeOnClick: true,
                                                                    pauseOnHover: true,
                                                                    className:
                                                                      "text-center toast-notification",
                                                                  }
                                                                );
                                                              }}
                                                            >
                                                              <span className="t-mr-8">
                                                                <i className="fa fa-trash"></i>
                                                              </span>
                                                              {_t(
                                                                t(
                                                                  "Cancel Order"
                                                                )
                                                              )}
                                                            </button>
                                                          ),
                                                        ]}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  _t(t("Not allowed"))
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )
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
                                submittedOrders,
                                setPaginatedSubmittedOrders
                              )}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(submittedOrders)}
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
                                    submittedOrdersForSearch
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
      </div>

      {/* show settle  */}
      <div
        className={`fk-settle-container d-flex flex-column justify-content-center ${showSettle ? "" : "d-none"
          }`}
      >
        <div className="fk-settle">
          <div className="container">
            <div className="row gx-3">
              <div className="col-lg-6 d-none d-lg-block">
                <span className="sm-text d-block text-capitalize font-weight-bold py-3">
                  {_t(t("Settle order"))}
                </span>
                <div
                  className="fk-settle__products d-flex flex-column"
                  data-simplebar
                >
                  <div className="container-fluid">
                    <div className="row gx-3">
                      <div className="col-12">
                        {/* POS Product list will be here  */}
                        <div className="fk-price-table__body t-mt-10">
                          <div className="fk-price-table__body-top">
                            <div className="fk-table">
                              <div className="t-pb-30">
                                <div className="col-12 filtr-item">
                                  <div className="fk-order-token t-bg-white">
                                    <div className="fk-order-token__body">
                                      <div className="fk-addons-table">
                                        <div className="fk-addons-table__head text-center">
                                          {_t(t("order token"))} -
                                          {checkOrderDetails.item &&
                                            checkOrderDetails.item.token.id}
                                        </div>
                                        <div className="fk-addons-table__info">
                                          <div className="row g-0">
                                            <div className="col-2 text-center border-right">
                                              <span className="fk-addons-table__info-text text-capitalize">
                                                {_t(t("S/L"))}
                                              </span>
                                            </div>
                                            <div className="col-3 text-center border-right">
                                              <span className="fk-addons-table__info-text text-capitalize">
                                                {_t(t("food"))}
                                              </span>
                                            </div>
                                            <div className="col-4 text-left pl-2 border-right">
                                              <span className="fk-addons-table__info-text text-capitalize">
                                                {_t(t("Additional Info"))}
                                              </span>
                                            </div>
                                            <div className="col-2 text-center">
                                              <span className="fk-addons-table__info-text text-capitalize">
                                                {_t(t("QTY"))}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                        {checkOrderDetails.item &&
                                          checkOrderDetails.item.orderedItems.map(
                                            (thisItem, indexThisItem) => {
                                              return (
                                                <div className="fk-addons-table__body-row">
                                                  <div className="row g-0">
                                                    <div className="col-2 text-center border-right d-flex">
                                                      <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                        {indexThisItem + 1}
                                                      </span>
                                                    </div>
                                                    <div className="col-3 text-center border-right d-flex">
                                                      <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                        {thisItem.food_item} (
                                                        {thisItem.food_group})
                                                      </span>
                                                    </div>
                                                    <div className="col-4 text-center border-right t-pl-10 t-pr-10">
                                                      {thisItem.variation !==
                                                        null && (
                                                          <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                                            <span className="font-weight-bold mr-1">
                                                              {_t(t("variation"))}
                                                              :
                                                            </span>
                                                            {thisItem.variation}
                                                          </span>
                                                        )}

                                                      {thisItem.properties !==
                                                        null && (
                                                          <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                                            <span className="font-weight-bold mr-1">
                                                              {_t(
                                                                t("properties")
                                                              )}
                                                              :
                                                            </span>
                                                            {JSON.parse(
                                                              thisItem.properties
                                                            ).map(
                                                              (
                                                                propertyItem,
                                                                thisIndex
                                                              ) => {
                                                                if (
                                                                  thisIndex !==
                                                                  JSON.parse(
                                                                    thisItem.properties
                                                                  ).length -
                                                                  1
                                                                ) {
                                                                  return (
                                                                    propertyItem.property +
                                                                    `${propertyItem.quantity >
                                                                      1
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
                                                                    `${propertyItem.quantity >
                                                                      1
                                                                      ? "(" +
                                                                      propertyItem.quantity +
                                                                      ")"
                                                                      : ""
                                                                    }`
                                                                  );
                                                                }
                                                              }
                                                            )}
                                                          </span>
                                                        )}
                                                    </div>
                                                    <div className="col-2 text-center d-flex">
                                                      <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                        {thisItem.quantity}
                                                      </span>
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
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="row gx-3">
                  <div className="col-md-9">
                    {returnMoneyUsd > 0 ? (
                      <div
                        className="alert alert-danger text-center"
                        style={{ height: "56px", marginTop: "16px" }}
                      >
                        Return Amount: {formatPrice(returnMoneyUsd)}
                      </div>
                    ) : (
                      <>
                        <div className="fk-settle-group d-flex t-mt-15">
                          <label
                            htmlFor="settle-total"
                            className="text-capitalize w-50 fk-settle-group__label font-weight-bold"
                          >
                            total:
                          </label>
                          <div
                            id="settle-total"
                            className="w-50 fk-settle-group__input text-right pr-2 font-weight-bold"
                          >
                            {checkOrderDetails &&
                              checkOrderDetails.item &&
                              formatPrice(
                                checkOrderDetails.item.total_payable -
                                checkOrderDetails.item.paid_amount
                              )}
                          </div>
                        </div>
                        <div className="fk-settle-group d-flex t-mt-10 t-mb-15">
                          <label
                            htmlFor="settle-paid-amount"
                            className="text-capitalize w-50 fk-settle-group__label font-weight-bold"
                          >
                            paid amount:
                          </label>
                          <div
                            id="settle-total"
                            className="w-50 fk-settle-group__input text-right pr-2 font-weight-bold"
                          >
                            {paidMoney}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="fk-settle-cal container-fluid">
                      <div className="row h-100 g-2 mt-1">
                        <div className="col-2">
                          <div className="row g-2 h-100">
                            <div className="col-12">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + 10);
                                  }
                                }}
                              >
                                10
                              </button>
                            </div>
                            <div className="col-12">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + 20);
                                  }
                                }}
                              >
                                20
                              </button>
                            </div>
                            <div className="col-12">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + 50);
                                  }
                                }}
                              >
                                50
                              </button>
                            </div>
                            <div className="col-12 mb-2">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + 100);
                                  }
                                }}
                              >
                                100
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-10">
                          <div className="row g-2 h-100">
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 1);
                                      }
                                    }}
                                  >
                                    1
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 4);
                                      }
                                    }}
                                  >
                                    4
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 7);
                                      }
                                    }}
                                  >
                                    7
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-p t-text-white"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + 500);
                                      }
                                    }}
                                  >
                                    500
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 2);
                                      }
                                    }}
                                  >
                                    2
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 5);
                                      }
                                    }}
                                  >
                                    5
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 8);
                                      }
                                    }}
                                  >
                                    8
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-p t-text-white"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 1000);
                                      }
                                    }}
                                  >
                                    1000
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 3);
                                      }
                                    }}
                                  >
                                    3
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 6);
                                      }
                                    }}
                                  >
                                    6
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney +""+ 9);
                                      }
                                    }}
                                  >
                                    9
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn  t-bg-d t-text-white"
                                    onClick={() => {
                                      setPaidMoney("");
                                      setReturnMoneyUsd(0);
                                      setCheckOrderDetails({
                                        ...checkOrderDetails,
                                        payment_type: null,
                                        payment_amount: null,
                                      });
                                    }}
                                  >
                                    C
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-text-white t-bg-ac text-capitalize"
                                    onClick={() => {
                                      if (
                                        checkOrderDetails &&
                                        checkOrderDetails.item
                                      ) {
                                        let theP = parseFloat(
                                          formatPrice(
                                            checkOrderDetails.item
                                              .total_payable -
                                            checkOrderDetails.item.paid_amount
                                          )
                                        );
                                        setPaidMoney(theP);
                                      }
                                    }}
                                  >
                                    all
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-text-white t-bg-ac text-capitalize"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        if (
                                          checkOrderDetails &&
                                          checkOrderDetails.item
                                        ) {
                                          
                                          setPaidMoney(paidMoney +""+ ".");
                                        }
                                      }
                                    }}
                                  >
                                    .
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-text-white t-bg-ac text-capitalize"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                          setPaidMoney(paidMoney +""+ 0);
                                        
                                      }
                                    }}
                                  >
                                    0
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn bg-primary t-text-white t-bg-r text-capitalize"
                                    onClick={!loading && handleSettleOrder}
                                  >
                                    {!loading ? _t(t("settle")) : _t(t("wait"))}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex flex-column justify-content-center t-mt-15">
                      <div className="fk-settle__pay" data-simplebar>
                        <div className="row gx-3">
                          <div className="col-12">
                            {/* POS Navigation will ber here */}
                            <ul className="t-list fk-pos-nav list-group">
                              <li className="fk-pos-nav__list">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowSettle(false);
                                  }}
                                  className="w-100 t-text-dark t-heading-font btn alert alert-danger font-weight-bold text-uppercase py-3 mb-3"
                                >
                                  Go back
                                </button>
                              </li>
                              {/* paymentTypes */}
                              {paymentTypeForSearch &&
                                paymentTypeForSearch.map(
                                  (groupItem, groupIndex) => {
                                    return (
                                      <li
                                        className="fk-pos-nav__list"
                                        key={groupIndex}
                                      >
                                        <button
                                          type="button"
                                          //set active or !
                                          className={`w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase py-3 ${checkOrderDetails &&
                                            checkOrderDetails.payment_type !==
                                            null &&
                                            checkOrderDetails.payment_type[0]
                                              .id === groupItem.id
                                            ? "active"
                                            : ""
                                            }`}
                                          onClick={() => {
                                            handleSetpaymentTypeSingle(
                                              groupItem
                                            );
                                          }}
                                        >
                                          {groupItem.name}
                                        </button>
                                      </li>
                                    );
                                  }
                                )}
                              {/* paymentTypes */}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Submitted;
