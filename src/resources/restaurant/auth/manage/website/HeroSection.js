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

const HeroSection = () => {
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
    subHeading1: getSystemSettings(generalSettings, "hero_sub_1"),
    subHeading2: getSystemSettings(generalSettings, "hero_sub_2"),
    heading: getSystemSettings(generalSettings, "hero_heading"),
    image: null,
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    setNewSettings({
      subHeading1: getSystemSettings(generalSettings, "hero_sub_1"),
      subHeading2: getSystemSettings(generalSettings, "hero_sub_2"),
      heading: getSystemSettings(generalSettings, "hero_heading"),
      image: null,
    });
  }, [generalSettings]);

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
    formData.append("subHeading1", newSettings.subHeading1);
    formData.append("heading", newSettings.heading);
    formData.append("subHeading2", newSettings.subHeading2);
    formData.append("image", newSettings.image);
    const url = BASE_URL + "/settings/hero-section";
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
          if (error.response.data.errors.image) {
            error.response.data.errors.image.forEach((item) => {
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
        <title>{_t(t("Hero Section"))}</title>
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
                                  {_t(t("Hero Section"))}
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
                          <div className="form-group mt-2">
                            <div className="mb-2">
                              <label htmlFor="vat" className="control-label">
                                {_t(t("Sub-heading-1"))}
                              </label>
                            </div>
                            <div className="mb-2">
                              <input
                                type="text"
                                className="form-control sm-text"
                                name="subHeading1"
                                onChange={handleChange}
                                value={newSettings.subHeading1}
                                placeholder="Best In Town"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group mt-3">
                            <div className="mb-2">
                              <label htmlFor="vat" className="control-label">
                                {_t(t("Heading"))}
                              </label>
                            </div>
                            <div className="mb-2">
                              <textarea
                                rows="3"
                                type="text"
                                onChange={handleChange}
                                value={newSettings.heading}
                                className="form-control sm-text"
                                name="heading"
                                placeholder="Enjoy Our Chicken Burger Fast Food"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group mt-3">
                            <div className="mb-2">
                              <label htmlFor="vat" className="control-label">
                                {_t(t("Sub-heading-2"))}
                              </label>
                            </div>
                            <div className="mb-2">
                              <input
                                type="text"
                                className="form-control sm-text"
                                name="subHeading2"
                                onChange={handleChange}
                                value={newSettings.subHeading2}
                                placeholder="Bacon-Potatos-Bbq Sauce"
                                required
                              />
                            </div>
                          </div>

                          <div className="form-group mt-3">
                            <div className="mb-2">
                              <label htmlFor="vat" className="control-label">
                                {_t(t("Image"))}
                              </label>
                            </div>
                            <div className="mb-2">
                              <input
                                type="file"
                                onChange={handleItemImage}
                                className="form-control sm-text"
                                name="image"
                              />
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

export default HeroSection;
