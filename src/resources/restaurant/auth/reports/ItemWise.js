import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  tableLoading,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chart from "react-apexcharts";
import Moment from "react-moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//pages & includes
import ReportSidebar from "./ReportSidebar";

//context consumer
import { SettingsContext } from "../../../../contexts/Settings";

const ItemWise = () => {
  const { t } = useTranslation();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);
  // States hook here
  const [amountChart, setAmountChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [],
      },
      labels: { show: false },
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(false);

  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  //get ItemWise reports filter
  const getItemWiseSelected = () => {
    if (startDate !== null && endDate !== null) {
      setLoading(true);
      var fromDate = startDate.toISOString();
      var toDate = endDate.toISOString();
      const url = BASE_URL + "/settings/get-food-item-report";
      let formData = {
        fromDate,
        toDate,
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
              xaxis: {
                ...amountChart.options.xaxis,
                categories: res.data[0],
                labels: { show: false },
              },
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
        <title>{_t(t("Food item wise report"))}</title>
      </Helmet>

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
                                  {_t(t("Food Item Wise report"))}
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
                          <div className="col-5 col-md-4 t-mb-15 mb-md-0 d-none d-md-block text-right">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text py-2"
                              onClick={getItemWiseSelected}
                            >
                              {_t(t("Generate Report"))}
                            </button>
                          </div>

                          <div className="col-5 col-md-8 t-mb-15 mb-md-0 d-block d-md-none">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text"
                              onClick={getItemWiseSelected}
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
                                  type="line"
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
                                            {_t(t("Name"))}
                                          </th>
                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Group"))}
                                          </th>
                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Variation"))}
                                          </th>
                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Qty"))}
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

                                              <td className="xsm-text align-middle text-center">
                                                {item.food_item}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.food_group}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.variation !== null
                                                  ? item.variation
                                                  : "-"}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.quantity}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(item.price)}
                                                {currencySymbolRight()}
                                              </td>
                                              <td className="xsm-text align-middle text-center">
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

export default ItemWise;
