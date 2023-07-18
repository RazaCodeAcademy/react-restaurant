import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//functions
import {
  _t,
  getCookie,
  modalLoading,
  tableLoading,
  pagination,
  paginationLoading,
  showingData,
  searchedShowingData,
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

//3rd party packages
import { Helmet } from "react-helmet";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { FoodContext } from "../../../../../contexts/Food";

const AllergiesCrud = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  let {
    //food allergy
    getFoodAllergy,
    foodAllergyList,
    setFoodAllergyList,
    setPaginatedFoodAllergy,
    foodAllergyForSearch,
    setFoodAllergyforSearch,

    //pagination
    dataPaginating,
  } = useContext(FoodContext);

  // States hook here
  //new allergy
  let [newFoodAllergy, setNewFoodAllergy] = useState({
    name: "",
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedFoodAllergy, setSearchedFoodAllergy] = useState({
    list: null,
    searched: false,
  });

  //set name hook
  const handleSetNewFoodAllergy = (e) => {
    setNewFoodAllergy({ ...newFoodAllergy, [e.target.name]: e.target.value });
  };

  //Save New paymentType
  const handleSaveNewFoodAllergy = (e) => {
    e.preventDefault();
    setNewFoodAllergy({
      ...newFoodAllergy,
      uploading: true,
    });
    const foodAllergyUrl = BASE_URL + `/settings/new-food-allergy`;
    let formData = new FormData();
    formData.append("name", newFoodAllergy.name);
    return axios
      .post(foodAllergyUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewFoodAllergy({
          name: "",
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setFoodAllergyList(res.data[0], true);
        setFoodAllergyforSearch(res.data[1]);
        setSearchedFoodAllergy({
          ...searchedFoodAllergy,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Food allergy has been added"))}`, {
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
        setNewFoodAllergy({
          ...newFoodAllergy,
          uploading: false,
        });
        if (error.response.data.errors) {
          if (error.response.data.errors.name) {
            error.response.data.errors.name.forEach((item) => {
              if (item === "A food allergy already exists with this name") {
                toast.error(
                  `${_t(t("A food allergy already exists with this name"))}`,
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
            });
          } else {
            toast.error(`${_t(t("Please try again"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
          }
        }
      });
  };

  //set edit true & values
  const handleSetEdit = (slug) => {
    let paymentType = foodAllergyForSearch.filter((item) => {
      return item.slug === slug;
    });
    setNewFoodAllergy({
      ...newFoodAllergy,
      name: paymentType[0].name,
      input_key: paymentType[0].input_key,
      editSlug: paymentType[0].slug,
      edit: true,
    });
  };

  //update food allergy
  const handleUpdateFoodAllergy = (e) => {
    e.preventDefault();
    setNewFoodAllergy({
      ...newFoodAllergy,
      uploading: true,
    });
    const foodAllergyUrl = BASE_URL + `/settings/update-food-allergy`;
    let formData = new FormData();
    formData.append("name", newFoodAllergy.name);
    formData.append("editSlug", newFoodAllergy.editSlug);
    return axios
      .post(foodAllergyUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewFoodAllergy({
          name: "",
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setFoodAllergyList(res.data[0], true);
        setFoodAllergyforSearch(res.data[1]);
        setSearchedFoodAllergy({
          ...searchedFoodAllergy,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Food allergy has been updated"))}`, {
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
        setNewFoodAllergy({
          ...newFoodAllergy,
          uploading: false,
        });
        if (error.response.data.errors) {
          if (error.response.data.errors.name) {
            error.response.data.errors.name.forEach((item) => {
              if (item === "A food allergy already exists with this name") {
                toast.error(
                  `${_t(t("A food allergy already exists with this name"))}`,
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
            });
          } else {
            toast.error(`${_t(t("Please try again"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
          }
        }
      });
  };

  //search food allergy here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedFoodAllergy({ ...searchedFoodAllergy, searched: false });
    } else {
      let searchedList = foodAllergyForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        return lowerCaseItemName.includes(searchInput);
      });
      setSearchedFoodAllergy({
        ...searchedFoodAllergy,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of paymentType
  const handleDeleteConfirmation = (slug) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">{_t(t("You want to delete this?"))}</p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleDeleteFoodAllergy(slug);
                  onClose();
                }}
              >
                {_t(t("Yes, delete it!"))}
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

  //delete paymentType here
  const handleDeleteFoodAllergy = (slug) => {
    setLoading(true);
    const foodAllergyUrl = BASE_URL + `/settings/delete-food-allergy/${slug}`;
    return axios
      .get(foodAllergyUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodAllergyList(res.data[0], true);
        setFoodAllergyforSearch(res.data[1]);
        setSearchedFoodAllergy({
          ...searchedFoodAllergy,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Food allergy has been deleted successfully"))}`, {
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

  const handleEnableDisable = (slug, index) => {
    console.log(slug);
    let formData = {
      slug: slug,
    };
    const foodItemUpdateEnableDisableUrl =
      BASE_URL + `/settings/update-food-allergy-enable-disable`;
    return axios
      .post(foodItemUpdateEnableDisableUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
        data: formData,
      })
      .then((res) => {
        // Update the data in your React component
        const updatedData = [...foodAllergyList.data]; // Create a copy of the data array
        updatedData[index].is_enabled = !updatedData[index].is_enabled; // Toggle the is_enabled property

        setFoodAllergyList((prevState) => ({
          ...prevState,
          data: updatedData,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Food Allergies"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addPaymentType" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newFoodAllergy.edit
                    ? _t(t("Add new food allergy"))
                    : _t(t("Update food allergy"))}
                </h5>
              </div>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {/* show form or show saving loading */}
              {newFoodAllergy.uploading === false ? (
                <div key="fragment-food-group-1">
                  <form
                    onSubmit={
                      !newFoodAllergy.edit
                        ? handleSaveNewFoodAllergy
                        : handleUpdateFoodAllergy
                    }
                  >
                    <div>
                      <label htmlFor="name" className="form-label">
                        {_t(t("Name"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        placeholder="e.g. Fever, Poison"
                        value={newFoodAllergy.name || ""}
                        required
                        onChange={handleSetNewFoodAllergy}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newFoodAllergy.edit
                              ? _t(t("Save"))
                              : _t(t("Update"))}
                          </button>
                        </div>
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-primary w-100 xsm-text text-uppercase t-width-max"
                            data-dismiss="modal"
                          >
                            {_t(t("Close"))}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <div key="fragment2">
                  <div className="text-center text-primary font-weight-bold text-uppercase">
                    {_t(t("Please wait"))}
                  </div>
                  {modalLoading(3)}
                  <div className="mt-4">
                    <div className="row">
                      <div className="col-6">
                        <button
                          type="button"
                          className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          {!newFoodAllergy.edit ? _t(t("Save")) : _t(t("Update"))}
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          className="btn btn-primary w-100 xsm-text text-uppercase t-width-max"
                          data-dismiss="modal"
                        >
                          {_t(t("Close"))}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Add modal Ends*/}

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
                    {newFoodAllergy.uploading === true || loading === true ? (
                      tableLoading()
                    ) : (
                      <div key="fragment3">
                        {/* next page data spin loading */}
                        <div className={`${dataPaginating && "loading"}`}></div>
                        {/* spin loading ends */}

                        <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                          <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize">
                                  {!searchedFoodAllergy.searched
                                    ? _t(t("Food Allergies List"))
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center">
                              {/* Search allergy */}
                              <div className="col-md-9 t-mb-15 mb-md-0">
                                <div className="input-group">
                                  <div className="form-file">
                                    <input
                                      type="text"
                                      className="form-control border-0 form-control--light-1 rounded-0"
                                      placeholder={_t(t("Search")) + ".."}
                                      onChange={handleSearch}
                                    />
                                  </div>
                                  <button
                                    className="btn btn-primary"
                                    type="button"
                                  >
                                    <i
                                      className="fa fa-search"
                                      aria-hidden="true"
                                    ></i>
                                  </button>
                                </div>
                              </div>

                              {/* Add allergy modal trigger button */}
                              <div className="col-md-3 text-md-right">
                                <button
                                  type="button"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                  data-toggle="modal"
                                  data-target="#addPaymentType"
                                  onClick={() => {
                                    setNewFoodAllergy({
                                      ...newFoodAllergy,
                                      edit: false,
                                      uploading: false,
                                    });
                                  }}
                                >
                                  {_t(t("add new"))}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Table */}
                        <div className="table-responsive">
                          <table className="table table-bordered table-hover min-table-height">
                            <thead className="align-middle">
                              <tr>
                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("S/L"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Name"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Enable/Disable"))}
                                </th>
                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Action"))}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="align-middle">
                              {/* loop here, logic === !search && haveData && haveDataLegnth > 0*/}
                              {!searchedFoodAllergy.searched
                                ? [
                                    foodAllergyList && [
                                      foodAllergyList.data.length === 0 ? (
                                        <tr className="align-middle">
                                          <td
                                            scope="row"
                                            colSpan="6"
                                            className="xsm-text align-middle text-center"
                                          >
                                            {_t(t("No data available"))}
                                          </td>
                                        </tr>
                                      ) : (
                                        foodAllergyList.data.map(
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
                                                    (foodAllergyList.current_page -
                                                      1) *
                                                      foodAllergyList.per_page}
                                                </th>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>
                                                <td
                                                  className={`xsm-text text-capitalize align-middle text-center`}
                                                >
                                                  <span
                                                    className={`badge bg-${
                                                      item.is_enabled == 1
                                                        ? "success"
                                                        : "danger"
                                                    }`}
                                                  >
                                                    {item.is_enabled == 1
                                                      ? "Yes"
                                                      : "No"}
                                                  </span>
                                                </td>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  <div className="dropdown">
                                                    <button
                                                      className="btn t-bg-clear t-text-dark--light-40"
                                                      type="button"
                                                      data-toggle="dropdown"
                                                    >
                                                      <i className="fa fa-ellipsis-h"></i>
                                                    </button>
                                                    <div className="dropdown-menu">
                                                      <button
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() =>
                                                          handleSetEdit(
                                                            item.slug
                                                          )
                                                        }
                                                        data-toggle="modal"
                                                        data-target="#addPaymentType"
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-pencil"></i>
                                                        </span>
                                                        {_t(t("Edit"))}
                                                      </button>

                                                      <button
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() => {
                                                          handleDeleteConfirmation(
                                                            item.slug
                                                          );
                                                        }}
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-trash"></i>
                                                        </span>
                                                        {_t(t("Delete "))}
                                                      </button>
                                                      <button
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() => {
                                                          handleEnableDisable(
                                                            item.slug,
                                                            index
                                                          );
                                                        }}
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-list"></i>
                                                        </span>
                                                        {_t(
                                                          t("Enable / Disable")
                                                        )}
                                                      </button>
                                                    </div>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          }
                                        )
                                      ),
                                    ],
                                  ]
                                : [
                                    /* searched data, logic === haveData*/
                                    searchedFoodAllergy && [
                                      searchedFoodAllergy.list.length === 0 ? (
                                        <tr className="align-middle">
                                          <td
                                            scope="row"
                                            colSpan="6"
                                            className="xsm-text align-middle text-center"
                                          >
                                            {_t(t("No data available"))}
                                          </td>
                                        </tr>
                                      ) : (
                                        searchedFoodAllergy.list.map(
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
                                                    (foodAllergyList.current_page -
                                                      1) *
                                                      foodAllergyList.per_page}
                                                </th>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>

                                                <td
                                                  className={`xsm-text text-capitalize align-middle text-center`}
                                                >
                                                  <span
                                                    className={`badge bg-${
                                                      item.is_enabled == 1
                                                        ? "success"
                                                        : "danger"
                                                    }`}
                                                  >
                                                    {item.is_enabled == 1
                                                      ? "Yes"
                                                      : "No"}
                                                  </span>
                                                </td>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  <div className="dropdown">
                                                    <button
                                                      className="btn t-bg-clear t-text-dark--light-40"
                                                      type="button"
                                                      data-toggle="dropdown"
                                                    >
                                                      <i className="fa fa-ellipsis-h"></i>
                                                    </button>
                                                    <div className="dropdown-menu">
                                                      <button
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() =>
                                                          handleSetEdit(
                                                            item.slug
                                                          )
                                                        }
                                                        data-toggle="modal"
                                                        data-target="#addPaymentType"
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-pencil"></i>
                                                        </span>
                                                        {_t(t("Edit"))}
                                                      </button>

                                                      <button
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() => {
                                                          handleDeleteConfirmation(
                                                            item.slug
                                                          );
                                                        }}
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-trash"></i>
                                                        </span>
                                                        {_t(t("Delete"))}
                                                      </button>
                                                    </div>
                                                  </div>
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
                    )}
                  </div>
                </div>
              </div>

              {/* pagination loading effect */}
              {newFoodAllergy.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedFoodAllergy.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(foodAllergyList, setPaginatedFoodAllergy)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(foodAllergyList)}
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
                                    setSearchedFoodAllergy({
                                      ...searchedFoodAllergy,
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
                                    searchedFoodAllergy,
                                    foodAllergyForSearch
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
            {/* Rightbar contents end*/}
          </div>
        </div>
      </main>
      {/* main body ends */}
    </>
  );
};

export default AllergiesCrud;
