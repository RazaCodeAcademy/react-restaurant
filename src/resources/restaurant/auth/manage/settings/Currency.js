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

const Currency = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    //common
    loading,
    setLoading,

    //currencies
    currencyList,
    setCurrencyList,
    setPaginatedCurrencies,
    setNavCurrencyList,
    currencyListForSearch,
    setCurrencyListForSearch,

    //pagination
    dataPaginating,
    setDataPaginating,
  } = useContext(SettingsContext);

  // States hook here
  //new currency
  let [newCurrency, setNewCurrency] = useState({
    name: "",
    code: "",
    rate: "",
    symbol: "",
    alignment: "",
    edit: false,
    editCode: null,
    uploading: false,
  });

  //new default
  let [newDefault, setNewDefault] = useState({
    uploading: false,
  });

  //search result
  let [searchedCurrencies, setSearchedCurrencies] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => {}, []);

  //set name, code hook
  const handleSetNewCurrency = (e) => {
    setNewCurrency({ ...newCurrency, [e.target.name]: e.target.value });
  };

  //Save New Currency
  const handleSaveNewCurrency = (e) => {
    e.preventDefault();
    setNewCurrency({
      ...newCurrency,
      uploading: true,
    });
    const currencyUrl = BASE_URL + `/settings/new-currency`;
    let formData = new FormData();
    formData.append("name", newCurrency.name);
    formData.append("code", newCurrency.code);
    formData.append("rate", newCurrency.rate);
    formData.append("symbol", newCurrency.symbol);
    formData.append("alignment", newCurrency.alignment);
    return axios
      .post(currencyUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setNewCurrency({
          name: "",
          code: "",
          rate: "",
          symbol: "",
          alignment: "",
          edit: false,
          editCode: null,
          uploading: false,
        });
        setCurrencyList(res.data[0]);
        setNavCurrencyList(res.data[1]);
        setCurrencyListForSearch(res.data[1]);
        setLoading(false);
        toast.success(`${_t(t("A new currency has been created"))}`, {
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
        setNewCurrency({
          ...newCurrency,
          uploading: false,
        });
        if (error && error.response.data.errors) {
          if (error.response.data.errors.code) {
            error.response.data.errors.code.forEach((item) => {
              if (item === "A currency already exists with this code") {
                toast.error(
                  `${_t(t("A currency already exists with this code"))}`,
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

  const handleSetEdit = (id) => {
    let currency = currencyListForSearch.filter((item) => {
      return item.id === id;
    });
    setNewCurrency({
      ...newCurrency,
      name: currency[0].name,
      code: currency[0].code,
      rate: currency[0].rate,
      symbol: currency[0].symbol,
      alignment: currency[0].alignment,
      editCode: currency[0].code,
      edit: true,
    });
  };

  const handleUpdateCurrency = (e) => {
    e.preventDefault();
    setNewCurrency({
      ...newCurrency,
      uploading: true,
    });
    const currencyUrl = BASE_URL + `/settings/update-currency`;
    let formData = new FormData();
    formData.append("name", newCurrency.name);
    formData.append("rate", newCurrency.rate);
    formData.append("symbol", newCurrency.symbol);
    formData.append("alignment", newCurrency.alignment);
    formData.append("editCode", newCurrency.editCode);
    return axios
      .post(currencyUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        let localCurrency = JSON.parse(localStorage.getItem("currency"));
        if (localCurrency.code === newCurrency.editCode) {
          const temp = res.data[1].find((item) => {
            return item.code === localCurrency.code;
          });
          localStorage.setItem("currency", JSON.stringify(temp));
        }
        setNewCurrency({
          name: "",
          code: "",
          rate: "",
          symbol: "",
          alignment: "",
          edit: false,
          editCode: null,
          uploading: false,
        });
        setCurrencyList(res.data[0]);
        setNavCurrencyList(res.data[1]);
        setCurrencyListForSearch(res.data[1]);
        setSearchedCurrencies({
          ...searchedCurrencies,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("currency has been updated"))}`, {
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
        setNewCurrency({
          ...newCurrency,
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

  //Save New default currency
  const handleDefault = (code) => {
    setLoading(true);
    setNewDefault({ ...newDefault, uploading: true });
    setDataPaginating(true);
    const currencyUrl = BASE_URL + `/settings/update-default-currency`;
    let formData = new FormData();
    formData.append("code", code);
    return axios
      .post(currencyUrl, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setCurrencyList(res.data[0]);
        setNavCurrencyList(res.data[1]);
        setCurrencyListForSearch(res.data[1]);
        setSearchedCurrencies({
          ...searchedCurrencies,
          list: res.data[1],
          searched: false,
        });
        setLoading(false);
        setDataPaginating(false);
        setNewDefault({ ...newDefault, uploading: false });
        toast.success(`${_t(t("Default currency has been updated"))}`, {
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

  //search currencies here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedCurrencies({ ...searchedCurrencies, searched: false });
    } else {
      let searchedLang = currencyListForSearch.filter((item) => {
        let lowerCaseItemName = item.name.toLowerCase();
        let lowerCaseItemCode = item.code.toLowerCase();
        return (
          lowerCaseItemName.includes(searchInput) ||
          lowerCaseItemCode.includes(searchInput)
        );
      });
      setSearchedCurrencies({
        ...searchedCurrencies,
        list: searchedLang,
        searched: true,
      });
    }
  };

  //delete confirmation modal of currency
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
                  handleDeleteCurrency(code);
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

  //delete currency here
  const handleDeleteCurrency = (code) => {
    setLoading(true);
    if (code !== "usd") {
      const currencyUrl = BASE_URL + `/settings/delete-currency/${code}`;
      return (
        axios
          //todo:: Authorization here
          .get(currencyUrl, {
            headers: { Authorization: `Bearer ${getCookie()}` },
          })
          .then((res) => {
            setCurrencyList(res.data[0]);
            setNavCurrencyList(res.data[1]);
            setCurrencyListForSearch(res.data[1]);
            setSearchedCurrencies({
              ...searchedCurrencies,
              list: res.data[1],
            });
            setLoading(false);
            toast.success(
              `${_t(t("currency has been deleted successfully"))}`,
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
      toast.error(`${_t(t("USD currency can not be deleted!"))}`, {
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
        <title>{_t(t("Currencies"))}</title>
      </Helmet>

      {/* Add currency modal */}
      <div className="modal fade" id="addCurrency" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {!newCurrency.edit
                    ? _t(t("Add new currency"))
                    : _t(t("Update currency"))}
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
              {newCurrency.uploading === false ? (
                <div key="fragment1">
                  <form
                    onSubmit={
                      !newCurrency.edit
                        ? handleSaveNewCurrency
                        : handleUpdateCurrency
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
                        placeholder="e.g. US Dollar"
                        value={newCurrency.name}
                        required
                        onChange={handleSetNewCurrency}
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
                        onChange={handleSetNewCurrency}
                        value={newCurrency.code}
                        disabled={newCurrency.edit}
                        required
                        placeholder="e.g. usd for US Dollar"
                      />
                    </div>

                    <div className="mt-2">
                      <label htmlFor="symbol" className="form-label">
                        {_t(t("Symbol"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="symbol"
                        name="symbol"
                        onChange={handleSetNewCurrency}
                        value={newCurrency.symbol}
                        required
                        placeholder="e.g. $, €, ৳"
                      />
                    </div>

                    <div className="mt-2">
                      <label htmlFor="rate" className="form-label">
                        {_t(t("Rate"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        id="rate"
                        name="rate"
                        onChange={handleSetNewCurrency}
                        value={newCurrency.rate}
                        required
                        placeholder="1 USD = ?"
                      />
                    </div>

                    <div className="mt-2">
                      <label htmlFor="symbol" className="form-label">
                        {_t(t("Allignment"))}{" "}
                        <small className="text-primary">*</small>
                      </label>
                      <select
                        name="alignment"
                        className="form-control"
                        onChange={handleSetNewCurrency}
                        required
                        value={newCurrency.alignment}
                      >
                        <option value="">
                          {_t(t("Please select an alignment"))}..
                        </option>
                        <option value="left">
                          {_t(t("Left"))} - [symbol][amount]
                        </option>
                        <option value="right">
                          {_t(t("Right"))} - [amount][symbol]
                        </option>
                      </select>
                    </div>

                    <div className="mt-4">
                      <div className="row">
                        <div className="col-6">
                          <button
                            type="submit"
                            className="btn btn-success w-100 xsm-text text-uppercase t-width-max"
                          >
                            {!newCurrency.edit
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
                          {!newCurrency.edit ? _t(t("Save")) : _t(t("Update"))}
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
      {/* Add currency modal Ends*/}

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
                    {newCurrency.uploading === true || loading === true ? (
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
                                  {!searchedCurrencies.searched
                                    ? _t(t("Currency List"))
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

                              {/* Add currency modal trigger button */}
                              <div className="col-md-3 text-md-right">
                                <button
                                  type="button"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                  data-toggle="modal"
                                  data-target="#addCurrency"
                                  onClick={() => {
                                    setNewCurrency({
                                      ...newCurrency,
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
                                  1 USD = ?
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Symbol"))}
                                </th>
                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Alignment"))}
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
                              {!searchedCurrencies.searched
                                ? [
                                    currencyList && [
                                      currencyList.data.length === 0 ? (
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
                                        currencyList.data.map((item, index) => {
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
                                                  (currencyList.current_page -
                                                    1) *
                                                    currencyList.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.rate}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.symbol}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.alignment === "left"
                                                  ? item.alignment +
                                                    "  - [symbol] [amount]"
                                                  : item.alignment +
                                                    "  - [amount] [symbol]"}
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
                                                      data-target="#addCurrency"
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
                                    searchedCurrencies && [
                                      searchedCurrencies.list.length === 0 ? (
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
                                        searchedCurrencies.list.map(
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
                                                        data-target="#addCurrency"
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
              {newCurrency.uploading === true || loading === true
                ? paginationLoading()
                : [
                    // logic === !searched
                    !searchedCurrencies.searched ? (
                      <div key="fragment4">
                        <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                          <div className="row align-items-center t-pl-15 t-pr-15">
                            <div className="col-md-7 t-mb-15 mb-md-0">
                              {/* pagination function */}
                              {pagination(currencyList, setPaginatedCurrencies)}
                            </div>
                            <div className="col-md-5">
                              <ul className="t-list d-flex justify-content-md-end align-items-center">
                                <li className="t-list__item">
                                  <span className="d-inline-block sm-text">
                                    {showingData(currencyList)}
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
                                    setSearchedCurrencies({
                                      ...searchedCurrencies,
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
                                    searchedCurrencies,
                                    currencyListForSearch
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

export default Currency;
