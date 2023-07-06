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

const Waiter = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  let {
    //waiter
    waiterList,
    setWaiterList,
    setPaginatedWaiter,
    waiterForSearch,
    setWaiterForSearch,

    //pagination
    dataPaginating,
  } = useContext(UserContext);

  let {
    //branch
    branchForSearch,
  } = useContext(RestaurantContext);

  // States hook here
  //new waiter
  let [newWaiter, setNewWaiter] = useState({
    name: "",
    phn_no: "",
    branch: null,
    selectedBranch: null,
    image: null,
    edit: false,
    editSlug: null,
    editImage: null,
    uploading: false,
  });

  //search result
  let [searchedWaiter, setSearchedWaiter] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, phn no hook
  const handleSetNewWaiter = (e) => {
    setNewWaiter({ ...newWaiter, [e.target.name]: e.target.value });
  };

  //set branch hook
  const handleSetBranch = (branch) => {
    setNewWaiter({ ...newWaiter, branch });
  };

  //set image hook
  const handleWaiterImage = (e) => {
    setNewWaiter({
      ...newWaiter,
      [e.target.name]: e.target.files[0],
    });
  };

  //Save New waiter
  const handleSaveNewWaiter = (e) => {
    e.preventDefault();
    if (newWaiter.branch !== null) {
      setNewWaiter({
        ...newWaiter,
        uploading: true,
      });
      const waiterUrl = BASE_URL + `/settings/new-waiter`;
      let formData = new FormData();
      formData.append("name", newWaiter.name);
      formData.append("phn_no", newWaiter.phn_no);
      formData.append("branch_id", newWaiter.branch.id);
      formData.append("image", newWaiter.image);
      return axios
        .post(waiterUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setNewWaiter({
            name: "",
            phn_no: "",
            branch: null,
            selectedBranch: null,
            image: null,
            edit: false,
            editSlug: null,
            editImage: null,
            uploading: false,
          });
          setWaiterList(res.data[0]);
          setWaiterForSearch(res.data[1]);
          setLoading(false);
          toast.success(`${_t(t("Waiter has been added"))}`, {
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
          setNewWaiter({
            ...newWaiter,
            uploading: false,
          });
          if (error && error.response.data.errors) {
            if (error.response.data.errors.phn_no) {
              error.response.data.errors.phn_no.forEach((item) => {
                if (item === "A waiter exists with this phone number") {
                  toast.error(
                    `${_t(t("A waiter exists with this phone number"))}`,
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
            if (error.response.data.errors.image) {
              error.response.data.errors.image.forEach((item) => {
                if (item === "Please select a valid image file") {
                  toast.error(`${_t(t("Please select a valid image file"))}`, {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  });
                }
                if (item === "Please select a file less than 5MB") {
                  toast.error(
                    `${_t(t("Please select a file less than 5MB"))}`,
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
    let waiter = waiterForSearch.filter((item) => {
      return item.slug === slug;
    });
    let selectedOptionForBranch = null;
    if (waiter[0].branch_id) {
      selectedOptionForBranch = branchForSearch.filter((branchItem) => {
        return branchItem.id === parseInt(waiter[0].branch_id);
      });
    }
    setNewWaiter({
      ...newWaiter,
      name: waiter[0].name,
      phn_no: waiter[0].phn_no,
      selectedBranch: selectedOptionForBranch[0] || null,
      editSlug: waiter[0].slug,
      editImage: waiter[0].image,
      edit: true,
    });
  };

  //update Group
  const handleUpdateWaiter = (e) => {
    e.preventDefault();
    setNewWaiter({
      ...newWaiter,
      uploading: true,
    });
    const waiterUrl = BASE_URL + `/settings/update-waiter`;
    let formData = new FormData();
    formData.append("name", newWaiter.name);
    formData.append("phn_no", newWaiter.phn_no);
    if (newWaiter.branch !== null) {
      formData.append("branch_id", newWaiter.branch.id);
    }
    formData.append("image", newWaiter.image);
    formData.append("editSlug", newWaiter.editSlug);
    return axios
      .post(waiterUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewWaiter({
          name: "",
          phn_no: "",
          branch: null,
          selectedBranch: null,
          image: null,
          edit: false,
          editSlug: null,
          editImage: null,
          uploading: false,
        });
        setWaiterList(res.data[0]);
        setWaiterForSearch(res.data[1]);
        setSearchedWaiter({
          ...searchedWaiter,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Waiter has been updated"))}`, {
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
        setNewWaiter({
          ...newWaiter,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.phn_no) {
            error.response.data.errors.phn_no.forEach((item) => {
              if (item === "A waiter exists with this phone number") {
                toast.error(
                  `${_t(t("A waiter exists with this phone number"))}`,
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
          if (error.response.data.errors.image) {
            error.response.data.errors.image.forEach((item) => {
              if (item === "Please select a valid image file") {
                toast.error(`${_t(t("Please select a valid image file"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
              if (item === "Please select a file less than 5MB") {
                toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            });
          }
        }
      });
  };

  //search waiters here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedWaiter({ ...searchedWaiter, searched: false });
    } else {
      let searchedList = waiterForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        let lowerCaseItemPhnNo = item.phn_no.toLowerCase();
        let lowerCaseItemBranch =
          item.branch_name !== null && item.branch_name.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          lowerCaseItemPhnNo.includes(searchInput) ||
          (lowerCaseItemBranch && lowerCaseItemBranch.includes(searchInput))
        );
      });
      setSearchedWaiter({
        ...searchedWaiter,
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
                  handleDeleteWaiter(slug);
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

  //delete waiter here
  const handleDeleteWaiter = (slug) => {
    setLoading(true);
    const waiterUrl = BASE_URL + `/settings/delete-waiter/${slug}`;
    return axios
      .get(waiterUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setWaiterList(res.data[0]);
        setWaiterForSearch(res.data[1]);
        setSearchedWaiter({
          ...searchedWaiter,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Waiter has been deleted successfully"))}`, {
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
        <title>{_t(t("Waiters"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addWaiter" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newWaiter.edit
                    ? _t(t("Add new waiter"))
                    : _t(t("Update waiter"))}
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
              {newWaiter.uploading === false ? (
                <div key="fragment-permission-1">
                  <form
                    onSubmit={
                      !newWaiter.edit ? handleSaveNewWaiter : handleUpdateWaiter
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
                        value={newWaiter.name || ""}
                        required
                        onChange={handleSetNewWaiter}
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
                        placeholder="e.g. 01xxx xxx xxx"
                        value={newWaiter.phn_no || ""}
                        required
                        onChange={handleSetNewWaiter}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="form-label mb-0">
                        {_t(t("Select a branch"))}{" "}
                        {newWaiter.edit ? (
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
                      {newWaiter.edit && newWaiter.selectedBranch !== null && (
                        <ul className="list-group list-group-horizontal-sm row col-12 mb-2 ml-md-1">
                          <li className="list-group-item col-12 col-md-3 bg-success rounded-sm py-1 px-2 my-1 text-center">
                            {newWaiter.selectedBranch.name}
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
                        placeholder={_t(t("Please select a branch")) + ".."}
                      />
                    </div>

                    <div className="mt-3">
                      <div className="d-flex align-items-center mb-1">
                        <label htmlFor="image" className="form-label mb-0 mr-3">
                          {_t(t("Image"))}{" "}
                          <small className="text-secondary">
                            ({_t(t("300 x 300 Preferable"))})
                          </small>
                        </label>
                        {newWaiter.edit && (
                          <div
                            className="fk-language__flag"
                            style={{
                              backgroundImage: `url(${newWaiter.editImage})`,
                            }}
                          ></div>
                        )}
                      </div>
                      <input
                        type="file"
                        className="form-control"
                        id="image"
                        name="image"
                        onChange={handleWaiterImage}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newWaiter.edit ? _t(t("Save")) : _t(t("Update"))}
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
                          {!newWaiter.edit ? _t(t("Save")) : _t(t("Update"))}
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
                    {newWaiter.uploading === true || loading === true ? (
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
                                  {!searchedWaiter.searched
                                    ? _t(t("Waiter List"))
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
                                  data-target="#addWaiter"
                                  onClick={() => {
                                    setNewWaiter({
                                      ...newWaiter,
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
                                  {_t(t("Image"))}
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
                                  {_t(t("Phn no"))}
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
                              {!searchedWaiter.searched
                                ? [
                                    waiterList && [
                                      waiterList.data.length === 0 ? (
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
                                        waiterList.data.map((item, index) => {
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
                                                  (waiterList.current_page -
                                                    1) *
                                                    waiterList.per_page}
                                              </th>

                                              <td className="xsm-text">
                                                <div
                                                  className="table-img-large mx-auto"
                                                  style={{
                                                    backgroundImage: `url(${
                                                      item.image !== null
                                                        ? item.image
                                                        : "/assets/img/waiter.jpg"
                                                    })`,
                                                  }}
                                                ></div>
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <a
                                                  href={`tel:${item.phn_no}`}
                                                  rel="noopener noreferrer"
                                                >
                                                  {item.phn_no}
                                                </a>
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
                                                        setNewWaiter({
                                                          ...newWaiter,
                                                          branch: null,
                                                        });
                                                        handleSetEdit(
                                                          item.slug
                                                        );
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#addWaiter"
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
                                    searchedWaiter && [
                                      searchedWaiter.list.length === 0 ? (
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
                                        searchedWaiter.list.map(
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
                                                    (waiterList.current_page -
                                                      1) *
                                                      waiterList.per_page}
                                                </th>

                                                <td className="xsm-text">
                                                  <div
                                                    className="table-img-large mx-auto"
                                                    style={{
                                                      backgroundImage: `url(${
                                                        item.image !== null
                                                          ? item.image
                                                          : "/assets/img/waiter.jpg"
                                                      })`,
                                                    }}
                                                  ></div>
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  <a
                                                    href={`tel:${item.phn_no}`}
                                                    rel="noopener noreferrer"
                                                  >
                                                    {item.phn_no}
                                                  </a>
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
                                                          setNewWaiter({
                                                            ...newWaiter,
                                                            branch: null,
                                                          });
                                                          handleSetEdit(
                                                            item.slug
                                                          );
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#addWaiter"
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
              {newWaiter.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedWaiter.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(waiterList, setPaginatedWaiter)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(waiterList)}
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
                                    setSearchedWaiter({
                                      ...searchedWaiter,
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
                                    searchedWaiter,
                                    waiterForSearch
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

export default Waiter;
