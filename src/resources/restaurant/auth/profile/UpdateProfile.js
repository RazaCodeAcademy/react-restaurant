import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  pageLoading,
  deleteCookie,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//importing context consumer here
import { UserContext } from "../../../../contexts/User";
import { SettingsContext } from "../../../../contexts/Settings";

const UpdateProfile = () => {
  //getting context values here
  const {
    //common
    loading,
    setLoading,
    dataPaginating,
  } = useContext(SettingsContext);

  const { authUserInfo, setAuthUserInfo } = useContext(UserContext);

  const history = useHistory();
  const { t } = useTranslation();

  //new adminStaff
  let [newAdminStaff, setAdminStaff] = useState({
    phn_no: "",
    password: "",
    password_confirmation: "",
    image: null,
    edit: false,
    uploading: false,
  });

  //useEffect
  useEffect(() => {
    setLoading(true);
    if (authUserInfo && authUserInfo.details) {
      setAdminStaff({
        ...newAdminStaff,
        phn_no: authUserInfo.details.phn_no,
      });
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [authUserInfo]);

  //set image hook
  const handleAdminStaffImage = (e) => {
    setAdminStaff({
      ...newAdminStaff,
      [e.target.name]: e.target.files[0],
    });
  };

  //set name, phn no hook
  const handleSetNewAdminStaff = (e) => {
    setAdminStaff({ ...newAdminStaff, [e.target.name]: e.target.value });
  };
  //set name, phn no hook
  const handleUpdateAdminStaff = (e) => {
    e.preventDefault();
    const adminStaffUrl = BASE_URL + `/settings/update-profile`;
    setLoading(true);

    let formData = new FormData();
    formData.append("phn_no", newAdminStaff.phn_no);
    formData.append("image", newAdminStaff.image);

    return axios
      .post(adminStaffUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {
        setLoading(false);
        setAuthUserInfo({
          ...authUserInfo,
          details: { ...authUserInfo.details, phn_no: newAdminStaff.phn_no },
        });
        setAdminStaff({
          ...newAdminStaff,
          password: "",
          password_confirmation: "",
          image: null,
        });
        toast.success(`${_t(t("Profile updated"))}`, {
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

  //set name, phn no hook
  const handleUpdateAdminStaffPassword = (e) => {
    e.preventDefault();
    const adminStaffUrl = BASE_URL + `/settings/update-profile`;
    setLoading(true);

    let formData = new FormData();
    formData.append("password", newAdminStaff.password);
    formData.append(
      "password_confirmation",
      newAdminStaff.password_confirmation
    );
    return axios
      .post(adminStaffUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {
        setLoading(false);
        handleLogout();
        toast.success(`${_t(t("Profile updated, please login to continue"))}`, {
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
        if (error && error.response.data.errors) {
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
            });
          }
        }
      });
  };

  //logout
  const handleLogout = () => {
    deleteCookie();
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Update Password"))}</title>
      </Helmet>
      <main id="main" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            <div className="col-12 t-mb-30 mb-lg-0">
              {loading === true ? (
                pageLoading()
              ) : (
                <div className="t-bg-white ">
                  {/* next page data spin loading */}
                  <div className={`${dataPaginating && "loading"}`}></div>
                  {/* spin loading ends */}
                  <div className="row gx-2 align-items-center t-pt-15 t-pb-15 t-pl-15 t-pr-15 t-shadow">
                    <div className="col-12">
                      <ul className="t-list fk-breadcrumb">
                        <li className="fk-breadcrumb__list">
                          <span className="t-link fk-breadcrumb__link text-capitalize">
                            {_t(t("Update Password"))}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div
                    className="fk-scroll--order-history profile-update-full"
                    data-simplebar
                  >
                    <div className="mt-5 t-pt-30 t-pl-15  t-pr-15">
                      <div className="">
                        <div className="card col-8 offset-2 mb-3 mb-md-0 p-5">
                          <div key="fragment-permission-2">
                            <form onSubmit={handleUpdateAdminStaffPassword}>
                              <div className="mt-3">
                                <label
                                  htmlFor="password"
                                  className="form-label"
                                >
                                  {_t(t("Password"))}
                                </label>
                                <input
                                  type="password"
                                  className="form-control"
                                  id="password"
                                  name="password"
                                  placeholder={_t(t("Password"))}
                                  value={newAdminStaff.password || ""}
                                  onChange={handleSetNewAdminStaff}
                                  required
                                  autoComplete="off"
                                />
                              </div>

                              <div className="mt-3">
                                <label
                                  htmlFor="password_confirmation"
                                  className="form-label"
                                >
                                  {_t(t("Confirm Password"))}
                                </label>
                                <input
                                  type="password"
                                  className="form-control"
                                  id="password_confirmation"
                                  name="password_confirmation"
                                  placeholder={_t(t("Confirm Password"))}
                                  value={
                                    newAdminStaff.password_confirmation || ""
                                  }
                                  required
                                  onChange={handleSetNewAdminStaff}
                                  autoComplete="off"
                                />
                              </div>

                              <div className="mt-4">
                                <button
                                  type="submit"
                                  className="btn btn-primary xsm-text text-uppercase px-5 py-2 mb-2 mb-md-0"
                                >
                                  {_t(t("Update Password"))}
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default UpdateProfile;
