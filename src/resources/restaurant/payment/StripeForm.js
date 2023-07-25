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
            setTimeout(() => {
              if (res.data.success) {
                removeLocalStorage();
              }
              setSuccess(!success)
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

  return (
    <>
      {/* Payment  */}
      <h5 className="text-center">Order Payment</h5>
      <div id="card-element"></div>
      <div className="panel panel-default credit-card-box">
        <div className="panel-heading display-table">
          <h5 className="panel-title">Payment Details</h5>
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
                <div className="row my-3">
                  <div className="col-xs-12 form-group required">
                    <label className="control-label mb-3">Card Details</label>
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
      {/* Payment End */}
    </>
  );
};

export default StripeForm;
