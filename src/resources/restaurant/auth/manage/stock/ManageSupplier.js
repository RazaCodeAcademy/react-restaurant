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
import { UserContext } from "../../../../../contexts/User";

const ManageSupplier = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  let {
    //customer
    getSupplier,
    supplierList,
    setSupplierList,
    setPaginatedSupplier,
    supplierForSearch,
    setSupplierForSearch,
    //pagination
    dataPaginating,
  } = useContext(UserContext);

  // States hook here
  //new customer
  let [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phn_no: "",
    address: "",
    due: null,
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedSupplier, setSearchedSupplier] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, phn no hook
  const handleSetNewSupplier = (e) => {
    setNewSupplier({ ...newSupplier, [e.target.name]: e.target.value });
  };

  //Save New customer
  const handleSaveNewCustomer = (e) => {
    e.preventDefault();
    setNewSupplier({
      ...newSupplier,
      uploading: true,
    });
    const customerUrl = BASE_URL + `/settings/new-supplier`;
    let formData = new FormData();
    formData.append("name", newSupplier.name);
    formData.append("phn_no", newSupplier.phn_no);
    formData.append("email", newSupplier.email);
    formData.append("address", newSupplier.address);
    formData.append("due", 0);
    return axios
      .post(customerUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewSupplier({
          name: "",
          email: "",
          phn_no: "",
          address: "",
          due: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setSupplierList(res.data[0]);
        setSupplierForSearch(res.data[1]);
        setLoading(false);
        toast.success(`${_t(t("Supplier has been added"))}`, {
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
        setNewSupplier({
          ...newSupplier,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.phn_no) {
            error.response.data.errors.phn_no.forEach((item) => {
              if (item === "A supplier exists with this phone number") {
                toast.error(
                  `${_t(t("A supplier exists with this phone number"))}`,
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
          }
        }
      });
  };

  //set edit true & values
  const handleSetEdit = (slug) => {
    let supplier = supplierForSearch.filter((item) => {
      return item.slug === slug;
    });
    setNewSupplier({
      ...newSupplier,
      name: supplier[0].name,
      email: supplier[0].email,
      phn_no: supplier[0].phn_no,
      address: supplier[0].address,
      due: supplier[0].due_balance,
      editSlug: supplier[0].slug,
      edit: true,
    });
  };

  //update customer
  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    setNewSupplier({
      ...newSupplier,
      uploading: true,
    });
    const customerUrl = BASE_URL + `/settings/update-supplier`;
    let formData = new FormData();
    formData.append("name", newSupplier.name);
    formData.append("phn_no", newSupplier.phn_no);
    formData.append("email", newSupplier.email);
    formData.append("address", newSupplier.address);
    formData.append("due", 0);
    formData.append("editSlug", newSupplier.editSlug);
    return axios
      .post(customerUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewSupplier({
          name: "",
          email: "",
          phn_no: "",
          address: "",
          due: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setSupplierList(res.data[0]);
        setSupplierForSearch(res.data[1]);
        setSearchedSupplier({
          ...searchedSupplier,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Supplier has been updated"))}`, {
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
        setNewSupplier({
          ...newSupplier,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.phn_no) {
            error.response.data.errors.phn_no.forEach((item) => {
              if (item === "A supplier exists with this phone number") {
                toast.error(
                  `${_t(t("A supplier exists with this phone number"))}`,
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
          }
        }
      });
  };

  //search customers here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedSupplier({ ...searchedSupplier, searched: false });
    } else {
      let searchedList = supplierForSearch.filter((item) => {
        //name
        let lowerCaseItemName = item.name.toLowerCase();

        //email
        let lowerCaseItemEmail =
          item.email !== null && item.email.toLowerCase();

        //phn no
        let lowerCaseItemPhnNo =
          item.phn_no !== null && item.phn_no.toLowerCase();

        //address
        let lowerCaseItemAddress =
          item.address !== null && item.address.toLowerCase();

        return (
          lowerCaseItemName.includes(searchInput) ||
          (lowerCaseItemEmail && lowerCaseItemEmail.includes(searchInput)) ||
          (lowerCaseItemPhnNo && lowerCaseItemPhnNo.includes(searchInput)) ||
          (lowerCaseItemAddress && lowerCaseItemAddress.includes(searchInput))
        );
      });
      setSearchedSupplier({
        ...searchedSupplier,
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
                  handleDeleteCustomer(slug);
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
  const handleDeleteCustomer = (slug) => {
    setLoading(true);
    const customerUrl = BASE_URL + `/settings/delete-supplier/${slug}`;
    return axios
      .get(customerUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSupplierList(res.data[0]);
        setSupplierForSearch(res.data[1]);
        setSearchedSupplier({
          ...searchedSupplier,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Supplier has been deleted successfully"))}`, {
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

  return (
    <>
      <Helmet>
        <title>{_t(t("Suppliers"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addCustomer" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newSupplier.edit
                    ? _t(t("Add new Supplier"))
                    : _t(t("Update Supplier"))}
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
              {newSupplier.uploading === false ? (
                <div key="fragment-customer-1">
                  <form
                    onSubmit={
                      !newSupplier.edit
                        ? handleSaveNewCustomer
                        : handleUpdateCustomer
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
                        placeholder="e.g. Mr. John"
                        value={newSupplier.name || ""}
                        required
                        onChange={handleSetNewSupplier}
                      />
                    </div>

                    <div className="mt-3">
                      <label htmlFor="email" className="form-label">
                        {_t(t("Email"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        required
                        placeholder="e.g. supplier@example.com"
                        value={newSupplier.email || ""}
                        onChange={handleSetNewSupplier}
                      />
                    </div>

                    <div className="mt-3">
                      <label htmlFor="phn_no" className="form-label">
                        {_t(t("Phone number"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="phn_no"
                        name="phn_no"
                        required
                        placeholder="e.g. 01xxx xxx xxx"
                        value={newSupplier.phn_no || ""}
                        onChange={handleSetNewSupplier}
                      />
                    </div>

                    {/* <div className="mt-3">
                      <label htmlFor="due" className="form-label">
                        {_t(t("Previous due"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        id="due"
                        name="due"
                        required
                        className="form-control"
                        onChange={handleSetNewSupplier}
                        value={newSupplier.due}
                        placeholder="Previous due in USD"
                        required
                      />
                    </div> */}

                    <div className="mt-3">
                      <label htmlFor="address" className="form-label">
                        {_t(t("Address"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        required
                        placeholder="Type customer address"
                        value={newSupplier.address || ""}
                        onChange={handleSetNewSupplier}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newSupplier.edit
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
                          {!newSupplier.edit ? _t(t("Save")) : _t(t("Update"))}
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
                    {newSupplier.uploading === true || loading === true ? (
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
                                  {!searchedSupplier.searched
                                    ? _t(t("Supplier List"))
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
                                    setNewSupplier({
                                      ...newSupplier,
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
                                  {_t(t("email"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Phn no"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Address"))}
                                </th>

                                {/* <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Due"))}
                                </th> */}

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
                              {!searchedSupplier.searched
                                ? [
                                    supplierList && [
                                      supplierList.data.length === 0 ? (
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
                                        supplierList.data.map((item, index) => {
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
                                                  (supplierList.current_page -
                                                    1) *
                                                    supplierList.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.email}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.phn_no ? (
                                                  <a
                                                    href={`tel:${item.phn_no}`}
                                                    rel="noopener noreferrer"
                                                  >
                                                    {item.phn_no}
                                                  </a>
                                                ) : (
                                                  "-"
                                                )}
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.address}
                                              </td>

                                              {/* <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(item.due_balance)}
                                                {currencySymbolRight()}
                                              </td> */}

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
                                                        setNewSupplier({
                                                          ...newSupplier,
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
                                        })
                                      ),
                                    ],
                                  ]
                                : [
                                    /* searched data, logic === haveData*/
                                    searchedSupplier && [
                                      searchedSupplier.list.length === 0 ? (
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
                                        searchedSupplier.list.map(
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
                                                    (supplierList.current_page -
                                                      1) *
                                                      supplierList.per_page}
                                                </th>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>

                                                <td className="xsm-text align-middle text-center">
                                                  {item.email}
                                                </td>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.phn_no ? (
                                                    <a
                                                      href={`tel:${item.phn_no}`}
                                                      rel="noopener noreferrer"
                                                    >
                                                      {item.phn_no}
                                                    </a>
                                                  ) : (
                                                    "-"
                                                  )}
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.address}
                                                </td>

                                                {/* <td className="xsm-text align-middle text-center">
                                                  {currencySymbolLeft()}
                                                  {formatPrice(
                                                    item.due_balance
                                                  )}
                                                  {currencySymbolRight()}
                                                </td> */}

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
                                                          setNewSupplier({
                                                            ...newSupplier,
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
              {newSupplier.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedSupplier.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(supplierList, setPaginatedSupplier)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(supplierList)}
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
                                    setSearchedSupplier({
                                      ...searchedSupplier,
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
                                    searchedSupplier,
                                    supplierForSearch
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

export default ManageSupplier;
