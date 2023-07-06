import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

//functions
import {
    _t,
    getCookie,
    tableLoading,
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Switch from "react-switch";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";

const OnlinePayment = () => {
    const { t } = useTranslation();

    //getting context values here
    let {
        loading,
        dataPaginating,
        paymentDetails
    } = useContext(SettingsContext);


    // payment
    const [paymentMethod, setPaymentMethod] = useState({
        paypal: 'paypal',
        client_id: '',
    });


    const handleChange2 = (e) => {
        setPaymentMethod({
            ...paymentMethod, [e.target.name]: e.target.value
        })
    }

    const handleSubmit2 = (e) => {
        e.preventDefault();
        const url = BASE_URL + `/settings/set-payment-client-id`;

        const data = {
            name: paymentMethod.paypal,
            value: paymentMethod.client_id
        }

        return axios
            .post(url, data, {
                headers: { Authorization: `Bearer ${getCookie()}` },
            })
            .then((res) => {
                toast.success(`${_t(t("paypal setup successfully"))}`, {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                });
            })
    }

    // useEffect == componentDidMount()
    useEffect(() => {
    }, []);

    return (
        <>
            <Helmet>
                <title>{_t(t("Set up online Payment"))}</title>
            </Helmet>

            {/* main body */}
            <main id="main" data-simplebar>
                <div className="container">
                    <div className="row t-mt-10 gx-2">
                        {/* left Sidebar */}
                        <div className="col-lg-3 col-xxl-2 t-mb-30 mb-lg-0">
                            <ManageSidebar />
                        </div>
                        {/* left Sidebar ends */}

                        {/* Rightbar contents */}
                        <div className="col-lg-9 col-xxl-10 t-mb-30 mb-lg-0">
                            <div className="t-bg-white">
                                <div
                                    className="fk-scroll--pos-menu table-bottom-info-hide"
                                    data-simplebar
                                >
                                    <div className="t-pl-15 t-pr-15">
                                        {/* next page data spin loading */}
                                        <div className={`${dataPaginating && "loading"}`}></div>
                                        {/* spin loading ends */}

                                        {/* Loading effect */}
                                        {loading === true ? (
                                            tableLoading()
                                        ) : (
                                            <>
                                                {/* working on dynamic client id */}
                                                {/* <div>
                                                    <form className="p-4" onSubmit={handleSubmit2}>
                                                        <div class="form-group mb-4">
                                                            <label for="paypal mb-4">Payment type</label>
                                                            <input name="paypal" disabled onChange={handleChange2} type="text" class="form-control" id="paypal" aria-describedby="paypalHelp" placeholder="PAYPAL" />

                                                        </div>
                                                        <div class="form-group mb-4">
                                                            <label for="clinet-id mb-4">Client id</label>
                                                            <input name="client_id" onChange={handleChange2} type="text" class="form-control" id="clinet-id" placeholder="client id" />
                                                        </div>

                                                        <button type="submit" class="btn btn-primary">Submit</button>
                                                    </form>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="card" >
                                                        <div class="card-header">
                                                            Payment Details
                                                        </div>
                                                        <ul className="list-group list-group-flush">
                                                            <li class="list-group-item">Name :{paymentDetails.name}</li>
                                                            <li class="list-group-item">Value :{paymentDetails.value}</li>

                                                        </ul>
                                                    </div>
                                                </div> */}

                                                <div class="row mx-2 my-2 mb-4 p-5">
                                                    <div class="col-12">
                                                        <ul class="t-list fk-breadcrumb">
                                                            <li class="fk-breadcrumb__list">
                                                                <h6 class="t-link  mb-4">We only support paypal integration for online payment. If you have paypal account then follow the steps below.</h6>
                                                            </li>
                                                        </ul>
                                                        <ul class="list-group ml-0 pl-0 lg-text">
                                                            <li class="list-group-item border-0 pl-0">1: Get your client id from your paypal account</li>
                                                            <li class="list-group-item border-0 pl-0"> 2: Send us ticket with the client id (https://softtechitsupport.com)</li>
                                                            <li class="list-group-item border-0 pl-0">3:  We will setup it up for you</li>
                                                            <li class="list-group-item border-0 pl-0">Thank you</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Rightbar contents end*/}
                    </div>
                </div>
            </main>
            {/* main body ends */}
        </>
    );
};

export default OnlinePayment;

