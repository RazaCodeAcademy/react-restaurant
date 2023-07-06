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
  showingData,
  searchedShowingData,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Moment from "react-moment";

//importing context consumer here
import { UserContext } from "../../../../contexts/User";
import { SettingsContext } from "../../../../contexts/Settings";
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { NavLink } from "react-router-dom";

const WorkPeriod = () => {
  var weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  var month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  //getting context values here
  const {
    //common
    loading,
    setLoading,
    dataPaginating,
    showManageStock,
  } = useContext(SettingsContext);

  const { authUserInfo } = useContext(UserContext);

  const {
    //branch
    branchForSearch,

    //work period
    getWorkPeriod,
    workPeriodList,
    setWorkPeriodList,
    setPaginatedWorkPeriod,
    workPeriodForSearch,
    setWorkPeriodListForSearch,
  } = useContext(RestaurantContext);

  const { t } = useTranslation();

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
    authUserInfo.details &&
      setNewWorkPeriod({
        branch_id: authUserInfo.details.branch_id
          ? authUserInfo.details.branch_id
          : null,
        user_type: authUserInfo.details.user_type,
      });
  }, []);

  //set branch id
  const handleSetBranchId = (branch) => {
    setNewWorkPeriod({
      ...newWorkPeriod,
      branch_id: branch.id,
    });
  };

  //search work periods here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedWorkPeriod({ ...searchedWorkPeriod, searched: false });
    } else {
      let searchedList = workPeriodForSearch.filter((item) => {
        let lowerCaseItemBranchName = item.branch_name.toLowerCase();
        let lowerCaseItemUserName = item.started_by.toLowerCase();
        let lowerCaseItemDate = item.date.toLowerCase();
        let lowerCaseItemUserName2 =
          item.ended_by && item.ended_by.toLowerCase();
        return (
          lowerCaseItemBranchName.includes(searchInput) ||
          lowerCaseItemUserName.includes(searchInput) ||
          lowerCaseItemDate.includes(searchInput) ||
          (lowerCaseItemUserName2 &&
            lowerCaseItemUserName2.includes(searchInput))
        );
      });
      setSearchedWorkPeriod({
        ...searchedWorkPeriod,
        list: searchedList,
        searched: true,
      });
    }
  };

  //Save New work period
  const handleSaveNewWorkPeriod = (e) => {
    e.preventDefault();
    if (newWorkPeriod.branch_id) {
      setNewWorkPeriod({
        ...newWorkPeriod,
        uploading: true,
      });
      const url = BASE_URL + `/settings/new-work-period`;
      let date =
        weekday[new Date().getDay()] +
        ", " +
        new Date().getDate() +
        " " +
        month[new Date().getMonth()] +
        ", " +
        new Date().getFullYear();

      let time = new Date().getTime();

      let formData = {
        date: date,
        branch_id: newWorkPeriod.branch_id,
        started_at: time,
      };
      return axios
        .post(url, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          if (res.data === "exist") {
            authUserInfo.details &&
              setNewWorkPeriod({
                branch_id: authUserInfo.details.branch_id
                  ? authUserInfo.details.branch_id
                  : null,
                user_type: authUserInfo.details.user_type,

                uploading: false,
              });
            toast.error(
              `${_t(t("Please end the started work period first"))}`,
              {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              }
            );
          } else {
            authUserInfo.details &&
              setNewWorkPeriod({
                branch_id: authUserInfo.details.branch_id
                  ? authUserInfo.details.branch_id
                  : null,
                user_type: authUserInfo.details.user_type,

                uploading: false,
              });
            setWorkPeriodList(res.data[0]);
            setWorkPeriodListForSearch(res.data[1]);
            setSearchedWorkPeriod({
              ...searchedWorkPeriod,
              list: res.data[1],
            });
            setLoading(false);
            toast.success(`${_t(t("Work period has been started"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
          }
        })
        .catch(() => {
          setLoading(false);
          setNewWorkPeriod({
            ...newWorkPeriod,
            uploading: false,
          });
          toast.error(`${_t(t("Please try again"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        });
    } else {
      toast.error(`${_t(t("Please select a branch"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //milisec to hour min
  const millisToMinutesAndHours = (millis) => {
    var minutes = Math.floor(millis / 60000);
    var hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${hours} ${_t(t("hr"))} - ${minutes} ${_t(t("min"))} - ${seconds < 10 ? "0" : ""
      }${seconds} ${_t(t("sec"))}`;
  };

  //end confirmation modal of workPeriod
  const handleDeleteConfirmation = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">{_t(t("You want to end now?"))}</p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleEndWorkPeriod(id);
                  onClose();
                }}
              >
                {_t(t("Yes, end work period!"))}
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

  //end here
  const handleEndWorkPeriod = (id) => {
    setNewWorkPeriod({
      ...newWorkPeriod,
      uploading: true,
    });
    const url = BASE_URL + `/settings/update-work-period`;
    let time = new Date().getTime();
    let formData = {
      id: id,
      ended_at: time,
    };
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data !== "orderExist" && res.data !== "addClosing") {
          authUserInfo.details &&
            setNewWorkPeriod({
              branch_id: authUserInfo.details.branch_id
                ? authUserInfo.details.branch_id
                : null,
              user_type: authUserInfo.details.user_type,

              uploading: false,
            });
          setWorkPeriodList(res.data[0]);
          setWorkPeriodListForSearch(res.data[1]);
          setSearchedWorkPeriod({
            ...searchedWorkPeriod,
            list: res.data[1],
          });
          setLoading(false);
          toast.success(`${_t(t("Work period has been ended"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        } else {
          if (res.data === "addClosing") {
            toast.error(`${_t(t("Add closing stock of ingredients"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
          } else {
            toast.error(
              `${_t(
                t("All submitted orders need to be settled to end workperiod")
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
          setLoading(false);
          setNewWorkPeriod({
            ...newWorkPeriod,
            uploading: false,
          });
        }
      })
      .catch(() => {
        setLoading(false);
        setNewWorkPeriod({
          ...newWorkPeriod,
          uploading: false,
        });
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
        <title>{_t(t("Work Periods"))}</title>
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
                            {!searchedWorkPeriod.searched
                              ? _t(t("Work periods"))
                              : _t(t("Search Result"))}
                          </span>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6 col-lg-5">
                      <div className="input-group">
                        <button className="btn btn-primary" type="button">
                          <i className="fa fa-search" aria-hidden="true"></i>
                        </button>
                        <div className="form-file">
                          <input
                            type="text"
                            className="form-control border-0 form-control--light-1 rounded-0"
                            placeholder={
                              _t(t("Search by branch, date, user")) + ".."
                            }
                            onChange={handleSearch}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-7 t-mb-15 mb-md-0">
                      <div className="row gx-2 align-items-center">
                        {authUserInfo.details !== null &&
                          authUserInfo.details.user_type !== "staff" ? (
                          <>
                            <div className="col-md-7 t-mb-15 mb-md-0 mt-3 mt-md-0">
                              <Select
                                options={branchForSearch && branchForSearch}
                                components={makeAnimated()}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.name}
                                classNamePrefix="select"
                                className="xsm-text"
                                onChange={handleSetBranchId}
                                maxMenuHeight="200px"
                                placeholder={
                                  _t(t("Please select a branch")) + ".."
                                }
                              />
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list fk-sort align-items-center justify-content-center">
                                <li className="fk-sort__list mb-0 flex-grow-1">
                                  <button
                                    onClick={handleSaveNewWorkPeriod}
                                    className="w-100 btn btn-secondary sm-text text-uppercase"
                                  >
                                    {_t(t("start work period"))}
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </>
                        ) : (
                          <div className="col-12 col-md-5 ml-auto mt-2 mt-md-0">
                            <ul className="t-list fk-sort align-items-center justify-content-center">
                              <li className="fk-sort__list mb-0 flex-grow-1">
                                <button
                                  onClick={handleSaveNewWorkPeriod}
                                  className="w-100 btn btn-secondary sm-text text-uppercase"
                                >
                                  {_t(t("start work period"))}
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="fk-scroll--order-history" data-simplebar>
                    <div className="t-pl-15 t-pr-15">
                      <div className="table-responsive">
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
                                {_t(t("Branch"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Started by"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Date"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Started at"))}
                              </th>
                              {showManageStock ? <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Stock"))}
                              </th> : null}
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Ended at"))}
                              </th>
                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Ended by"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text align-middle text-center border-1 border"
                              >
                                {_t(t("Total time"))}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="align-middle">
                            {!searchedWorkPeriod.searched
                              ? [
                                workPeriodList && [
                                  workPeriodList.data.length === 0 ? (
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
                                    workPeriodList.data.map((item, index) => {
                                      return (
                                        <tr
                                          className="align-middle"
                                          key={index}
                                        >
                                          <th
                                            scope="row"
                                            className="xsm-text text-capitalize align-middle text-center"
                                          >
                                            {index +
                                              1 +
                                              (workPeriodList.current_page -
                                                1) *
                                              workPeriodList.per_page}
                                          </th>

                                          <td className="xsm-text align-middle text-center text-secondary">
                                            {item.branch_name}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.started_by}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.date}
                                          </td>

                                          <td className="xsm-text align-middle text-center text-green">
                                            <Moment format="LT">
                                              {new Date(item.created_at)}
                                            </Moment>
                                          </td>

                                          {/* show if manage stock is enable */}
                                          {showManageStock ? <td className="xsm-text align-middle text-center">
                                            <NavLink
                                              className={`btn xxsm-text ${item.ended_at === null
                                                ? "btn-secondary"
                                                : "btn-success"
                                                } btn-sm p-1`}
                                              to={
                                                `/dashboard/closing-stock/` +
                                                item.started_at
                                              }
                                            >
                                              {_t(t("Closing Stock"))}
                                            </NavLink>
                                          </td> : null}


                                          <td className="xsm-text align-middle text-center text-primary">
                                            {item.ended_at ? (
                                              <Moment format="LT">
                                                {new Date(item.updated_at)}
                                              </Moment>
                                            ) : (
                                              "-"
                                            )}
                                          </td>

                                          <td className="xsm-text align-middle text-center">
                                            {item.ended_at ? (
                                              item.ended_by
                                            ) : (
                                              <button
                                                className="btn btn-primary btn-sm py-0 px-4"
                                                onClick={() => {
                                                  handleDeleteConfirmation(
                                                    item.id
                                                  );
                                                }}
                                              >
                                                {_t(t("End"))}
                                              </button>
                                            )}
                                          </td>
                                          <td className="xsm-text align-middle text-center">
                                            {item.ended_at
                                              ? millisToMinutesAndHours(
                                                parseInt(
                                                  item.ended_at -
                                                  item.started_at
                                                )
                                              )
                                              : "-"}
                                          </td>
                                        </tr>
                                      );
                                    })
                                  ),
                                ],
                              ]
                              : [
                                /* searched data, logic === haveData*/
                                searchedWorkPeriod && [
                                  searchedWorkPeriod.list.length === 0 ? (
                                    <tr className="align-middle">
                                      <td
                                        scope="row"
                                        colSpan="9"
                                        className="xsm-text align-middle text-center"
                                      >
                                        {_t(t("No data available"))}
                                      </td>
                                    </tr>
                                  ) : (
                                    searchedWorkPeriod.list.map(
                                      (item, index) => {
                                        return (
                                          <tr
                                            className="align-middle"
                                            key={index}
                                          >
                                            <th
                                              scope="row"
                                              className="xsm-text text-capitalize align-middle text-center"
                                            >
                                              {index +
                                                1 +
                                                (workPeriodList.current_page -
                                                  1) *
                                                workPeriodList.per_page}
                                            </th>

                                            <td className="xsm-text align-middle text-center text-secondary">
                                              {item.branch_name}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.started_by}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.date}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              <Moment format="LT">
                                                {new Date(item.created_at)}
                                              </Moment>
                                            </td>
                                            {/* 
                                            <td className="xsm-text align-middle text-center">
                                              <NavLink
                                                className={`btn xxsm-text ${item.ended_at === null
                                                    ? "btn-secondary"
                                                    : "btn-success"
                                                  } btn-sm p-1`}
                                                to={
                                                  `/dashboard/closing-stock/` +
                                                  item.started_at
                                                }
                                              >
                                                {_t(t("Closing Stock"))}
                                              </NavLink>
                                            </td> */}

                                            <td className="xsm-text align-middle text-center">
                                              {item.ended_at ? (
                                                <Moment format="LT">
                                                  {new Date(item.updated_at)}
                                                </Moment>
                                              ) : (
                                                "-"
                                              )}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.ended_at ? (
                                                item.ended_by
                                              ) : (
                                                <button
                                                  className="btn btn-primary btn-sm py-0 px-4"
                                                  onClick={() => {
                                                    handleDeleteConfirmation(
                                                      item.id
                                                    );
                                                  }}
                                                >
                                                  {_t(t("End"))}
                                                </button>
                                              )}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
                                              {item.ended_at
                                                ? millisToMinutesAndHours(
                                                  parseInt(
                                                    item.ended_at -
                                                    item.started_at
                                                  )
                                                )
                                                : "-"}
                                            </td>
                                          </tr>
                                        );
                                      }
                                    )
                                  ),
                                ],
                              ]}
                          </tbody>
                        </table>
                      </div>
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
                                  {showingData(workPeriodList)}
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
                                {searchedShowingData(
                                  searchedWorkPeriod,
                                  workPeriodForSearch
                                )}
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

export default WorkPeriod;
