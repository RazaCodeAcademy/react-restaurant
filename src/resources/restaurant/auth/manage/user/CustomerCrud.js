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
import Select from "react-select";
import makeAnimated from "react-select/animated";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { UserContext } from "../../../../../contexts/User";
import { RestaurantContext } from "../../../../../contexts/Restaurant";

const CustomerCrud = () => {
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
    getCustomer,
    customerList,
    setCustomerList,
    setPaginatedCustomer,
    customerForSearch,
    setCustomerForSearch,

    //pagination
    dataPaginating,
  } = useContext(UserContext);

  let {
    //branch
    branchForSearch,
  } = useContext(RestaurantContext);

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
          setCustomerList(res.data[0]);
          setCustomerForSearch(res.data[1]);
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
  };

  //set edit true & values
  const handleSetEdit = (slug) => {
    let customer = customerForSearch.filter((item) => {
      return item.slug === slug;
    });
    let selectedOptionForBranch = null;
    if (customer[0].branch_id) {
      selectedOptionForBranch = branchForSearch.filter((branchItem) => {
        return branchItem.id === parseInt(customer[0].branch_id);
      });
    }
    setNewCustomer({
      ...newCustomer,
      name: customer[0].name,
      email: customer[0].email,
      phn_no: customer[0].phn_no,
      address: customer[0].address,
      selectedBranch: selectedOptionForBranch[0] || null,
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
        setCustomerList(res.data[0]);
        setCustomerForSearch(res.data[1]);
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
      let searchedList = customerForSearch.filter((item) => {
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

        //branch
        let lowerCaseItemBranch =
          item.branch_name !== null && item.branch_name.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          (lowerCaseItemEmail && lowerCaseItemEmail.includes(searchInput)) ||
          (lowerCaseItemPhnNo && lowerCaseItemPhnNo.includes(searchInput)) ||
          (lowerCaseItemAddress &&
            lowerCaseItemAddress.includes(searchInput)) ||
          (lowerCaseItemBranch && lowerCaseItemBranch.includes(searchInput))
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
        setCustomerList(res.data[0]);
        setCustomerForSearch(res.data[1]);
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

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('csv_file', selectedFile);
      const customerUrl = BASE_URL + `/settings/upload-csv-to-create-new-customer`;
      axios.post(customerUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
        .then(response => {
          if(response.data.success){
            window.location.reload();
          }else{
            console.log(response.data.message)
          }
        })
        .catch(error => {
          console.error(error); // Handle error
        });
      }
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
                      {newCustomer.edit && newCustomer.selectedBranch !== null && (
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
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleSetBranch}
                        placeholder={_t(t("Please select a branch"))}
                      />
                    </div>

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
                    {newCustomer.uploading === true || loading === true ? (
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
                                  {!searchedCustomer.searched
                                    ? _t(t("Customer List"))
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                          <div className="row gx-3 align-items-center">
                              {/* import customer csv file */}
                              <div className="col-md-9 t-mb-15 mb-md-0">
                                <div className="input-group">
                                  <div className="form-file">
                                    <input
                                      type="file"
                                      className="form-control border-0 form-control--light-1 rounded-0"
                                      placeholder={_t(t("Search")) + ".."}
                                      onChange={handleFileChange}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Add customer modal trigger button */}
                              <div className="col-md-3 text-md-right mt-2">
                                <button
                                  type="button"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                  onClick={() => {
                                    handleFileUpload()
                                  }}
                                >
                                  {_t(t("Upload CSV"))}
                                </button>
                              </div>
                            </div>
                            <div className="row gx-3 align-items-center mt-1">
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

                                <th
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
                                </th>
                              </tr>
                            </thead>
                            <tbody className="align-middle">
                              {/* loop here, logic === !search && haveData && haveDataLegnth > 0*/}
                              {!searchedCustomer.searched
                                ? [
                                    customerList && [
                                      customerList.data.length === 0 ? (
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
                                        customerList.data.map((item, index) => {
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
                                                  (customerList.current_page -
                                                    1) *
                                                    customerList.per_page}
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

                                              <td className="xsm-text align-middle text-center">
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
                                              </td>
                                            </tr>
                                          );
                                        })
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
                                                    (customerList.current_page -
                                                      1) *
                                                      customerList.per_page}
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

                                                <td className="xsm-text align-middle text-center">
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
                              {pagination(customerList, setPaginatedCustomer)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(customerList)}
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
                                    customerForSearch
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

export default CustomerCrud;
