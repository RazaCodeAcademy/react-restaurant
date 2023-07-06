import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL, SAAS_APPLICATION, saas_apiUrl, saas_apiParams, saas_form_data } from "../../../../BaseUrl";

//functions
import {
    _t
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../../../contexts/Settings";
import Avatar from 'react-avatar';

// images
import img1 from '../saasInfo/img/img1.png'
import img2 from '../saasInfo/img/img2.png'
import img3 from '../saasInfo/img/img3.png'
import img4 from '../saasInfo/img/img4.png'
import rolling from '../saasInfo/img/rolling.svg'

const SaasProfile = () => {
    const { t } = useTranslation();
    const history = useHistory();
    //getting context values here
    const [loading, setLoading] = useState(true);

    let [saasUserInfo, setSaasUserInfo] = useState({
        name: null,
        phone: null,
        email: null,
        domain: null,
        address: null,
        rest_name: null,
        subscription_name: null,
        total_food: null,
        payment_status: null,
        payment_gateway: null,
        amount: null,
        total_food_items: null,
        available_food_item: null,
        total_branch: null,
        available_branch_item: null,
        // payment_histories: []
    });

    let [paymentHistories, setPaymentHistories] = useState([]);
    const url = saas_apiUrl + '/api/user-subscription-data?' + saas_apiParams;
    const paymentUrl = saas_apiUrl + '/api/payment-histories?' + saas_apiParams;
    const handleSaasUserInfo = () => {
        fetch(url
            , {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
                , method: 'GET'
            }
        )
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                setSaasUserInfo({
                    name: myJson.name,
                    phone: myJson.phone,
                    email: myJson.email,
                    domain: myJson.domain,
                    address: myJson.rest_address,
                    rest_name: myJson.rest_name,
                    subscription_name: myJson.subscription_name,
                    total_food: myJson.total_items,
                    available_food_item: myJson.available_item,
                    total_branch: myJson.total_branch,
                    available_branch_item: myJson.available_branch,
                    payment_status: myJson.payment_status,
                    payment_gateway: myJson.payment_gateway,
                    amount: myJson.amount,
                    // payment_histories: myJson.payment_histories,
                    subscription_date_endin: myJson.subscription_date_endin
                })
                setLoading(false);
            });

    }
    const payemtHistoryData = () => {
        return axios
            .get(paymentUrl)
            .then((res) => {
                setPaymentHistories(res.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    //useEffect == componentDidMount()
    useEffect(() => {
        handleSaasUserInfo();
        payemtHistoryData();
    }, []);

    return (
        <>
            <Helmet>
                <title>{_t(t("Saas Info Page"))}</title>
            </Helmet>
            <main data-simplebar>
                <div className="container wrapper-margin-40">
                    <div className="row t-mt-10 gx-2 justify-content-center">

                        <div className="col-lg-4">
                            <div className="saas_card_profile">
                                <span className="upper_bg_shape"></span>
                                <div className="avatar_img_wrapper">
                                    <Avatar
                                        color='#121053'
                                        name={saasUserInfo.name}
                                        size="150"
                                        round={true}
                                        className="saas_user_img"
                                    />
                                </div>

                                <span className="user_title"><i class="fa fa-user icon" aria-hidden="true"></i> User Information</span>

                                {loading ? <div className="d-flex justify-content-center align-items-center">
                                    <img src={rolling} alt="" className="hist_rolling" />
                                </div> : <div className="user_info_wrapper">

                                    <div className="list_wrapper">
                                        <span className="user_icon"><i class="fa fa-user icon" aria-hidden="true"></i></span>
                                        <span className="title_wrapper">
                                            <span className="subtitle">Full Name</span>
                                            <span className="title">{saasUserInfo.name}</span>
                                        </span>
                                    </div>
                                    <div className="list_wrapper">
                                        <span className="user_icon"><i class="fa fa-phone" aria-hidden="true"></i></span>
                                        <span className="title_wrapper">
                                            <span className="subtitle">Phone Number</span>
                                            <span className="title">{saasUserInfo.phone}</span>
                                        </span>
                                    </div>
                                    <div className="list_wrapper">
                                        <span className="user_icon"><i class="fa fa-envelope-open-o" aria-hidden="true"></i></span>
                                        <span className="title_wrapper">
                                            <span className="subtitle">Email Address</span>
                                            <span className="title">{saasUserInfo.email}</span>
                                        </span>
                                    </div>
                                    <div className="list_wrapper">
                                        <span className="user_icon"><i class="fa fa-map-marker" aria-hidden="true"></i></span>
                                        <span className="title_wrapper">
                                            <span className="subtitle">Address</span>
                                            <span className="title">{saasUserInfo.address}</span>
                                        </span>
                                    </div>
                                    <div className="list_wrapper">
                                        <span className="user_icon"><i class="fa fa-globe" aria-hidden="true"></i></span>
                                        <span className="title_wrapper">
                                            <span className="subtitle">Domain</span>
                                            <span className="title">{saasUserInfo.domain}</span>
                                        </span>
                                    </div>
                                    <div className="list_wrapper">
                                        <span className="user_icon"><i class="fa fa-cutlery" aria-hidden="true"></i></span>
                                        <span className="title_wrapper">
                                            <span className="subtitle">Restaurant Name</span>
                                            <span className="title">{saasUserInfo.rest_name}</span>
                                        </span>
                                    </div>
                                </div>}
                            </div>
                        </div>

                        {/* main content */}
                        <div className="col-lg-8">
                            {/* subs title */}
                            <span className="saas_subs_title">
                                <span className="saas_subs_icon">
                                    <i class="fa fa-clock-o" aria-hidden="true"></i>
                                </span> Subscription -
                                <span className="text-success"> {saasUserInfo.subscription_name}</span>
                                <span className="text-dark"> ({saasUserInfo.subscription_date_endin} <span className="text-lowercase">left</span>) </span>
                            </span>

                            {/* saas profile card info */}
                            <div className="row mt-4">
                                <div className="col-lg-3">
                                    {loading ? <div className="single_saas_info_card"> <img src={rolling} alt="" className="saas_info_img saas_card_loading" /> </div> :
                                        <div className="single_saas_info_card">
                                            <img className="saas_info_img" src={img1} alt="" />
                                            <span className="count_number">{saasUserInfo.total_food}</span>
                                            <span className="title">Total Foods</span>
                                            {/* <img src={rolling} alt="" className=""/> */}

                                        </div>}
                                </div>
                                <div className="col-lg-3">
                                    {loading ? <div className="single_saas_info_card"> <img src={rolling} alt="" className="saas_info_img saas_card_loading" /> </div> :
                                        <div className="single_saas_info_card">
                                            <img className="saas_info_img" src={img2} alt="" />
                                            <span className="count_number">{saasUserInfo.available_food_item}</span>
                                            <span className="title">Food left</span>
                                        </div>}
                                </div>
                                <div className="col-lg-3">
                                    {loading ? <div className="single_saas_info_card"> <img src={rolling} alt="" className="saas_info_img saas_card_loading" /> </div> : <div className="single_saas_info_card">
                                        <img className="saas_info_img" src={img3} alt="" />
                                        <span className="count_number">{saasUserInfo.total_branch}</span>
                                        <span className="title">Total Branches</span>
                                    </div>}

                                </div>
                                <div className="col-lg-3">
                                    {loading ? <div className="single_saas_info_card"> <img src={rolling} alt="" className="saas_info_img saas_card_loading" /> </div> :
                                        <div className="single_saas_info_card">
                                            <img className="saas_info_img" src={img4} alt="" />
                                            <span className="count_number">{saasUserInfo.available_branch_item}</span>
                                            <span className="title">Branch left</span>
                                        </div>}

                                </div>
                            </div>

                            {/* payment history */}
                            <div className="mt-4 saas_profile_history_wrapper">
                                <div className="saas_payment_header">
                                    <span className="title">Payment history</span>
                                    {/* <form class="form-inline my-2 my-lg-0">
                                        <input class="form-control saas_history_form mr-sm-2" type="search" placeholder="Search" aria-label="Search now" />
                                    </form> */}
                                </div>

                                {/* history table */}
                                <div class="table-responsive-xl mt-4" >
                                    <table class="table saas_history_table table-borderless">
                                        <thead className="saas_history_head">
                                            <tr key="1">
                                                <th>Sl</th>
                                                <th>Invoice</th>
                                                <th>Payment Gateway</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        {loading ?
                                            <div className="d-flex justify-content-center align-items-center">
                                                <img src={rolling} alt="" className="history_rolling" />
                                            </div> :
                                            <tbody className="saas_history_table_body">
                                                {
                                                    paymentHistories.map((item, index) => {
                                                        return (
                                                            <tr key="1" className="saas_history_table_row">
                                                                <td className="text-capitalize font-weight-bold">#{index + 1}</td>
                                                                <td className="text-capitalize font-weight-bold">#{item.invoice}</td>
                                                                <td className="text-capitalize font-weight-bold">{item.payment_gateway}</td>
                                                                <td className="text-capitalize font-weight-bold">{
                                                                    item.amount
                                                                }</td>
                                                                <td className="text-capitalize font-weight-bold">{item.payment_status}</td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        }
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </main>
        </>
    );
};

export default SaasProfile;
