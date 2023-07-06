import React, { useEffect, useContext, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

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

const FoodPurchaseEdit = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useParams();
  //getting context values here
  let { dataPaginating } = useContext(SettingsContext);
  let { loading, setLoading, branchForSearch } = useContext(RestaurantContext);
  let { getSupplier, supplierForSearch } = useContext(UserContext);
  let { getFoodGroup, foodItemStock } = useContext(FoodContext);
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

  //purchasegrp
  const [purchaseGroup, setPurchaseGroup] = useState(null);
  const [purchasedItem, setPurchasedItem] = useState(null);

  //useEffect == componentDidMount()
  useEffect(() => {
    setLoading(true);
    getSupplier();
    getFoodGroup();
    getPurchasedItem();
  }, []);

  const getPurchasedItem = () => {
    const url =
      BASE_URL + "/settings/get-food_purchase_items/" + parseInt(params.id);
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPurchasedItem(res.data[0]);
        setPurchaseGroup(res.data[1]);
        setNewItem({
          ...newItem,
          items: res.data[0],
          invoice: res.data[1].invoice_number,
          paymentType: res.data[1].payment_type,
          description: res.data[1].desc,
        });

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };
  //on change input field
  const handleChange = (e) => {
    let item = purchasedItem.find((findThis) => {
      return findThis.id === parseInt(e.target.name);
    });
    if (e.target.value === null || e.target.value === "") {
      item.qty = 0;
    } else {
      item.qty = e.target.value;
    }
    let temp = [];
    purchasedItem.map((thisItem) => {
      if (thisItem.id !== item.id) {
        temp.push(thisItem);
      } else {
        temp.push(item);
      }
    });
    setPurchasedItem(temp);
  };

  const handleChangeRate = (e) => {
    let item = purchasedItem.find((findThis) => {
      return findThis.id === parseInt(e.target.name);
    });
    if (e.target.value === null || e.target.value === "") {
      item.rate = 0;
    } else {
      item.rate = e.target.value;
    }
    let temp = [];
    purchasedItem.map((thisItem) => {
      if (thisItem.id !== item.id) {
        temp.push(thisItem);
      } else {
        temp.push(item);
      }
    });
    setPurchasedItem(temp);
  };

  const handleChangeGroup = (e) => {
    if (e.target.name !== "paid_amount") {
      setPurchaseGroup({ ...purchaseGroup, [e.target.name]: e.target.value });
    } else {
      if (e.target.value !== null || e.target.value === "") {
        setPurchaseGroup({ ...purchaseGroup, [e.target.name]: e.target.value });
      } else {
        setPurchaseGroup({ ...purchaseGroup, [e.target.name]: 0 });
      }
    }
  };

  //stock
  const handleGetStock = (id) => {
    if (purchaseGroup) {
      let stock = foodItemStock.find((item) => {
        return (
          parseInt(item.food_id) === parseInt(id) &&
          parseInt(item.branch_id) === parseInt(purchaseGroup.branch_id)
        );
      });
      if (stock === undefined) {
        return 0;
      }
      return stock.qty;
    }
  };

  //total
  const handleGetTotal = () => {
    let total = 0;
    purchasedItem.map((item) => {
      total = total + item.qty * item.rate;
    });
    return total;
  };

  //post req of food item add
  const ingredientItemAxios = () => {
    setLoading(true);

    let formData = {
      group_id: purchaseGroup.id,
      invoice_number: purchaseGroup.invoice_number,
      desc: purchaseGroup.desc,
      payment_type: purchaseGroup.payment_type,
      paid_amount: purchaseGroup.paid_amount,
      total_bill: handleGetTotal(),
      items: purchasedItem,
    };
    if (purchaseDate !== null) {
      formData.date =
        new Date(purchaseDate).getFullYear() +
        "-" +
        (new Date(purchaseDate).getMonth() + 1) +
        "-" +
        new Date(purchaseDate).getDate();
    }

    const url = BASE_URL + "/settings/update-food_purchase";
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        getFoodGroup();
        getPurchasedItem();
        setLoading(false);
        toast.success(`${_t(t("Purchase has been updated"))}`, {
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
    ingredientItemAxios();
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Edit Food Purchase"))}</title>
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
                                  {_t(t("Edit Food purchase"))}
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
                                  </label>
                                </div>
                                <select disabled className="form-control">
                                  <option value=""></option>
                                  {branchForSearch &&
                                    purchaseGroup &&
                                    branchForSearch.map((bItem) => {
                                      return (
                                        <option
                                          selected={
                                            bItem.id ===
                                            parseInt(purchaseGroup.branch_id)
                                          }
                                          value={bItem.id}
                                        >
                                          {bItem.name}
                                        </option>
                                      );
                                    })}
                                </select>
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
                                <select disabled className="form-control">
                                  <option value=""></option>
                                  {supplierForSearch &&
                                    purchaseGroup &&
                                    supplierForSearch.map((sItem) => {
                                      return (
                                        <option
                                          selected={
                                            sItem.id ===
                                            parseInt(purchaseGroup.supplier_id)
                                          }
                                          value={sItem.id}
                                        >
                                          {sItem.name}
                                        </option>
                                      );
                                    })}
                                </select>
                              </div>
                            )}
                            <div className="row">
                              <div className="form-group col-8 mt-3">
                                <div className="mb-2">
                                  <label
                                    htmlFor="invoice_number"
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
                                    id="invoice_number"
                                    name="invoice_number"
                                    onChange={handleChangeGroup}
                                    value={
                                      purchaseGroup &&
                                      purchaseGroup.invoice_number
                                    }
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
                                    placeholderText={
                                      purchaseGroup &&
                                      purchaseGroup.purchase_date
                                    }
                                    shouldCloseOnSelect={false}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label htmlFor="desc" className="control-label">
                                  {_t(t("Description"))}
                                </label>
                              </div>
                              <div className="mb-2">
                                <textarea
                                  type="text"
                                  className="form-control"
                                  id="desc"
                                  name="desc"
                                  onChange={handleChangeGroup}
                                  value={purchaseGroup && purchaseGroup.desc}
                                  placeholder="Short description"
                                />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label
                                  htmlFor="payment_type"
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
                                  id="payment_type"
                                  name="payment_type"
                                  onChange={handleChangeGroup}
                                  value={
                                    purchaseGroup && purchaseGroup.payment_type
                                  }
                                  placeholder="e.g. Cash, Bank payment.."
                                  required
                                />
                              </div>
                            </div>

                            <div className="form-group mt-3">
                              <div className="mb-2">
                                <label
                                  htmlFor="payment_type"
                                  className="control-label"
                                >
                                  {_t(t("Food Items"))}
                                  <span className="text-danger">*</span>
                                </label>
                              </div>
                            </div>

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
                                      {purchasedItem.map(
                                        (ingredientItem, index) => {
                                          return (
                                            <tr
                                              className="align-middle"
                                              key={index}
                                            >
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                {ingredientItem.food_name}
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {handleGetStock(
                                                  ingredientItem.food_id
                                                )}
                                              </td>

                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  className="form-control text-center"
                                                  id={ingredientItem.id}
                                                  name={ingredientItem.id}
                                                  onChange={handleChange}
                                                  value={
                                                    ingredientItem.qty !== 0
                                                      ? ingredientItem.qty
                                                      : ""
                                                  }
                                                  placeholder="Qty"
                                                  required
                                                />
                                              </td>
                                              <td className="xsm-text text-capitalize align-middle text-center">
                                                <input
                                                  type="number"
                                                  step="0.01"
                                                  min="0"
                                                  className="form-control text-center"
                                                  id={ingredientItem.id}
                                                  name={ingredientItem.id}
                                                  onChange={handleChangeRate}
                                                  value={
                                                    ingredientItem.rate !== 0
                                                      ? ingredientItem.rate
                                                      : ""
                                                  }
                                                  placeholder="Price in usd"
                                                  required
                                                />
                                              </td>

                                              <td className="xsm-text align-middle text-center">
                                                {currencySymbolLeft()}
                                                {formatPrice(
                                                  parseFloat(
                                                    ingredientItem.rate
                                                  ) *
                                                    parseFloat(
                                                      ingredientItem.qty
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
                                            name="paid_amount"
                                            value={
                                              purchaseGroup &&
                                              purchaseGroup.paid_amount !== 0
                                                ? purchaseGroup.paid_amount
                                                : ""
                                            }
                                            onChange={handleChangeGroup}
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
                                            handleGetTotal() -
                                              (purchaseGroup &&
                                              purchaseGroup.paid_amount !==
                                                null &&
                                              purchaseGroup.paid_amount !== ""
                                                ? parseFloat(
                                                    purchaseGroup.paid_amount
                                                  )
                                                : 0)
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

export default FoodPurchaseEdit;
