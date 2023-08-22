import React, { useEffect, useState, useContext, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { NavLink } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  getSystemSettings,
  formatPrice,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import Skeleton from "react-loading-skeleton";
import Moment from "react-moment";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { confirmAlert } from "react-confirm-alert";
import Countdown from "react-countdown-now";

//importing context consumer here
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { FoodContext } from "../../../../contexts/Food";
import { SettingsContext } from "../../../../contexts/Settings";
import { UserContext } from "../../../../contexts/User";

const Kitchen = () => {
  const { t } = useTranslation();

  const {
    //kitchen dashboard
    getKitchenNewOrders,
    kithcenNewOrders,
    setKithcenNewOrders,
    loading,
    setLoading,
  } = useContext(RestaurantContext);

  //getting context values here
  const {
    //common
    generalSettings,
    showManageStock,
  } = useContext(SettingsContext);

  const {
    authUserInfo,
    //customer
    customerForSearch,
    setCustomerForSearch,
    //waiter
    waiterForSearch,
  } = useContext(UserContext);

  const {
    //food group
    foodGroupForSearch,
  } = useContext(FoodContext);

  //state hooks
  const [filterOrder, setFilterOrder] = useState({
    isFiltered: false,
    filterKey: "",
    groups: null,
  });

  //search result
  const [searchedOrder, setSearchedOrder] = useState({
    list: null,
    searched: false,
  });

  setTimeout(() => {
    window.location.reload();
  }, 60000);

  useEffect(() => {
    //get all orders when coming to kithcen
    getKitchenNewOrders();

    //add "All" option to group filter
    let tempFoodGroups = [];
    foodGroupForSearch &&
      foodGroupForSearch.map((item) => {
        if (item.name !== "All") {
          tempFoodGroups.push(item);
        }
      });
    //new option added to food group
    tempFoodGroups.unshift({ name: "All" });
    setFilterOrder({
      ...filterOrder,
      groups: tempFoodGroups,
    });
  }, [foodGroupForSearch]);

  //filter ordered items
  const handleFilter = (foodGrp) => {
    setFilterOrder({
      ...filterOrder,
      isFiltered: foodGrp.name == "All" ? false : true,
      filterKey: foodGrp.name,
    });
  };

  //search orders here
  const handleSearch = (e) => {
    let searchInput = e.target.value.toLowerCase();
    if (searchInput.length === 0) {
      setSearchedOrder({ ...searchedOrder, searched: false });
    } else {
      let searchedList =
        kithcenNewOrders &&
        kithcenNewOrders.filter((item) => {
          //token
          let lowerCaseItemToken = JSON.stringify(item.token.id);

          return lowerCaseItemToken.includes(searchInput);
        });
      setSearchedOrder({
        ...searchedOrder,
        list: searchedList,
        searched: true,
      });
    }
  };

  //accept or reject
  const handleAcceptOrReject = (id, timeInMinutes, index) => {
    //front end accept-reject view update
    let newState = kithcenNewOrders.map((orderItem) =>
      orderItem.id === id
        ? {
            ...orderItem,
            time_to_deliver: timeInMinutes,
            is_accepted: parseInt(orderItem.is_accepted) === 0 ? 1 : 0,
          }
        : orderItem
    );

    setKithcenNewOrders(newState);

    //front end accept-reject view update for searched
    if (searchedOrder.searched) {
      let newStateSearched = searchedOrder.list.map((orderItemSearched) =>
        orderItemSearched.id === id
          ? {
              ...orderItemSearched,
              time_to_deliver: timeInMinutes,
              is_accepted:
                parseInt(orderItemSearched.is_accepted) === 0 ? 1 : 0,
            }
          : orderItemSearched
      );
      setSearchedOrder({
        ...searchedOrder,
        list: newStateSearched,
      });
    }

    //set on server
    const url = BASE_URL + "/settings/accept-new-order";
    let formData = {
      id,
      time_to_deliver: timeInMinutes,
    };
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {})
      .catch(() => {
        //undo if any error happened
        newState = newState.map((orderItem) =>
          orderItem.id === id
            ? {
                ...orderItem,
                is_accepted: parseInt(orderItem.is_accepted) === 0 ? 1 : 0,
              }
            : orderItem
        );
        setKithcenNewOrders(newState);
        //undo if any error happened for searched
        if (searchedOrder.searched) {
          let newStateSearched = searchedOrder.list.map((orderItemSearched) =>
            orderItemSearched.id === id
              ? {
                  ...orderItemSearched,
                  is_accepted:
                    parseInt(orderItemSearched.is_accepted) === 0 ? 1 : 0,
                }
              : orderItemSearched
          );
          setSearchedOrder({
            ...searchedOrder,
            list: newStateSearched,
          });
        }
        toast.error(`${_t(t("Please refresh and try again"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //delete confirmation modal of waiter
  const handleReadyConfirmation = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body">
            <h1>{_t(t("Are you sure?"))}</h1>
            <p className="text-center">{_t(t("All items are cooked?"))}</p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleReady(id);
                  onClose();
                }}
              >
                {_t(t("YES, COOKED!"))}
              </button>
              <button className="btn btn-success ml-2 px-3" onClick={onClose}>
                {_t(t("NO"))}
              </button>
            </div>
          </div>
        );
      },
    });
  };

  //make the order group ready here
  const handleReady = (id) => {
    setLoading(true);
    const url = BASE_URL + "/settings/mark-all-items-ready";
    let formData = {
      id,
    };
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {
        //remove ready item from order list
        let newState = kithcenNewOrders.filter((orderItem) => {
          return orderItem.id !== id;
        });
        setKithcenNewOrders(newState);

        //remove ready item from search list
        if (searchedOrder.searched) {
          let newSearchState = searchedOrder.list.filter(
            (orderItemSearched) => {
              return orderItemSearched.id !== id;
            }
          );
          setSearchedOrder({
            ...searchedOrder,
            list: newSearchState,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error(`${_t(t("Please refresh and try again"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //make the order group ready here
  const handleEachItemReady = (orderGroupId, itemId) => {
    //to redo the action
    let oldState = kithcenNewOrders;
    let oldSearchedState = searchedOrder.list;

    //new state
    let orderGroup = kithcenNewOrders.find((orderItem) => {
      return orderItem.id === orderGroupId;
    });

    //updating the item's cooking status
    let newItems = orderGroup.orderedItems.map((eachItem) =>
      eachItem.id === itemId
        ? {
            ...eachItem,
            is_cooking: parseInt(eachItem.is_cooking) === 0 ? 1 : 0,
          }
        : eachItem
    );

    //set updated order list with item's status change
    let newState = kithcenNewOrders.map((orderItem) =>
      orderItem.id === orderGroupId
        ? { ...orderItem, is_accepted: 1, orderedItems: newItems }
        : orderItem
    );
    setKithcenNewOrders(newState);

    //searched list update
    if (searchedOrder.searched) {
      //new searched state
      let orderGroup = searchedOrder.list.find((orderItem) => {
        return orderItem.id === orderGroupId;
      });

      let newItemsSearched = orderGroup.orderedItems.map((eachItem) =>
        eachItem.id === itemId
          ? {
              ...eachItem,
              is_cooking: parseInt(eachItem.is_cooking) === 0 ? 1 : 0,
            }
          : eachItem
      );

      let newStateSearched = searchedOrder.list.map((orderItem) =>
        orderItem.id === orderGroupId
          ? { ...orderItem, is_accepted: 1, orderedItems: newItemsSearched }
          : orderItem
      );
      setSearchedOrder({
        ...searchedOrder,
        list: newStateSearched,
      });
    }

    //set server's item status
    const url = BASE_URL + "/settings/mark-order-item-ready";
    let formData = {
      orderGroupId: orderGroupId,
      id: itemId,
    };
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then(() => {})
      .catch(() => {
        //undo if any error occured
        setKithcenNewOrders(oldState);
        setSearchedOrder({
          ...searchedOrder,
          list: oldSearchedState,
        });
        toast.error(`${_t(t("Please refresh and try again"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [itemID, setItemID] = useState(0);
  const [itemIndex, setItemIndex] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedOrder, setSelectedOrder] = useState();

  const openModal = (item_id, index) => {
    setItemID(item_id);
    setItemIndex(index);
    setIsOpen((prev) => !prev);
  };

  const saveAcceptOrder = () => {
    createCounter(new Date(), inputValue, itemIndex);
    handleAcceptOrReject(itemID, inputValue, itemIndex);
    setIsOpen((prev) => !prev);
  };

  const createCounter = (serverDateTime, minutes, index) => {
    var futureDateTime = serverDateTime;
    futureDateTime.setMinutes(futureDateTime.getMinutes() + parseInt(minutes));

    const updatedData = [...kithcenNewOrders];
    updatedData[index].accepted_time = futureDateTime; // Update the remaining time
    setKithcenNewOrders(updatedData);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const closeModal = () => {
    setIsOpen((prev) => !prev);
  };

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // Function to handle printing for the selected order
  const handlePrintOrder = (order) => {
    console.log(order);
    setSelectedOrder(order);
    setTimeout(() => {
      handlePrint(); // Trigger the printing after a brief delay
    }, 100); // Adjust the delay as needed
  };

  return (
    <>
      <Helmet>
        <title>{_t(t("Kitchen"))}</title>
      </Helmet>
      <div className="d-none">
        <div ref={componentRef}>
          <h1>{selectedOrder ? console.log(selectedOrder) : ""}</h1>
        </div>
        <div ref={componentRef}>
          {selectedOrder && (
            <div className="fk-print">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <span className="d-block fk-print-text font-weight-bold text-uppercase text-center sm-text">
                      {getSystemSettings(generalSettings, "siteName")}
                      {","}
                      {selectedOrder &&
                        selectedOrder.branch_name}
                    </span>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {selectedOrder &&
                        selectedOrder.branch !== null &&
                        selectedOrder.branch}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {_t(t("call"))}:{" "}
                      {selectedOrder &&
                      selectedOrder.branch !== null &&
                      selectedOrder.branch
                        ? selectedOrder.branch
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_heading")}
                    </p>
                    <span className="d-block fk-print-text text-uppercase text-center lg-text myBorderTopCustomer">
                      {_t(t("Token No"))}-
                      {selectedOrder && selectedOrder.token.id}
                    </span>
                    <p className="mb-0 fk-print-text text-capitalize lg-text">
                      {selectedOrder &&
                        selectedOrder.dept_tag &&
                        selectedOrder.dept_tag.name}
                    </p>
                    {selectedOrder.newCustomer ? (
                      <>
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Name :{" "}
                          {selectedOrder &&
                            selectedOrder.customer_name}
                        </p>
                        {/* <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Address :{" "}
                          {selectedOrder.newCustomerInfo &&
                            selectedOrder.newCustomerInfo.address}
                        </p>
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Phone :{" "}
                          {selectedOrder.newCustomerInfo &&
                            selectedOrder.newCustomerInfo.number}
                        </p>
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Zipcode :{" "}
                          {selectedOrder.newCustomerInfo &&
                            selectedOrder.newCustomerInfo.zipcode}
                        </p> */}
                      </>
                    ) : (
                      <>
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Name :{" "}
                          {selectedOrder &&
                            selectedOrder.customer_name}
                        </p>
                        {/* <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Address :{" "}
                          {selectedOrder.customer &&
                            selectedOrder.customer.address}
                        </p>
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Phone :{" "}
                          {selectedOrder.customer &&
                            selectedOrder.customer.phn_no}
                        </p>
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Zipcode :{" "}
                          {selectedOrder.customer &&
                            selectedOrder.customer.zipcode}
                        </p> */}
                      </>
                    )}

                    {/* <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Vat reg"))}: {_t(t("Applied"))}
                    </p> */}
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("date"))}: <Moment format="LL">{new Date()}</Moment>
                      {", "}
                      {selectedOrder && (
                        <Moment format="LT">{selectedOrder.token.time}</Moment>
                      )}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Total guests"))}:{" "}
                      {selectedOrder && selectedOrder.total_guest}
                    </p>

                    {selectedOrder && selectedOrder !== null ? (
                      <p className="mb-0 xsm-text fk-print-text text-capitalize">
                        {_t(t("waiter name"))}: {selectedOrder.waiter_name}
                      </p>
                    ) : (
                      ""
                    )}

                    <p className="mb-0 sm-text fk-print-text text-capitalize lg-text">
                      {"UNPAID"}
                    </p>

                    <table className="table mb-0 table-borderless akash-table-for-print-padding">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="fk-print-text xsm-text text-capitalize"
                          >
                            {_t(t("qty"))} {_t(t("item"))}
                          </th>
                          <th
                            scope="col"
                            className="fk-print-text xsm-text text-capitalize text-right"
                          >
                            {_t(t("T"))}.{_t(t("price"))}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {selectedOrder.orderedItems.map(
                          (printItem, printItemIndex) => {
                            return (
                              <tr>
                                <td className="fk-print-text xsm-text text-capitalize">
                                  <div className="d-flex flex-wrap">
                                    <span className="d-inline-block xsm-text">
                                      -{printItem.quantity}{" "}
                                      {printItem.food_item}
                                      {printItem.note && <span><b> Note:</b> {printItem.note}</span>}
                                      {parseInt(
                                        printItem.has_variation
                                      ) === 1 &&
                                        printItem.variation &&
                                        "(" +
                                          printItem.variation.variation_name +
                                          ")"}
                                    </span>
                                  </div>

                                  {/* properties */}
                                  {/* {printItem.properties &&
                                  printItem.properties.length > 0 &&
                                  selectedPropertyGroup[printItemIndex] !==
                                    undefined &&
                                  selectedPropertyGroup[printItemIndex].map(
                                    (thisIsGroup) => {
                                      let theGroup =
                                        propertyGroupForSearch &&
                                        propertyGroupForSearch.find(
                                          (theItem) => {
                                            return theItem.id === thisIsGroup;
                                          }
                                        );
                                      return (
                                        <div className="d-block">
                                          {printItem.properties.map(
                                            (propertyName, propertyIndex) => {
                                              if (
                                                parseInt(
                                                  propertyName.item
                                                    .property_group_id
                                                ) === theGroup.id
                                              ) {
                                                return (
                                                  <span className="text-capitalize xsm-text d-inline-block mr-1">
                                                    -{printItem.quantity}
                                                    {propertyName.quantity > 1
                                                      ? "*" +
                                                        propertyName.quantity
                                                      : ""}{" "}
                                                    {propertyName.item.name}
                                                    <br />
                                                  </span>
                                                );
                                              } else {
                                                return true;
                                              }
                                            }
                                          )}
                                        </div>
                                      );
                                    }
                                  )} */}
                                </td>
                                <td className="fk-print-text xsm-text text-capitalize text-right">
                                  <div className="d-block xsm-text">
                                    {/* {showPriceOfEachOrderItemPrint(
                                    printItemIndex
                                  )} */}
                                  </div>

                                  {/* {printItem.properties &&
                                  printItem.properties.length > 0 &&
                                  selectedPropertyGroup[printItemIndex] !==
                                    undefined &&
                                  selectedPropertyGroup[printItemIndex].map(
                                    (
                                      thisIsGroup,
                                      thisIsGroupPaddingTopIndex
                                    ) => {
                                      let theGroup =
                                        propertyGroupForSearch &&
                                        propertyGroupForSearch.find(
                                          (theItem) => {
                                            return theItem.id === thisIsGroup;
                                          }
                                        );
                                      return (
                                        <div
                                          className={`text-capitalize d-block xsm-text ${
                                            thisIsGroupPaddingTopIndex === 0
                                              ? [
                                                  parseInt(
                                                    printItem.item.has_variation
                                                  ) === 1
                                                    ? [
                                                        printItem.properties &&
                                                        printItem.properties
                                                          .length > 0
                                                          ? "addonPadding35"
                                                          : "addonPadding24",
                                                      ]
                                                    : [
                                                        printItem.properties &&
                                                        printItem.properties
                                                          .length > 0
                                                          ? "addonPadding24"
                                                          : "",
                                                      ],
                                                ]
                                              : ""
                                          }`}
                                        >
                                          {printItem.properties.map(
                                            (propertyName, propertyIndex) => {
                                              if (
                                                parseInt(
                                                  propertyName.item
                                                    .property_group_id
                                                ) === theGroup.id
                                              ) {
                                                return (
                                                  <span>
                                                    {formatPrice(
                                                      printItem.quantity *
                                                        propertyName.quantity *
                                                        propertyName.item
                                                          .extra_price
                                                    )}
                                                    <br />
                                                  </span>
                                                );
                                              } else {
                                                return true;
                                              }
                                            }
                                          )}
                                        </div>
                                      );
                                    }
                                  )} */}
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">{_t(t("total"))}</span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            { selectedOrder.order_bill}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {selectedOrder.vat > 0 && (
                      <table className="table mb-0 table-borderless">
                        <tbody>
                            <tr>
                              <th className="fk-print-text xsm-text">
                                <span className="d-block xsm-text">
                                  TAX({selectedOrder.vat}
                                  %)
                                </span>
                              </th>
                              <td className="fk-print-text xsm-text text-capitalize text-right">
                                {selectedOrder.vat}
                              </td>
                            </tr>
                        </tbody>
                      </table>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "flat" && (
                      <>
                        {selectedOrder.serviceCharge > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("S.Charge"))}
                                  </span>
                                </th>

                                {selectedOrder && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(selectedOrder.serviceCharge)}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {selectedOrder.discount > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("discount"))}
                                  </span>
                                </th>
                                {selectedOrder && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(selectedOrder.discount)}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "percentage" && (
                      <>
                        {selectedOrder.serviceCharge > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("S.Charge"))}
                                    {selectedOrder &&
                                      "(" + selectedOrder.serviceCharge + "%)"}
                                  </span>
                                </th>

                                {selectedOrder && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(
                                      selectedOrder.theSubTotal *
                                        (selectedOrder.serviceCharge / 100)
                                    )}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {selectedOrder.discount > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text xsm-text text-capitalize">
                                  <span className="d-block">
                                    {_t(t("discount"))}
                                    {selectedOrder &&
                                      "(" + selectedOrder.discount + "%)"}
                                  </span>
                                </th>
                                {selectedOrder && (
                                  <td className="fk-print-text xsm-text text-capitalize text-right">
                                    {formatPrice(
                                      selectedOrder.theSubTotal *
                                        (selectedOrder.discount / 100)
                                    )}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </>
                    )}

                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("grand total"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {selectedOrder.total_payable}
                          </td>
                        </tr>
                        <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("Return Amount"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {0.00}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="myBorder"></div>
                    <p className="mb-0 xsm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_footer")}
                    </p>
                    <p className="mb-0 xsm-text fk-print-text text-capitalize text-center">
                      {_t(t("bill prepared by"))}:{" "}
                      {authUserInfo &&
                        authUserInfo.details &&
                        authUserInfo.details.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        {isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h5>Order Ready Time</h5>
              <div className="form-group">
                <label>Enter Time In Minutes</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter minutes"
                  value={inputValue}
                  onChange={handleInputChange}
                />
              </div>
              <div className="my-2">
                <button className="btn btn-success" onClick={saveAcceptOrder}>
                  Accept
                </button>
                <button className="btn btn-dark ml-3" onClick={closeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <main id="main" data-simplebar>
        <div className="fk-scroll--index t-mt-15 t-mb-15" data-simplebar>
          <div className="container-fluid">
            <div className="t-bg-white t-pt-10 t-pb-10 t-pl-15 t-pr-15">
              {/* next page data spin loading */}
              <div className={`${loading && "loading"}`}></div>
              {/* spin loading ends */}
              <div className="row gx-2 align-items-center">
                <div className="col-md-3 t-mb-15 mb-md-0">
                  <ul className="t-list fk-breadcrumb">
                    <li className="fk-breadcrumb__list">
                      <span className="t-link fk-breadcrumb__link text-uppercase">
                        <span className="mr-2">
                          <img
                            src="/assets/img/cooking.png"
                            alt="cooking"
                            className="img-fluid"
                            style={{ height: "40px", width: "40px" }}
                          />
                        </span>
                        <span className="mr-1">{_t(t("kitchen"))}</span>{" "}
                        {_t(t("dashboard"))}
                      </span>
                    </li>
                  </ul>
                </div>
                {/* <div className="col-md-2">
                  <NavLink
                    to="/dashboard/kitchen/online"
                    onClick={() => {
                      getKitchenNewOrders();
                      setSearchedOrder({
                        ...searchedOrder,
                        searched: false,
                      });
                    }}
                    className="btn btn-secondary btn-block sm-text text-uppercase mb-2 mb-md-0 text-truncate"
                  >
                    {_t(t("Online Orders"))}
                  </NavLink>
                </div> */}
                <div className="col-md-2">
                  <button
                    type="button"
                    onClick={() => {
                      getKitchenNewOrders();
                      setSearchedOrder({
                        ...searchedOrder,
                        searched: false,
                      });
                    }}
                    className="btn btn-primary btn-block sm-text text-uppercase mb-2 mb-md-0 text-truncate"
                  >
                    {_t(t("Refresh"))}
                  </button>
                </div>
                <div className="col-md-2">
                  <Select
                    options={filterOrder.groups && filterOrder.groups}
                    components={makeAnimated()}
                    getOptionLabel={(option) => option.name}
                    getOptionValue={(option) => option.name}
                    classNamePrefix="select"
                    className="xsm-text mb-2 mb-md-0 "
                    onChange={handleFilter}
                    maxMenuHeight="200px"
                    placeholder={_t(t("Filter by group")) + ".."}
                  />
                </div>

                <div className="col-md-3">
                  <div className="input-group">
                    <div className="form-file">
                      <input
                        type="text"
                        className="form-control border-0 form-control--light-1 rounded-0"
                        placeholder={_t(t("Search by token")) + ".."}
                        onChange={handleSearch}
                      />
                    </div>
                    <button className="btn btn-primary" type="button">
                      <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {!searchedOrder.searched ? (
              <div className="row no-gutters g-4 mt-1">
                {kithcenNewOrders ? (
                  [
                    kithcenNewOrders.length > 0 ? (
                      kithcenNewOrders.map((item, index) => {
                        return (
                          <div
                            className="col-md-6 col-xl-4"
                            key={item.id}
                            data-category={index + 1}
                          >
                            <div className="fk-order-token t-bg-white p-3 h-100">
                              <div className="fk-order-token__footer text-right">
                                {item.is_accepted == 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-danger xsm-text text-uppercase btn-lg mr-2"
                                  >
                                    <Countdown
                                      date={new Date(item.accepted_time)}
                                    />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-success xsm-text text-uppercase btn-lg mr-2"
                                  onClick={() => handlePrintOrder(item)}
                                >
                                  {_t(t("Print Slip"))}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-success xsm-text text-uppercase btn-lg mr-2"
                                  onClick={() =>
                                    handleReadyConfirmation(item.id)
                                  }
                                >
                                  {_t(t("Order ready"))}
                                </button>
                                {parseInt(item.is_accepted) === 0 ? (
                                  <button
                                    type="button"
                                    className="btn btn-secondary xsm-text text-uppercase btn-lg"
                                    onClick={() => openModal(item.id, index)}
                                  >
                                    {_t(t("Accept order"))}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-primary xsm-text text-uppercase btn-lg"
                                    onClick={() =>
                                      handleAcceptOrReject(item.id, 0, index)
                                    }
                                  >
                                    {_t(t("Make order pending"))}
                                  </button>
                                )}
                              </div>
                              <div className="fk-order-token__body">
                                <div className="fk-addons-table">
                                  <div className="fk-addons-table__head d-flex justify-content-between px-3">
                                    <span>
                                      {_t(t("order token"))}: #{item.token.id}
                                    </span>
                                    <span>
                                      {_t(t("ordered at"))}:{" "}
                                      <Moment format="LT">
                                        {item.token.time}
                                      </Moment>
                                    </span>
                                  </div>
                                  <div className="fk-addons-table__info">
                                    <div className="row g-0">
                                      <div className="col-2 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("S/L"))}
                                        </span>
                                      </div>
                                      <div className="col-3 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("food"))}
                                        </span>
                                      </div>
                                      <div className="col-4 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("Additional Info"))}
                                        </span>
                                      </div>
                                      <div className="col-2 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("QTY"))}
                                        </span>
                                      </div>
                                      <div className="col-1 text-center py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          <i className="fa fa-check"></i>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="fk-addons-table__body">
                                    {item.orderedItems.map(
                                      (thisItem, indexThisItem) => {
                                        if (filterOrder.isFiltered) {
                                          if (
                                            thisItem.food_group ===
                                            filterOrder.filterKey
                                          ) {
                                            return (
                                              <div
                                                key={thisItem.id}
                                                className="fk-addons-table__body-row"
                                              >
                                                <div className="row g-0">
                                                  <div className="col-2 text-center border-right d-flex py-2">
                                                    <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                      {indexThisItem + 1}
                                                    </span>
                                                  </div>
                                                  <div className="col-3 text-center border-right d-flex py-2">
                                                    <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                      {thisItem.food_item} (
                                                      {thisItem.food_group})
                                                    </span>
                                                  </div>
                                                  <div className="col-4 text-center border-right t-pl-10 t-pr-10 py-2">
                                                    {thisItem.variation !==
                                                      null && (
                                                      <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                                        <span className="font-weight-bold mr-1">
                                                          {_t(t("variation"))}:
                                                        </span>
                                                        {thisItem.variation}
                                                      </span>
                                                    )}

                                                    {thisItem.properties !==
                                                      null && (
                                                      <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                                        <span className="font-weight-bold mr-1">
                                                          {_t(t("properties"))}:
                                                        </span>
                                                        {JSON.parse(
                                                          thisItem.properties
                                                        ).map(
                                                          (
                                                            propertyItem,
                                                            thisIndex
                                                          ) => {
                                                            if (
                                                              thisIndex !==
                                                              JSON.parse(
                                                                thisItem.properties
                                                              ).length -
                                                                1
                                                            ) {
                                                              return (
                                                                propertyItem.property +
                                                                ", "
                                                              );
                                                            } else {
                                                              return propertyItem.property;
                                                            }
                                                          }
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="col-2 text-center border-right d-flex py-2">
                                                    <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                      {thisItem.quantity}
                                                    </span>
                                                  </div>

                                                  <div className="col-1 text-center d-flex py-2">
                                                    <label className="mx-checkbox mx-checkbox--empty m-auto">
                                                      <input
                                                        type="checkbox"
                                                        className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                                        checked={
                                                          parseInt(
                                                            thisItem.is_cooking
                                                          ) === 1
                                                        }
                                                        onChange={() => {
                                                          handleEachItemReady(
                                                            item.id,
                                                            thisItem.id
                                                          );
                                                        }}
                                                      />
                                                      <span className="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text"></span>
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        } else {
                                          return (
                                            <div
                                              key={thisItem.id}
                                              className="fk-addons-table__body-row"
                                            >
                                              <div className="row g-0">
                                                <div className="col-2 text-center border-right d-flex py-2">
                                                  <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                    {indexThisItem + 1}
                                                  </span>
                                                </div>
                                                <div className="col-3 text-center border-right d-flex py-2">
                                                  <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                    {thisItem.food_item} (
                                                    {thisItem.food_group})
                                                  </span>
                                                </div>
                                                <div className="col-4 text-center border-right t-pl-10 t-pr-10 py-2">
                                                  {thisItem.variation !==
                                                    null && (
                                                    <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                                      <span className="font-weight-bold mr-1">
                                                        {_t(t("variation"))}:
                                                      </span>
                                                      {thisItem.variation}
                                                    </span>
                                                  )}

                                                  {thisItem.properties !==
                                                    null && (
                                                    <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                                      <span className="font-weight-bold mr-1">
                                                        {_t(t("properties"))}:
                                                      </span>
                                                      {JSON.parse(
                                                        thisItem.properties
                                                      ).map(
                                                        (
                                                          propertyItem,
                                                          thisIndex
                                                        ) => {
                                                          if (
                                                            thisIndex !==
                                                            JSON.parse(
                                                              thisItem.properties
                                                            ).length -
                                                              1
                                                          ) {
                                                            return (
                                                              propertyItem.property +
                                                              ", "
                                                            );
                                                          } else {
                                                            return propertyItem.property;
                                                          }
                                                        }
                                                      )}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="col-2 text-center border-right d-flex py-2">
                                                  <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                    {thisItem.quantity}
                                                  </span>
                                                </div>

                                                <div className="col-1 text-center d-flex py-2">
                                                  <label className="mx-checkbox mx-checkbox--empty m-auto">
                                                    <input
                                                      type="checkbox"
                                                      className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                                      checked={
                                                        parseInt(
                                                          thisItem.is_cooking
                                                        ) === 1
                                                      }
                                                      onChange={() => {
                                                        handleEachItemReady(
                                                          item.id,
                                                          thisItem.id
                                                        );
                                                      }}
                                                    />
                                                    <span className="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text"></span>
                                                  </label>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-8 offset-2" data-category="1">
                        <div className="fk-order-token t-bg-white p-5 text-center text-uppercase text-primary no-order">
                          {/* No order in the kitchen */}
                          <img
                            src="/assets/img/no-order.jpg"
                            alt="no order found"
                            className="img-fluid h-100"
                          />
                        </div>
                      </div>
                    ),
                  ]
                ) : (
                  <div className="col-12" data-category="1">
                    <Skeleton
                      className="fk-order-token t-bg-white p-3 border border-2"
                      style={{ minHeight: "560px" }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="row no-gutters g-4 mt-1">
                {searchedOrder ? (
                  [
                    searchedOrder.list.length > 0 ? (
                      searchedOrder.list.map((item, index) => {
                        return (
                          <div
                            className="col-md-6 col-xl-4"
                            data-category={index + 1}
                          >
                            <div className="fk-order-token t-bg-white p-3 h-100">
                              <div className="fk-order-token__footer text-right">
                                {item.is_accepted == 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-danger xsm-text text-uppercase btn-lg mr-2"
                                  >
                                    <Countdown
                                      date={new Date(item.accepted_time)}
                                    />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn btn-success xsm-text text-uppercase btn-lg mr-2"
                                  onClick={() =>
                                    handleReadyConfirmation(item.id)
                                  }
                                >
                                  {_t(t("Order ready"))}
                                </button>
                                {parseInt(item.is_accepted) === 0 ? (
                                  <button
                                    type="button"
                                    className="btn btn-secondary xsm-text text-uppercase btn-lg"
                                    onClick={() => openModal(item.id, index)}
                                  >
                                    {_t(t("Accept order"))}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn btn-primary xsm-text text-uppercase btn-lg"
                                    onClick={() =>
                                      handleAcceptOrReject(item.id, 0, index)
                                    }
                                  >
                                    {_t(t("Make order pending"))}
                                  </button>
                                )}
                              </div>
                              <div className="fk-order-token__body">
                                <div className="fk-addons-table">
                                  <div className="fk-addons-table__head d-flex justify-content-between px-3">
                                    <span>
                                      {_t(t("order token"))}: #{item.token.id}
                                    </span>
                                    <span>
                                      {_t(t("ordered at"))}:{" "}
                                      <Moment format="LT">
                                        {item.token.time}
                                      </Moment>
                                    </span>
                                  </div>
                                  <div className="fk-addons-table__info">
                                    <div className="row g-0">
                                      <div className="col-2 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("S/L"))}
                                        </span>
                                      </div>
                                      <div className="col-3 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("food"))}
                                        </span>
                                      </div>
                                      <div className="col-4 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("Additional Info"))}
                                        </span>
                                      </div>
                                      <div className="col-2 text-center border-right py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          {_t(t("QTY"))}
                                        </span>
                                      </div>
                                      <div className="col-1 text-center py-2">
                                        <span className="fk-addons-table__info-text text-capitalize">
                                          <i className="fa fa-check"></i>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="fk-addons-table__body">
                                    {item.orderedItems.map(
                                      (thisItem, indexThisItem) => {
                                        if (filterOrder.isFiltered) {
                                          if (
                                            thisItem.food_group ===
                                            filterOrder.filterKey
                                          ) {
                                            return (
                                              <div className="fk-addons-table__body-row">
                                                <div className="row g-0">
                                                  <div className="col-2 text-center border-right d-flex py-2">
                                                    <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                      {indexThisItem + 1}
                                                    </span>
                                                  </div>
                                                  <div className="col-3 text-center border-right d-flex py-2">
                                                    <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                      {thisItem.food_item} (
                                                      {thisItem.food_group})
                                                    </span>
                                                  </div>
                                                  <div className="col-4 text-center border-right t-pl-10 t-pr-10 py-2">
                                                    {thisItem.variation !==
                                                      null && (
                                                      <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                                        <span className="font-weight-bold mr-1">
                                                          {_t(t("variation"))}:
                                                        </span>
                                                        {thisItem.variation}
                                                      </span>
                                                    )}

                                                    {thisItem.properties !==
                                                      null && (
                                                      <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                                        <span className="font-weight-bold mr-1">
                                                          {_t(t("properties"))}:
                                                        </span>
                                                        {JSON.parse(
                                                          thisItem.properties
                                                        ).map(
                                                          (
                                                            propertyItem,
                                                            thisIndex
                                                          ) => {
                                                            if (
                                                              thisIndex !==
                                                              JSON.parse(
                                                                thisItem.properties
                                                              ).length -
                                                                1
                                                            ) {
                                                              return (
                                                                propertyItem.property +
                                                                ", "
                                                              );
                                                            } else {
                                                              return propertyItem.property;
                                                            }
                                                          }
                                                        )}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <div className="col-2 text-center border-right d-flex py-2">
                                                    <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                      {thisItem.quantity}
                                                    </span>
                                                  </div>

                                                  <div className="col-1 text-center d-flex py-2">
                                                    <label className="mx-checkbox mx-checkbox--empty m-auto">
                                                      <input
                                                        type="checkbox"
                                                        className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                                        checked={
                                                          parseInt(
                                                            thisItem.is_cooking
                                                          ) === 1
                                                        }
                                                        onChange={() => {
                                                          handleEachItemReady(
                                                            item.id,
                                                            thisItem.id
                                                          );
                                                        }}
                                                      />
                                                      <span className="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text"></span>
                                                    </label>
                                                  </div>
                                                </div>
                                              </div>
                                            );
                                          }
                                        } else {
                                          return (
                                            <div className="fk-addons-table__body-row">
                                              <div className="row g-0">
                                                <div className="col-2 text-center border-right d-flex py-2">
                                                  <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                    {indexThisItem + 1}
                                                  </span>
                                                </div>
                                                <div className="col-3 text-center border-right d-flex py-2">
                                                  <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                    {thisItem.food_item} (
                                                    {thisItem.food_group})
                                                  </span>
                                                </div>
                                                <div className="col-4 text-center border-right t-pl-10 t-pr-10 py-2">
                                                  {thisItem.variation !==
                                                    null && (
                                                    <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pt-5">
                                                      <span className="font-weight-bold mr-1">
                                                        {_t(t("variation"))}:
                                                      </span>
                                                      {thisItem.variation}
                                                    </span>
                                                  )}

                                                  {thisItem.properties !==
                                                    null && (
                                                    <span className="fk-addons-table__info-text text-capitalize d-block text-left t-pb-5">
                                                      <span className="font-weight-bold mr-1">
                                                        {_t(t("properties"))}:
                                                      </span>
                                                      {JSON.parse(
                                                        thisItem.properties
                                                      ).map(
                                                        (
                                                          propertyItem,
                                                          thisIndex
                                                        ) => {
                                                          if (
                                                            thisIndex !==
                                                            JSON.parse(
                                                              thisItem.properties
                                                            ).length -
                                                              1
                                                          ) {
                                                            return (
                                                              propertyItem.property +
                                                              ", "
                                                            );
                                                          } else {
                                                            return propertyItem.property;
                                                          }
                                                        }
                                                      )}
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="col-2 text-center border-right d-flex py-2">
                                                  <span className="fk-addons-table__info-text text-capitalize m-auto">
                                                    {thisItem.quantity}
                                                  </span>
                                                </div>

                                                <div className="col-1 text-center d-flex py-2">
                                                  <label className="mx-checkbox mx-checkbox--empty m-auto">
                                                    <input
                                                      type="checkbox"
                                                      className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                                      checked={
                                                        parseInt(
                                                          thisItem.is_cooking
                                                        ) === 1
                                                      }
                                                      onChange={() => {
                                                        handleEachItemReady(
                                                          item.id,
                                                          thisItem.id
                                                        );
                                                      }}
                                                    />
                                                    <span className="mx-checkbox__text text-capitalize t-text-heading fk-addons-table__body-text"></span>
                                                  </label>
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      }
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-8 offset-2" data-category="1">
                        <div className="fk-order-token t-bg-white p-5 text-center text-uppercase text-primary no-order">
                          {/* No order in the kitchen */}
                          <img
                            src="/assets/img/no-order.jpg"
                            alt="no order found"
                            className="img-fluid h-100"
                          />
                        </div>
                      </div>
                    ),
                  ]
                ) : (
                  <div className="col-12" data-category="1">
                    <Skeleton
                      className="fk-order-token t-bg-white p-3 border border-2"
                      style={{ minHeight: "560px" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Kitchen;
