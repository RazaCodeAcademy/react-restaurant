import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../BaseUrl";

//functions
import { _t, tableLoading } from "../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../contexts/Settings";

const ImportDb = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here

  //useEffect == componentDidMount()
  useEffect(() => {
    handleCheckDbConnection();
  }, []);

  //check db connection
  const handleCheckDbConnection = () => {
    setLoading(true);
    const url = BASE_URL + "/check-database-connection";
    return axios
      .get(url)
      .then((res) => {
        if (res.data === "error") {
          setLoading(false);
          history.push("/installation/database-setup");
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        history.push("/installation/database-setup");
      });
  };

  //upload fresh sql
  const handleFreshSqlUpload = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/import-fresh-sql";
    return axios
      .get(url)
      .then((res) => {
        setLoading(false);
        if (res.data === "ok") {
          history.push("/installation/add-admin-user");
        } else {
          setLoading(false);
          toast.error(`${_t(t("Something went wrong, please try again"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(`${_t(t("Something went wrong, please try again"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //upload demo sql
  const handleDemoSqlUpload = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/import-demo-sql";
    return axios
      .get(url)
      .then((res) => {
        setLoading(false);
        if (res.data === "ok") {
          history.push("/installation/add-admin-user");
        } else {
          setLoading(false);
          toast.error(`${_t(t("Something went wrong, please try again"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  return (
    <>
      <Helmet>
        <title>Import SQL</title>
      </Helmet>

      {/* main body */}
      <div id="main" className="main-height-100" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            {/* Rightbar contents */}
            <div className="col-10 offset-1 t-mb-30 mb-lg-0">
              <div className="t-bg-white">
                <div className="installation-full-page" data-simplebar>
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
                          <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list"></li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center"></div>
                          </div>
                        </div>

                        {/* Form starts here */}
                        <div class="text-center">
                          <h3 class="text-success font-weight-bold text-uppercase">
                            Import the Database SQL
                          </h3>
                        </div>
                        <p class="border mx-2 py-5 text-center mt-5">
                          To install a fresh system without any demo data, click
                          here..
                          <br />
                          <button
                            class="btn btn-secondary text-uppercase sm-text mt-3"
                            onClick={handleFreshSqlUpload}
                          >
                            Import fresh SQL
                          </button>
                        </p>

                        {/* <p class="border mx-2 py-5 text-center mt-3">
                          To install the system including demo data, click
                          here..
                          <br />
                          <button
                            class="btn btn-primary text-uppercase sm-text mt-3"
                            onClick={handleDemoSqlUpload}
                          >
                            Import DEMO SQL
                          </button>
                        </p> */}

                        {/* Form ends here */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Rightbar contents end*/}
          </div>
        </div>
      </div>
      {/* main body ends */}
    </>
  );
};

export default ImportDb;
