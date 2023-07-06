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

const SaasProfile = () => {
    const { t } = useTranslation();
    const history = useHistory();
    //getting context values here
    let { loading, setLoading } = useContext(SettingsContext);
    let [foodLeft, setFoodLeft] = useState(null);
    let [saasUserInfo, setSaasUserInfo] = useState({
        name: null,
        email: null,
        phone: null,
        domain: null,
        rest_name: null,
        rest_address: null,
        subscription_name: null,
        total_items: null,
        payment_status: null,
        payment_gateway: null,
        amount: null,
        total_food_items: null,
        total_branch_items: null,
        payment_histories: []

    });

    const url = saas_apiUrl + '/api/user-subscription-data?' + saas_apiParams;

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
                    email: myJson.email,
                    phone: myJson.phone,
                    domain: myJson.domain,
                    rest_name: myJson.rest_name,
                    rest_address: myJson.rest_address,
                    subscription_name: myJson.subscription_name,
                    total_items: myJson.total_items,
                    payment_status: myJson.payment_status,
                    payment_gateway: myJson.payment_gateway,
                    amount: myJson.amount,
                    total_food_items: myJson.available_item,
                    total_branch_items: myJson.available_branch,
                    payment_histories: myJson.payment_histories
                })
            });
    }

    const foodItemLeftFunc = () => {
        // check how many orders are left 
        const url2 = saas_apiUrl + '/api/user-item-limit-left?' + saas_apiParams;// replace with base url (prince.thetestserver.xyz)
        axios.get(url2).then((res) => {
            setFoodLeft(res.data);
        }).catch(() => {
            return 'NO data'
        });
    }

    //useEffect == componentDidMount()
    useEffect(() => {
        setLoading(false);
        handleSaasUserInfo();
        foodItemLeftFunc();
    }, []);

    return (
        <>
            <Helmet>
                <title>{_t(t("Saas Info Page"))}</title>
            </Helmet>
            <main data-simplebar>
                <div className="container">
                    <div className="row t-mt-10 gx-2 justify-content-center">

                        <div className="col-lg-12 col-xxl-10 t-mb-30 mb-lg-0">
                            <div className="t-bg-white">
                                <div
                                    className="fk-scroll--pos-menu table-bottom-info-hide"
                                    data-simplebar
                                >
                                    <div className="t-pl-15 t-pr-15">
                                        <div class="row container d-flex justify-content-center">
                                            <div class="col-lg-12 mt-5 col-md-12">
                                                <div class="card saas-user-card-full">
                                                    <div class="row m-l-0 m-r-0">
                                                        <div class="col-sm-4  user-profile">
                                                            <div class="card-block text-center text-white saas_history_card">
                                                                <div class="mb-4 d-flex justify-content-start">
                                                                    <Avatar
                                                                        color={Avatar.getRandomColor('sitebase', ['red'])}
                                                                        name={saasUserInfo.name}
                                                                        size="100"
                                                                        round={true}
                                                                    />
                                                                </div>
                                                                <h6 className="text-left margin-bottom-20">user Information</h6>
                                                                {saasUserInfo.payment_histories.map((item, index) => {
                                                                    // return <h3>{item.invoice}</h3>

                                                                    return <ul key={index} className="text-dark text-left saas_history_list">
                                                                        <li><strong>Invoice :</strong>{item.invoice}</li>
                                                                        <li><strong>User Id :</strong>{item.user_id}</li>
                                                                        <li><strong>payment Status :</strong>{item.payment_status}</li>
                                                                        <li><strong>Payment Gateway :</strong>{item.payment_gateway}</li>
                                                                        <li><strong>Amount :</strong> {item.amount}</li>
                                                                    </ul>

                                                                })}
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-8">
                                                            <div class="card-block saas_user_info">
                                                                <h5 class="f-w-600 title">User Information</h5>
                                                                <div class="row">
                                                                    <ul className="saas_user_info_list">
                                                                        <li><strong>Email</strong>: {saasUserInfo.name}</li>
                                                                        <li><strong>Email</strong>: {saasUserInfo.email}</li>
                                                                        <li><strong>Phone</strong>: {saasUserInfo.phone}</li>
                                                                        <li><strong>domain</strong>: {saasUserInfo.domain}</li>
                                                                        <li><strong>rest_name</strong>: {saasUserInfo.rest_name}</li>
                                                                        <li><strong>rest_address</strong>: {saasUserInfo.rest_address}</li>
                                                                        <li><strong>subscription_name</strong>: {saasUserInfo.subscription_name}</li>
                                                                        <li><strong>total_items</strong>: {saasUserInfo.total_items}</li>
                                                                        <li><strong>payment_status</strong>: {saasUserInfo.payment_status}</li>
                                                                        <li><strong>payment_gateway</strong>: {saasUserInfo.payment_gateway}</li>
                                                                        <li><strong>amount</strong>: {saasUserInfo.amount}</li>
                                                                        <li><strong>available_item</strong>: {saasUserInfo.available_item}</li>
                                                                        <li><strong>Branch</strong>: 100/{saasUserInfo.total_branch_items}</li>
                                                                        <li><strong>Food Item</strong>: {foodLeft}/{saasUserInfo.total_food_items}</li>

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

                    </div>
                </div>
            </main>
        </>
    );
};

export default SaasProfile;
