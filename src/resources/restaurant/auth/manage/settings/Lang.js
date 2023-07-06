import React, { useState, useContext, useEffect } from "react";
import { NavLink, useHistory } from "react-router-dom";

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
import Switch from "react-switch";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";

const Lang = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,

    //langs
    languageList,
    setLanguageList,
    setPaginatedLanguages,
    setNavLanguageList,
    languageListForSearch,
    setLanguageListForSearch,

    //pagination
    dataPaginating,
    setDataPaginating,
  } = useContext(SettingsContext);

  // States hook here
  //new languages
  let [newLang, setNewLang] = useState({
    name: "",
    code: "",
    image: null,
    edit: false,
    editCode: null,
    editImage: null,
    uploading: false,
  });

  //new default
  let [newDefault, setNewDefault] = useState({
    uploading: false,
  });

  //search result
  let [searchedLanguages, setSearchedLanguages] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, code hook
  const handleSetNewLang = (e) => {
    setNewLang({ ...newLang, [e.target.name]: e.target.value });
  };

  //set flag hook
  const handleLangFlag = (e) => {
    setNewLang({
      ...newLang,
      [e.target.name]: e.target.files[0],
    });
  };

  //Save New Language
  const handleSaveNewLang = (e) => {
    e.preventDefault();
    setNewLang({
      ...newLang,
      uploading: true,
    });
    const langUrl = BASE_URL + `/settings/new-lang`;
    let formData = new FormData();
    formData.append("name", newLang.name);
    formData.append("code", newLang.code);
    formData.append("image", newLang.image);
    return axios
      .post(langUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewLang({
          name: "",
          code: "",
          image: null,
          uploading: false,
        });
        setLanguageList(res.data[0]);
        setNavLanguageList(res.data[1]);
        setLanguageListForSearch(res.data[1]);
        setLoading(false);
        toast.success(`${_t(t("A new language has been created"))}`, {
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
        setNewLang({
          ...newLang,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.name) {
            error.response.data.errors.name.forEach((item) => {
              if (item === "A language already exists with this name") {
                toast.error(
                  `${_t(t("A language already exists with this name"))}`,
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

          if (error.response.data.errors.code) {
            error.response.data.errors.code.forEach((item) => {
              if (item === "A language already exists with this code") {
                toast.error(
                  `${_t(t("A language already exists with this code"))}`,
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

  const handleSetEdit = (id) => {
    let lang = languageListForSearch.filter((item) => {
      return item.id === id;
    });
    setNewLang({
      ...newLang,
      name: lang[0].name,
      code: lang[0].code,
      editCode: lang[0].code,
      editImage: lang[0].image,
      edit: true,
    });
  };

  const handleUpdateLang = (e) => {
    e.preventDefault();
    setNewLang({
      ...newLang,
      uploading: true,
    });
    const langUrl = BASE_URL + `/settings/update-lang`;
    let formData = new FormData();
    formData.append("name", newLang.name);
    formData.append("code", newLang.code);
    formData.append("image", newLang.image);
    formData.append("editCode", newLang.editCode);
    return axios
      .post(langUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewLang({
          name: "",
          code: "",
          image: null,
          edit: false,
          editCode: null,
          editImage: null,
          uploading: false,
        });
        setLanguageList(res.data[0]);
        setNavLanguageList(res.data[1]);
        setLanguageListForSearch(res.data[1]);
        setSearchedLanguages({
          ...searchedLanguages,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Language has been updated"))}`, {
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
        setNewLang({
          ...newLang,
          uploading: false,
        });
        if (error.response.data.errors) {
          if (error.response.data.errors.name) {
            error.response.data.errors.name.forEach((item) => {
              if (item === "A language already exists with this name") {
                toast.error(
                  `${_t(t("A language already exists with this name"))}`,
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

  //default Language
  const handleDefault = (code) => {
    setLoading(true);
    setNewDefault({ ...newDefault, uploading: true });
    setDataPaginating(true);
    const langUrl = BASE_URL + `/settings/update-default`;
    let formData = new FormData();
    formData.append("code", code);
    return axios
      .post(langUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setLanguageList(res.data[0]);
        setNavLanguageList(res.data[1]);
        setLanguageListForSearch(res.data[1]);
        setSearchedLanguages({
          ...searchedLanguages,
          list: res.data[1],
          searched: false,
        });
        setLoading(false);
        setDataPaginating(false);
        setNewDefault({ ...newDefault, uploading: false });
        toast.success(`${_t(t("Default language has been updated"))}`, {
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
      });
  };

  //search language here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedLanguages({ ...searchedLanguages, searched: false });
    } else {
      let searchedLang = languageListForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        let lowerCaseItemCode = item.code.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          lowerCaseItemCode.includes(searchInput)
        );
      });
      setSearchedLanguages({
        ...searchedLanguages,
        list: searchedLang,
        searched: true,
      });
    }
  };

  //delete confirmation modal of language
  const handleDeleteConfirmation = (code) => {
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
                  handleDeleteLanguage(code);
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

  //delete language here
  const handleDeleteLanguage = (code) => {
    setLoading(true);
    if (code !== "en") {
      const lang_url = BASE_URL + `/settings/delete-lang/${code}`;
      return (
        axios
          //todo:: Authorization here
          .get(lang_url, {
            headers: { Authorization: `Bearer ${getCookie()}` },
          })
          .then((res) => {
            setLanguageList(res.data[0]);
            setNavLanguageList(res.data[1]);
            setLanguageListForSearch(res.data[1]);
            setSearchedLanguages({
              ...searchedLanguages,
              list: res.data[1],
            });
            setLoading(false);
            toast.success(
              `${_t(t("Language has been deleted successfully"))}`,
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
          })
      );
    } else {
      setLoading(false);
      toast.error(`${_t(t("English language can not be deleted!"))}`, {
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
        <title>{_t(t("Languages"))}</title>
      </Helmet>

      {/* Add language modal */}
      <div className="modal fade" id="addLang" aria-hidden="true">
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newLang.edit
                    ? _t(t("Add new language"))
                    : _t(t("Update Language"))}
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
              {newLang.uploading === false ? (
                <div key="fragment1">
                  <form
                    onSubmit={
                      !newLang.edit ? handleSaveNewLang : handleUpdateLang
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
                        placeholder="e.g. English"
                        value={newLang.name}
                        required
                        onChange={handleSetNewLang}
                      />
                    </div>

                    <div className="mt-2">
                      <label htmlFor="code" className="form-label">
                        {_t(t("code"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        onChange={handleSetNewLang}
                        value={newLang.code}
                        disabled={newLang.edit}
                        required
                        placeholder="e.g. EN for english"
                      />
                    </div>

                    <div className="mt-2">
                      <div className="d-flex align-items-center mb-1">
                        <label htmlFor="image" className="form-label mb-0 mr-3">
                          {_t(t("Flag"))}{" "}
                          <small className="text-secondary">
                            ({_t(t("300 x 300 Preferable"))})
                          </small>
                        </label>
                        {newLang.edit && (
                          <div
                            className="fk-language__flag"
                            style={{
                              backgroundImage: `url(${newLang.editImage})`,
                            }}
                          ></div>
                        )}
                      </div>
                      <input
                        type="file"
                        className="form-control"
                        id="image"
                        name="image"
                        onChange={handleLangFlag}
                      />
                    </div>
                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newLang.edit ? _t(t("Save")) : _t(t("Update"))}
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
                          {!newLang.edit ? _t(t("Save")) : _t(t("Update"))}
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
      {/* Add language modal Ends*/}

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
                    {newLang.uploading === true || loading === true ? (
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
                                  {!searchedLanguages.searched
                                    ? _t(t("Language List"))
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center">
                              {/* Search languages */}
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

                              {/* Add language modal trigger button */}
                              <div className="col-md-3 text-md-right">
                                <button
                                  type="button"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                  data-toggle="modal"
                                  data-target="#addLang"
                                  onClick={() => {
                                    setNewLang({
                                      ...newLang,
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
                                  {_t(t("Code"))}
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
                                  {_t(t("Flag"))}
                                </th>
                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Set default"))}
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
                              {!searchedLanguages.searched
                                ? [
                                    languageList && [
                                      languageList.data.length === 0 ? (
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
                                        languageList.data.map((item, index) => {
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
                                                  (languageList.current_page -
                                                    1) *
                                                    languageList.per_page}
                                              </th>

                                              <td className="xsm-text align-middle text-center">
                                                {item.code}
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <div className="d-flex justify-content-center">
                                                  <div
                                                    className="fk-language__flag"
                                                    style={
                                                      item.image !== null
                                                        ? {
                                                            backgroundImage: `url(${item.image})`,
                                                          }
                                                        : ""
                                                    }
                                                  ></div>
                                                </div>
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <Switch
                                                  checked={item.is_default}
                                                  onChange={() => {
                                                    handleDefault(item.code);
                                                  }}
                                                  height={22}
                                                  width={44}
                                                  offColor="#ee5253"
                                                  disabled={
                                                    item.is_default ||
                                                    newDefault.uploading
                                                  }
                                                />
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
                                                        handleSetEdit(item.id)
                                                      }
                                                      data-toggle="modal"
                                                      data-target="#addLang"
                                                    >
                                                      <span className="t-mr-8">
                                                        <i className="fa fa-pencil"></i>
                                                      </span>
                                                      {_t(t("Edit"))}
                                                    </button>
                                                    <NavLink
                                                      className="dropdown-item sm-text text-capitalize"
                                                      to={`/dashboard/manage/settings/languages/${item.code}`}
                                                    >
                                                      <span className="t-mr-8">
                                                        <i className="fa fa-refresh"></i>
                                                      </span>
                                                      {_t(t("Translate"))}
                                                    </NavLink>
                                                    <button
                                                      className="dropdown-item sm-text text-capitalize"
                                                      onClick={() => {
                                                        handleDeleteConfirmation(
                                                          item.code
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
                                    searchedLanguages && [
                                      searchedLanguages.list.length === 0 ? (
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
                                        searchedLanguages.list.map(
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
                                                  {item.code}
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  {item.name}
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  <div className="d-flex justify-content-center">
                                                    <div
                                                      className="fk-language__flag"
                                                      style={
                                                        item.image !== null
                                                          ? {
                                                              backgroundImage: `url(${item.image})`,
                                                            }
                                                          : ""
                                                      }
                                                    ></div>
                                                  </div>
                                                </td>
                                                <td className="xsm-text text-capitalize align-middle text-center">
                                                  <Switch
                                                    checked={item.is_default}
                                                    onChange={() => {
                                                      handleDefault(item.code);
                                                    }}
                                                    height={22}
                                                    width={44}
                                                    offColor="#ee5253"
                                                    disabled={
                                                      item.is_default ||
                                                      newDefault.uploading
                                                    }
                                                  />
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
                                                          handleSetEdit(item.id)
                                                        }
                                                        data-toggle="modal"
                                                        data-target="#addLang"
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-pencil"></i>
                                                        </span>
                                                        {_t(t("Edit"))}
                                                      </button>
                                                      <NavLink
                                                        className="dropdown-item sm-text text-capitalize"
                                                        to={`/dashboard/manage/settings/languages/${item.code}`}
                                                      >
                                                        <span className="t-mr-8">
                                                          <i className="fa fa-refresh"></i>
                                                        </span>
                                                        {_t(t("Translate"))}
                                                      </NavLink>
                                                      <button
                                                        className="dropdown-item sm-text text-capitalize"
                                                        onClick={() => {
                                                          handleDeleteConfirmation(
                                                            item.code
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
              {newLang.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedLanguages.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(languageList, setPaginatedLanguages)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(languageList)}
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
                                    setSearchedLanguages({
                                      ...searchedLanguages,
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
                                    searchedLanguages,
                                    languageListForSearch
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

export default Lang;
