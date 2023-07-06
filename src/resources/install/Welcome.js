import React, { useEffect, useContext, useState } from "react";
import { NavLink, useHistory } from "react-router-dom";

//functions
import { _t, tableLoading } from "../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../contexts/Settings";

const Welcome = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here

  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <Helmet>
        <title>Installation | Khadyo Restaurant Software</title>
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
                          <h3 className="text-success font-weight-bold">
                            Khadyo Restaurant Software Installation
                          </h3>
                          <p className="sm-text">
                            You need to know the following items before
                            proceeding
                          </p>
                        </div>
                        <div className="m-5">
                          <ul className="list-group">
                            <li className="list-group-item">
                              <h6 className="font-weight-normal">
                                <i className="fa  fa-check"></i> Database Host
                                Name
                              </h6>
                            </li>
                            <li className="list-group-item">
                              <h6 className="font-weight-normal">
                                <i className="fa fa-check"></i> Database Name
                              </h6>
                            </li>
                            <li className="list-group-item">
                              <h6 className="font-weight-normal">
                                <i className="fa fa-check"></i> Database
                                Username
                              </h6>
                            </li>
                            <li className="list-group-item">
                              <h6 className="font-weight-normal">
                                <i className="fa fa-check"></i> Database
                                Password
                              </h6>
                            </li>
                          </ul>
                        </div>

                        <div className="m-2">
                          <p>
                            During the installation process. we will check if
                            the files there needed to be written (
                            <strong>.env file</strong>) have{" "}
                            <strong>write permission</strong>. We will also
                            check if
                            <strong> curl</strong> and   <strong> PDO</strong> is enabled on your server or
                            not.
                          </p>
                          <br />
                          <p>
                            Gather the information mentioned above before
                            hitting the start installation button. if you are
                            ready, click below...
                          </p>

                          <div className="text-center text-uppercase col-4 offset-4 mt-4 mb-3">
                            <NavLink
                              to="/installation/permission-chcek"
                              className="btn btn-secondary btn-block"
                            >
                              {" "}
                              Start Installation Process
                            </NavLink>
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
      </div>
      {/* main body ends */}
    </>
  );
};

export default Welcome;
