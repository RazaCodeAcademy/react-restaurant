import React, { useEffect, useContext, useState } from "react";
import { useHistory, NavLink } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../BaseUrl";

//functions
import { _t, tableLoading } from "../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";

//context consumer
import { SettingsContext } from "../../contexts/Settings";

const InstallPermission = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here
  const [theData, setTheData] = useState({
    php_version: null,
    curl_status: null,
    env_status: null,
    pdo_status: null
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(true);
    handleCheckPermission();
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, []);

  //check permission
  const handleCheckPermission = () => {

    const url = BASE_URL + "/check-permission";
    return axios
      .get(url)
      .then((res) => {
        setTheData({
          php_version: res.data[0],
          curl_status: res.data[1],
          env_status: res.data[2],
          pdo_status: res.data[3]
        });
      })
      .catch((err) => { });
  };

  return (
    <>
      <Helmet>
        <title>Checking Permissions</title>
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
                            Checking Permissions
                          </h3>
                          <p className="sm-text">
                            We ran diagnosis on your server. Review the items
                            that have a red mark on it. <br /> If everything is
                            green, you are good to go to the next step.
                          </p>
                        </div>

                        <div className="m-5">
                          <ul className="list-group">
                            <li className="list-group-item text-semibold">
                              Php version 8+
                              {theData.php_version !== null &&
                                theData.php_version > 7.3 ? (
                                <i className="fa fa-check text-success pull-right"></i>
                              ) : (
                                <i className="fa fa-close text-danger pull-right"></i>
                              )}
                            </li>
                            <li className="list-group-item text-semibold">
                              Curl Enabled
                              {theData.curl_status !== null &&
                                theData.curl_status === true ? (
                                <i className="fa fa-check text-success pull-right"></i>
                              ) : (
                                <i className="fa fa-close text-danger pull-right"></i>
                              )}
                            </li>
                            <li className="list-group-item text-semibold">
                              <b>.env</b> File Writeable Permission
                              {theData.env_status !== null &&
                                theData.env_status === true ? (
                                <i className="fa fa-check text-success pull-right"></i>
                              ) : (
                                <i className="fa fa-close text-danger pull-right"></i>
                              )}
                            </li>
                            <li className="list-group-item text-semibold">
                              <b>.env</b> Check PDO
                              {theData.pdo_status !== null &&
                                theData.pdo_status === true ? (
                                <i className="fa fa-check text-success pull-right"></i>
                              ) : (
                                <i className="fa fa-close text-danger pull-right"></i>
                              )}
                            </li>
                          </ul>
                        </div>

                        <p className="my-2 mx-5">
                          <div className="text-center text-uppercase col-4 offset-4 mt-4 mb-3">
                            {theData.php_version !== null &&
                              theData.php_version > 7.3 &&
                              theData.curl_status !== null &&
                              theData.pdo_status === true &&
                              (theData.curl_status === true &&
                                theData.env_status) !== null &&
                              theData.env_status === true ? (
                              <NavLink
                                to="/installation/database-setup"
                                className="btn btn-secondary btn-block"
                              >
                                {" "}
                                Go To Next Step
                              </NavLink>
                            ) : (
                              <div className="text-center text-primary text-uppercase">
                                Please contact your server provider to configure
                                the server accordring to the requirements
                              </div>
                            )}
                          </div>
                        </p>

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

export default InstallPermission;
