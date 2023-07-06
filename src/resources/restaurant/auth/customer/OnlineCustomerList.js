import React, { useEffect, useContext, useState } from "react";
import { NavLink } from "react-router-dom";
//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  modalLoading,
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

//importing context consumer here
import { UserContext } from "../../../../contexts/User";
import { SettingsContext } from "../../../../contexts/Settings";
import { RestaurantContext } from "../../../../contexts/Restaurant";

const OnlineCustomerList = () => {
  //getting context values here
  const {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  const {
    authUserInfo,

    //customer
    getCustomerOnline,
    customerListOnline,
    setCustomerListOnline,
    setPaginatedCustomerOnline,
    customerOnlineForSearch,
    setCustomerOnlineForSearch,

    //pagination
    dataPaginating,
  } = useContext(UserContext);

  const {
    //branch
    branchForSearch,
  } = useContext(RestaurantContext);

  const { t } = useTranslation();

  // States hook here
  //new customer
  let [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phn_no: "",
    address: "",
    branch: null,
    selectedBranch: null,
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedCustomer, setSearchedCustomer] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, phn no hook
  const handleSetNewCustomer = (e) => {
    setNewCustomer({ ...newCustomer, [e.target.name]: e.target.value });
  };

  //set branch hook
  const handleSetBranch = (branch) => {
    setNewCustomer({ ...newCustomer, branch });
  };

  //Save New customer
  const handleSaveNewCustomer = (e) => {
    e.preventDefault();
    let checkBranch = false;
    if (
      authUserInfo.details !== null &&
      authUserInfo.details.user_type !== "staff"
    ) {
      checkBranch = true;
    }
    if (checkBranch) {
      if (newCustomer.branch !== null) {
        setNewCustomer({
          ...newCustomer,
          uploading: true,
        });
        const customerUrl = BASE_URL + `/settings/new-customer`;
        let formData = new FormData();
        formData.append("name", newCustomer.name);
        formData.append("phn_no", newCustomer.phn_no);
        formData.append("email", newCustomer.email);
        formData.append("address", newCustomer.address);
        formData.append("branch_id", newCustomer.branch.id);
        return axios
          .post(customerUrl, formData, {
            headers: { Authorization: `Bearer ${getCookie()}` },
          })
          .then((res) => {
            setNewCustomer({
              name: "",
              email: "",
              phn_no: "",
              address: "",
              branch: null,
              selectedBranch: null,
              edit: false,
              editSlug: null,
              uploading: false,
            });
            setCustomerListOnline(res.data[0]);
            setCustomerOnlineForSearch(res.data[1]);
            setLoading(false);
            toast.success(`${_t(t("Customer has been added"))}`, {
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
            setNewCustomer({
              ...newCustomer,
              uploading: false,
            });
            if (error && error.response.data.errors) {
              if (error.response.data.errors.phn_no) {
                error.response.data.errors.phn_no.forEach((item) => {
                  if (item === "A customer exists with this phone number") {
                    toast.error(
                      `${_t(t("A customer exists with this phone number"))}`,
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
    } else {
      setNewCustomer({
        ...newCustomer,
        uploading: true,
      });
      const customerUrl = BASE_URL + `/settings/new-customer`;
      let formData = new FormData();
      formData.append("name", newCustomer.name);
      formData.append("phn_no", newCustomer.phn_no);
      formData.append("email", newCustomer.email);
      formData.append("address", newCustomer.address);
      if (authUserInfo.details !== null) {
        formData.append("branch_id", authUserInfo.details.branch_id);
      }
      return axios
        .post(customerUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setNewCustomer({
            name: "",
            email: "",
            phn_no: "",
            address: "",
            branch: null,
            selectedBranch: null,
            edit: false,
            editSlug: null,
            uploading: false,
          });
          setCustomerListOnline(res.data[0]);
          setCustomerOnlineForSearch(res.data[1]);
          setLoading(false);
          toast.success(`${_t(t("Customer has been added"))}`, {
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
          setNewCustomer({
            ...newCustomer,
            uploading: false,
          });
          if (error && error.response.data.errors) {
            if (error.response.data.errors.phn_no) {
              error.response.data.errors.phn_no.forEach((item) => {
                if (item === "A customer exists with this phone number") {
                  toast.error(
                    `${_t(t("A customer exists with this phone number"))}`,
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
    }
  };

  //set edit true & values
  const handleSetEdit = (slug) => {
    let customer = customerOnlineForSearch.filter((item) => {
      return item.slug === slug;
    });

    let selectedOptionForBranch = null;
    if (
      authUserInfo.details !== null &&
      authUserInfo.details.user_type !== "staff"
    ) {
      if (customer[0].branch_id) {
        selectedOptionForBranch = branchForSearch.filter((branchItem) => {
          return branchItem.id === parseInt(customer[0].branch_id);
        });
      }
    }
    setNewCustomer({
      ...newCustomer,
      name: customer[0].name,
      email: customer[0].email,
      phn_no: customer[0].phn_no,
      address: customer[0].address,
      selectedBranch: selectedOptionForBranch
        ? selectedOptionForBranch[0]
        : null,
      editSlug: customer[0].slug,
      edit: true,
    });
  };

  //update customer
  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    setNewCustomer({
      ...newCustomer,
      uploading: true,
    });
    const customerUrl = BASE_URL + `/settings/update-customer`;
    let formData = new FormData();
    formData.append("name", newCustomer.name);
    formData.append("phn_no", newCustomer.phn_no);
    formData.append("email", newCustomer.email);
    formData.append("address", newCustomer.address);
    if (newCustomer.branch !== null) {
      formData.append("branch_id", newCustomer.branch.id);
    }
    formData.append("editSlug", newCustomer.editSlug);
    return axios
      .post(customerUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewCustomer({
          name: "",
          email: "",
          phn_no: "",
          address: "",
          branch: null,
          selectedBranch: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setCustomerListOnline(res.data[0]);
        setCustomerOnlineForSearch(res.data[1]);
        setSearchedCustomer({
          ...searchedCustomer,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Customer has been updated"))}`, {
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
        setNewCustomer({
          ...newCustomer,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.phn_no) {
            error.response.data.errors.phn_no.forEach((item) => {
              if (item === "A customer exists with this phone number") {
                toast.error(
                  `${_t(t("A customer exists with this phone number"))}`,
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
      setSearchedCustomer({ ...searchedCustomer, searched: false });
    } else {
      let searchedList = customerOnlineForSearch.filter((item) => {
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
      setSearchedCustomer({
        ...searchedCustomer,
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
    const customerUrl = BASE_URL + `/settings/delete-customer/${slug}`;
    return axios
      .get(customerUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setCustomerListOnline(res.data[0]);
        setCustomerOnlineForSearch(res.data[1]);
        setSearchedCustomer({
          ...searchedCustomer,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Customer has been deleted successfully"))}`, {
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
        <title>{_t(t("Customers"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addCustomer" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newCustomer.edit
                    ? _t(t("Add new customer"))
                    : _t(t("Update customer"))}
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
              {newCustomer.uploading === false ? (
                <div key="fragment-customer-1">
                  <form
                    onSubmit={
                      !newCustomer.edit
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
                        value={newCustomer.name || ""}
                        required
                        onChange={handleSetNewCustomer}
                      />
                    </div>

                    {authUserInfo.details !== null &&
                      authUserInfo.details.user_type !== "staff" && (
                        <div className="mt-3">
                          <label className="form-label mb-0">
                            {_t(t("Select a branch"))}{" "}
                            {newCustomer.edit ? (
                              <small className="text-primary">
                                {"( "}
                                {_t(
                                  t(
                                    "Leave empty if you do not want to change branch"
                                  )
                                )}
                                {" )"}
                              </small>
                            ) : (
                              <small className="text-primary">*</small>
                            )}
                          </label>
                          {newCustomer.edit &&
                            newCustomer.selectedBranch !== null && (
                              <ul className="list-group list-group-horizontal-sm row col-12 mb-2 ml-md-1">
                                <li className="list-group-item col-12 col-md-3 bg-success rounded-sm py-1 px-2 my-1 text-center">
                                  {newCustomer.selectedBranch.name}
                                </li>
                              </ul>
                            )}
                          <Select
                            options={branchForSearch}
                            components={makeAnimated()}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            className="basic-multi-select mt-2"
                            classNamePrefix="select"
                            onChange={handleSetBranch}
                            placeholder={_t(t("Please select a branch"))}
                          />
                        </div>
                      )}

                    <div className="mt-3">
                      <label htmlFor="email" className="form-label">
                        {_t(t("Email"))}
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="e.g. customer@example.com"
                        value={newCustomer.email || ""}
                        onChange={handleSetNewCustomer}
                      />
                    </div>

                    <div className="mt-3">
                      <label htmlFor="phn_no" className="form-label">
                        {_t(t("Phone number"))}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="phn_no"
                        name="phn_no"
                        placeholder="e.g. 01xxx xxx xxx"
                        value={newCustomer.phn_no || ""}
                        onChange={handleSetNewCustomer}
                      />
                    </div>

                    <div className="mt-3">
                      <label htmlFor="address" className="form-label">
                        {_t(t("Address"))}
                      </label>
                      <textarea
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        placeholder="Type customer address"
                        value={newCustomer.address || ""}
                        onChange={handleSetNewCustomer}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newCustomer.edit
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
                          {!newCustomer.edit ? _t(t("Save")) : _t(t("Update"))}
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
            <div className="col-12 t-mb-30 mb-lg-0">
              {newCustomer.uploading === true || loading === true ? (
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
                            {!searchedCustomer.searched
                              ? _t(t("Customers"))
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
                            placeholder={_t(t("Search")) + ".."}
                            onChange={handleSearch}
                          />
                        </div>
                        <NavLink
                          to="/dashboard/customers"
                          className="btn btn-transparent btn-primary ml-2 sm-text text-uppercase"
                        >
                          {_t(t("POS Customers"))}
                        </NavLink>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-7 t-mb-15 mb-md-0">
                      <div className="row gx-2 align-items-center">
                        <div className="col-12 col-md-5 ml-auto mt-2 mt-md-0">
                          <ul className="t-list fk-sort align-items-center justify-content-center">
                            {/* <li className="fk-sort__list mb-0 flex-grow-1">
                              <button
                                className="w-100 btn btn-secondary sm-text text-uppercase"
                                data-toggle="modal"
                                data-target="#addCustomer"
                                onClick={() => {
                                  setNewCustomer({
                                    ...newCustomer,
                                    branch: null,
                                    edit: false,
                                    uploading: false,
                                  });
                                }}
                              >
                                {_t(t("add new"))}
                              </button>
                            </li> */}
                          </ul>
                        </div>
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
                                {_t(t("Branch"))}
                              </th>

                              <th
                                scope="col"
                                className="sm-text text-capitalize align-middle text-center border-1 border"
                              >
                                {_t(t("Action"))}
                              </th> */}
                            </tr>
                          </thead>
                          <tbody className="align-middle">
                            {/* loop here, logic === !search && haveData && haveDataLegnth > 0*/}
                            {!searchedCustomer.searched
                              ? [
                                  customerListOnline && [
                                    customerListOnline.data.length === 0 ? (
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
                                      customerListOnline.data.map(
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
                                                  (customerListOnline.current_page -
                                                    1) *
                                                    customerListOnline.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.email || "-"}
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
                                                {item.address || "-"}
                                              </td>

                                              {/* <td className="xsm-text align-middle text-center">
                                                {item.branch_name || "-"}
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
                                                        setNewCustomer({
                                                          ...newCustomer,
                                                          branch: null,
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
                                              </td> */}
                                            </tr>
                                          );
                                        }
                                      )
                                    ),
                                  ],
                                ]
                              : [
                                  /* searched data, logic === haveData*/
                                  searchedCustomer && [
                                    searchedCustomer.list.length === 0 ? (
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
                                      searchedCustomer.list.map(
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
                                                  (customerListOnline.current_page -
                                                    1) *
                                                    customerListOnline.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.email || "-"}
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
                                              <td className="xsm-text align-middle text-center">
                                                {item.address || "-"}
                                              </td>

                                              {/* <td className="xsm-text align-middle text-center">
                                                {item.branch_name || "-"}
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
                                                        setNewCustomer({
                                                          ...newCustomer,
                                                          branch: null,
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
                                              </td> */}
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
              {newCustomer.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedCustomer.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(
                                customerListOnline,
                                setPaginatedCustomerOnline
                              )}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(customerListOnline)}
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
                                    setSearchedCustomer({
                                      ...searchedCustomer,
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
                                    searchedCustomer,
                                    customerOnlineForSearch
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

export default OnlineCustomerList;
