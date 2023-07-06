import React, { useState, useEffect, useContext } from "react";
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

const Permissions = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,

    //group
    permissionGroup,
    setPermissionGroup,
    permissionGroupForSearch,
    setPermissionGroupForSearch,

    //permissions
    permissions,

    //pagination
    setPaginatedGropus,
    dataPaginating,
  } = useContext(SettingsContext);

  // States hook here
  //new group
  let [newGroup, setNewGroup] = useState({
    name: null,
    permission_ids: null,
    edit: false,
    editSlug: null,
    selectedPermissions: null,
    uploading: false,
  });

  //search result
  let [searchedGroups, setSearchedGroups] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount()
  useEffect(() => {}, []);

  //set name array hook
  const handleSetNewGroup = (e) => {
    setNewGroup({ ...newGroup, [e.target.name]: e.target.value });
  };

  //set permission id array hook
  const handleSetPermissionIds = (permission) => {
    setNewGroup({ ...newGroup, permission_ids: permission });
  };

  //Save New Group
  const handleSaveNewGroup = (e) => {
    e.preventDefault();
    if (newGroup.permission_ids !== null) {
      setNewGroup({
        ...newGroup,
        uploading: true,
      });
      const groupUrl = BASE_URL + `/settings/new-permission-group`;
      let formData = {
        name: newGroup.name,
        permissionIds: newGroup.permission_ids,
      };
      return axios
        .post(groupUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setNewGroup({
            name: null,
            permission_ids: null,
            edit: false,
            editSlug: null,
            uploading: false,
          });
          setPermissionGroup(res.data[0]);
          setPermissionGroupForSearch(res.data[1]);
          setLoading(false);
          toast.success(`${_t(t("A new group has been created"))}`, {
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
          setNewGroup({
            ...newGroup,
            uploading: false,
          });
          if (error && error.response.data.errors) {
            if (error.response.data.errors.name) {
              error.response.data.errors.name.forEach((item) => {
                if (item === "A group already exists with this name") {
                  toast.error(
                    `${_t(t("A group already exists with this name"))}`,
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
      toast.error(`${_t(t("Please select permissions"))}`, {
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
  const handleSetEdit = (id) => {
    let group = permissionGroupForSearch.filter((item) => {
      return item.id === id;
    });
    let tempArray = [];
    group[0].permission_array_id.map((item) => {
      permissions.map((permissionListItem) => {
        if (item === permissionListItem.id) {
          tempArray.push(permissionListItem);
        }
      });
    });
    setNewGroup({
      ...newGroup,
      name: group[0].name,
      editSlug: group[0].slug,
      selectedPermissions: tempArray,
      edit: true,
    });
  };

  //update Group
  const handleUpdateGroup = (e) => {
    e.preventDefault();
    setNewGroup({
      ...newGroup,
      uploading: true,
    });
    const groupUrl = BASE_URL + `/settings/update-permission-group`;
    let formData = {
      name: newGroup.name,
      editSlug: newGroup.editSlug,
      permissionIds: newGroup.permission_ids,
    };
    return axios
      .post(groupUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewGroup({
          name: null,
          permission_ids: null,
          edit: false,
          editSlug: null,
          uploading: false,
        });
        setPermissionGroup(res.data[0]);
        setPermissionGroupForSearch(res.data[1]);
        setLoading(false);
        toast.success(`${_t(t("Permission group has been updated"))}`, {
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
        setNewGroup({
          ...newGroup,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.name) {
            error.response.data.errors.name.forEach((item) => {
              if (item === "A group already exists with this name") {
                toast.error(
                  `${_t(t("A group already exists with this name"))}`,
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

  //search groups here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedGroups({ ...searchedGroups, searched: false });
    } else {
      let searchedList = permissionGroupForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        return lowerCaseItemName.includes(searchInput);
      });
      setSearchedGroups({
        ...searchedGroups,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of group
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
                  handleDeleteGroup(slug);
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

  //delete group here
  const handleDeleteGroup = (slug) => {
    setLoading(true);
    //todo:: add superAdmin when it will be SaaS
    if (slug !== "admin" || slug !== "customer") {
      const groupUrl = BASE_URL + `/settings/delete-permission-group/${slug}`;
      return axios
        .get(groupUrl, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          if (res.data === "Please remove this group from users first") {
            setLoading(false);
            toast.error(
              `${_t(t("Please remove this group from users first!"))}`,
              {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              }
            );
          } else if (res.data === "This group can not be deleted") {
            setLoading(false);
            toast.error(
              `${_t(t("Please remove this group from users first!"))}`,
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
            setPermissionGroup(res.data[0]);
            setPermissionGroupForSearch(res.data[1]);
            setLoading(false);
            toast.success(`${_t(t("Group has been deleted successfully"))}`, {
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
    } else {
      setLoading(false);
      toast.error(`${_t(t("This group can not be deleted!"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Permissions"))}</title>
      </Helmet>

      {/* Add group modal */}
      <div className="modal fade" id="addGroup" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newGroup.edit
                    ? _t(t("Add new permission group"))
                    : _t(t("Update permission group"))}
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
              {newGroup.uploading === false ? (
                <div key="fragment-permission-1">
                  <form
                    onSubmit={
                      !newGroup.edit ? handleSaveNewGroup : handleUpdateGroup
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
                        placeholder="e.g. Staff"
                        value={newGroup.name || ""}
                        required
                        onChange={handleSetNewGroup}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="form-label mb-0">
                        {_t(t("Select permissions"))}{" "}
                        {newGroup.edit && (
                          <small className="text-primary">
                            {"( "}
                            {_t(
                              t(
                                "Leave empty if you do not want to change permissions"
                              )
                            )}
                            {" )"}
                          </small>
                        )}
                      </label>
                      {newGroup.edit && (
                        <ul className="list-group list-group-horizontal-sm row col-12 mb-2 ml-md-1">
                          {newGroup.selectedPermissions.map((selectedItem) => {
                            return (
                              <li className="list-group-item col-12 col-md-3 bg-success rounded-sm py-1 px-2 mx-2 my-1 text-center">
                                {selectedItem.name}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <Select
                        options={permissions}
                        components={makeAnimated()}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.name}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleSetPermissionIds}
                        placeholder={_t(t("Please select permissions"))}
                        isMulti
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newGroup.edit ? _t(t("Save")) : _t(t("Update"))}
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
                          {!newGroup.edit ? _t(t("Save")) : _t(t("Update"))}
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
      {/* Add group modal Ends*/}

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
                    {newGroup.uploading === true || loading === true ? (
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
                                  {!searchedGroups.searched
                                    ? _t(t("Permission Group List"))
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
                                      placeholder={
                                        _t(t("Search by name")) + ".."
                                      }
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
                                  data-target="#addGroup"
                                  onClick={() => {
                                    setNewGroup({
                                      ...newGroup,
                                      permission_ids: null,
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
                                  {_t(t("Permissions"))}
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
                              {!searchedGroups.searched
                                ? [
                                    permissionGroup && [
                                      permissionGroup.data.length === 0 ? (
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
                                        permissionGroup.data.map(
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
                                                    (permissionGroup.current_page -
                                                      1) *
                                                      permissionGroup.per_page}
                                                </th>

                                                <td className="xsm-text align-middle text-center">
                                                  {item.name}
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.permission_array_id !==
                                                  null
                                                    ? item.permission_array_id.map(
                                                        (permissionItem) => {
                                                          let secondMap =
                                                            permissions &&
                                                            permissions.map(
                                                              (
                                                                ItemFromListPermission
                                                              ) => {
                                                                if (
                                                                  ItemFromListPermission.id ===
                                                                  permissionItem
                                                                ) {
                                                                  return (
                                                                    <ul
                                                                      className="list-group"
                                                                      key={
                                                                        permissionItem
                                                                      }
                                                                    >
                                                                      <li className="list-group-item bg-success rounded-sm p-1 m-1 mx-3">
                                                                        {
                                                                          ItemFromListPermission.name
                                                                        }
                                                                      </li>
                                                                    </ul>
                                                                  );
                                                                } else {
                                                                  return true;
                                                                }
                                                              }
                                                            );
                                                          return secondMap;
                                                        }
                                                      )
                                                    : "-"}
                                                </td>

                                                <td className="xsm-text align-middle text-center">
                                                  {/* todo::add superAdmin here when it will be SaaS */}
                                                  {item.name !== "Admin" ? (
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
                                                            setNewGroup({
                                                              ...newGroup,
                                                              permission_ids: null,
                                                            });
                                                            handleSetEdit(
                                                              item.id
                                                            );
                                                          }}
                                                          data-toggle="modal"
                                                          data-target="#addGroup"
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
                                                  ) : (
                                                    _t(
                                                      t(
                                                        "Edit or Delete is not allowed for"
                                                      )
                                                    ) +
                                                    [
                                                      " " +
                                                        item.name +
                                                        " " +
                                                        _t(t("group")),
                                                    ]
                                                  )}
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
                                    searchedGroups && [
                                      searchedGroups.list.length === 0 ? (
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
                                        searchedGroups.list.map(
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
                                                    (permissionGroup.current_page -
                                                      1) *
                                                      permissionGroup.per_page}
                                                </th>

                                                <td className="xsm-text align-middle text-center">
                                                  {item.name}
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.permission_array_id !==
                                                  null
                                                    ? item.permission_array_id.map(
                                                        (permissionItem) => {
                                                          let secondMap =
                                                            permissions &&
                                                            permissions.map(
                                                              (
                                                                ItemFromListPermission
                                                              ) => {
                                                                if (
                                                                  ItemFromListPermission.id ===
                                                                  permissionItem
                                                                ) {
                                                                  return (
                                                                    <ul
                                                                      className="list-group"
                                                                      key={
                                                                        permissionItem
                                                                      }
                                                                    >
                                                                      <li className="list-group-item bg-success rounded-sm p-1 m-1 mx-3">
                                                                        {
                                                                          ItemFromListPermission.name
                                                                        }
                                                                      </li>
                                                                    </ul>
                                                                  );
                                                                } else {
                                                                  return true;
                                                                }
                                                              }
                                                            );
                                                          return secondMap;
                                                        }
                                                      )
                                                    : "-"}
                                                </td>

                                                <td className="xsm-text align-middle text-center">
                                                  {/* todo::add superAdmin here when it will be SaaS */}
                                                  {item.name !== "Admin" ? (
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
                                                            setNewGroup({
                                                              ...newGroup,
                                                              permission_ids: null,
                                                            });
                                                            handleSetEdit(
                                                              item.id
                                                            );
                                                          }}
                                                          data-toggle="modal"
                                                          data-target="#addGroup"
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
                                                  ) : (
                                                    _t(
                                                      t(
                                                        "Edit or Delete is not allowed for"
                                                      )
                                                    ) +
                                                    [
                                                      " " +
                                                        item.name +
                                                        " " +
                                                        _t(t("group")),
                                                    ]
                                                  )}
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
              {newGroup.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedGroups.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(permissionGroup, setPaginatedGropus)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(permissionGroup)}
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
                                    setSearchedGroups({
                                      ...searchedGroups,
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
                                    searchedGroups,
                                    permissionGroupForSearch
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

export default Permissions;
