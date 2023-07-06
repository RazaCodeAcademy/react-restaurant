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

const DbSetup = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here
  //new item
  let [dbData, setDbData] = useState({
    DB_HOST: "localhost",
    DB_PORT: "3306",
    DB_DATABASE: null,
    DB_USERNAME: null,
    DB_PASSWORD: null,
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(false);
  }, []);

  //set data
  const handleChange = (e) => {
    setDbData({
      ...dbData,
      [e.target.name]: e.target.value,
    });
  };

  //save data
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + "/setup/database";
    return axios
      .post(url, dbData)
      .then(() => {
        handleCheckDbConnection();
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  //check db connection
  const handleCheckDbConnection = () => {
    const url = BASE_URL + "/check-database-connection";
    return axios
      .get(url)
      .then((res) => {
        if (res.data === "ok") {
          setLoading(false);
          history.push("/installation/import-database");
        } else {
          setLoading(false);
          toast.error(
            `${_t(
              t("Something went wrong, could not establish database connection")
            )}`,
            {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            }
          );
        }
      })
      .catch(() => {
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
  return (
    <>
      <Helmet>
        <title>Setup your database</title>
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
                        <div className="text-center">
                          <h3 className="text-success font-weight-bold text-uppercase">
                            Setup your database
                          </h3>
                        </div>
                        <form
                          onSubmit={handleSubmit}
                          className="col-12 col-md-8 offset-md-2 sm-text"
                        >
                          <div className="form-group mb-3">
                            <label>Database Host</label>
                            <input
                              className="form-control"
                              placeholder="Database Host"
                              name="DB_HOST"
                              value={dbData.DB_HOST}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="form-group mb-3">
                            <label>
                              Database Port{" "}
                              <small className="text-secondary">
                                (3306 *default, 3308, 8888, 8889, 7888 etc..)
                                <a
                                  href="https://www.networkinghowtos.com/howto/common-database-server-port-numbers/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="t-link"
                                >
                                  <i className="fa fa-info-circle ml-2 lg-text"></i>
                                </a>
                              </small>
                            </label>
                            <input
                              className="form-control"
                              placeholder="Database Port"
                              name="DB_PORT"
                              value={dbData.DB_PORT}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="form-group mb-3">
                            <label>Database Name</label>
                            <input
                              className="form-control"
                              placeholder="Database Name"
                              name="DB_DATABASE"
                              value={dbData.DB_DATABASE}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="form-group mb-3">
                            <label>Database Username</label>
                            <input
                              className="form-control"
                              placeholder="Database Username"
                              name="DB_USERNAME"
                              value={dbData.DB_USERNAME}
                              onChange={handleChange}
                              required
                            />
                          </div>

                          <div className="form-group mb-3">
                            <label>Database Password</label>
                            <input
                              className="form-control"
                              placeholder="Database Password"
                              type="password"
                              name="DB_PASSWORD"
                              value={dbData.DB_PASSWORD}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="text-uppercase mt-4 mb-3">
                            <button
                              className="btn btn-secondary text-uppercase"
                              type="submit"
                            >
                              Save the configuration
                            </button>
                          </div>
                        </form>
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

export default DbSetup;
