import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  tableLoading,
  getSystemSettings,
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

const PosScreen = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    loading,
    setLoading,
    generalSettings,
    setGeneralSettings,
    dataPaginating,
  } = useContext(SettingsContext);

  // States hook here

  //new item
  let [newSettings, setNewSettings] = useState({
    pos_screen:
      getSystemSettings(generalSettings, "pos_screen") === "1" ? 1 : 0,
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    setNewSettings({
      pos_screen:
        getSystemSettings(generalSettings, "pos_screen") === "1" ? 1 : 0,
    });
  }, [generalSettings]);

  //send req to server
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    let formData = new FormData();
    formData.append("pos_screen", newSettings.pos_screen === 0 ? "0" : "1");
    const url = BASE_URL + "/settings/pos-screen";
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setGeneralSettings(res.data);
        setNewSettings({
          ...newSettings,
          pos_screen: getSystemSettings(res.data, "pos_screen") === "1" ? 1 : 0,
        });
        setLoading(false);
        toast.success(`${_t(t("Settings has been updated"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      })
      .catch(() => {
        setLoading(false);
        toast.error(`${_t(t("Please try again"))}`, {
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
        <title>{_t(t("Pos Screen"))}</title>
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
                        <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                          <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize">
                                  {_t(t("Pos Screen"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center"></div>
                          </div>
                        </div>

                        {/* Form starts here */}
                        <form
                          className="row card p-2 mx-3 sm-text my-2"
                          onSubmit={handleSubmit}
                        >
                          <div className="col-12">
                            <div className="form-group">
                              <div className="mb-2">
                                <label
                                  htmlFor="siteName"
                                  className="control-label"
                                >
                                  <h5>{_t(t("Please select a pos screen"))}</h5>
                                </label>
                              </div>
                              <div className="mb-2 d-flex justify-content-between">
                                <div
                                  className={`col card mr-3 pointer-cursor ${
                                    newSettings.pos_screen === 0 && "bg-success"
                                  }`}
                                  onClick={() => {
                                    setNewSettings({
                                      ...newSettings,
                                      pos_screen: 0,
                                    });
                                  }}
                                >
                                  <img
                                    src="/assets/img/pos1.jpg"
                                    className="img-fluid m-3"
                                  />
                                </div>
                                <div
                                  className={`col card pointer-cursor ${
                                    newSettings.pos_screen === 1 && "bg-success"
                                  }`}
                                  onClick={() => {
                                    setNewSettings({
                                      ...newSettings,
                                      pos_screen: 1,
                                    });
                                  }}
                                >
                                  <img
                                    src="/assets/img/pos2.jpg"
                                    className="img-fluid m-3"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="form-group mt-4 pb-2">
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
                        </form>
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

export default PosScreen;
