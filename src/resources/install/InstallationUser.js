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

const InstallationUser = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here
  const [details, setDetails] = useState({
    name: null,
    email: null,
    phn_no: null,
    password: null,
    password_confirmation: null,
    purchase_key: null,
    ip_address: null,
    domain_name: null,
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    async function fetchMyAPI() {
      const url = BASE_URL + "/setup/check_ip_domain";
      let response = await axios.get(url);
      setDetails({
        ...details,
        ip_address: response.data[0],
        domain_name: response.data[1],
      });
      setLoading(false);
    }
    fetchMyAPI();
  }, []);

  //set data
  const handleChange = (e) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  //save data
  const handleSubmit = (e) => {
    e.preventDefault();
    if (details.password === details.password_confirmation) {
      setLoading(true);
      let formData = {
        purchase_key: details.purchase_key,
        ip_address: details.ip_address,
        domain_name: details.domain_name,
      };
      const verifyUrl =
        window.location.protocol +
        "//verify.softtech-it.com/api/khadyo-verify-purchase-code";
      return axios
        .post(verifyUrl, formData)
        .then((response) => {
          if (response.data === "continue") {
            const url = BASE_URL + "/setup/admin/store";
            return axios
              .post(url, details)
              .then((res) => {
                setLoading(false);
                if (res.data === "ok") {
                  history.push("/installation/congratulation");
                } else {
                  setLoading(false);
                  toast.error(
                    `${_t(t("Something went wrong, please try again"))}`,
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
                toast.error(
                  `${_t(t("Something went wrong, please try again"))}`,
                  {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  }
                );
              });
          } else {
            setLoading(false);
            if (response.data === "notKhadyo") {
              toast.error(
                `${_t(
                  t(
                    "You inserted a wrong purchase code, Please purchase our item from CODECANYON for a valid code"
                  )
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

            if (response.data === "invalidKey") {
              toast.error(`${_t(t("This purchase key is not valid"))}`, {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              });
            }

            if (
              response.data !== "invalidKey" &&
              response.data !== "notKhadyo" &&
              response.data !== "continue"
            ) {
              toast.error(
                `This purchase key has already been used in ${response.data} ,contact the support team to transfer domain.`,
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
    } else {
      toast.error(`${_t(t("Password confirmation does not match"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Add User</title>
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
                        <div className="text-center mb-5">
                          <h3 className="text-success font-weight-bold text-uppercase">
                            Hey, You are nearly there
                          </h3>
                          <h5 className="font-weight-bold">
                            Add an admin to use the system
                          </h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                          <div className="form-group row mb-3">
                            <label
                              for="name"
                              className="col-md-4 col-form-label text-md-right"
                            >
                              Name
                            </label>
                            <div className="col-md-6">
                              <input
                                placeholder="Enter full name"
                                id="name"
                                type="text"
                                className="form-control"
                                name="name"
                                value={details.name}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group row mb-3">
                            <label
                              for="email"
                              className="col-md-4 col-form-label text-md-right"
                            >
                              E-Mail Address
                            </label>

                            <div className="col-md-6">
                              <input
                                id="email"
                                placeholder="Enter email"
                                type="email"
                                className="form-control"
                                name="email"
                                value={details.email}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group row mb-3">
                            <label
                              for="phn_no"
                              className="col-md-4 col-form-label text-md-right"
                            >
                              Phone No.
                            </label>
                            <div className="col-md-6">
                              <input
                                placeholder="Enter phone number"
                                id="phn_no"
                                type="number"
                                className="form-control"
                                name="phn_no"
                                value={details.phn_no}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group row mb-3">
                            <label
                              for="password"
                              className="col-md-4 col-form-label text-md-right"
                            >
                              Password
                            </label>

                            <div className="col-md-6">
                              <input
                                id="password"
                                placeholder="Enter password"
                                type="password"
                                className="form-control"
                                name="password"
                                value={details.password}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group row mb-3">
                            <label
                              for="password-confirm"
                              className="col-md-4 col-form-label text-md-right"
                            >
                              Confirm Password
                            </label>

                            <div className="col-md-6 mb-3">
                              <input
                                id="password-confirm"
                                placeholder="Enter confirm password"
                                type="password"
                                className="form-control"
                                name="password_confirmation"
                                value={details.password_confirmation}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group row mb-3 mt-4">
                            <label className="col-md-4 col-form-label text-md-right"></label>
                            <div className="col-md-6">
                              <ul className="list-group ml-0 pl-0">
                                <li className="list-group-item text-semibold text-primary border-0 pl-0">
                                  <i className="fa fa-info mr-2"></i>
                                  Important information
                                </li>

                                <li className="list-group-item text-semibold border-0 pl-0 sm-text">
                                  You can use this{" "}
                                  <span className="text-secondary">
                                    purchase code
                                  </span>{" "}
                                  only in one domain. Once used, you can only
                                  transfer the website in it's subdomains. The
                                  main domain can not be changed unless you
                                  verify your purchase code from the support
                                  team of this software. And this support will
                                  not be free.
                                </li>
                                <li className="list-group-item text-semibold border-0 pl-0 sm-text">
                                  You can install in localhost, it will not
                                  affect your live server installation with the
                                  same purchase code.
                                </li>
                                <li className="list-group-item text-semibold text-secondary border-0 pl-0 sm-text">
                                  <i className="fa fa-info mr-2"></i>You need
                                  internet connection to save these informations
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="form-group row mb-3 align-items-center">
                            <label
                              for="purchase_key"
                              className="col-md-4 col-form-label text-md-right"
                            >
                              Your Purchase Code{" "}
                              <a
                                href="https://help.market.envato.com/hc/en-us/articles/202822600-Where-Is-My-Purchase-Code-"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-info"
                              >
                                <i className="fa fa-info"></i>
                              </a>
                            </label>
                            <div className="col-md-6">
                              <textarea
                                placeholder="Enter your purchase code here"
                                id="purchase_key"
                                type="text"
                                className="form-control pt-4"
                                name="purchase_key"
                                value={details.purchase_key}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group row mb-3">
                            <label className="col-md-4 col-form-label text-md-right"></label>

                            <div className="col-md-6 mb-3">
                              <button
                                type="submit"
                                className="btn btn-primary px-5"
                              >
                                Save
                              </button>
                            </div>
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

export default InstallationUser;
