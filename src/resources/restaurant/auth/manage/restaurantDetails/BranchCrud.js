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
import { BASE_URL, SAAS_APPLICATION, saas_apiUrl, saas_apiParams, saas_form_data } from "../../../../../BaseUrl";

//3rd party packages
import { Helmet } from "react-helmet";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { RestaurantContext } from "../../../../../contexts/Restaurant";

const BranchCrud = () => {

  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  let {
    //branch
    branchList,
    setBranchList,
    setPaginatedBranch,
    branchForSearch,
    setBranchforSearch,

    //pagination
    dataPaginating,
  } = useContext(RestaurantContext);

  // States hook here
  //new group
  let [newBranch, setNewBranch] = useState({
    name: "",
    phn_no: "",
    address: "",
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedBranch, setSearchedBranch] = useState({
    list: null,
    searched: false,
  });


  // branch limit check
  let [checkBranchLimitState, setCheckBranchLimitState] = useState('');

  // check branch limit
  const checkBranchLimit = () => {
    // check how many orders are left 
    const url = saas_apiUrl + '/api/user-branch-limit-check?' + saas_apiParams;
    axios.get(url).then((res) => {
      setCheckBranchLimitState(res.data);
    }).catch(() => {
      return 'NO data'
    });
  }


  //useEffect == componentDidMount
  useEffect(() => {
    // check expiry
    if (SAAS_APPLICATION == 'YES') {
      (async () => {
        const saasBranchToken = setInterval(checkBranchLimit, 2000);
        checkBranchLimit();

        return () => {
          clearInterval(saasBranchToken);
        }
      })();

    }


  }, []);

  //set name, phn no, address hook
  const handleSetNewBranch = (e) => {
    setNewBranch({ ...newBranch, [e.target.name]: e.target.value });
  };

  //Save New branch
  const handleSaveNewBranch = (e) => {
    e.preventDefault();
    setNewBranch({
      ...newBranch,
      uploading: true,
    });
    const branchUrl = BASE_URL + `/settings/new-branch`;
    let formData = new FormData();
    formData.append("name", newBranch.name);
    formData.append("phn_no", newBranch.phn_no);
    formData.append("address", newBranch.address);
    return axios
      .post(branchUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (SAAS_APPLICATION == 'YES') {
          // after send api req decremeny by one
          const url = saas_apiUrl + '/api/user-branch-limit-decrement';// replace with base url (prince.thetestserver.xyz)
          axios.post(url, saas_form_data).then((res) => {
            console.log(res);
          }).catch(() => {
            return 'NO data'
          });
        }
        setNewBranch({
          name: "",
          phn_no: "",
          address: "",
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setBranchList(res.data[0]);
        setBranchforSearch(res.data[1]);
        setSearchedBranch({
          ...searchedBranch,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Branch has been added"))}`, {
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
        setNewBranch({
          ...newBranch,
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
    let branch = branchForSearch.filter((item) => {
      return item.slug === slug;
    });
    setNewBranch({
      ...newBranch,
      name: branch[0].name,
      phn_no: branch[0].phn_no,
      address: branch[0].address,
      editSlug: branch[0].slug,
      edit: true,
    });
  };

  //update branch
  const handleUpdateBranch = (e) => {
    e.preventDefault();
    setNewBranch({
      ...newBranch,
      uploading: true,
    });
    const branchUrl = BASE_URL + `/settings/update-branch`;
    let formData = new FormData();
    formData.append("name", newBranch.name);
    formData.append("phn_no", newBranch.phn_no);
    formData.append("address", newBranch.address);
    formData.append("editSlug", newBranch.editSlug);
    return axios
      .post(branchUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewBranch({
          name: "",
          phn_no: "",
          address: "",
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setBranchList(res.data[0]);
        setBranchforSearch(res.data[1]);
        setSearchedBranch({
          ...searchedBranch,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Branch has been updated"))}`, {
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
        setNewBranch({
          ...newBranch,
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

  //search branch here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedBranch({ ...searchedBranch, searched: false });
    } else {
      let searchedList = branchForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        let lowerCaseItemPhnNo =
          item.phn_no !== null && item.phn_no.toLowerCase();
        let lowerCaseItemAddress =
          item.address !== null && item.address.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          (lowerCaseItemPhnNo && lowerCaseItemPhnNo.includes(searchInput)) ||
          (lowerCaseItemAddress && lowerCaseItemAddress.includes(searchInput))
        );
      });
      setSearchedBranch({
        ...searchedBranch,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of branch
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
                  handleDeleteBranch(slug);
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

  //delete branch here
  const handleDeleteBranch = (slug) => {
    setLoading(true);
    const branchUrl = BASE_URL + `/settings/delete-branch/${slug}`;
    return axios
      .get(branchUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data === "user") {
          setLoading(false);
          toast.error(
            `${_t(t("Please disable all the user of this branch first"))}`,
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
          setBranchList(res.data[0]);
          setBranchforSearch(res.data[1]);
          setSearchedBranch({
            ...searchedBranch,
            list: res.data[1],
          });
          setLoading(false);
          toast.success(`${_t(t("Branch has been deleted successfully"))}`, {
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
        <title>{_t(t("Branches"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addBranch" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newBranch.edit
                    ? _t(t("Add new branch"))
                    : _t(t("Update branch"))}
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
              {newBranch.uploading === false ? (
                <div key="fragment-branch-1">
                  <form
                    onSubmit={
                      !newBranch.edit ? handleSaveNewBranch : handleUpdateBranch
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
                        placeholder="e.g. Uttara Branch"
                        value={newBranch.name || ""}
                        required
                        onChange={handleSetNewBranch}
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
                        value={newBranch.phn_no || ""}
                        onChange={handleSetNewBranch}
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
                        placeholder="Type branch address"
                        value={newBranch.address || ""}
                        onChange={handleSetNewBranch}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          {
                            SAAS_APPLICATION == "YES" ? [
                              newBranch.edit ? [
                                <button
                                  type="submit"
                                  className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                                >
                                  Update
                                </button>
                              ] : [
                                checkBranchLimitState == 'HAS-LIMIT' ? <button
                                  type="submit"
                                  className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                                >
                                  {!newBranch.edit ? _t(t("Save")) : _t(t("Update"))}
                                </button> :
                                  <button
                                    type="button"
                                    className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                    onClick={() => {

                                      toast.error(`${'Your limit has expired'}`, {
                                        position: "bottom-center",
                                        autoClose: 5000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        className: "text-center toast-notification",
                                      });
                                    }}
                                  >
                                    {_t(t("disable"))}
                                  </button>
                              ]
                            ] : [
                              <button
                                type="submit"
                                className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                              >
                                {!newBranch.edit ? _t(t("Save")) : _t(t("Update"))}
                              </button>
                            ]
                          }
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
                          {!newBranch.edit ? _t(t("Save")) : _t(t("Update"))}
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
                    {newBranch.uploading === true || loading === true ? (
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
                                  {!searchedBranch.searched
                                    ? _t(t("Branch List"))
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
                                {SAAS_APPLICATION == 'YES' ? [
                                  checkBranchLimitState == 'HAS-LIMIT' ? <button
                                    type="button"
                                    className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                    data-toggle="modal"
                                    data-target="#addBranch"
                                    onClick={() => {
                                      setNewBranch({
                                        ...newBranch,
                                        edit: false,
                                        uploading: false,
                                      });
                                    }}
                                  >
                                    {_t(t("add new"))}
                                  </button> : <button
                                    type="button"
                                    className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                    onClick={() => {

                                      // toast.error(`${_t(t("Please upgrad your plan"))}`, {
                                      toast.error(`Your limit has expired`, {
                                        position: "bottom-center",
                                        autoClose: 10000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        className: "text-center toast-notification",
                                      });
                                    }}
                                  >
                                    {_t(t("add new"))}
                                  </button>
                                ] : [
                                  <button
                                    type="button"
                                    className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                    data-toggle="modal"
                                    data-target="#addBranch"
                                    onClick={() => {
                                      setNewBranch({
                                        ...newBranch,
                                        edit: false,
                                        uploading: false,
                                      });
                                    }}
                                  >
                                    {_t(t("add new"))}
                                  </button>
                                ]}
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
                                  {_t(t("Address"))}
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
                                  {_t(t("Action"))}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="align-middle">
                              {/* loop here, logic === !search && haveData && haveDataLegnth > 0*/}
                              {!searchedBranch.searched
                                ? [
                                  branchList && [
                                    branchList.data.length === 0 ? (
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
                                      branchList.data.map((item, index) => {
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
                                                (branchList.current_page -
                                                  1) *
                                                branchList.per_page}
                                            </th>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              {item.name}
                                            </td>

                                            <td className="xsm-text text-capitalize align-middle text-center">
                                              {item.address || "-"}
                                            </td>

                                            <td className="xsm-text align-middle text-center">
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
                                                    data-target="#addBranch"
                                                  >
                                                    <span className="t-mr-8">
                                                      <i className="fa fa-pencil"></i>
                                                    </span>
                                                    {_t(t("Edit"))}
                                                  </button>

                                                  {SAAS_APPLICATION == "YES" ? null : [
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
                                                  ]}
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
                                  searchedBranch && [
                                    searchedBranch.list.length === 0 ? (
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
                                      searchedBranch.list.map(
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
                                                  (branchList.current_page -
                                                    1) *
                                                  branchList.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.address || "-"}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
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
                                                      data-target="#addBranch"
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
              {newBranch.uploading === true || loading === true
                ? paginationLoading()
                : [
                  // logic === !searched
                  !searchedBranch.searched ? (
                    <div key="fragment4">
                      <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                        <div className="row align-items-center t-pl-15 t-pr-15">
                          <div className="col-md-7 t-mb-15 mb-md-0">
                            {/* pagination function */}
                            {pagination(branchList, setPaginatedBranch)}
                          </div>
                          <div className="col-md-5">
                            <ul className="t-list d-flex justify-content-md-end align-items-center">
                              <li className="t-list__item">
                                <span className="d-inline-block sm-text">
                                  {showingData(branchList)}
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
                                  setSearchedBranch({
                                    ...searchedBranch,
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
                                  searchedBranch,
                                  branchForSearch
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

export default BranchCrud;
