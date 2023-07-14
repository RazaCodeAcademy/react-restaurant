import React, { useState, useContext } from "react";
import { useLocation, useHistory } from "react-router-dom";

// stripe payment area
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../BaseUrl";

//functions
import { _t, getCookie, getSystemSettings } from "../../../functions/Functions";

//3rd party packages
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import "react-toastify/dist/ReactToastify.css";

import { SettingsContext } from "../../../contexts/Settings";

const CARD_OPTIONS = {
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

  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const paymentAmount = queryParams.get("payment_amount");
  const history = useHistory();

  const handleName = (e) => {
    setName(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
    });

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
            console.log("Successfuly Payment");
            setSuccess(true);
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
                          <CardElement options={CARD_OPTIONS} />
                        </div>
                      </fieldset>

                      {/* 
            
                                <div className='row'>
                                    <div className='col-xs-12 form-group card required'>
                                        <label className='control-label'>Card Number</label> <input
                                            autoComplete='off' value="4242424242424242" maxLength={16} className='form-control card-number' size='16'
                                            id="card-number"
                                            type='text' />
                                    </div>
                                </div>
            
                                <div className='row'>
                                    <div className='col-xs-12 col-md-4 form-group cvc required'>
                                        <label className='control-label'>CVC</label> <input autoComplete='off'
                                            className='form-control card-cvc' value="123" id="card-cvc" placeholder='ex. 311' size='4'
                                            type='text' />
                                    </div>
                                    <div className='col-xs-12 col-md-4 form-group expiration required'>
                                        <label className='control-label'>Expiration Month</label> <input
                                            className='form-control card-expiry-month' value="12" id="card-expiry-month" placeholder='MM' size='2'
                                            type='text' />
                                    </div>
                                    <div className='col-xs-12 col-md-4 form-group expiration required'>
                                        <label className='control-label'>Expiration Year</label> <input
                                            className='form-control card-expiry-year' value="2023" id="card-expiry-year" placeholder='YYYY' size='4'
                                            type='text' />
                                    </div>
                                </div>
            
                                <div className='row'>
                                    <div className='col-md-12 error form-group hide'>
                                        <div className='alert-danger alert'>Please correct the errors and try
                                            again.</div>
                                    </div>
                                </div> */}

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
                    <h2 className="alert alert-success text-center py-3">
                      Payment Successfull!
                    </h2>
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
    </>
  );
};

export default StripeForm;
