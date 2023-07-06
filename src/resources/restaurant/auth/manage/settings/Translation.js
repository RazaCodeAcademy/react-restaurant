import React, { useState, useEffect, useContext } from "react";
import { NavLink, useParams, useHistory } from "react-router-dom";

//jQuery initialization
import $ from "jquery";

//functions
import {
  _t,
  getCookie,
  tableLoading,
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
const Translation = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    loading,
    languageListForSearch,
    dataPaginating,
    setDataPaginating,
  } = useContext(SettingsContext);

  //getting url parameter
  let { code } = useParams();

  // States hook here
  let [toTranslate, setToTranslate] = useState(null);

  //useEffect == componentDidMount()
  useEffect(() => {
    handleTranslate(code);
    toastAfterReload();
  }, []);

  const toastAfterReload = () => {
    if (window.location.href.includes("translation-successful=true")) {
      toast.success(`${_t(t("Translation has been saved"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
      history.replace("/dashboard/manage/settings/languages/" + code);
    }
  };

  const handleTranslate = (langCode) => {
    setDataPaginating(true);
    const t_url = BASE_URL + `/settings/get-lang/${langCode}`;
    axios
      .get(t_url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setToTranslate(Object.entries(res.data));
        setDataPaginating(false);
      });
  };

  const handleTranslationInput = (e, index, key) => {
    let temp = [];
    toTranslate.map((item, indexItem) => {
      if (index === indexItem) {
        temp.push([key, e.target.value]);
      } else {
        temp.push(item);
      }
    });
    setToTranslate(temp);
  };

  //translate in one click
  const handleCopy = () => {
    let jsonData = toTranslate;
    let temp = [];
    $("#tranlation-table > tbody  > tr").each(function (index, tr) {
      $(tr).find(".value").val($(tr).find(".key").text());
      let newTranslation = $(tr).find(".key").text();
      jsonData.map((items, itemIndex) => {
        if (itemIndex === index) {
          temp.push([items[0], newTranslation]);
        }
      });
    });
    setToTranslate(temp);
  };

  const handleSubmitTranslation = (e) => {
    e.preventDefault();
    let data = Object.fromEntries(
      toTranslate.filter(([k, v]) => {
        return true;
      })
    );
    let formData = {
      data: data,
      code: code,
    };
    const t_url = BASE_URL + `/settings/save-translation`;
    return axios
      .post(t_url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {
        window.location.href =
          window.location.pathname + "?translation-successful=true";
      });
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Update Translation"))}</title>
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
                <div className="fk-scroll--pos-menu" data-simplebar>
                  <div className="t-pl-15 t-pr-15">
                    {/* Loading effect */}
                    {loading === true ? (
                      tableLoading()
                    ) : (
                      <>
                        {/* next page data spin loading */}
                        <div className={`${dataPaginating && "loading"}`}></div>
                        {/* spin loading ends */}
                        <div className="row gx-2 align-items-center pt-0">
                          <div className="col-md-4 col-lg-3 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize"></span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-8 col-lg-9">
                            <div className="row gx-0 align-items-center">
                              {/* Search Translationuages */}
                              <div className="col-md-9 col-xl-10 t-mb-15 mb-md-0"></div>

                              {/* Add Translationuage modal trigger button */}
                              <div className="col-md-3 col-xl-2 text-md-right"></div>
                            </div>
                          </div>
                        </div>
                        {/* Table */}
                        <div className="card-header border-bottom-0">
                          <h3 className="panel-title text-center">
                            {_t(t("Update Translation"))}
                          </h3>
                          {/* Showing language name and flag */}
                          <div className="d-flex justify-content-center">
                            {languageListForSearch &&
                              languageListForSearch.map((item) => {
                                if (item.code === code) {
                                  return (
                                    <div
                                      className="d-flex align-items-center"
                                      key={item.id}
                                    >
                                      <span>{item.name}</span>
                                      <div
                                        className="fk-language__flag ml-3"
                                        style={{
                                          backgroundImage: `url(${item.image})`,
                                        }}
                                      ></div>
                                    </div>
                                  );
                                }
                              })}
                          </div>
                          <p className="text-muted text-center">
                            {_t(
                              t(
                                "You can update the translation in a very easy way"
                              )
                            )}
                            <br />{" "}
                            {_t(
                              t(
                                "Install any google translation extention in your browser, translate the whole page"
                              )
                            )}
                            <br /> {_t(t("Click Copy Translation button"))}
                            <br />
                            {_t(t("Click save"))}
                          </p>
                        </div>
                        <div className="card-body">
                          <div className="form-horizontal">
                            <div className="panel-body">
                              <table
                                className="table table-striped table-bordered demo-dt-basic mb-1"
                                cellSpacing="0"
                                width="100%"
                                id="tranlation-table"
                              >
                                <tbody>
                                  {toTranslate &&
                                    toTranslate.map((items, index) => {
                                      return (
                                        <tr className="text-center" key={index}>
                                          <td>{index + 1}</td>
                                          <td className="key text-left translation-input">
                                            {items[0]}
                                          </td>
                                          <td>
                                            <input
                                              type="text"
                                              className="form-control value w-100"
                                              name="translations[]"
                                              onChange={(e) => {
                                                handleTranslationInput(
                                                  e,
                                                  index,
                                                  items[0]
                                                );
                                              }}
                                              value={items[1]}
                                            />
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* pagination loading effect */}
              {/* pagination loading effect removed */}
              <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                <div className="row align-items-center t-pl-15 t-pr-15">
                  <div className="col-md-7 t-mb-15 mb-md-0">
                    <ul className="t-list d-flex justify-content-center justify-content-md-start">
                      <li className="t-list__item no-pagination-style">
                        <NavLink
                          className="btn btn-primary btn-sm"
                          to="/dashboard/manage/settings/languages"
                        >
                          <i className="fa fa-reply"></i> {_t(t("Go back"))}
                        </NavLink>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-5">
                    <ul className="t-list d-flex justify-content-center justify-content-md-end align-items-center">
                      <li className="t-list__item">
                        <div className="form-group">
                          <div className="col-lg-12 text-right">
                            <button
                              className="btn btn-warning btn-sm text-dark"
                              type="button"
                              onClick={handleCopy}
                            >
                              {_t(t("Copy Translations"))}
                            </button>
                            <button
                              className="btn btn-success btn-sm ml-2 text-dark"
                              type="button"
                              onClick={handleSubmitTranslation}
                            >
                              {_t(t("Save"))}
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>
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

export default Translation;
