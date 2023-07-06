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
  formatPrice,
  currencySymbolLeft,
  currencySymbolRight,
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
import Select from "react-select";
import makeAnimated from "react-select/animated";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { RestaurantContext } from "../../../../../contexts/Restaurant";

const IngredientItem = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  let {
    //item
    getIngredientItem,
    ingredientItemList,
    setIngredientItemList,
    setPaginatedIngredientItem,
    ingredientItemForSearch,
    setIngredientItemForSearch,

    //group
    getIngredientGroup,
    ingredientGroupForSearch,

    //pagination
    dataPaginating,
  } = useContext(RestaurantContext);

  // States hook here
  //new ingredient group
  let [newIngredientItem, setNewIngredientItem] = useState({
    name: "",
    unit: "",
    itemGroup: null,
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedIngredientGroup, setSearchedIngredientGroup] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {
    getIngredientGroup();
  }, []);

  //handle Set item group hook
  const handleSetItemGroup = (itemGroup) => {
    setNewIngredientItem({ ...newIngredientItem, itemGroup });
  };

  //set name, phn no hook
  const handleSetNewIngredientGroup = (e) => {
    setNewIngredientItem({
      ...newIngredientItem,
      [e.target.name]: e.target.value,
    });
  };

  //Save New customer
  const handleSaveNewIngredientGroup = (e) => {
    e.preventDefault();
    if (newIngredientItem.itemGroup !== null) {
      setNewIngredientItem({
        ...newIngredientItem,
        uploading: true,
      });
      const customerUrl = BASE_URL + `/settings/new-ingredient_item`;
      let formData = new FormData();
      formData.append("name", newIngredientItem.name);
      formData.append("unit", newIngredientItem.unit);
      formData.append("group_id", newIngredientItem.itemGroup.id);
      return axios
        .post(customerUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setNewIngredientItem({
            name: "",
            unit: "",
            itemGroup: null,
            edit: false,
            editSlug: null,
            uploading: false,
          });
          setIngredientItemList(res.data[0]);
          setIngredientItemForSearch(res.data[1]);
          setLoading(false);
          toast.success(`${_t(t("Ingredient item has been added"))}`, {
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
          setNewIngredientItem({
            ...newIngredientItem,
            uploading: false,
          });
        });
    } else {
      toast.error(`${_t(t("Please select a group"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //set edit true & values
  const handleSetEdit = (slug) => {
    let ingredientItem = ingredientItemForSearch.filter((item) => {
      return item.slug === slug;
    });

    let ingredientGroup = ingredientGroupForSearch.find((grp) => {
      return grp.id === parseInt(ingredientItem[0].ingredient_group_id);
    });

    setNewIngredientItem({
      ...newIngredientItem,
      name: ingredientItem[0].name,
      unit: ingredientItem[0].unit,
      itemGroup: ingredientGroup,
      editSlug: ingredientItem[0].slug,
      edit: true,
    });
  };

  //update customer
  const handleUpdateIngredientGroup = (e) => {
    e.preventDefault();
    setNewIngredientItem({
      ...newIngredientItem,
      uploading: true,
    });
    const customerUrl = BASE_URL + `/settings/update-ingredient_item`;
    let formData = new FormData();
    formData.append("name", newIngredientItem.name);
    formData.append("unit", newIngredientItem.unit);
    formData.append("group_id", newIngredientItem.itemGroup.id);
    formData.append("editSlug", newIngredientItem.editSlug);
    return axios
      .post(customerUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewIngredientItem({
          name: "",
          unit: "",
          itemGroup: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setIngredientItemList(res.data[0]);
        setIngredientItemForSearch(res.data[1]);
        setSearchedIngredientGroup({
          ...searchedIngredientGroup,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Ingredient item has been updated"))}`, {
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
        setNewIngredientItem({
          ...newIngredientItem,
          uploading: false,
        });
      });
  };

  //search customers here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedIngredientGroup({
        ...searchedIngredientGroup,
        searched: false,
      });
    } else {
      let searchedList = ingredientItemForSearch.filter((item) => {
        //name
        let lowerCaseItemName = item.name.toLowerCase();
        //grp
        let lowerCaseItemGrp = item.group_name.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          lowerCaseItemGrp.includes(searchInput)
        );
      });
      setSearchedIngredientGroup({
        ...searchedIngredientGroup,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of waiter
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
                  handleDeleteIngredientGroup(slug);
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

  //delete customer here
  const handleDeleteIngredientGroup = (slug) => {
    setLoading(true);
    const customerUrl = BASE_URL + `/settings/delete-ingredient_item/${slug}`;
    return axios
      .get(customerUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientItemList(res.data[0]);
        setIngredientItemForSearch(res.data[1]);
        setSearchedIngredientGroup({
          ...searchedIngredientGroup,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(
          `${_t(t("Ingredient item has been deleted successfully"))}`,
          {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          }
        );
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
        <title>{_t(t("Ingredient Item"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addCustomer" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newIngredientItem.edit
                    ? _t(t("Add new Ingredient Item"))
                    : _t(t("Update Ingredient Item"))}
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
              {newIngredientItem.uploading === false ? (
                <div key="fragment-customer-1">
                  <form
                    onSubmit={
                      !newIngredientItem.edit
                        ? handleSaveNewIngredientGroup
                        : handleUpdateIngredientGroup
                    }
                  >
                    {ingredientGroupForSearch && (
                      <div className="form-group">
                        <div className="mb-2">
                          <label htmlFor="itemGroup" className="control-label">
                            {_t(t("Ingredient group"))}
                            <span className="text-danger">*</span>
                            <small className="ml-2">
                              {newIngredientItem.edit &&
                                "(" +
                                  _t(
                                    t(
                                      "Leave empty if you do not want to change group"
                                    )
                                  ) +
                                  ")"}
                            </small>
                          </label>
                        </div>

                        {newIngredientItem.edit && (
                          <ul className="list-group list-group-horizontal-sm row col-12 mb-2 ml-md-1">
                            <li className="list-group-item col-12 col-md-2 py-1 my-1 border-0 px-0 ml-3 ml-md-0">
                              {_t(t("Selected Group"))}
                            </li>
                            <li className="list-group-item col-12 col-md-3 bg-success rounded-sm py-1 px-2 mx-2 my-1 text-center">
                              {newIngredientItem.itemGroup &&
                                newIngredientItem.itemGroup.name}
                            </li>
                          </ul>
                        )}

                        <Select
                          options={ingredientGroupForSearch}
                          components={makeAnimated()}
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.name}
                          classNamePrefix="select"
                          onChange={handleSetItemGroup}
                          maxMenuHeight="200px"
                          placeholder={
                            _t(t("Please select an Ingredient group")) + ".."
                          }
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <label htmlFor="name" className="form-label">
                        {_t(t("Name"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        placeholder="e.g. Mr. John"
                        value={newIngredientItem.name || ""}
                        required
                        onChange={handleSetNewIngredientGroup}
                      />
                    </div>

                    <div className="mt-3">
                      <label htmlFor="unit" className="form-label">
                        {_t(t("Unit"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="unit"
                        name="unit"
                        placeholder="e.g. Kg, pcs"
                        value={newIngredientItem.unit || ""}
                        required
                        onChange={handleSetNewIngredientGroup}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newIngredientItem.edit
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
                          {!newIngredientItem.edit
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
                    {newIngredientItem.uploading === true ||
                    loading === true ? (
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
                                  {!searchedIngredientGroup.searched
                                    ? _t(t("Ingredient Item"))
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center">
                              {/* Search customer */}
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

                              {/* Add customer modal trigger button */}
                              <div className="col-md-3 text-md-right">
                                <button
                                  type="button"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                  data-toggle="modal"
                                  data-target="#addCustomer"
                                  onClick={() => {
                                    setNewIngredientItem({
                                      ...newIngredientItem,
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
                                  {_t(t("Group"))}
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
                              {!searchedIngredientGroup.searched
                                ? [
                                    ingredientItemList && [
                                      ingredientItemList.data.length === 0 ? (
                                        <tr className="align-middle">
                                          <td
                                            scope="row"
                                            colSpan="7"
                                            className="xsm-text align-middle text-center"
                                          >
                                            {_t(t("No data available"))}
                                          </td>
                                        </tr>
                                      ) : (
                                        ingredientItemList.data.map(
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
                                                    (ingredientItemList.current_page -
                                                      1) *
                                                      ingredientItemList.per_page}
                                                </th>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.group_name}
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
                                                        onClick={() => {
                                                          setNewIngredientItem({
                                                            ...newIngredientItem,
                                                          });
                                                          handleSetEdit(
                                                            item.slug
                                                          );
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#addCustomer"
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
                                  ]
                                : [
                                    /* searched data, logic === haveData*/
                                    searchedIngredientGroup && [
                                      searchedIngredientGroup.list.length ===
                                      0 ? (
                                        <tr className="align-middle">
                                          <td
                                            scope="row"
                                            colSpan="7"
                                            className="xsm-text align-middle text-center"
                                          >
                                            {_t(t("No data available"))}
                                          </td>
                                        </tr>
                                      ) : (
                                        searchedIngredientGroup.list.map(
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
                                                    (ingredientItemList.current_page -
                                                      1) *
                                                      ingredientItemList.per_page}
                                                </th>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.group_name}
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
                                                        onClick={() => {
                                                          setNewIngredientItem({
                                                            ...newIngredientItem,
                                                          });
                                                          handleSetEdit(
                                                            item.slug
                                                          );
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#addCustomer"
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
              {newIngredientItem.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedIngredientGroup.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(
                                ingredientItemList,
                                setPaginatedIngredientItem
                              )}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(ingredientItemList)}
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
                                    setSearchedIngredientGroup({
                                      ...searchedIngredientGroup,
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
                                    searchedIngredientGroup,
                                    ingredientItemForSearch
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

export default IngredientItem;
