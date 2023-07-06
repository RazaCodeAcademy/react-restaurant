import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  tableLoading,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { RestaurantContext } from "../../../../../contexts/Restaurant";
import { UserContext } from "../../../../../contexts/User";
import { FoodContext } from "../../../../../contexts/Food";

const IngredientPurchase = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let {
    loading,
    setLoading,
    branchForSearch,
    getIngredientItem,
    ingredientItemForSearch,
    ingredientItemStock,
    getWorkPeriod,
    dataPaginating,
  } = useContext(RestaurantContext);
  let { getSupplier, supplierForSearch } = useContext(UserContext);
  let { workPeriodWeb, getFoodWeb } = useContext(FoodContext);
  // States hook here
  //new item
  let [newItem, setNewItem] = useState({
    branch: null,
    supplier: null,
    invoice: "",
    description: "",
    paymentType: "",
    items: null,
    paid: null,
    total: null,
    due: null,
  });

  //datepicker
  const [purchaseDate, setPurchaseDate] = useState(null);

  //qty and rate
  let [qtyOfItem, setQtyOfItem] = useState(null);
  let [rateOfItem, setRateOfItem] = useState(null);

  //useEffect == componentDidMount()
  useEffect(() => {
    getFoodWeb();
    getSupplier();
    getIngredientItem();
  }, []);

  //on change input field
  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  //set items hook
  const handleSetItems = (item) => {
    setNewItem({
      ...newItem,
      items: item,
    });
  };

  //stock
  const handleGetStock = (id) => {
    if (newItem.branch === null) {
      return 0;
    }
    let stock = ingredientItemStock.find((item) => {
      return (
        item.ingredient_id === parseInt(id) &&
        item.branch_id === newItem.branch.id
      );
    });
    if (stock === undefined) {
      return 0;
    }
    return stock.qty;
  };
  //subtotal
  const handleGetSubTotal = (slug) => {
    let qty = 0;
    let rate = 0;
    if (qtyOfItem !== null && qtyOfItem[slug]) {
      qty = qtyOfItem[slug];
    }
    if (rateOfItem !== null && rateOfItem[slug]) {
      rate = rateOfItem[slug];
    }
    return rate * qty;
  };

  //total
  const handleGetTotal = () => {
    let total = 0;
    if (newItem.items !== null) {
      newItem.items.map((item) => {
        if (
          qtyOfItem &&
          rateOfItem &&
          qtyOfItem[item.slug] &&
          rateOfItem[item.slug]
        ) {
          total = total + qtyOfItem[item.slug] * rateOfItem[item.slug];
        }
      });
    }
    return total;
  };

  //set each item qty
  const handleItemQty = (e) => {
    setQtyOfItem({
      ...qtyOfItem,
      [e.target.name]: e.target.value,
    });
  };

  //set each item qty
  const handleItemRate = (e) => {
    setRateOfItem({
      ...rateOfItem,
      [e.target.name]: e.target.value,
    });
  };

  //handle Set branch hook
  const handleSetBranch = (branch) => {
    let theWorkPeriod =
      workPeriodWeb &&
      workPeriodWeb.find((thisItem) => {
        return parseInt(thisItem.branch_id) === parseInt(branch.id);
      });
    if (theWorkPeriod !== undefined) {
      setNewItem({ ...newItem, branch });
    } else {
      setNewItem({ ...newItem, branch: null });
    }
  };

  //handle Set supplier hook
  const handleSetSupplier = (supplier) => {
    setNewItem({ ...newItem, supplier });
  };

  //post req of food item add
  const ingredientItemAxios = () => {
    setLoading(true);
    let date =
      new Date(purchaseDate).getFullYear() +
      "-" +
      (new Date(purchaseDate).getMonth() + 1) +
      "-" +
      new Date(purchaseDate).getDate();
    let formData = new FormData();
    formData.append("branch_id", newItem.branch.id);
    formData.append("supplier_id", newItem.supplier.id);
    formData.append("invoice_number", newItem.invoice);
    formData.append("purchase_date", date);
    formData.append("desc", newItem.description);
    formData.append("payment_type", newItem.paymentType);
    formData.append("paid_amount", newItem.paid);
    formData.append("total_bill", handleGetTotal());

    //converting items and prices to array
    let slugArray = [];
    newItem.items.map((newIngredientItem) => {
      slugArray.push(newIngredientItem.slug);
    });
    slugArray.map((slugItem) => {
      formData.append("slugOfIngredients[]", slugItem);
      if (qtyOfItem[slugItem]) {
        formData.append("qtys[]", qtyOfItem[slugItem]);
      }
      if (rateOfItem[slugItem]) {
        formData.append("rates[]", rateOfItem[slugItem]);
      }
    });

    const url = BASE_URL + "/settings/new-ingredient_purchase";
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        getIngredientItem();
        setNewItem({
          branch: null,
          supplier: null,
          invoice: "",
          description: "",
          paymentType: "",
          items: null,
          paid: null,
          total: null,
          due: null,
        });
        setQtyOfItem(null);
        setRateOfItem(null);
        setLoading(false);
        toast.success(`${_t(t("Purchase has been added"))}`, {
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
        toast.error(`${_t(t("Please try again later"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //send to server
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      newItem.branch !== null &&
      newItem.supplier !== null &&
      newItem.items !== null &&
      newItem.items.length > 0 &&
      newItem.purchaseDate !== null
    ) {
      ingredientItemAxios();
    } else {
      toast.error(`${_t(t("Please fill all the required fields"))}`, {
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
        <title>{_t(t("Add Purchase"))}</title>
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
                <div
                  className="fk-scroll--pos-menu table-bottom-info-hide"
                  data-simplebar
                >
                  <div className="t-pl-15 t-pr-15">
                    {/* next page data spin loading */}
                    <div className={`${dataPaginating && "loading"}`}></div>
                    {/* spin loading ends */}

                    {/* Loading effect */}
                    {loading === true ? (
                      tableLoading()
                    ) : (
                      <div key="smtp-form">
                        <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                          <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize">
                                  {_t(t("Add new purchase"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                          <div className="col-md-6 col-lg-7">
                            <div className="row gx-3 align-items-center"></div>
                          </div>
                        </div>

                        {/* Form starts here */}
                        <form
                          className="row card p-2 mx-3 mb-5 sm-text"
                          onSubmit={handleSubmit}
                        >
                          <div className="col-12">
                            {branchForSearch && (
                              <div className="form-group mt-2">
                                <div className="mb-2">
                                  <label
                                    htmlFor="branch"
                                    className="control-label"
                                  >
                                    {_t(t("Branch"))}
                                    <span className="text-danger">*</span>
                                    {newItem.branch === null && (
                                      <small className="text-secondary">
                                        {" ("}
                                        {_t(
                                          t(
                                            "please check if workperiod of the selected branch is started"
                                          )
                                        )}
                                        )
                                      </small>
                                    )}
                                  </label>
                                </div>
                                <Select
                                  options={branchForSearch}
                                  components={makeAnimated()}
                                  getOptionLabel={(option) => option.name}
                                  getOptionValue={(option) => option.name}
                                  classNamePrefix="select"
                                  onChange={handleSetBranch}
                                  maxMenuHeight="200px"
                                  placeholder={
                                    _t(t("Please select a branch")) + ".."
                                  }
                                />
                              </div>
                            )}

                            {supplierForSearch && (
                              <div className="form-group mt-3">
                                <div className="mb-2">
                                  <label
                                    htmlFor="branch"
                                    className="control-label"
                                  >
                                    {_t(t("Supplier"))}
                                    <span className="text-danger">*</span>
                                  </label>
                                </div>
                                <Select
                                  options={supplierForSearch}
                                  components={makeAnimated()}
                                  getOptionLabel={(option) => option.name}
                                  getOptionValue={(option) => option.name}
                                  classNamePrefix="select"
                                  onChange={handleSetSupplier}
                                  maxMenuHeight="200px"
                                  placeholder={
                                    _t(t("Please select a supplier")) + ".."
                                  }
                                />
                              </div>
                            )}
                            <div className="row">
                              <div className="form-group col-8 mt-3">
                                <div className="mb-2">
                                  <label
                                    htmlFor="invoice"
                                    className="control-label"
                                  >
                                    {_t(t("Invoice"))}
                                    <span className="text-danger">*</span>
                                  </label>
                                </div>
                                <div className="mb-2">
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="invoice"
                                    name="invoice"
                                    onChange={handleChange}
                                    value={newItem.invoice}
                                    placeholder="e.g. 123"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="form-group col-4 text-right mt-3">
                                <div className="mb-2 ml-4 text-left">
                                  <label
                                    htmlFor="purchaseDate"
                                    className="control-label"
                                  >
                                    {_t(t("Purchase Date"))}
                                    <span className="text-danger">*</span>
                                  </label>
                                </div>
                                <div className="mb-2">
                                  <DatePicker
                                    selected={purchaseDate}
                                    onChange={(date) => setPurchaseDate(date)}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    className="form-control"
                                    placeholderText={_t(t("Purchase date"))}
                                    shouldCloseOnSelect={false}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label
                                  htmlFor="description"
                                  className="control-label"
                                >
                                  {_t(t("Description"))}
                                </label>
                              </div>
                              <div className="mb-2">
                                <textarea
                                  type="text"
                                  className="form-control"
                                  id="description"
                                  name="description"
                                  onChange={handleChange}
                                  value={newItem.description}
                                  placeholder="Short description"
                                />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label
                                  htmlFor="paymentType"
                                  className="control-label"
                                >
                                  {_t(t("Payment Type"))}
                                  <span className="text-danger">*</span>
                                </label>
                              </div>
                              <div className="mb-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  id="paymentType"
                                  name="paymentType"
                                  onChange={handleChange}
                                  value={newItem.paymentType}
                                  placeholder="e.g. Cash, Bank payment.."
                                  required
                                />
                              </div>
                            </div>

                            {ingredientItemForSearch && (
                              <div className="form-group mt-3">
                                <div className="mb-2">
                                  <label
                                    htmlFor="branch"
                                    className="control-label"
                                  >
                                    {_t(t("Ingredient Items"))}
                                    <span className="text-danger">*</span>
                                  </label>
                                </div>
                                <Select
                                  options={ingredientItemForSearch}
                                  components={makeAnimated()}
                                  getOptionLabel={(option) => option.name}
                                  getOptionValue={(option) => option.name}
                                  classNamePrefix="select"
                                  onChange={handleSetItems}
                                  maxMenuHeight="200px"
                                  isMulti
                                  isDisabled={newItem.branch === null}
                                  placeholder={
                                    _t(t("Please select items")) + ".."
                                  }
                                />
                              </div>
                            )}

                            {newItem.items !== null && [
                              newItem.items.length > 0 && (
                                <div className="table-responsive mt-3">
                                  <table className="table table-bordered table-hover">
                                    <thead className="align-middle">
                                      <tr>
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
                                          {_t(t("stock"))}
                                        </th>
                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          {_t(t("Qty"))}
                                        </th>
                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          {_t(t("Rate"))}
                                        </th>

                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          {_t(t("Total"))}
                                        </th>
                                      </tr>
                                    </thead>

                                    <tbody className="align-middle">
                                      {newItem.items.map(
                                        (ingredientItem, index) => {
                                          return (
                                            <tr
                                              className="align-middle"
                                              key={index}
                                            >
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {ingredientItem.name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {handleGetStock(
                                                  ingredientItem.id
                                                )}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  className="form-control text-center"
                                                  id={ingredientItem.slug}
                                                  name={ingredientItem.slug}
                                                  onChange={handleItemQty}
                                                  placeholder="Qty"
                                                  required
                                                  disabled={
                                                    newItem.branch === null
                                                  }
                                                />
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  className="form-control text-center"
                                                  id={ingredientItem.slug}
                                                  name={ingredientItem.slug}
                                                  onChange={handleItemRate}
                                                  placeholder="Price in usd"
                                                  required
                                                  disabled={
                                                    newItem.branch === null
                                                  }
                                                />
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  handleGetSubTotal(
                                                    ingredientItem.slug
                                                  )
                                                )}
                                                {currencySymbolRight()}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                    <tfoot className="align-middle">
                                      <tr>
                                        <th
                                          scope="col"
                                          colSpan="3"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        ></th>

                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          {_t(t("Total Bill"))}
                                        </th>

                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          {currencySymbolLeft()}
                                          {formatPrice(handleGetTotal())}
                                          {currencySymbolRight()}
                                        </th>
                                      </tr>
                                      <tr>
                                        <th
                                          scope="col"
                                          colSpan="3"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        ></th>
                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          {_t(t("Paid"))}
                                        </th>

                                        <th
                                          scope="col"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        >
                                          <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="form-control p-0 text-center"
                                            name="paid"
                                            value={newItem.paid}
                                            onChange={handleChange}
                                            placeholder="In usd"
                                            required
                                          />
                                        </th>
                                      </tr>
                                      <tr>
                                        <th
                                          scope="col"
                                          colSpan="3"
                                          className="sm-text text-capitalize align-middle text-center border-1 border"
                                        ></th>
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
                                          {currencySymbolLeft()}
                                          {formatPrice(
                                            handleGetTotal() - newItem.paid
                                          )}
                                          {currencySymbolRight()}
                                        </th>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              ),
                            ]}

                            <div className="form-group mt-4 pb-2">
                              <div className="col-lg-12">
                                <button
                                  className="btn btn-primary px-5"
                                  type="submit"
                                  disabled={newItem.branch === null}
                                >
                                  {_t(t("Save"))}
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Rightbar contents end*/}
          </div>
        </div>
      </main>
      {/* main body ends */}
    </>
  );
};

export default IngredientPurchase;
