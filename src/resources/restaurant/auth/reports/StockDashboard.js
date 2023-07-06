import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  formatPrice,
  tableLoading,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Chart from "react-apexcharts";

//pages & includes
import ReportSidebar from "./ReportSidebar";

//context consumer
import { SettingsContext } from "../../../../contexts/Settings";

const StockDashboard = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here
  //donout chart
  const [donoutWithPattern, setDonoutWithPattern] = useState({
    series: [],
    options: {
      chart: {
        width: 380,
        type: "donut",
        dropShadow: {
          enabled: true,
          color: "#111",
          top: -1,
          left: 3,
          blur: 3,
          opacity: 0.2,
        },
      },
      stroke: {
        width: 0,
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                showAlways: true,
                show: true,
              },
            },
          },
        },
      },
      labels: [],
      dataLabels: {
        dropShadow: {
          blur: 3,
          opacity: 0.8,
        },
      },
      fill: {
        type: "pattern",
        opacity: 1,
        pattern: {
          enabled: true,
          style: [
            "verticalLines",
            "squares",
            "horizontalLines",
            "circles",
            "slantedLines",
          ],
        },
      },
      states: {
        hover: {
          filter: "none",
        },
      },
      theme: {
        palette: "palette2",
      },

      title: {
        text: _t(t("Today's total revenue of all branches")),
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  });

  //pie chart
  const [options, setOptions] = useState({
    series: [],
    options: {
      chart: {
        width: 380,
        type: "pie",
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],

      title: {
        text: _t(t("Today's revenue by food group")),
      },
    },
  });

  //monthly branch
  const [chart, setChart] = useState({
    options: {
      xaxis: {
        categories: [],
        labels: { show: true },
      },
    },
    series: [
      {
        name: _t(t("Amount")),
        data: [],
      },
    ],
  });

  //monthly branch
  const [chartitem, setChartItem] = useState({
    options: {
      xaxis: {
        categories: [],
        labels: { show: false },
      },
    },
    series: [
      {
        name: _t(t("Amount")),
        data: [],
      },
    ],
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(true);
    getReport();
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  //get reports
  const getReport = () => {
    const url = BASE_URL + "/settings/report-dashboard";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        dailyBranch(res.data[0], res.data[1]);
        monthlyBranch(res.data[2], res.data[3]);
        dailyGroup(res.data[4], res.data[5]);
        monthlyItems(res.data[6], res.data[7]);
      })
      .catch((error) => {});
  };

  //set daily branch
  const dailyBranch = (name, amount) => {
    let formattedAmount = amount.map((item) => parseFloat(formatPrice(item)));
    setDonoutWithPattern({
      series: formattedAmount,
      options: {
        chart: {
          width: 380,
          type: "donut",
          dropShadow: {
            enabled: true,
            color: "#111",
            top: -1,
            left: 3,
            blur: 3,
            opacity: 0.2,
          },
        },
        stroke: {
          width: 0,
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  showAlways: true,
                  show: true,
                },
              },
            },
          },
        },
        labels: name,
        dataLabels: {
          dropShadow: {
            blur: 3,
            opacity: 0.8,
          },
        },
        fill: {
          type: "pattern",
          opacity: 1,
          pattern: {
            enabled: true,
            style: [
              "verticalLines",
              "squares",
              "horizontalLines",
              "circles",
              "slantedLines",
            ],
          },
        },
        states: {
          hover: {
            filter: "none",
          },
        },
        theme: {
          palette: "palette2",
        },

        title: {
          text: _t(t("Today's total revenue of all branches")),
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],
      },
    });
  };

  //set daily foodgroup
  const dailyGroup = (name, amount) => {
    let formattedAmount = amount.map((item) => parseFloat(formatPrice(item)));

    setOptions({
      series: formattedAmount,
      options: {
        chart: {
          width: 380,
          type: "pie",
        },
        labels: name,
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200,
              },
              legend: {
                position: "bottom",
              },
            },
          },
        ],

        title: {
          text: _t(t("Today's revenue by food group")),
        },
      },
    });
  };

  //set monthly branch
  const monthlyBranch = (name, amount) => {
    let formattedAmount = amount.map((item) => parseFloat(formatPrice(item)));
    setChart({
      ...chart,
      options: {
        ...chart.options,
        xaxis: { ...chart.options.xaxis, categories: name },
      },
      series: [{ name: chart.series[0].name, data: formattedAmount }],
    });
  };

  //set monthly items
  const monthlyItems = (name, amount) => {
    let formattedAmount = amount.map((item) => parseFloat(formatPrice(item)));
    setChartItem({
      ...chartitem,
      options: {
        ...chartitem.options,
        xaxis: { ...chartitem.options.xaxis, categories: name },
      },
      series: [{ name: chartitem.series[0].name, data: formattedAmount }],
    });
  };
  return (
    <>
      <Helmet>
        <title>{_t(t("StockDashboard"))}</title>
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
                                  {_t(t("StockDashboard"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="row gx-2 justify-content-center t-pt-15 t-pb-15">
                          <div className="col-12 col-md-5 t-mb-15 mb-md-0 pie">
                            <Chart
                              options={donoutWithPattern.options}
                              series={donoutWithPattern.series}
                              type="donut"
                              width="380"
                            />
                          </div>
                          <div className="col-12 col-md-5 t-mb-15 mb-md-0 pie">
                            <Chart
                              options={options.options}
                              series={options.series}
                              type="pie"
                              width="380"
                            />
                          </div>
                        </div>
                        <hr />
                        <div className="row gx-2 justify-content-start ml-3">
                          <div className="col-4 t-mb-15 mb-md-0">
                            <h4 className="py-1 font-weight-bold text-dark sm-text rounded-sm">
                              {_t(t("Last month's revenue of each branch"))}
                            </h4>
                          </div>
                        </div>

                        <div className="row gx-2 justify-content-center t-pt-15 t-pb-15">
                          <div className="col-12 t-mb-15 mb-md-0">
                            <Chart
                              options={chart.options}
                              series={chart.series}
                              type="bar"
                              width="100%"
                              height="300"
                            />
                          </div>
                        </div>

                        <div className="row gx-2 justify-content-center">
                          <div className="col-4 t-mb-15 mb-md-0">
                            <div className="py-1 sm-text text-center rounded-sm">
                              {_t(t("AMOUNT / BRANCH"))}
                            </div>
                          </div>
                        </div>
                        <hr />

                        <div className="row gx-2 justify-content-start ml-3">
                          <div className="col-4 t-mb-15 mb-md-0">
                            <h4 className="py-1 font-weight-bold text-dark sm-text rounded-sm">
                              {_t(t("Last month's item wise revenue"))}
                            </h4>
                          </div>
                        </div>

                        <div className="row gx-2 justify-content-center t-pt-15 t-pb-15">
                          <div className="col-12 t-mb-15 mb-md-0">
                            <Chart
                              options={chartitem.options}
                              series={chartitem.series}
                              type="line"
                              width="100%"
                              height="300"
                            />
                          </div>
                        </div>
                        <div className="row gx-2 justify-content-center">
                          <div className="col-4 t-mb-15 mb-md-0">
                            <div className="pb-3 sm-text text-center rounded-sm">
                              {_t(t("AMOUNT / BRANCH"))}
                            </div>
                          </div>
                        </div>
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

export default StockDashboard;
