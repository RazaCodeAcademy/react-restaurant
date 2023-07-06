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
import { RestaurantContext } from "../../../../../contexts/Restaurant";

const TableCrud = () => {
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
    branchForSearch,

    //tables
    tableList,
    setTableList,
    setPaginatedTable,
    setTableforSearch,
    tableForSearch,

    //pagination
    dataPaginating,
  } = useContext(RestaurantContext);

  // States hook here
  //new group
  let [newTable, setNewTable] = useState({
    name: "",
    capacity: "",
    branch: null,
    selectedBranch: null,
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedTable, setSearchedTable] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, capacity hook
  const handleSetNewTable = (e) => {
    setNewTable({ ...newTable, [e.target.name]: e.target.value });
  };

  //set branch hook
  const handleSetBranch = (branch) => {
    setNewTable({ ...newTable, branch });
  };

  //Save New table
  const handleSaveNewTable = (e) => {
    e.preventDefault();
    if (newTable.branch !== null) {
      setNewTable({
        ...newTable,
        uploading: true,
      });
      const branchUrl = BASE_URL + `/settings/new-table`;
      let formData = new FormData();
      formData.append("name", newTable.name);
      formData.append("capacity", newTable.capacity);
      formData.append("branch_id", newTable.branch.id);
      return axios
        .post(branchUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setNewTable({
            name: "",
            capacity: "",
            branch: null,
            selectedBranch: null,
            edit: false,
            editSlug: null,
            uploading: false,
          });
          setTableList(res.data[0]);
          setTableforSearch(res.data[1]);
          setSearchedTable({
            ...searchedTable,
            list: res.data[1],
          });
          setLoading(false);
          toast.success(`${_t(t("Table has been added"))}`, {
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
          setNewTable({
            ...newTable,
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

  //set edit true & values
  const handleSetEdit = (slug) => {
    let table = tableForSearch.filter((item) => {
      return item.slug === slug;
    });
    let selectedOptionForBranch = null;
    if (table[0].branch_id) {
      selectedOptionForBranch = branchForSearch.filter((branchItem) => {
        return branchItem.id === parseInt(table[0].branch_id);
      });
    }
    setNewTable({
      ...newTable,
      name: table[0].name,
      capacity: table[0].capacity,
      selectedBranch: selectedOptionForBranch[0] || null,
      editSlug: table[0].slug,
      edit: true,
    });
  };

  //update table
  const handleUpdateTable = (e) => {
    e.preventDefault();
    setNewTable({
      ...newTable,
      uploading: true,
    });
    const branchUrl = BASE_URL + `/settings/update-table`;
    let formData = new FormData();
    formData.append("name", newTable.name);
    formData.append("capacity", newTable.capacity);

    if (newTable.branch !== null) {
      formData.append("branch_id", newTable.branch.id);
    }
    formData.append("editSlug", newTable.editSlug);
    return axios
      .post(branchUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewTable({
          name: "",
          capacity: "",
          branch: null,
          selectedBranch: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setTableList(res.data[0]);
        setTableforSearch(res.data[1]);
        setSearchedTable({
          ...searchedTable,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Table has been updated"))}`, {
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
        setNewTable({
          ...newTable,
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

  //search table here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedTable({ ...searchedTable, searched: false });
    } else {
      let searchedList = tableForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        let lowerCaseItemCapacity =
          item.capacity !== null && item.capacity.toLowerCase();
        let lowerCaseItemBranch =
          item.branch_name !== null && item.branch_name.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          (lowerCaseItemCapacity &&
            lowerCaseItemCapacity.includes(searchInput)) ||
          (lowerCaseItemBranch && lowerCaseItemBranch.includes(searchInput))
        );
      });
      setSearchedTable({
        ...searchedTable,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of table
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
                  handleDeleteTable(slug);
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

  //delete table here
  const handleDeleteTable = (slug) => {
    setLoading(true);
    const branchUrl = BASE_URL + `/settings/delete-table/${slug}`;
    return axios
      .get(branchUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setTableList(res.data[0]);
        setTableforSearch(res.data[1]);
        setSearchedTable({
          ...searchedTable,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Table has been deleted successfully"))}`, {
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
        <title>{_t(t("Tables"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addTable" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newTable.edit
                    ? _t(t("Add new table"))
                    : _t(t("Update table"))}
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
              {newTable.uploading === false ? (
                <div key="fragment-table-1">
                  <form
                    onSubmit={
                      !newTable.edit ? handleSaveNewTable : handleUpdateTable
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
                        placeholder="e.g. Table 01"
                        value={newTable.name || ""}
                        required
                        onChange={handleSetNewTable}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="form-label mb-0">
                        {_t(t("Select a branch"))}{" "}
                        {newTable.edit ? (
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
                      {newTable.edit && newTable.selectedBranch !== null && (
                        <ul className="list-group list-group-horizontal-sm row col-12 mb-2 ml-md-1">
                          <li className="list-group-item col-12 col-md-3 bg-success rounded-sm py-1 px-2 my-1 text-center">
                            {newTable.selectedBranch.name}
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
                      <label htmlFor="capacity" className="form-label">
                        {_t(t("Guest capacity"))}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id="capacity"
                        name="capacity"
                        placeholder="e.g. 05"
                        min="1"
                        value={newTable.capacity || ""}
                        onChange={handleSetNewTable}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newTable.edit ? _t(t("Save")) : _t(t("Update"))}
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
                          {!newTable.edit ? _t(t("Save")) : _t(t("Update"))}
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
                    {newTable.uploading === true || loading === true ? (
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
                                  {!searchedTable.searched
                                    ? _t(t("Table List"))
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
                                  data-target="#addTable"
                                  onClick={() => {
                                    setNewTable({
                                      ...newTable,
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
                                  {_t(t("Capacity"))}
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
                              {!searchedTable.searched
                                ? [
                                    tableList && [
                                      tableList.data.length === 0 ? (
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
                                        tableList.data.map((item, index) => {
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
                                                  (tableList.current_page - 1) *
                                                    tableList.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.capacity || "-"}
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
                                                        setNewTable({
                                                          ...newTable,
                                                          branch: null,
                                                        });
                                                        handleSetEdit(
                                                          item.slug
                                                        );
                                                      }}
                                                      data-toggle="modal"
                                                      data-target="#addTable"
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
                                    searchedTable && [
                                      searchedTable.list.length === 0 ? (
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
                                        searchedTable.list.map(
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
                                                    (tableList.current_page -
                                                      1) *
                                                      tableList.per_page}
                                                </th>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>

                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.capacity || "-"}
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
                                                          setNewTable({
                                                            ...newTable,
                                                            branch: null,
                                                          });
                                                          handleSetEdit(
                                                            item.slug
                                                          );
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#addTable"
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
              {newTable.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedTable.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(tableList, setPaginatedTable)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(tableList)}
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
                                    setSearchedTable({
                                      ...searchedTable,
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
                                    searchedTable,
                                    tableForSearch
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

export default TableCrud;
