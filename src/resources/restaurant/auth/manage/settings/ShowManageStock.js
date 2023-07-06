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

import Switch from "react-switch";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";

const ShowManageStock = () => {
  const { t } = useTranslation();
  const history = useHistory();

  //getting context values here
  let {
    loading,
    setLoading,
    dataPaginating,
  } = useContext(SettingsContext);

  // States hook here
  const [checked, setChecked] = useState(true);
  // on change send req
  const handleChange = (newChecked) => {
    setChecked(newChecked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = BASE_URL + `/settings/show-manage-stock-settings`;
    let formData = new FormData();
    formData.append('checked', checked);

    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        toast.success(`${_t(t("menu has changed successfully"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      })
  }

  // update
  const updateCheckValue = () => {
    const url = BASE_URL + `/settings/show-manage-stock-menu-info`;
    axios.get(url, {
      headers: { Authorization: `Bearer ${getCookie()}` },
    }).then((res) => {

      if (res.data.length == 0 || res.data[0].value == 1) {
        setChecked(true);
      } else {
        setChecked(false);
      }
    });

  }

  // useEffect == componentDidMount()
  useEffect(() => {
    updateCheckValue();

  }, []);


  return (
    <>
      <Helmet>
        <title>{_t(t("Manage Stock Menu"))}</title>
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
                                  {_t(t("Show Manage Stock"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center"></div>
                          </div>
                        </div>

                        {/* Form starts here */}
                        <div
                          className="row card p-2 mx-3 sm-text my-2"

                        >
                          <div className="col-12">

                            <div className="table-responsive">
                              <table className="table table-bordered table-hover min-table-height">
                                <thead className="align-middle">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="sm-text text-capitalize align-middle text-center border-1 border"
                                    >
                                      {_t(t("Menu Name"))}
                                    </th>

                                    <th
                                      scope="col"
                                      className="sm-text text-capitalize align-middle text-center border-1 border"
                                    >
                                      {_t(t("show-menu"))}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="align-middle">
                                  <tr>
                                    <th scope="col"
                                      className="sm-text text-capitalize align-middle text-center border-1 border">Manage stock</th>
                                    <th scope="col"
                                      className="sm-text text-capitalize align-middle text-center border-1 border">
                                      <div>
                                        <form onSubmit={handleSubmit} className="d-flex justify-content-around">
                                          <Switch
                                            onChange={handleChange}
                                            checked={checked}
                                            className="react-switch"
                                          />
                                          <button className="btn btn-danger">Update</button>
                                        </form>
                                      </div>
                                    </th>
                                  </tr>
                                </tbody>
                              </table>
                              <div className="mt-4">
                                <h5>Key points to note :</h5>
                                <p className="text-danger mt-4">Disabling the manage stock will allow you to get <strong className="text-uppercase">unlimited quantity</strong> of order from POS and Landing page and hide the <strong className="text-uppercase">MANAGE STOCK</strong> menu from sidebar. Refresh the page after enabling manage stock if needed</p>
                              </div>
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

export default ShowManageStock;
