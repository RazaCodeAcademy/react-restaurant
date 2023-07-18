import React, { useContext, useEffect, useState, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";

// stripe payment area
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  getSystemSettings,
  formatPrice,
} from "../../../functions/Functions";

//3rd party packages
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";
import Moment from "react-moment";
import { useReactToPrint } from "react-to-print";

import { SettingsContext } from "../../../contexts/Settings";
import { FoodContext } from "../../../contexts/Food";
import { UserContext } from "../../../contexts/User";

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

const StripeForm = () => {
  const { t } = useTranslation();
  //getting context values here
  let { generalSettings } = useContext(SettingsContext);

  const [name, setName] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState({
    success: false,
    text: "",
  });
  const [newOrder, setNewOrder] = useState();
  const [orderDetails, setOrderDetails] = useState();
  //selected groups
  const [selectedPropertyGroup, setSelectedPropertyGroup] = useState([]);
  //the sub total
  const [theSubTotal, setTheSubTotal] = useState(0);
  //vat
  const [theVat, setTheVat] = useState(0);
  //vat settings
  const [newSettings, setNewSettings] = useState(null);
  //return
  const [returnMoneyUsd, setReturnMoneyUsd] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const [cardNumber, setCardNumber] = useState("");

  const {
    //food
    foodForSearch,
    //food group
    foodGroupForSearch,
    getFoodGroup,
    //property group
    propertyGroupForSearch,
    //food stock
    foodItemStock,
  } = useContext(FoodContext);

  const {
    authUserInfo,
    //customer
    customerForSearch,
    setCustomerForSearch,
    //waiter
    waiterForSearch,
  } = useContext(UserContext);

  useEffect(() => {
    setNewOrder(JSON.parse(localStorage.getItem("newOrder")));
    setOrderDetails(JSON.parse(localStorage.getItem("orderDetails")));
    setNewSettings(JSON.parse(localStorage.getItem("newSettings")));
    setTheSubTotal(
      localStorage.getItem("theSubTotal")
        ? parseFloat(localStorage.getItem("theSubTotal"))
        : 0
    );
    setPaymentAmount(
      localStorage.getItem("payment_amount")
        ? parseFloat(localStorage.getItem("payment_amount"))
        : 0
    );
    setTheVat(
      localStorage.getItem("theVat")
        ? parseFloat(localStorage.getItem("theVat"))
        : 0
    );
  }, []);

  const stripe = useStripe();
  const elements = useElements();

  const history = useHistory();

  const handleName = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(cardNumber);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

    if (paymentMethod && paymentMethod.card) {
      setCardNumber(paymentMethod.card.last4);
    } else {
      setCardNumber("");
    }

    if (!error) {
      try {
        const { id } = paymentMethod;
        let url = BASE_URL + "/settings/stripe";
        let localCurrency = JSON.parse(localStorage.getItem("currency"));

        let formData = {
          name: name,
          currency: localCurrency.code,
          amount: paymentAmount,
          stripeToken: id,
        };

        axios
          .post(url, formData, {
            headers: { Authorization: `Bearer ${getCookie()}` },
          })
          .then((res) => {
            setSuccess(true);
            setMessage({
              success: res.data.success,
              text: res.data.message,
            });
            handlePrint();
            setTimeout(() => {
              if (res.data.success) {
                removeLocalStorage();
                history.push("/dashboard/pos");
              } else {
                window.location.reload();
              }
            }, 2000);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log(error.message);
    }
  };

  const removeLocalStorage = () => {
    localStorage.removeItem("payment_amount");
    localStorage.removeItem("newOrder");
    localStorage.removeItem("orderDetails");
    localStorage.removeItem("newSettings");
    localStorage.removeItem("theSubTotal");
    localStorage.removeItem("theVat");
  };

  //print bills
  const componentRef = useRef();
  const component2Ref = useRef();

  //show price of each item in print
  const showPriceOfEachOrderItemPrint = (itemIndex) => {
    if (newOrder) {
      let price = 0;
      let orderItem = newOrder[itemIndex];
      //check price * quantity (variation price / item price)
      if (parseInt(orderItem.item.has_variation) === 1) {
        price = parseFloat(orderItem.variation.food_with_variation_price);
      } else {
        price = parseFloat(orderItem.item.price);
      }

      let formattedPrice = formatPrice(price * orderItem.quantity);
      return formattedPrice;
    }
  };

  //after order submit or settle
  //for pos manager
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      // if (getSystemSettings(generalSettings, "print_kitchen_bill") === "1") {
      //   handlePrint2();
      // } else {
      //   // handleOrderSubmitSuccessful();
      // }
    },
  });

  //for kithcen
  const handlePrint2 = useReactToPrint({
    content: () => component2Ref.current,
    onAfterPrint: () => {
      // handleOrderSubmitSuccessful();
    },
  });

  return (
    <>
      <Helmet>
        <title>
          {generalSettings &&
            getSystemSettings(generalSettings, "siteName") +
              " | " +
              _t(t("Orders Payments"))}
        </title>

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css"
        />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
      </Helmet>

      {/* Main  */}
      <main className="kh-user my-5">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-md-offset-3 col-sm-12">
              <h3 className="text-center">Order Payment</h3>
              <div id="card-element"></div>
              <div className="panel panel-default credit-card-box">
                <div className="panel-heading display-table">
                  <h3 className="panel-title">Payment Details</h3>
                </div>
                <div className="panel-body">
                  {!success ? (
                    <form onSubmit={handleSubmit}>
                      <fieldset>
                        <div className="row">
                          <div className="col-xs-12 form-group required">
                            <label className="control-label">
                              Name on Card
                            </label>{" "}
                            <input
                              className="form-control"
                              value={name}
                              size="4"
                              type="text"
                              id="name"
                              onChange={handleName}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-xs-12 form-group required">
                            <label className="control-label">Card Details</label>
                            <CardElement
                              options={CARD_OPTIONS}
                            />
                          </div>
                        </div>
                      </fieldset>
                      <div className="row mt-4">
                        <div className="col-xs-12">
                          <button
                            className="btn btn-danger btn-lg btn-block"
                            type="submit"
                          >
                            Pay Now (${paymentAmount})
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <h4
                      className={`alert alert-${
                        message.success ? "success" : "danger"
                      } text-center py-3`}
                    >
                      {message.text}
                    </h4>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* <StripeCheckout 
              token={onToken}
              name="raza"
              stripeKey="pk_test_51HeMxMGahXUsew7kgRWCjly9sFZQOImZzSHExaYqxd8jmFUl8psNrqhq5BXVZvNQ427YUQNpxwmoPX3gHRlY58lr00d78CtYbD"
            /> */}
        </div>
      </main>
      {/* Main End */}

      {/* Print bill */}
      <div className="d-none">
        <div ref={componentRef}>
          {newOrder && (
            <div className="fk-print">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <span className="d-block fk-print-text font-weight-bold text-uppercase text-center sm-text">
                      {getSystemSettings(generalSettings, "siteName")}
                      {","}
                      {orderDetails &&
                        orderDetails.branch !== null &&
                        orderDetails.branch.name}
                    </span>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {orderDetails &&
                        orderDetails.branch !== null &&
                        orderDetails.branch.address}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {_t(t("call"))}:{" "}
                      {orderDetails &&
                      orderDetails.branch !== null &&
                      orderDetails.branch.phn_no
                        ? orderDetails.branch.phn_no
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_heading")}
                    </p>
                    <span className="d-block fk-print-text text-uppercase text-center lg-text myBorderTopCustomer">
                      {_t(t("Token No"))}-
                      {orderDetails && orderDetails.token.id}
                    </span>
                    <p className="mb-0 fk-print-text text-capitalize lg-text">
                      {orderDetails &&
                        orderDetails.dept_tag &&
                        orderDetails.dept_tag.name}
                    </p>
                    <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize text-center">
                      {_t(t("Customer Copy"))}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Card Last 4 Digits"))}: {`**** **** **** ${cardNumber}`}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("date"))}: <Moment format="LL">{new Date()}</Moment>
                      {", "}
                      {orderDetails && (
                        <Moment format="LT">{orderDetails.token.time}</Moment>
                      )}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("date"))}: <Moment format="LL">{new Date()}</Moment>
                      {", "}
                      {orderDetails && (
                        <Moment format="LT">{orderDetails.token.time}</Moment>
                      )}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Total guests"))}:{" "}
                      {orderDetails && orderDetails.total_guest}
                    </p>

                    {orderDetails && orderDetails.waiter !== null ? (
                      <p className="mb-0 xsm-text fk-print-text text-capitalize">
                        {_t(t("waiter name"))}: {orderDetails.waiter.name}
                      </p>
                    ) : (
                      ""
                    )}

                    <p className="mb-0 sm-text fk-print-text text-capitalize lg-text">
                      PAID
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
                        {newOrder.map((printItem, printItemIndex) => {
                          return (
                            <tr>
                              <td className="fk-print-text xsm-text text-capitalize">
                                <div className="d-flex flex-wrap">
                                  <span className="d-inline-block xsm-text">
                                    -{printItem.quantity} {printItem.item.name}
                                    {parseInt(printItem.item.has_variation) ===
                                      1 &&
                                      printItem.variation &&
                                      "(" +
                                        printItem.variation.variation_name +
                                        ")"}
                                  </span>
                                </div>

                                {/* properties */}
                                {printItem.properties &&
                                  printItem.properties.length > 0 &&
                                  selectedPropertyGroup[printItemIndex] !==
                                    undefined &&
                                  selectedPropertyGroup[printItemIndex].map(
                                    (thisIsGroup) => {
                                      let theGroup =
                                        propertyGroupForSearch &&
                                        propertyGroupForSearch.find(
                                          (theItem) => {
                                            return theItem.id === thisIsGroup;
                                          }
                                        );
                                      return (
                                        <div className="d-block">
                                          {printItem.properties.map(
                                            (propertyName, propertyIndex) => {
                                              if (
                                                parseInt(
                                                  propertyName.item
                                                    .property_group_id
                                                ) === theGroup.id
                                              ) {
                                                return (
                                                  <span className="text-capitalize xsm-text d-inline-block mr-1">
                                                    -{printItem.quantity}
                                                    {propertyName.quantity > 1
                                                      ? "*" +
                                                        propertyName.quantity
                                                      : ""}{" "}
                                                    {propertyName.item.name}
                                                    <br />
                                                  </span>
                                                );
                                              } else {
                                                return true;
                                              }
                                            }
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                              </td>
                              <td className="fk-print-text xsm-text text-capitalize text-right">
                                <div className="d-block xsm-text">
                                  {showPriceOfEachOrderItemPrint(
                                    printItemIndex
                                  )}
                                </div>

                                {printItem.properties &&
                                  printItem.properties.length > 0 &&
                                  selectedPropertyGroup[printItemIndex] !==
                                    undefined &&
                                  selectedPropertyGroup[printItemIndex].map(
                                    (
                                      thisIsGroup,
                                      thisIsGroupPaddingTopIndex
                                    ) => {
                                      let theGroup =
                                        propertyGroupForSearch &&
                                        propertyGroupForSearch.find(
                                          (theItem) => {
                                            return theItem.id === thisIsGroup;
                                          }
                                        );
                                      return (
                                        <div
                                          className={`text-capitalize d-block xsm-text ${
                                            thisIsGroupPaddingTopIndex === 0
                                              ? [
                                                  parseInt(
                                                    printItem.item.has_variation
                                                  ) === 1
                                                    ? [
                                                        printItem.properties &&
                                                        printItem.properties
                                                          .length > 0
                                                          ? "addonPadding35"
                                                          : "addonPadding24",
                                                      ]
                                                    : [
                                                        printItem.properties &&
                                                        printItem.properties
                                                          .length > 0
                                                          ? "addonPadding24"
                                                          : "",
                                                      ],
                                                ]
                                              : ""
                                          }`}
                                        >
                                          {printItem.properties.map(
                                            (propertyName, propertyIndex) => {
                                              if (
                                                parseInt(
                                                  propertyName.item
                                                    .property_group_id
                                                ) === theGroup.id
                                              ) {
                                                return (
                                                  <span>
                                                    {formatPrice(
                                                      printItem.quantity *
                                                        propertyName.quantity *
                                                        propertyName.item
                                                          .extra_price
                                                    )}
                                                    <br />
                                                  </span>
                                                );
                                              } else {
                                                return true;
                                              }
                                            }
                                          )}
                                        </div>
                                      );
                                    }
                                  )}
                              </td>
                            </tr>
                          );
                        })}
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
                            {formatPrice(theSubTotal)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {theVat > 0 && (
                      <table className="table mb-0 table-borderless">
                        <tbody>
                          {getSystemSettings(generalSettings, "vat_system") ===
                          "igst" ? (
                            <tr>
                              <th className="fk-print-text xsm-text">
                                <span className="d-block xsm-text">
                                  VAT({newSettings !== null && newSettings.vat}
                                  %)
                                </span>
                              </th>
                              <td className="fk-print-text xsm-text text-capitalize text-right">
                                {formatPrice(theVat)}
                              </td>
                            </tr>
                          ) : getSystemSettings(
                              generalSettings,
                              "vat_system"
                            ) === "cgst" ? (
                            <>
                              <tr>
                                <th className="fk-print-text xsm-text">
                                  <span className="d-block xsm-text">
                                    CGST(
                                    {getSystemSettings(generalSettings, "cgst")}
                                    %)
                                  </span>
                                </th>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  {formatPrice(
                                    theSubTotal *
                                      (parseFloat(
                                        getSystemSettings(
                                          generalSettings,
                                          "cgst"
                                        )
                                      ) /
                                        100)
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th className="fk-print-text xsm-text">
                                  <span className="d-block xsm-text">
                                    SGST(
                                    {getSystemSettings(generalSettings, "sgst")}
                                    %)
                                  </span>
                                </th>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  {formatPrice(
                                    theSubTotal *
                                      (parseFloat(
                                        getSystemSettings(
                                          generalSettings,
                                          "sgst"
                                        )
                                      ) /
                                        100)
                                  )}
                                </td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <th className="fk-print-text xsm-text">
                                <span className="d-block xsm-text">
                                  TAX({newSettings !== null && newSettings.tax}
                                  %)
                                </span>
                              </th>
                              <td className="fk-print-text xsm-text text-capitalize text-right">
                                {formatPrice(theVat)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "flat" && (
                      <>
                        {orderDetails && orderDetails.serviceCharge > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("S.Charge"))}
                                  </span>
                                </th>

                                {orderDetails && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(orderDetails.serviceCharge)}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {orderDetails.discount > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("discount"))}
                                  </span>
                                </th>
                                {orderDetails && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(orderDetails.discount)}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "percentage" && (
                      <>
                        {orderDetails.serviceCharge > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("S.Charge"))}
                                    {orderDetails &&
                                      "(" + orderDetails.serviceCharge + "%)"}
                                  </span>
                                </th>

                                {orderDetails && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(
                                      theSubTotal *
                                        (orderDetails.serviceCharge / 100)
                                    )}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {orderDetails.discount > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("discount"))}
                                    {orderDetails &&
                                      "(" + orderDetails.discount + "%)"}
                                  </span>
                                </th>
                                {orderDetails && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(
                                      theSubTotal *
                                        (orderDetails.discount / 100)
                                    )}
                                  </td>
                                )}
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
                            {formatPrice(paymentAmount)}
                          </td>
                        </tr>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("Return Amount"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {formatPrice(returnMoneyUsd)}
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
                      {authUserInfo &&
                        authUserInfo.details &&
                        authUserInfo.details.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StripeForm;
