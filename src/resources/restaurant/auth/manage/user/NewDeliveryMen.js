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

const NewDeliveryMen = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,

    //permission group
    permissionGroupForSearch,
  } = useContext(SettingsContext);

  let {
    //adminStaff
    getDeliveryUser,
    deliveryListReq,
    setDeliveryListReq,
    setPaginatedDeliveryUser,
    deliveryListReqForSearch,
    setDeliveryListReqForSearch,

    //pagination
    dataPaginating,
  } = useContext(UserContext);

  let {
    //branch
    branchForSearch,
  } = useContext(RestaurantContext);

  // States hook here
  //new adminStaff
  let [newAdminStaff, setAdminStaff] = useState({
    user_type: "",
    name: "",
    email: "",
    phn_no: "",
    password: "",
    password_confirmation: "",
    branch: null,
    selectedBranch: null,
    selectPermissionGroup: null,
    selectedPermissionGroup: null,
    image: null,
    edit: false,
    editSlug: null,
    editImage: null,
    uploading: false,
  });

  //search result
  let [searchedAdminStaff, setSearchedAdminStaff] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, phn no hook
  const handleSetNewAdminStaff = (e) => {
    setAdminStaff({ ...newAdminStaff, [e.target.name]: e.target.value });
  };

  //set branch hook
  const handleSetBranch = (branch) => {
    setAdminStaff({ ...newAdminStaff, branch });
  };

  //set permission hook
  const handleSetPermissionGroup = (selectPermissionGroup) => {
    setAdminStaff({ ...newAdminStaff, selectPermissionGroup });
  };

  //set image hook
  const handleAdminStaffImage = (e) => {
    setAdminStaff({
      ...newAdminStaff,
      [e.target.name]: e.target.files[0],
    });
  };

  //Save New adminStaff
  const handleSaveNewAdminStaff = (e) => {
    e.preventDefault();
    //url and form data
    const adminStaffUrl = BASE_URL + `/settings/new-delivery-man`;
    let formData = new FormData();
    formData.append("user_type", "deliveryMan");
    formData.append("name", newAdminStaff.name);
    formData.append("email", newAdminStaff.email);
    formData.append("phn_no", newAdminStaff.phn_no);
    formData.append("password", newAdminStaff.password);
    formData.append(
      "password_confirmation",
      newAdminStaff.password_confirmation
    );
    if (newAdminStaff.branch !== null) {
      formData.append("branch_id", newAdminStaff.branch.id);
    }
    formData.append("image", newAdminStaff.image);
    //check branch !null
    if (newAdminStaff.branch !== null) {
      setAdminStaff({
        ...newAdminStaff,
        uploading: true,
      });

      return axios
        .post(adminStaffUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setAdminStaff({
            user_type: "",
            name: "",
            email: "",
            phn_no: "",
            password: "",
            password_confirmation: "",
            branch: null,
            selectPermissionGroup: null,
            selectedBranch: null,
            selectedPermissionGroup: null,
            image: null,
            edit: false,
            editSlug: null,
            editImage: null,
            uploading: false,
          });
          setDeliveryListReq(res.data[2]);
          setDeliveryListReqForSearch(res.data[3]);
          setLoading(false);
          toast.success(`${_t(t("User has been added"))}`, {
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
          setAdminStaff({
            ...newAdminStaff,
            branch: null,
            selectPermissionGroup: null,
            uploading: false,
          });
          if (error && error.response.data.errors) {
            if (error.response.data.errors.phn_no) {
              error.response.data.errors.phn_no.forEach((item) => {
                if (item === "An user exists with this phone number") {
                  toast.error(
                    `${_t(t("An user exists with this phone number"))}`,
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
            if (error.response.data.errors.email) {
              error.response.data.errors.email.forEach((item) => {
                if (item === "An user exists with this email") {
                  toast.error(`${_t(t("An user exists with this email"))}`, {
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
            if (error.response.data.errors.password) {
              error.response.data.errors.password.forEach((item) => {
                if (item === "Password confirmation does not match") {
                  toast.error(
                    `${_t(t("Password confirmation does not match"))}`,
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
                if (item === "The password must be at least 6 characters.") {
                  toast.error(
                    `${_t(t("The password must be at least 6 characters"))}`,
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
    let adminStaff = deliveryListReqForSearch.filter((item) => {
      return item.slug === slug;
    });

    let selectedOptionForPermission = null;
    if (adminStaff[0].permission_group_id) {
      selectedOptionForPermission = permissionGroupForSearch.filter(
        (groupItem) => {
          return groupItem.id === adminStaff[0].permission_group_id;
        }
      );
    }

    if (adminStaff[0].user_type === "staff") {
      let selectedOptionForBranch = null;
      if (adminStaff[0].branch_id) {
        selectedOptionForBranch =
          branchForSearch !== null &&
          branchForSearch.filter((branchItem) => {
            return branchItem.id === adminStaff[0].branch_id;
          });
      }
      setAdminStaff({
        ...newAdminStaff,
        user_type: adminStaff[0].user_type,
        name: adminStaff[0].name,
        email: adminStaff[0].email,
        phn_no: adminStaff[0].phn_no,
        selectedBranch: selectedOptionForBranch[0] || null,
        selectedPermissionGroup: selectedOptionForPermission[0] || null,
        editSlug: adminStaff[0].slug,
        editImage: adminStaff[0].image,
        edit: true,
      });
    } else {
      setAdminStaff({
        ...newAdminStaff,
        user_type: adminStaff[0].user_type,
        name: adminStaff[0].name,
        email: adminStaff[0].email,
        phn_no: adminStaff[0].phn_no,
        selectedPermissionGroup: selectedOptionForPermission[0] || null,
        editSlug: adminStaff[0].slug,
        editImage: adminStaff[0].image,
        edit: true,
      });
    }
  };

  //update adminStaff
  const handleUpdateAdminStaff = (e) => {
    e.preventDefault();
    //url and form data
    const adminStaffUrl = BASE_URL + `/settings/update-delivery-man`;
    let formData = new FormData();
    formData.append("user_type", newAdminStaff.user_type);
    formData.append("name", newAdminStaff.name);
    formData.append("email", newAdminStaff.email);
    formData.append("phn_no", newAdminStaff.phn_no);
    formData.append("password", newAdminStaff.password);
    formData.append(
      "password_confirmation",
      newAdminStaff.password_confirmation
    );
    if (newAdminStaff.selectPermissionGroup !== null) {
      formData.append(
        "permission_group_id",
        newAdminStaff.selectPermissionGroup.id
      );
    }
    if (newAdminStaff.user_type !== "admin" && newAdminStaff.branch !== null) {
      formData.append("branch_id", newAdminStaff.branch.id);
    }
    formData.append("image", newAdminStaff.image);
    formData.append("editSlug", newAdminStaff.editSlug);

    //check user type
    if (newAdminStaff.user_type === "staff") {
      setAdminStaff({
        ...newAdminStaff,
        uploading: true,
      });

      return axios
        .post(adminStaffUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setAdminStaff({
            user_type: "",
            name: "",
            email: "",
            phn_no: "",
            password: "",
            password_confirmation: "",
            branch: null,
            selectPermissionGroup: null,
            selectedBranch: null,
            selectedPermissionGroup: null,
            image: null,
            edit: false,
            editSlug: null,
            editImage: null,
            uploading: false,
          });
          setDeliveryListReq(res.data[2]);
          setDeliveryListReqForSearch(res.data[3]);
          setLoading(false);
          toast.success(`${_t(t("User has been updated"))}`, {
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
          setAdminStaff({
            ...newAdminStaff,
            branch: null,
            selectPermissionGroup: null,
            uploading: false,
          });
          if (error && error.response.data.errors) {
            if (error.response.data.errors.email) {
              error.response.data.errors.email.forEach((item) => {
                if (item === "An user exists with this email") {
                  toast.error(`${_t(t("An user exists with this email"))}`, {
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

            if (error.response.data.errors.phn_no) {
              error.response.data.errors.phn_no.forEach((item) => {
                if (item === "An user exists with this phone number") {
                  toast.error(
                    `${_t(t("An user exists with this phone number"))}`,
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

            if (error.response.data.errors.password) {
              error.response.data.errors.password.forEach((item) => {
                if (item === "Password confirmation does not match") {
                  toast.error(
                    `${_t(t("Password confirmation does not match"))}`,
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
                if (item === "The password must be at least 6 characters.") {
                  toast.error(
                    `${_t(t("The password must be at least 6 characters"))}`,
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
      setAdminStaff({
        ...newAdminStaff,
        uploading: true,
      });
      return axios
        .post(adminStaffUrl, formData, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          setAdminStaff({
            user_type: "",
            name: "",
            email: "",
            phn_no: "",
            password: "",
            password_confirmation: "",
            branch: null,
            selectPermissionGroup: null,
            selectedBranch: null,
            selectedPermissionGroup: null,
            image: null,
            edit: false,
            editSlug: null,
            editImage: null,
            uploading: false,
          });
          setDeliveryListReq(res.data[2]);
          setDeliveryListReqForSearch(res.data[3]);
          setLoading(false);
          toast.success(`${_t(t("User has been updated"))}`, {
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
          setAdminStaff({
            ...newAdminStaff,
            branch: null,
            selectPermissionGroup: null,
            uploading: false,
          });
          if (error && error.response.data.errors) {
            if (error.response.data.errors.password) {
              error.response.data.errors.password.forEach((item) => {
                if (item === "The password confirmation does not match.") {
                  toast.error(
                    `${_t(t("Password confirmation does not match"))}`,
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
                if (item === "The password must be at least 6 characters.") {
                  toast.error(
                    `${_t(t("The password must be at least 6 characters"))}`,
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
            if (error.response.data.errors.phn_no) {
              error.response.data.errors.phn_no.forEach((item) => {
                if (item === "An user exists with this phone number") {
                  toast.error(
                    `${_t(t("An user exists with this phone number"))}`,
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

  //search admin staff here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedAdminStaff({ ...searchedAdminStaff, searched: false });
    } else {
      let searchedList = deliveryListReqForSearch.filter((item) => {
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
      setSearchedAdminStaff({
        ...searchedAdminStaff,
        list: searchedList,
        searched: true,
      });
    }
  };

  //disable confirmation modal of adminStaff
  const handleDisableConfirmation = (slug) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body bg-danger text-white">
            <h1 className="text-white">{_t(t("Are you sure?"))}</h1>
            <p className="text-center">
              {_t(t("You want to disable this user?"))}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-warning text-dark"
                onClick={() => {
                  handleDisableUser(slug);
                  onClose();
                }}
              >
                {_t(t("Yes, please!"))}
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

  //disable adminStaff here
  const handleDisableUser = (slug) => {
    setLoading(true);
    const adminStaffUrl = BASE_URL + `/settings/delete-delivery-man/${slug}`;
    return axios
      .get(adminStaffUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeliveryListReq(res.data[2]);
        setDeliveryListReqForSearch(res.data[3]);
        setSearchedAdminStaff({
          ...searchedAdminStaff,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("User has been disabled"))}`, {
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

  //active confirmation modal of adminStaff
  const handleActiveConfirmation = (slug) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body bg-success">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">
              {_t(t("You want to active this user?"))}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-warning text-dark"
                onClick={() => {
                  handleActiveUser(slug);
                  onClose();
                }}
              >
                {_t(t("Yes, please!"))}
              </button>
              <button className="btn btn-primary ml-2 px-3" onClick={onClose}>
                {_t(t("No"))}
              </button>
            </div>
          </div>
        );
      },
    });
  };

  //Active adminStaff here
  const handleActiveUser = (slug) => {
    setLoading(true);
    let formData = {
      slug,
    };
    const adminStaffUrl = BASE_URL + `/settings/approve-delivery-man`;
    return axios
      .post(adminStaffUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data === "noBranch") {
          setLoading(false);
          toast.error(
            `${_t(
              t(
                "The branch of this user not found, can not change active status"
              )
            )}`,
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
          setDeliveryListReq(res.data[2]);
          setDeliveryListReqForSearch(res.data[3]);
          setSearchedAdminStaff({
            ...searchedAdminStaff,
            list: res.data[1],
          });
          setLoading(false);
          toast.success(`${_t(t("User has been activated"))}`, {
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
        <title>{_t(t("Delivery User Requests"))}</title>
      </Helmet>

      {/* Add modal */}
      <div className="modal fade" id="addWaiter" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newAdminStaff.edit
                    ? _t(t("Add new delivery user"))
                    : _t(t("Update delivery user"))}
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
              {newAdminStaff.uploading === false ? (
                <div key="fragment-permission-1">
                  <form
                    onSubmit={
                      !newAdminStaff.edit
                        ? handleSaveNewAdminStaff
                        : handleUpdateAdminStaff
                    }
                  >
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
                        value={newAdminStaff.name || ""}
                        required
                        onChange={handleSetNewAdminStaff}
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
                        placeholder="e.g. delivery@example.com"
                        value={newAdminStaff.email || ""}
                        required
                        onChange={handleSetNewAdminStaff}
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
                        value={newAdminStaff.phn_no || ""}
                        onChange={handleSetNewAdminStaff}
                        required
                      />
                    </div>

                    <div className="mt-3">
                      <label htmlFor="password" className="form-label">
                        {_t(t("Password"))}{" "}
                        {!newAdminStaff.edit && (
                          <small className="text-primary">*</small>
                        )}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="e.g. Password"
                        value={newAdminStaff.password || ""}
                        required={!newAdminStaff.edit}
                        onChange={handleSetNewAdminStaff}
                      />
                    </div>

                    <div className="mt-3">
                      <label
                        htmlFor="password_confirmation"
                        className="form-label"
                      >
                        {_t(t("Confirm Password"))}{" "}
                        {!newAdminStaff.edit && (
                          <small className="text-primary">*</small>
                        )}
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password_confirmation"
                        name="password_confirmation"
                        placeholder="e.g. Confirm password"
                        value={newAdminStaff.password_confirmation || ""}
                        required={newAdminStaff.password !== ""}
                        onChange={handleSetNewAdminStaff}
                      />
                    </div>

                    <div className="mt-3">
                      <label className="form-label mb-0">
                        {_t(t("Select a branch"))}{" "}
                        {newAdminStaff.edit ? (
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
                      {newAdminStaff.edit &&
                        newAdminStaff.selectedBranch !== null && (
                          <ul className="list-group list-group-horizontal-sm row col-12 mb-2 ml-md-1">
                            <li className="list-group-item col-12 col-md-3 bg-success rounded-sm py-1 px-2 my-1 text-center">
                              {newAdminStaff.selectedBranch.name}
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
                      <div className="d-flex align-items-center mb-1">
                        <label htmlFor="image" className="form-label mb-0 mr-3">
                          {_t(t("Image"))}{" "}
                          <small className="text-secondary">
                            ({_t(t("300 x 300 Preferable"))})
                          </small>
                        </label>
                        {newAdminStaff.edit && (
                          <div
                            className="fk-language__flag"
                            style={{
                              backgroundImage: `url(${newAdminStaff.editImage})`,
                            }}
                          ></div>
                        )}
                      </div>
                      <input
                        type="file"
                        className="form-control"
                        id="image"
                        name="image"
                        onChange={handleAdminStaffImage}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newAdminStaff.edit
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
                          {!newAdminStaff.edit
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

      {/* view modal */}
      <div className="modal fade" id="viewUser" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {newAdminStaff.name}
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
              <table className="table table-striped table-sm text-center mt-3">
                <tbody>
                  <tr>
                    <td className="text-capitalized">{_t(t("Name"))}</td>
                    <td>{newAdminStaff.name}</td>
                  </tr>
                  <tr>
                    <td className="text-capitalized">{_t(t("Email"))}</td>
                    <td>{newAdminStaff.email}</td>
                  </tr>
                  <tr>
                    <td className="text-capitalized">
                      {_t(t("Phone number"))}
                    </td>
                    <td>{newAdminStaff.phn_no}</td>
                  </tr>
                  {newAdminStaff.user_type !== "superAdmin" &&
                    newAdminStaff.selectedPermissionGroup !== null && (
                      <tr>
                        <td className="text-capitalized">
                          {_t(t("Permission group"))}
                        </td>
                        <td>{newAdminStaff.selectedPermissionGroup.name}</td>
                      </tr>
                    )}

                  {newAdminStaff.user_type === "staff" &&
                    newAdminStaff.selectedBranch !== null && (
                      <tr>
                        <td className="text-capitalized">{_t(t("Branch"))}</td>
                        <td>{newAdminStaff.selectedBranch.name}</td>
                      </tr>
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* view modal Ends*/}

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
                    {newAdminStaff.uploading === true || loading === true ? (
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
                                  {!searchedAdminStaff.searched
                                    ? _t(t("delivery user requests"))
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center">
                              {/* Search group */}
                              <div className="col-12 t-mb-15 mb-md-0">
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
                              {!searchedAdminStaff.searched
                                ? [
                                    deliveryListReq && [
                                      deliveryListReq.data.length === 0 ? (
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
                                        deliveryListReq.data.map(
                                          (item, index) => {
                                            return (
                                              <tr
                                                className={`align-middle ${
                                                  parseInt(item.is_banned) &&
                                                  "text-primary"
                                                }`}
                                                key={index}
                                              >
                                                <th
                                                  scope="row"
                                                  className="xsm-text text-capitalize align-middle text-center"
                                                >
                                                  {index +
                                                    1 +
                                                    (deliveryListReq.current_page -
                                                      1) *
                                                      deliveryListReq.per_page}
                                                </th>

                                                <td className="xsm-text">
                                                  <div
                                                    className="table-img-large mx-auto"
                                                    style={{
                                                      backgroundImage: `url(${
                                                        item.image !== null
                                                          ? item.image
                                                          : "/assets/img/admin.png"
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
                                                          setAdminStaff({
                                                            ...newAdminStaff,
                                                            branch: null,
                                                          });
                                                          handleSetEdit(
                                                            item.slug
                                                          );
                                                        }}
                                                        data-toggle="modal"
                                                        data-target="#viewUser"
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-eye"></i>
                                                        </span>
                                                        {_t(t("View"))}
                                                      </button>

                                                      {item.user_type !==
                                                        "superAdmin" && [
                                                        !parseInt(
                                                          item.is_banned
                                                        ) ? (
                                                          <button
                                                            className="dropdown-item sm-text text-capitalize"
                                                            onClick={() => {
                                                              handleDisableConfirmation(
                                                                item.slug
                                                              );
                                                            }}
                                                          >
                                                            <span className="t-mr-8">
                                                              <i className="fa fa-times"></i>
                                                            </span>
                                                            {_t(t("Disable"))}
                                                          </button>
                                                        ) : (
                                                          <button
                                                            className="dropdown-item sm-text text-capitalize"
                                                            onClick={() => {
                                                              handleActiveConfirmation(
                                                                item.slug
                                                              );
                                                            }}
                                                          >
                                                            <span className="t-mr-8">
                                                              <i className="fa fa-check"></i>
                                                            </span>
                                                            {_t(t("Active"))}
                                                          </button>
                                                        ),
                                                      ]}
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
                                    searchedAdminStaff && [
                                      searchedAdminStaff.list.length === 0 ? (
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
                                        searchedAdminStaff.list.map(
                                          (item, index) => {
                                            return (
                                              <tr
                                                className={`align-middle ${
                                                  parseInt(item.is_banned) &&
                                                  "text-primary"
                                                }`}
                                                key={index}
                                              >
                                                <th
                                                  scope="row"
                                                  className="xsm-text text-capitalize align-middle text-center"
                                                >
                                                  {index +
                                                    1 +
                                                    (deliveryListReq.current_page -
                                                      1) *
                                                      deliveryListReq.per_page}
                                                </th>

                                                <td className="xsm-text">
                                                  <div
                                                    className="table-img-large mx-auto"
                                                    style={{
                                                      backgroundImage: `url(${
                                                        item.image !== null
                                                          ? item.image
                                                          : "/assets/img/admin.png"
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
                                                      {item.user_type !==
                                                        "superAdmin" && [
                                                        !parseInt(
                                                          item.is_banned
                                                        ) ? (
                                                          <button
                                                            className="dropdown-item sm-text text-capitalize"
                                                            onClick={() => {
                                                              handleDisableConfirmation(
                                                                item.slug
                                                              );
                                                            }}
                                                          >
                                                            <span className="t-mr-8">
                                                              <i className="fa fa-times"></i>
                                                            </span>
                                                            {_t(t("Disable"))}
                                                          </button>
                                                        ) : (
                                                          <button
                                                            className="dropdown-item sm-text text-capitalize"
                                                            onClick={() => {
                                                              handleActiveConfirmation(
                                                                item.slug
                                                              );
                                                            }}
                                                          >
                                                            <span className="t-mr-8">
                                                              <i className="fa fa-check"></i>
                                                            </span>
                                                            {_t(t("Active"))}
                                                          </button>
                                                        ),
                                                      ]}
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
              {newAdminStaff.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedAdminStaff.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(
                                deliveryListReq,
                                setPaginatedDeliveryUser
                              )}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(deliveryListReq)}
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
                                    setSearchedAdminStaff({
                                      ...searchedAdminStaff,
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
                                    searchedAdminStaff,
                                    deliveryListReqForSearch
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

export default NewDeliveryMen;
