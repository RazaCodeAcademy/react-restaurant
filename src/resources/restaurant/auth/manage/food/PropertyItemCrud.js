import React, { useState, useContext, useEffect } from "react";
import { NavLink, useHistory, useParams } from "react-router-dom";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//functions
import {
  //common
  _t,
  getCookie,
  formatPrice,
  currencySymbolLeft,
  currencySymbolRight,

  //loading
  modalLoading,
  tableLoading,

  //pagination
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
import { FoodContext } from "../../../../../contexts/Food";

const PropertyItemCrud = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const propertySlug = useParams();
  //getting context values here

  let {
    //common
    loading,
    setLoading,
    //property Item
    getPropertyItem,
    propertyItemList,
    setPropertyItemList,
    propertyItemForSearch,
    setPropertyItemForSearch,
    propertyItemGroup,
    getFood,

    //pagination
    dataPaginating,
  } = useContext(FoodContext);

  // States hook here
  //new property item
  let [newPropertyItem, setNewPropertyItem] = useState({
    name: "",
    extraPrice: null,
    allow_multi_quantity: false,
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedPropertyItem, setSearchedPropertyItem] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {
    setLoading(true);
    getPropertyItem(propertySlug.slug);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  //set name hook
  const handleSetNewPropertyItem = (e) => {
    setNewPropertyItem({
      ...newPropertyItem,
      [e.target.name]: e.target.value,
    });
  };

  const handleMultiQuantity = () => {
    setNewPropertyItem({
      ...newPropertyItem,
      allow_multi_quantity: !newPropertyItem.allow_multi_quantity,
    });
  };

  //Save New property item
  const handleSaveNewPropertyItem = (e) => {
    e.preventDefault();
    setNewPropertyItem({
      ...newPropertyItem,
      uploading: true,
    });
    const propertyItemUrl = BASE_URL + `/settings/new-property-item`;
    let formData = new FormData();
    formData.append("name", newPropertyItem.name);
    formData.append("extraPrice", newPropertyItem.extraPrice);
    formData.append(
      "allow_multi_quantity",
      newPropertyItem.allow_multi_quantity === false ? 0 : 1
    );
    formData.append("propertyGroupSlug", propertySlug.slug);
    return axios
      .post(propertyItemUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewPropertyItem({
          name: "",
          extraPrice: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setPropertyItemList(res.data[0]);
        setPropertyItemForSearch(res.data[0]);
        setSearchedPropertyItem({
          ...searchedPropertyItem,
          list: res.data[0],
        });
        getFood();
        setLoading(false);
        toast.success(`${_t(t("Property item has been added"))}`, {
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
        setNewPropertyItem({
          ...newPropertyItem,
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

  //set edit true & values
  const handleSetEdit = (slug) => {
    let variation = propertyItemForSearch.filter((item) => {
      return item.slug === slug;
    });
    setNewPropertyItem({
      ...newPropertyItem,
      name: variation[0].name,
      extraPrice: variation[0].extra_price,
      allow_multi_quantity:
        parseInt(variation[0].allow_multi_quantity) === 1 ? true : false,
      editSlug: variation[0].slug,
      edit: true,
    });
  };

  //update property item
  const handleUpdatePropertyItem = (e) => {
    e.preventDefault();
    setNewPropertyItem({
      ...newPropertyItem,
      uploading: true,
    });
    const propertyItemUrl = BASE_URL + `/settings/update-property-item`;
    let formData = new FormData();
    formData.append("name", newPropertyItem.name);
    formData.append("extraPrice", newPropertyItem.extraPrice);
    formData.append(
      "allow_multi_quantity",
      newPropertyItem.allow_multi_quantity === false ? 0 : 1
    );
    formData.append("editSlug", newPropertyItem.editSlug);
    formData.append("propertyGroupSlug", propertySlug.slug);
    return axios
      .post(propertyItemUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewPropertyItem({
          name: "",
          extraPrice: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setPropertyItemList(res.data[0]);
        setPropertyItemForSearch(res.data[0]);
        setSearchedPropertyItem({
          ...searchedPropertyItem,
          list: res.data[0],
        });
        getFood();
        setLoading(false);
        toast.success(`${_t(t("Property item has been updated"))}`, {
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
        setNewPropertyItem({
          ...newPropertyItem,
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

  //search property item here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedPropertyItem({ ...searchedPropertyItem, searched: false });
    } else {
      let searchedList = propertyItemForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        let lowerCaseItemExtraPrice = item.extra_price.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          lowerCaseItemExtraPrice.includes(searchInput)
        );
      });
      setSearchedPropertyItem({
        ...searchedPropertyItem,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of property item
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
                  handleDeletePropertyItem(slug);
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

  //delete variation here
  const handleDeletePropertyItem = (slug) => {
    setLoading(true);
    const propertyItemUrl = BASE_URL + `/settings/delete-property-item/${slug}`;
    return axios
      .get(propertyItemUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPropertyItemList(res.data[0]);
        setPropertyItemForSearch(res.data[0]);
        setSearchedPropertyItem({
          ...searchedPropertyItem,
          list: res.data[0],
        });
        getFood();
        setLoading(false);
        toast.success(
          `${_t(t("Property item has been deleted successfully"))}`,
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
        <title>{_t(t("Property Items"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addvariation" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newPropertyItem.edit
                    ? _t(t("Add new property item"))
                    : _t(t("Update property item"))}
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
              {newPropertyItem.uploading === false ? (
                <div key="fragment-property-item-1">
                  <form
                    onSubmit={
                      !newPropertyItem.edit
                        ? handleSaveNewPropertyItem
                        : handleUpdatePropertyItem
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
                        placeholder="e.g. Egg, Cheese, Mild, Spicy"
                        value={newPropertyItem.name || ""}
                        required
                        onChange={handleSetNewPropertyItem}
                      />
                    </div>

                    <div className="mt-4">
                      <label htmlFor="extraPrice" className="form-label">
                        {_t(t("Price"))}{" "}
                        <small className="text-primary">* </small>
                        <small className="text-secondary">
                          ( {_t(t("Insert 0 if it is free"))} ) (
                          {_t(t("Enter price in USD"))})
                        </small>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        id="extraPrice"
                        name="extraPrice"
                        placeholder="e.g. Type price of this item in 'US dollar'"
                        value={newPropertyItem.extraPrice || ""}
                        required
                        onChange={handleSetNewPropertyItem}
                      />
                    </div>

                    <div className="form-check mt-4">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="has_multiple_quantity"
                        checked={newPropertyItem.allow_multi_quantity}
                        onChange={handleMultiQuantity}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="has_multiple_quantity"
                      >
                        {_t(t("Allow multiple quantity?"))}
                      </label>
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newPropertyItem.edit
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
                          {!newPropertyItem.edit
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
                    {newPropertyItem.uploading === true || loading === true ? (
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
                                  {!searchedPropertyItem.searched
                                    ? [
                                        `${
                                          propertyItemGroup
                                            ? propertyItemGroup.name
                                            : ""
                                        } ${_t(t("List"))}`,
                                      ]
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center">
                              {/* Search group */}
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

                              {/* Add group modal trigger button */}
                              <div className="col-md-3 text-md-right">
                                <button
                                  type="button"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                  data-toggle="modal"
                                  data-target="#addvariation"
                                  onClick={() => {
                                    setNewPropertyItem({
                                      ...newPropertyItem,
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
                                  {_t(t("Price"))}
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
                              {!searchedPropertyItem.searched
                                ? [
                                    propertyItemList && [
                                      propertyItemList.length === 0 ? (
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
                                        propertyItemList.map((item, index) => {
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

                                              <td className="xsm-text align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(item.extra_price)}
                                                {currencySymbolRight()}
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
                                                        handleSetEdit(item.slug)
                                                      }
                                                      data-toggle="modal"
                                                      data-target="#addvariation"
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
                                        })
                                      ),
                                    ],
                                  ]
                                : [
                                    /* searched data, logic === haveData*/
                                    searchedPropertyItem && [
                                      searchedPropertyItem.list.length === 0 ? (
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
                                        searchedPropertyItem.list.map(
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
                                                  {index + 1}
                                                </th>

                                                <td className="xsm-text align-middle text-center">
                                                  {item.name}
                                                </td>

                                                <td className="xsm-text align-middle text-center">
                                                  {currencySymbolLeft()}
                                                  {formatPrice(
                                                    item.extra_price
                                                  )}
                                                  {currencySymbolRight()}
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
                                                        data-target="#addvariation"
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
              {newPropertyItem.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedPropertyItem.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              <div style={{ height: "33px" }}></div>
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {_t(t("Showing"))}{" "}
                                    {propertyItemForSearch &&
                                      propertyItemForSearch.length}{" "}
                                    {_t(t("of"))}{" "}
                                    {propertyItemForSearch &&
                                      propertyItemForSearch.length}
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
                                    setSearchedPropertyItem({
                                      ...searchedPropertyItem,
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
                                    searchedPropertyItem,
                                    propertyItemForSearch
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

export default PropertyItemCrud;
