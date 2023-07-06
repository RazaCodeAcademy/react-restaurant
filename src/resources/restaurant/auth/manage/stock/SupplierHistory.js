import React, { useEffect, useContext, useState } from "react";
import { useHistory, NavLink } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

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
} from "../../../../../functions/Functions";
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
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { UserContext } from "../../../../../contexts/User";

const SupplierHistory = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating, generalSettings } =
    useContext(SettingsContext);
  let { getSupplier, supplierForSearch } = useContext(UserContext);

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
  const [supplier, setSupplier] = useState(null);
  const [food, setFood] = useState(null);
  //useEffect == componentDidMount()
  useEffect(() => {
    getSupplier();
  }, []);

  const handleBranch = (supplier) => {
    setSupplier(supplier);
  };

  const handleFood = (e) => {
    setFood(e.target.value);
  };
  //get SupplierHistory reports filter
  const getSupplierHistorySelected = () => {
    if (
      supplier !== null &&
      startDate !== null &&
      endDate !== null &&
      food !== null
    ) {
      setLoading(true);
      var fromDate = startDate.toISOString();
      var toDate = endDate.toISOString();
      const url = BASE_URL + "/settings/get-supplier-report";
      let formData = {
        fromDate,
        toDate,
        supplier,
        food,
      };
      return axios
        .post(url, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setReportData(res.data);
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
        <title>{_t(t("Supplier History"))}</title>
      </Helmet>

      {/* Settle modal */}
      <div className="modal fade" id="orderDetails" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {/* show order token on modal header */}
                  {_t(t("Purchase Details"))}
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
                <table className="table table-striped table-sm text-center mt-3">
                  <thead className="bg-info text-white text-uppercase">
                    <tr>
                      <th scope="col" colSpan="2">
                        {_t(t("Purchase details"))}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-capitalized">{_t(t("Supplier"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.supplier_name}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Invoice"))}</td>
                      <td>
                        {checkOrderDetails.item &&
                          checkOrderDetails.item.invoice_number}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Purchased Date"))}
                      </td>
                      <td>
                        <Moment format="LL">
                          {checkOrderDetails.item &&
                            checkOrderDetails.item.purchase_date}
                        </Moment>
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Total Bill"))}
                      </td>
                      <td>
                        {currencySymbolLeft()}
                        {formatPrice(
                          checkOrderDetails.item
                            ? checkOrderDetails.item.total_bill
                            : 0
                        )}
                        {currencySymbolRight()}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">
                        {_t(t("Paid Amount"))}
                      </td>
                      <td>
                        {currencySymbolLeft()}
                        {formatPrice(
                          checkOrderDetails.item
                            ? checkOrderDetails.item.paid_amount
                            : 0
                        )}
                        {currencySymbolRight()}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-capitalized">{_t(t("Due"))}</td>
                      <td>
                        {currencySymbolLeft()}
                        {formatPrice(
                          checkOrderDetails.item
                            ? checkOrderDetails.item.credit_amount
                            : 0
                        )}
                        {currencySymbolRight()}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* show this if order settle is not true, if true show payment input field */}
                {!checkOrderDetails.settle ? (
                  <div class="col-12 filtr-item">
                    <div class="fk-order-token t-bg-white">
                      <div class="fk-order-token__body">
                        <div class="fk-addons-table">
                          <div class="fk-addons-table__head text-center">
                            {_t(t("purchased items"))}
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
                                  {_t(t("name"))}
                                </span>
                              </div>
                              <div class="col-4  text-center pl-2 border-right">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("qty"))}
                                </span>
                              </div>
                              <div class="col-2 text-center">
                                <span class="fk-addons-table__info-text text-capitalize">
                                  {_t(t("rate"))}
                                </span>
                              </div>
                            </div>
                          </div>
                          {checkOrderDetails.item &&
                            checkOrderDetails.item.items.map(
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
                                          {food === "food"
                                            ? thisItem.food_name
                                            : thisItem.ingredient_name}
                                        </span>
                                      </div>
                                      <div class="col-4 text-center border-right t-pl-10 t-pr-10">
                                        <span class="fk-addons-table__info-text text-capitalize d-block t-pt-5">
                                          {thisItem.qty}
                                        </span>
                                      </div>
                                      <div class="col-2 text-center d-flex">
                                        <span class="fk-addons-table__info-text text-capitalize m-auto">
                                          {currencySymbolLeft()}
                                          {formatPrice(thisItem.rate)}
                                          {currencySymbolRight()}
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
                ) : (
                  ""
                )}
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
                      <div key="smtp-form">
                        <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                          <div className="col-12 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize">
                                  {_t(t("Supplier History"))}
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
                            options={supplierForSearch && supplierForSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            value={supplier}
                            classNamePrefix="select"
                            className="xsm-text col-md-4 d-none d-md-block "
                            onChange={handleBranch}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Select supplier")) + ".."}
                          />

                          <Select
                            options={supplierForSearch && supplierForSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            value={supplier}
                            classNamePrefix="select"
                            className="xsm-text col-5 mb-2 mb-md-0 d-block d-md-none"
                            onChange={handleBranch}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Select supplier")) + ".."}
                          />

                          <div className="col-2 t-mb-15 mb-md-0 d-none d-md-block text-right">
                            <select
                              className="form-control"
                              onChange={handleFood}
                            >
                              <option value="">{_t(t("Select one"))}</option>
                              <option value="food" selected={food === "food"}>
                                {_t(t("Food"))}
                              </option>
                              <option
                                value="ingredient"
                                selected={food === "ingredient"}
                              >
                                {_t(t("Ingredient"))}
                              </option>
                            </select>
                          </div>

                          <div className="col-2 t-mb-15 mb-md-0 d-none d-md-block text-right">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text py-2"
                              onClick={getSupplierHistorySelected}
                            >
                              {_t(t("Filter"))}
                            </button>
                          </div>

                          <div className="col-5 t-mb-15 mb-md-0 d-block d-md-none">
                            <select
                              className="form-control"
                              onChange={handleFood}
                            >
                              <option value="">{_t(t("Select one"))}</option>
                              <option value="food" selected={food === "food"}>
                                {_t(t("Food"))}
                              </option>
                              <option
                                value="ingredient"
                                selected={food === "ingredient"}
                              >
                                {_t(t("Ingredient"))}
                              </option>
                            </select>
                          </div>

                          <div className="col-5 t-mb-15 mb-md-0 d-block d-md-none">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text"
                              onClick={getSupplierHistorySelected}
                            >
                              {_t(t("Filter"))}
                            </button>
                          </div>
                        </div>
                        {generatedReport ? (
                          <>
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
                                            {_t(t("Supplier"))}
                                          </th>

                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Invoice"))}
                                          </th>

                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Purchased"))}
                                          </th>

                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Total"))}
                                          </th>

                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Due"))}
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

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.supplier_name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.invoice_number}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <Moment format="LL">
                                                  {item.purchase_date}
                                                </Moment>
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(item.total_bill)}
                                                {currencySymbolRight()}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  item.credit_amount
                                                )}
                                                {currencySymbolRight()}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
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
                                                  {_t(t("View"))}
                                                </span>
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
                              {_t(t("Filter data following the above field"))}
                            </div>
                          </div>
                        )}
                        {reportData && !reportData.length > 0 && (
                          <div className="row gx-2 justify-content-center t-pt-15">
                            <div className="col-8 mt-5 py-4 mb-md-0 card text-center text-uppercase sm-text">
                              {_t(t("No Data Available"))}
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

export default SupplierHistory;
