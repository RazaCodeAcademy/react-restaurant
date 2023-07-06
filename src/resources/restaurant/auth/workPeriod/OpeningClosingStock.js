import React, { useEffect, useContext, useState } from "react";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  pageLoading,
  paginationLoading,
  pagination,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//importing context consumer here
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { FoodContext } from "../../../../contexts/Food";
import { NavLink, useParams } from "react-router-dom";
const OpeningClosingStock = () => {
  const {
    //work period
    workPeriodList,
    setPaginatedWorkPeriod,
    // workPeriodForSearch,
    dataPaginating,
  } = useContext(RestaurantContext);

  const {
    getIngredientStock,
    loading,
    setLoading,
    items,
    setItems,
    theGroups,
  } = useContext(FoodContext);

  const { t } = useTranslation();
  const { started_at } = useParams();

  //new unit
  let [newWorkPeriod, setNewWorkPeriod] = useState({
    user_type: null,
    branch_id: null,
    uploading: false,
  });

  //search result
  let [searchedWorkPeriod, setSearchedWorkPeriod] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {
    getIngredientStock(started_at);
  }, []);

  //update stock
  const handleUpdate = () => {
    setLoading(true);
    const url = BASE_URL + `/settings/update-closing-items`;
    let formData = {
      items: items,
    };
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        getIngredientStock(started_at);
        setLoading(false);
        toast.success(`${_t(t("Closing stock has been updated"))}`, {
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

  // const handleReadOnly = (item) => {
  //   let total =
  //     parseInt(item.opening_stock) + parseInt(item.addition_to_opening);
  //   if (total === 0) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  //maximum
  const hadnleMax = (item) => {
    let temp =
      parseFloat(item.opening_stock) +
      parseFloat(
        item.addition_to_opening !== null ? item.addition_to_opening : 0
      ) -
      parseFloat(
        item.subtraction_from_opening !== null
          ? item.subtraction_from_opening
          : 0
      );
    return JSON.stringify(temp);
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Opening Closing Stock"))}</title>
      </Helmet>
      <main id="main" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            <div className="col-12 t-mb-30 mb-lg-0">
              {newWorkPeriod.uploading === true || loading === true ? (
                pageLoading()
              ) : (
                <div className="t-bg-white ">
                  {/* next page data spin loading */}
                  <div className={`${dataPaginating && "loading"}`}></div>
                  {/* spin loading ends */}
                  <div className="row gx-2 align-items-center t-pt-15 t-pb-15 t-pl-15 t-pr-15 t-shadow">
                    <div className="col-12 t-mb-15">
                      <ul className="t-list fk-breadcrumb">
                        <li className="fk-breadcrumb__list">
                          <span className="t-link fk-breadcrumb__link text-capitalize">
                            {_t(t("Add Closing Stock of Ingredients"))}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-5"></div>
                    <div className="col-md-6 col-lg-7 t-mb-15 mb-md-0">
                      <div className="row gx-2 align-items-center">
                        <div className="col-12 col-md-5 ml-auto mt-2 mt-md-0">
                          <ul className="t-list fk-sort align-items-center justify-content-center">
                            <li className="fk-sort__list mb-0 flex-grow-1">
                              <NavLink
                                to="/dashboard/work-periods"
                                className="w-100 btn alert-danger sm-text text-uppercase"
                              >
                                {_t(t("Go Back"))}
                              </NavLink>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="fk-scroll--order-history" data-simplebar>
                    <div className="t-pl-15 t-pr-15">
                      <form
                        className="table-responsive"
                        onSubmit={handleUpdate}
                      >
                        <table className="table table-bordered table-hover min-table-height mt-4">
                          <thead className="align-middle">
                            <tr>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("S/L"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Name"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Opening Stock"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Addition"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Subtraction"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Closing Stock"))}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="align-middle">
                            {!searchedWorkPeriod.searched
                              ? [
                                items &&
                                theGroups && [
                                  items.length === 0 ? (
                                    <tr className="align-middle">
                                      <td
                                        scope="row"
                                        colSpan="8"
                                        className="xsm-text align-middle text-center"
                                      >
                                        {_t(t("No data available"))}
                                      </td>
                                    </tr>
                                  ) : (
                                    theGroups.map(
                                      (grpItem, grpItemIndex) => {
                                        return (
                                          <>
                                            <tr className="align-middle alert-success">
                                              <td
                                                scope="row"
                                                colSpan="8"
                                                className="xsm-text align-middle text-left ml-5 text-uppercase"
                                              >
                                                {grpItem.name}
                                              </td>
                                            </tr>
                                            {items.map((item, index) => {
                                              if (
                                                parseInt(
                                                  item.ingredient_group_id
                                                ) === grpItem.id
                                              ) {
                                                return (
                                                  <tr
                                                    className="align-middle"
                                                    key={index}
                                                  >
                                                    <th
                                                      scope="row"
                                                      className="xsm-text text-capitalize align-middle text-center"
                                                    >
                                                      {index + 1}
                                                    </th>

                                                    <td className="xsm-text align-middle text-center text-secondary">
                                                      {item.ingredient_name +
                                                        " / " +
                                                        item.ingredient_unit}
                                                    </td>

                                                    <td className="xsm-text align-middle text-center">
                                                      {item.opening_stock}
                                                    </td>

                                                    <td className="xsm-text align-middle text-center">
                                                      {item.addition_to_opening ===
                                                        null
                                                        ? 0
                                                        : item.addition_to_opening}
                                                    </td>

                                                    <td className="xsm-text align-middle text-center">
                                                      {item.subtraction_from_opening ===
                                                        null
                                                        ? 0
                                                        : item.subtraction_from_opening}
                                                    </td>
                                                    <td className="xsm-text align-middle text-center">
                                                      <input
                                                        type="number"
                                                        className="form-control"
                                                        name={item.id}
                                                        placeholder={_t(
                                                          t(
                                                            "Keep fields blank to calculate auto"
                                                          )
                                                        )}
                                                        max={hadnleMax(
                                                          item
                                                        )}
                                                        value={
                                                          item.closing_stock ||
                                                          null
                                                        }
                                                        onChange={(e) => {
                                                          let tempArray =
                                                            [];
                                                          items.map(
                                                            (pushThis) => {
                                                              if (
                                                                pushThis.id !==
                                                                item.id
                                                              ) {
                                                                tempArray.push(
                                                                  pushThis
                                                                );
                                                              } else {
                                                                if (
                                                                  e.target
                                                                    .value !==
                                                                  "" &&
                                                                  e.target
                                                                    .value !==
                                                                  null
                                                                ) {
                                                                  pushThis.closing_stock =
                                                                    parseFloat(
                                                                      e
                                                                        .target
                                                                        .value
                                                                    );
                                                                } else {
                                                                  pushThis.closing_stock =
                                                                    null;
                                                                }
                                                                tempArray.push(
                                                                  pushThis
                                                                );
                                                              }
                                                            }
                                                          );
                                                          setItems(
                                                            tempArray
                                                          );
                                                        }}
                                                      />
                                                    </td>
                                                  </tr>
                                                );
                                              } else {
                                                return false;
                                              }
                                            })}
                                          </>
                                        );
                                      }
                                    )
                                  ),
                                ],
                              ]
                              : ""}
                          </tbody>
                        </table>
                        {items && items.length > 0 && (
                          <button
                            type="submit"
                            className="btn btn-primary float-right px-5 mb-3"
                          >
                            {_t(t("update"))}
                          </button>
                        )}
                      </form>
                    </div>
                  </div>
                </div>
              )}
              {/* pagination loading effect */}
              {newWorkPeriod.uploading === true || loading === true
                ? paginationLoading()
                : [
                  // logic === !searched
                  !searchedWorkPeriod.searched ? (
                    <div key="fragment4">
                      <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                        <div className="row align-items-center t-pl-15 t-pr-15">
                          <div className="col-md-7 t-mb-15 mb-md-0">
                            {/* pagination function */}
                            {pagination(
                              workPeriodList,
                              setPaginatedWorkPeriod
                            )}
                          </div>
                          <div className="col-md-5">
                            <ul className="t-list d-flex justify-content-md-end align-items-center">
                              <li className="t-list__item">
                                <span className="d-inline-block sm-text">
                                  {/* {showingData(workPeriodList)} */}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // if searched
                    <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                      <div className="row align-items-center t-pl-15 t-pr-15">
                        <div className="col-md-7 t-mb-15 mb-md-0">
                          <ul className="t-list d-flex">
                            <li className="t-list__item no-pagination-style">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  setSearchedWorkPeriod({
                                    ...searchedWorkPeriod,
                                    searched: false,
                                  })
                                }
                              >
                                {_t(t("Clear Search"))}
                              </button>
                            </li>
                          </ul>
                        </div>
                        <div className="col-md-5">
                          <ul className="t-list d-flex justify-content-md-end align-items-center">
                            <li className="t-list__item">
                              <span className="d-inline-block sm-text">
                                {/* {searchedShowingData(
                                    searchedWorkPeriod,
                                    workPeriodForSearch
                                  )} */}
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  ),
                ]}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default OpeningClosingStock;
