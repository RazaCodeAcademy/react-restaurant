import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  modalLoading,
  tableLoading,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
  getSystemSettings,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "react-apexcharts";
import Moment from "react-moment";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//pages & includes
import ReportSidebar from "./ReportSidebar";

//context consumer
import { SettingsContext } from "../../../../contexts/Settings";
import { UserContext } from "../../../../contexts/User";

const UserWise = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating, generalSettings } =
    useContext(SettingsContext);
  let { adminStaffForSearch } = useContext(UserContext);

  // States hook here
  const [amountChart, setAmountChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [],
      },
    },
    series: [
      {
        name: _t(t("Amount")),
        data: [],
      },
    ],
  });

  //all data
  const [reportData, setReportData] = useState(null);

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

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(false);
  const [theUser, setTheUser] = useState(null);
  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [adminStaffForSearch]);

  const handleUser = (user) => {
    setTheUser(user);
  };

  //get UserWise reports filter
  const getUserWiseSelected = () => {
    if (theUser !== null && startDate !== null && endDate !== null) {
      setLoading(true);
      var fromDate = startDate.toISOString();
      var toDate = endDate.toISOString();
      const url = BASE_URL + "/settings/get-user-report";
      let formData = {
        fromDate,
        toDate,
        user: theUser,
      };
      return axios
        .post(url, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          let formattedAmount = res.data[1].map((item) =>
            parseFloat(formatPrice(item))
          );
          setAmountChart({
            ...amountChart,
            options: {
              ...amountChart.options,
              xaxis: { ...amountChart.options.xaxis, categories: res.data[0] },
            },
            series: [
              { name: amountChart.series[0].name, data: formattedAmount },
            ],
          });
          setReportData(res.data[2]);
          setGeneratedReport(true);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
        });
    } else {
      toast.error(
        `${_t(t("Please select all the field to generate report"))}`,
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
        <title>{_t(t("POS user wise report"))}</title>
      </Helmet>

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
                                                  `${
                                                    propertyItem.quantity > 1
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
                                                  `${
                                                    propertyItem.quantity > 1
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
                          <td className="text-capitalized">{_t(t("Cgst"))}</td>
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
                          <td className="text-capitalized">{_t(t("Sgst"))}</td>
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
            {/* left Sidebar */}
            <div className="col-lg-3 col-xxl-2 t-mb-30 mb-lg-0">
              <ReportSidebar />
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
                      <div key="smtp-form">
                        <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                          <div className="col-12 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize">
                                  {_t(t("POS user Wise report"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="row gx-2 mt-2">
                          <div className="col-12 col-md-2 d-md-block">
                            <DatePicker
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              className="form-control sm-text py-2 t-mb-15 mb-md-0"
                              placeholderText={_t(t("From date"))}
                              shouldCloseOnSelect={false}
                            />
                          </div>
                          <div className="col-12 col-md-2 t-mb-15 mb-md-0">
                            <DatePicker
                              selected={endDate}
                              onChange={(date) => setEndDate(date)}
                              peekNextMonth
                              showMonthDropdown
                              showYearDropdown
                              dropdownMode="select"
                              className="form-control sm-text py-2"
                              placeholderText={_t(t("To date"))}
                              shouldCloseOnSelect={false}
                            />
                          </div>
                          <Select
                            options={adminStaffForSearch && adminStaffForSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            value={theUser}
                            classNamePrefix="select"
                            className="xsm-text col-md-4 d-none d-md-block "
                            onChange={handleUser}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Select an user")) + ".."}
                          />

                          <Select
                            options={adminStaffForSearch && adminStaffForSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            value={theUser}
                            classNamePrefix="select"
                            className="xsm-text col-5 mb-2 mb-md-0 d-block d-md-none"
                            onChange={handleUser}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Select an user")) + ".."}
                          />

                          <div className="col-4 t-mb-15 mb-md-0 d-none d-md-block text-right">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text py-2"
                              onClick={getUserWiseSelected}
                            >
                              {_t(t("Generate Report"))}
                            </button>
                          </div>

                          <div className="col-5 t-mb-15 mb-md-0 d-block d-md-none">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text"
                              onClick={getUserWiseSelected}
                            >
                              {_t(t("Generate Report"))}
                            </button>
                          </div>
                        </div>
                        {generatedReport ? (
                          <>
                            <div className="row gx-2 justify-content-center t-pt-15">
                              <div className="col-12 mb-md-0">
                                <Chart
                                  options={amountChart.options}
                                  series={amountChart.series}
                                  type="bar"
                                  width="100%"
                                  height="350px"
                                />
                              </div>
                            </div>
                            {reportData !== null &&
                              reportData !== undefined &&
                              reportData.length > 0 && (
                                <div className="row gx-2 justify-content-center t-pb-15 t-pt-15">
                                  <div className="col-12 t-mb-15 mb-md-0 table-responsive">
                                    <table className="table table-bordered table-hover min-table-height mt-3">
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
                                            {_t(t("Bill"))}
                                          </th>

                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("branch"))}
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
                                            {_t(t("Date"))}
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="align-middle">
                                        {/* loop here*/}
                                        {reportData.map((item, index) => {
                                          return (
                                            <tr
                                              className="align-middle"
                                              key={index}
                                            >
                                              <th
                                                scope="row"
                                                className="xsm-text text-capitalize align-middle text-center"
                                              >
                                                {index + 1}
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
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  item.total_payable
                                                )}
                                                {currencySymbolRight()}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.branch_name}
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
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <Moment format="LL">
                                                  {item.created_at}
                                                </Moment>
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="row gx-2 justify-content-center t-pt-15">
                            <div className="col-8 mt-5 py-4 mb-md-0 card text-center text-uppercase sm-text">
                              {_t(
                                t("Generate report following the above field")
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

export default UserWise;
