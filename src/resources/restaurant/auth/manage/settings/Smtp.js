import React, { useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

//functions
import {
  _t,
  getCookie,
  tableLoading,
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

const Smtp = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    loading,
    setLoading,
    dataPaginating,
    smtp,
    getSmtp,
    setSmtp,
  } = useContext(SettingsContext);

  //useEffect == componentDidMount()
  useEffect(() => {}, []);

  //on change input field
  const handleChange = (e) => {
    setSmtp({ ...smtp, [e.target.name]: e.target.value });
  };

  //send to server
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = BASE_URL + `/settings/set-smtp`;
    const formData = {
      MAIL_MAILER: smtp.MAIL_MAILER,
      MAIL_HOST: smtp.MAIL_HOST,
      MAIL_PORT: smtp.MAIL_PORT,
      MAIL_USERNAME: smtp.MAIL_USERNAME,
      MAIL_PASSWORD: smtp.MAIL_PASSWORD,
      MAIL_ENCRYPTION: smtp.MAIL_ENCRYPTION,
      MAIL_FROM_ADDRESS: smtp.MAIL_FROM_ADDRESS,
      MAIL_FROM_NAME: smtp.MAIL_FROM_NAME,
    };
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSmtp({
          ...smtp,
          MAIL_MAILER: res.data[0].MAIL_MAILER,
          MAIL_HOST: res.data[0].MAIL_HOST,
          MAIL_PORT: res.data[0].MAIL_PORT,
          MAIL_USERNAME: res.data[0].MAIL_USERNAME,
          MAIL_PASSWORD: res.data[0].MAIL_PASSWORD,
          MAIL_ENCRYPTION: res.data[0].MAIL_ENCRYPTION,
          MAIL_FROM_ADDRESS: res.data[0].MAIL_FROM_ADDRESS,
          MAIL_FROM_NAME: res.data[0].MAIL_FROM_NAME,
        });
        getSmtp();
        toast.success(`${_t(t("SMTP settings has been updated"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
        setLoading(false);
      })
      .catch((error) => {
        toast.error(
          `${_t(t("Something unexpected happened, Please try again"))}`,
          {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          }
        );
        setLoading(false);
      });
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Update Smtp"))}</title>
      </Helmet>

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
                        <div className="row gx-2 align-items-center pt-0">
                          <div className="col-md-4 col-lg-3 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize"></span>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-header border-bottom-0">
                          <h3 className="panel-title text-center">
                            {_t(t("Update Smtp"))}
                          </h3>

                          <p className="text-muted text-center">
                            {_t(
                              t(
                                "Please be carefull when you are configuring SMTP, For incorrect configuration you may get error in few features"
                              )
                            )}
                          </p>
                        </div>
                        <div className="card-body">
                          <div className="form-horizontal">
                            <div className="panel-body">
                              <form className="row" onSubmit={handleSubmit}>
                                <div className="col-12 col-md-6 order-2 order-sm-1">
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail mailer
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <select
                                        name="MAIL_MAILER"
                                        className="form-control rounded-sm pl-2 mb-2"
                                        onChange={handleChange}
                                        value={smtp.MAIL_MAILER}
                                        required
                                      >
                                        <option value="">
                                          {_t(t("Please select an option"))}
                                        </option>
                                        <option value="sendmail">
                                          Sendmail
                                        </option>
                                        <option value="smtp">Smtp</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail host
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="MAIL_HOST"
                                        onChange={handleChange}
                                        value={smtp.MAIL_HOST}
                                        placeholder="localhost"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail port
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="MAIL_PORT"
                                        onChange={handleChange}
                                        placeholder="e.g. 587"
                                        value={smtp.MAIL_PORT}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail username
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="MAIL_USERNAME"
                                        onChange={handleChange}
                                        value={smtp.MAIL_USERNAME}
                                        placeholder="Enter your email username"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail password
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        type="password"
                                        className="form-control"
                                        name="MAIL_PASSWORD"
                                        onChange={handleChange}
                                        value={smtp.MAIL_PASSWORD}
                                        placeholder="Email password"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail encryption
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <select
                                      name="MAIL_ENCRYPTION"
                                      className="form-control rounded-sm pl-2 mb-2"
                                      onChange={handleChange}
                                      value={smtp.MAIL_ENCRYPTION}
                                      required
                                    >
                                      <option value="">
                                        {_t(t("Please select an option"))}
                                      </option>
                                      <option value="ssl">ssl</option>
                                      <option value="tls">tls</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail from address
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="MAIL_FROM_ADDRESS"
                                        onChange={handleChange}
                                        value={smtp.MAIL_FROM_ADDRESS}
                                        placeholder="Mail from address"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        Mail from name
                                        <span className="text-danger"> *</span>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="MAIL_FROM_NAME"
                                        onChange={handleChange}
                                        value={smtp.MAIL_FROM_NAME}
                                        placeholder="Mail from name"
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="form-group mt-3 pb-2">
                                    <div className="col-lg-12">
                                      <button
                                        className="btn btn-primary px-5"
                                        type="submit"
                                      >
                                        {_t(t("Save"))}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12 col-md-6 order-1 order-sm-2 mb-3">
                                  <p className="mb-2">{_t(t("For Non-SSL"))}</p>
                                  <ul className="list-group">
                                    <li className="list-group-item text-dark">
                                      {_t(
                                        t(
                                          "Select 'sendmail' for Mail Mailer if you face any issue after configuring 'smtp' as Mail Mailer"
                                        )
                                      )}
                                    </li>
                                    <li className="list-group-item text-dark">
                                      {_t(
                                        t(
                                          "Set Mail Host according to your server Mail Client Manual Settings"
                                        )
                                      )}
                                    </li>
                                    <li className="list-group-item text-dark">
                                      {_t(t("Set Mail port as '587'"))}
                                    </li>
                                    <li className="list-group-item text-dark">
                                      {_t(
                                        t(
                                          "Set Mail Encryption as 'ssl' if you face issue with 'tls'"
                                        )
                                      )}
                                    </li>
                                  </ul>

                                  <p className="mt-3 mb-2">
                                    {_t(t("For SSL"))}
                                  </p>
                                  <ul className="list-group mar-no">
                                    <li className="list-group-item text-dark">
                                      {_t(
                                        t(
                                          "Select 'sendmail' for Mail Mailer if you face any issue after configuring 'smtp' as Mail Mailer"
                                        )
                                      )}
                                    </li>
                                    <li className="list-group-item text-dark">
                                      {_t(
                                        t(
                                          "Set Mail Host according to your server Mail Client Manual Settings"
                                        )
                                      )}
                                    </li>
                                    <li className="list-group-item text-dark">
                                      {_t(t("Set Mail port as '465'"))}
                                    </li>
                                    <li className="list-group-item text-dark">
                                      {_t(t("Set Mail Encryption as 'ssl'"))}
                                    </li>
                                  </ul>
                                </div>
                              </form>
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

export default Smtp;
