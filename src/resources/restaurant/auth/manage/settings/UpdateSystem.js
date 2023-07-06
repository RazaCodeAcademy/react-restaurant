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
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";

const UpdateSystem = () => {
  const { t } = useTranslation();
  const history = useHistory();

  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  // States hook here
  const [updateFile, setUpdateFile] = useState({
    file: null,
  });

  //useEffect == componentDidMount()
  useEffect(() => {}, []);

  //set image hook
  const handleItemImage = (e) => {
    setUpdateFile({
      ...updateFile,
      [e.target.name]: e.target.files[0],
    });
  };

  //confirmation modal of update
  const handleUpdateConfirmation = (e) => {
    e.preventDefault();
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">
              {_t(t("You want to update the system?"))}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleSubmit();
                  onClose();
                }}
              >
                {_t(t("Yes, proceed!"))}
              </button>
              <button className="btn btn-success ml-2 px-3" onClick={onClose}>
                {_t(t("No"))}
              </button>
            </div>
          </div>
        );
      },
    });
  };

  //send req to server
  const handleSubmit = () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("file", updateFile.file);
    const url = BASE_URL + "/settings/update-system";
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {
        const refresh_url = BASE_URL + "/settings/refresh-system";
        return axios
          .get(refresh_url, {
            headers: { Authorization: `Bearer ${getCookie()}` },
          })
          .then(() => {
            setLoading(false);
            toast.success(`${_t(t("Settings has been updated"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
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
        <title>{_t(t("Update system"))}</title>
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
                                  {_t(t("Update system"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center"></div>
                          </div>
                        </div>

                        {/* info starts here */}
                        <div className="row mx-2 my-2">
                          <div className="col-12">
                            <ul className="list-group ml-0 pl-0 lg-text">
                              <li className="list-group-item text-primary border-0 pl-0">
                                <i className="fa fa-info mr-2"></i>
                                {_t(
                                  t("Please be careful of the following points")
                                )}
                                :
                              </li>

                              <li className="list-group-item border-0 pl-0">
                                1. File read and write permission needs to be
                                enabled in your server.
                              </li>
                              <li className="list-group-item border-0 pl-0">
                                2. Do not close the window or navigate to other
                                page after clicking the save button.
                              </li>

                              <li className="list-group-item border-0 pl-0">
                                3. Make sure your internet does not make any
                                issue while this process be evaluated.
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Form starts here */}
                        <form
                          className="row card p-2 mx-3 sm-text my-2"
                          onSubmit={handleUpdateConfirmation}
                        >
                          <div className="col-12">
                            <h4 className="">
                              {_t(t("Please upload the file here"))}
                            </h4>
                            <h6>
                              <i className="fa fa-info mr-2"></i>
                              {_t(t("Download the project from codecanyon"))}
                            </h6>
                            <h6>
                              <i className="fa fa-info mr-2"></i>
                              {_t(t("Unzip the file"))}
                            </h6>
                            <div className="form-group mt-2">
                              <div className="mb-2">
                                <label htmlFor="file" className="control-label">
                                  <h6>
                                    <i className="fa fa-info mr-2"></i>Select
                                    <span className="text-primary ml-2">
                                      Update.zip
                                    </span>
                                  </h6>
                                </label>
                              </div>
                              <div className="mb-2">
                                <input
                                  type="file"
                                  className="form-control-file"
                                  id="file"
                                  name="file"
                                  onChange={handleItemImage}
                                  required
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

export default UpdateSystem;
