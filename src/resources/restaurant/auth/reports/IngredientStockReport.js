import React, { useEffect, useContext, useState } from "react";
import { useHistory, NavLink } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  tableLoading,
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
import { RestaurantContext } from "../../../../contexts/Restaurant";

const IngredientStockReport = () => {
  const { t } = useTranslation();
  //getting context values here
  let { loading, setLoading, dataPaginating, generalSettings } =
    useContext(SettingsContext);
  let { branchForSearch } = useContext(RestaurantContext);

  //all data
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(false);
  const [branch, setBranch] = useState(null);
  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleBranch = (branch) => {
    setBranch(branch);
  };

  //get IngredientStockReport reports filter
  const getIngredientStockReportSelected = () => {
    if (branch !== null && startDate !== null && endDate !== null) {
      setLoading(true);
      var fromDate = startDate.toISOString();
      var toDate = endDate.toISOString();
      const url = BASE_URL + "/settings/get-food-stock-report";
      let formData = {
        fromDate,
        toDate,
        branch,
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
        <title>{_t(t("Ingredient Stock Report"))}</title>
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
                                  {_t(t("Ingredient Stock Report"))}
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
                            options={branchForSearch && branchForSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            value={branch}
                            classNamePrefix="select"
                            className="xsm-text col-md-4 d-none d-md-block "
                            onChange={handleBranch}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Select a branch")) + ".."}
                          />

                          <Select
                            options={branchForSearch && branchForSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            value={branch}
                            classNamePrefix="select"
                            className="xsm-text col-5 mb-2 mb-md-0 d-block d-md-none"
                            onChange={handleBranch}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Select a branch")) + ".."}
                          />

                          <div className="col-4 t-mb-15 mb-md-0 d-none d-md-block text-right">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text py-2"
                              onClick={getIngredientStockReportSelected}
                            >
                              {_t(t("Generate Report"))}
                            </button>
                          </div>

                          <div className="col-5 t-mb-15 mb-md-0 d-block d-md-none">
                            <button
                              className="btn btn-block btn-primary text-uppercase sm-text"
                              onClick={getIngredientStockReportSelected}
                            >
                              {_t(t("Generate Report"))}
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
                                            {_t(t("Branch"))}
                                          </th>
                                          <th
                                            scope="col"
                                            className="sm-text text-capitalize align-middle text-center border-1 border"
                                          >
                                            {_t(t("Date"))}
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
                                            {_t(t("Stock"))}
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
                                                {item.branch_name}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.date}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                <Moment format="LT">
                                                  {
                                                    new Date(
                                                      parseInt(item.started_at)
                                                    )
                                                  }
                                                </Moment>
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                <NavLink
                                                  className={`btn xxsm-text ${item.ended_at === null
                                                    ? "btn-success"
                                                    : "btn-success"
                                                    } btn-sm p-1`}
                                                  to={
                                                    `/dashboard/ingredient-stock/` +
                                                    item.started_at
                                                  }
                                                >
                                                  {_t(t("Check Stock"))}
                                                </NavLink>
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

export default IngredientStockReport;
