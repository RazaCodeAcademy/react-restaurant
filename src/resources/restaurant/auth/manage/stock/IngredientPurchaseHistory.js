import React, { useState, useContext, useEffect } from "react";
import { useHistory, NavLink } from "react-router-dom";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//functions
import {
  _t,
  getCookie,
  tableLoading,
  pagination,
  paginationLoading,
  showingData,
  searchedShowingData,
  formatPrice,
  currencySymbolLeft,
  currencySymbolRight,
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
import Moment from "react-moment";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { RestaurantContext } from "../../../../../contexts/Restaurant";

const IngredientPurchaseHistory = () => {
  const { t } = useTranslation();
  //getting context values here
  let {
    //common
    loading,
    setLoading,
  } = useContext(SettingsContext);

  let {
    //ingredient purchases
    ingredientPurchaseHistory,
    setIngredientPurchaseHistory,
    setPaginatedIngredientPurchase,
    ingredientPurchaseHistoryForSearch,
    setIngredientPurchaseHistoryForSearch,
    //pagination
    dataPaginating,
  } = useContext(RestaurantContext);

  // States hook here
  //new customer
  let [newSupplier, setNewSupplier] = useState({
    name: "",
    email: "",
    phn_no: "",
    address: "",
    due: null,
    edit: false,
    editSlug: null,
    uploading: false,
  });

  //search result
  let [searchedSupplier, setSearchedSupplier] = useState({
    list: null,
    searched: false,
  });

  //useEffect == componentDidMount
  useEffect(() => { }, []);

  //search purchase here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedSupplier({ ...searchedSupplier, searched: false });
    } else {
      let searchedList = ingredientPurchaseHistoryForSearch.filter((item) => {
        //name
        let lowerCaseItemSupplierName = item.supplier_name.toLowerCase();

        //email
        let lowerCaseItemInvoice =
          item.invoice_number !== null && item.invoice_number.toLowerCase();

        return (
          lowerCaseItemSupplierName.includes(searchInput) ||
          lowerCaseItemInvoice.includes(searchInput)
        );
      });
      setSearchedSupplier({
        ...searchedSupplier,
        list: searchedList,
        searched: true,
      });
    }
  };

  //delete confirmation modal of waiter
  const handleDeleteConfirmation = (id) => {
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
                  handleDeletePurchase(id);
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

  //delete purchase here
  const handleDeletePurchase = (id) => {
    setLoading(true);
    const url = BASE_URL + `/settings/delete-ingredient_purchase/${id}`;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientPurchaseHistory(res.data[0]);
        setIngredientPurchaseHistoryForSearch(res.data[1]);
        setSearchedSupplier({
          ...searchedSupplier,
          list: res.data[1],
        });
        setLoading(false);
        toast.success(`${_t(t("Purchase has been deleted successfully"))}`, {
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
        <title>{_t(t("Ingredient Purchases"))}</title>
      </Helmet>

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
                    {newSupplier.uploading === true || loading === true ? (
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
                                  {!searchedSupplier.searched
                                    ? _t(t("Ingredient Purchases List"))
                                    : _t(t("Search Result"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center">
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
                                <NavLink
                                  to="/dashboard/manage/stock/ingredient-purchase"
                                  className="btn btn-primary xsm-text text-uppercase btn-lg btn-block"
                                >
                                  {_t(t("add new"))}
                                </NavLink>
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
                                  {_t(t("Supplier"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Invoice"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Purchased"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Total"))}
                                </th>

                                <th
                                  scope="col"
                                  className="sm-text text-capitalize align-middle text-center border-1 border"
                                >
                                  {_t(t("Due"))}
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
                              {!searchedSupplier.searched
                                ? [
                                  ingredientPurchaseHistory && [
                                    ingredientPurchaseHistory.data.length ===
                                      0 ? (
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
                                      ingredientPurchaseHistory.data.map(
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
                                                  (ingredientPurchaseHistory.current_page -
                                                    1) *
                                                  ingredientPurchaseHistory.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.supplier_name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.invoice_number}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <Moment format="LL">
                                                  {item.purchase_date}
                                                </Moment>
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(item.total_bill)}
                                                {currencySymbolRight()}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  item.credit_amount
                                                )}
                                                {currencySymbolRight()}
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
                                                    <NavLink
                                                      to={`/dashboard/manage/stock/purchase-history-ingredient-edit/${item.id}`}
                                                      className="dropdown-item sm-text text-capitalize"
                                                    >
                                                      <span className="t-mr-8">
                                                        <i className="fa fa-pencil"></i>
                                                      </span>
                                                      {_t(t("View/Edit"))}
                                                    </NavLink>

                                                    <button
                                                      className="dropdown-item sm-text text-capitalize"
                                                      onClick={() => {
                                                        handleDeleteConfirmation(
                                                          item.id
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
                                ]
                                : [
                                  /* searched data, logic === haveData*/
                                  searchedSupplier && [
                                    searchedSupplier.list.length === 0 ? (
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
                                      searchedSupplier.list.map(
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
                                                  (ingredientPurchaseHistory.current_page -
                                                    1) *
                                                  ingredientPurchaseHistory.per_page}
                                              </th>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {item.supplier_name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {item.invoice_number}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <Moment format="LL">
                                                  {item.purchase_date}
                                                </Moment>
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(item.total_bill)}
                                                {currencySymbolRight()}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  item.credit_amount
                                                )}
                                                {currencySymbolRight()}
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
                                                    <NavLink
                                                      to={`/dashboard/manage/stock/purchase-history-food-edit/${item.id}`}
                                                      className="dropdown-item sm-text text-capitalize"
                                                    >
                                                      <span className="t-mr-8">
                                                        <i className="fa fa-pencil"></i>
                                                      </span>
                                                      {_t(t("View/Edit"))}
                                                    </NavLink>

                                                    <button
                                                      className="dropdown-item sm-text text-capitalize"
                                                      onClick={() => {
                                                        handleDeleteConfirmation(
                                                          item.id
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
              {newSupplier.uploading === true || loading === true
                ? paginationLoading()
                : [
                  // logic === !searched
                  !searchedSupplier.searched ? (
                    <div key="fragment4">
                      <div className="t-bg-white mt-1 t-pt-5 t-pb-5">
                        <div className="row align-items-center t-pl-15 t-pr-15">
                          <div className="col-md-7 t-mb-15 mb-md-0">
                            {/* pagination function */}
                            {pagination(
                              ingredientPurchaseHistory,
                              setPaginatedIngredientPurchase
                            )}
                          </div>
                          <div className="col-md-5">
                            <ul className="t-list d-flex justify-content-md-end align-items-center">
                              <li className="t-list__item">
                                <span className="d-inline-block sm-text">
                                  {showingData(ingredientPurchaseHistory)}
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
                                  setSearchedSupplier({
                                    ...searchedSupplier,
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
                                  searchedSupplier,
                                  ingredientPurchaseHistoryForSearch
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

export default IngredientPurchaseHistory;
