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

const Promotions = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    loading,
    setLoading,
    generalSettings,
    setGeneralSettings,
    getSettings,
    dataPaginating,
  } = useContext(SettingsContext);

  // States hook here

  //new item
  let [newSettings, setNewSettings] = useState({
    heading1: null,
    subHeading1: null,
    image1: null,
    //
    heading6: null,
    subHeading6: null,
    image6: null,
    //
    heading2: null,
    image2: null,
    //
    heading3: null,
    image3: null,
    //
    heading4: null,
    image4: null,
    //
    heading5: null,
    image5: null,
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    setNewSettings({
      ...newSettings,
      heading1: getSystemSettings(generalSettings, "banner_heading_1"),
      subHeading1: getSystemSettings(generalSettings, "banner_sub_heading_1"),
      heading6: getSystemSettings(generalSettings, "banner_heading_6"),
      subHeading6: getSystemSettings(generalSettings, "banner_sub_heading_6"),
      //
      heading2: getSystemSettings(generalSettings, "banner_heading_2"),
      heading3: getSystemSettings(generalSettings, "banner_heading_3"),
      heading4: getSystemSettings(generalSettings, "banner_heading_4"),
      heading5: getSystemSettings(generalSettings, "banner_heading_5"),
    });
    _t();
  }, [generalSettings], _t);

  //on change input field
  const handleChange = (e) => {
    setNewSettings({ ...newSettings, [e.target.name]: e.target.value });
  };

  //set image hook
  const handleItemImage = (e) => {
    setNewSettings({
      ...newSettings,
      [e.target.name]: e.target.files[0],
    });
  };

  //send req to server
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    let formData = new FormData();
    //
    formData.append("heading1", newSettings.heading1);
    formData.append("subHeading1", newSettings.subHeading1);
    formData.append("image1", newSettings.image1);
    formData.append("heading6", newSettings.heading6);
    formData.append("subHeading6", newSettings.subHeading6);
    formData.append("image6", newSettings.image6);
    //
    formData.append("heading2", newSettings.heading2);
    formData.append("image2", newSettings.image2);
    //
    formData.append("heading3", newSettings.heading3);
    formData.append("image3", newSettings.image3);
    //
    formData.append("heading4", newSettings.heading4);
    formData.append("image4", newSettings.image4);
    //
    formData.append("heading5", newSettings.heading5);
    formData.append("image5", newSettings.image5);

    const url = BASE_URL + "/settings/promotion-section";
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        getSettings();
        setLoading(false);
        toast.success(`${_t(t("Section has been updated"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      })
      .catch((error) => {
        setLoading(false);
        if (error && error.response.data.errors) {
          if (error.response.data.errors.image1) {
            error.response.data.errors.image1.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
          //
          if (error.response.data.errors.image2) {
            error.response.data.errors.image2.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
          //
          if (error.response.data.errors.image3) {
            error.response.data.errors.image3.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
          //
          if (error.response.data.errors.image4) {
            error.response.data.errors.image4.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
          //
          if (error.response.data.errors.image5) {
            error.response.data.errors.image5.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
          //
          if (error.response.data.errors.image6) {
            error.response.data.errors.image6.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
        }
      });
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Promotions"))}</title>
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
                                  {_t(t("Promotions"))}
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
                          <div className="alert-success">
                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <label
                                  htmlFor=""
                                  className="control-label font-weight-bold"
                                >
                                  {_t(t("Large Images"))} (570x240)
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label htmlFor="vat" className="control-label">
                                  {_t(t("Banner One"))}
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <textarea
                                  rows="2"
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.heading1}
                                  className="form-control sm-text"
                                  name="heading1"
                                  placeholder="Banner one heading"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <input
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.subHeading1}
                                  className="form-control sm-text"
                                  name="subHeading1"
                                  placeholder="Banner one sub-heading"
                                />
                              </div>
                            </div>
                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <input
                                  type="file"
                                  onChange={handleItemImage}
                                  className="form-control sm-text"
                                  name="image1"
                                />
                              </div>
                            </div>

                            <div className="form-group mt-4">
                              <div className="mb-2">
                                <label htmlFor="vat" className="control-label">
                                  {_t(t("Banner Six"))}
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <textarea
                                  rows="2"
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.heading6}
                                  className="form-control sm-text"
                                  name="heading6"
                                  placeholder="Banner six heading"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <input
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.subHeading6}
                                  className="form-control sm-text"
                                  name="subHeading6"
                                  placeholder="Banner six sub-heading"
                                />
                              </div>
                            </div>
                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <input
                                  type="file"
                                  onChange={handleItemImage}
                                  className="form-control sm-text"
                                  name="image6"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="alert-primary mt-4">
                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <label
                                  htmlFor=""
                                  className="control-label font-weight-bold"
                                >
                                  {_t(t("Square Images"))}(270x240)
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-4">
                              <div className="mb-2">
                                <label htmlFor="vat" className="control-label">
                                  {_t(t("Banner Two"))}
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <textarea
                                  rows="2"
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.heading2}
                                  className="form-control sm-text"
                                  name="heading2"
                                  placeholder="Banner two heading"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <input
                                  type="file"
                                  onChange={handleItemImage}
                                  className="form-control sm-text"
                                  name="image2"
                                />
                              </div>
                            </div>

                            <div className="form-group mt-4">
                              <div className="mb-2">
                                <label htmlFor="vat" className="control-label">
                                  {_t(t("Banner Three"))}
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <textarea
                                  rows="2"
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.heading3}
                                  className="form-control sm-text"
                                  name="heading3"
                                  placeholder="Banner three heading"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <input
                                  type="file"
                                  onChange={handleItemImage}
                                  className="form-control sm-text"
                                  name="image3"
                                />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label htmlFor="vat" className="control-label">
                                  {_t(t("Banner Four"))}
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <textarea
                                  rows="2"
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.heading4}
                                  className="form-control sm-text"
                                  name="heading4"
                                  placeholder="Banner four heading"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <input
                                  type="file"
                                  onChange={handleItemImage}
                                  className="form-control sm-text"
                                  name="image4"
                                />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label htmlFor="vat" className="control-label">
                                  {_t(t("Banner Five"))}
                                </label>
                              </div>
                            </div>

                            <div className="form-group mt-1">
                              <div className="mb-2">
                                <textarea
                                  rows="2"
                                  type="text"
                                  onChange={handleChange}
                                  value={newSettings.heading5}
                                  className="form-control sm-text"
                                  name="heading5"
                                  placeholder="Banner five heading"
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <input
                                  type="file"
                                  onChange={handleItemImage}
                                  className="form-control sm-text"
                                  name="image5"
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

export default Promotions;
