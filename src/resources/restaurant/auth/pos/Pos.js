import React, { useContext, useEffect, useState, useRef } from "react";
import { NavLink, useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
  getSystemSettings,
} from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Moment from "react-moment";
import { useReactToPrint } from "react-to-print";

//importing context consumer here
import { UserContext } from "../../../../contexts/User";
import { SettingsContext } from "../../../../contexts/Settings";
import { RestaurantContext } from "../../../../contexts/Restaurant";
import { FoodContext } from "../../../../contexts/Food";
import Calculator from "./calc/Calculator";
import { logDOM } from "@testing-library/react";

// -----------------------------------stripe payment method-----------------------------------
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeForm from "../../payment/StripeForm";

const public_key =
  "pk_live_51NPm09GqyM3ux2URac4Gt7OXMCDgAHcccZcUJuXePIkbX3t87JWLGY6tCftGnPt3HTP1GE3qTBRrqLqIOZiLDqpY00AwrygRj0";

const stripeTestPromise = loadStripe(public_key);
// import StripeCheckout from "react-stripe-checkout";

const CARD_OPTIONS = {
  hidePostalCode: true,
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#9e2146",
    },
  },
};

// -----------------------------------stripe payment method-----------------------------------

const Pos = () => {
  const history = useHistory();

  //getting context values here
  const {
    //common
    loading,
    setLoading,
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
    //food
    foodForSearch,
    //food group
    foodGroupForSearch,
    getFoodGroup,
    //property group
    propertyGroupForSearch,
    //food stock
    foodItemStock,
  } = useContext(FoodContext);

  const {
    //work period
    workPeriodForSearch,
    setWorkPeriodListForSearch,
    //branch
    branchForSearch,
    //table
    tableForSearch,
    //dept-tag
    deptTagForSearch,
    //payment-type
    paymentTypeForSearch,
  } = useContext(RestaurantContext);

  const { t } = useTranslation();

  // State hooks here
  const [foodItem, setFoodItem] = useState({
    foodGroup: null,
    items: null,
    selectedItem: null,
    variations: null,
    properties: null,
  });

  // const [foodItem, setFoodItem] = useState({
  //   foodGroup: [{
  //     id: 22,
  //     name: "Bread",
  //     slug: "34d-1639221643-bread",
  //     created_at: "2021-12-11T07:50:43.000000Z",
  //     updated_at: "2021-12-11T07:50:43.000000Z",

  //   }],
  //   items: [{
  //     id: 71,
  //     food_group_id: "22",
  //     food_group: "Bread",
  //     name: "Bread 1",
  //     slug: "bXe-1639221673-bread-1",
  //     is_special: "0",
  //     image: "http://localhost/khadyo_updated_production_saas/laravel/public/images/food_item/1639221673-burgerjpg.jpg", has_variation: "0",
  //     price: "11",
  //     has_property: "0",

  //   }],
  //   selectedItem: [{
  //     id: 71,
  //     food_group_id: "22",
  //     food_group: "Bread",
  //     name: "Bread 1",
  //     slug: "bXe-1639221673-bread-1",
  //     is_special: "0",
  //     image: "http://localhost/khadyo_updated_production_saas/laravel/public/images/food_item/1639221673-burgerjpg.jpg", has_variation: "0",
  //     price: "11",
  //     has_property: "0",

  //   }],
  //   variations: null,
  //   properties: null,
  // });

  // show settle
  const [showSettle, setShowSettle] = useState(false);
  //calculator
  const [calculatorMenu, setCalculatorMenu] = useState(false);
  //new order
  const [newOrder, setNewOrder] = useState(null);
  //active index of order list
  const [activeItemInOrder, setActiveItemInOrder] = useState(null);
  //checked variations
  const [selectedVariation, setSelectedVariation] = useState([]);
  //selected groups
  const [selectedPropertyGroup, setSelectedPropertyGroup] = useState([]);
  //checked properties
  const [selectedProperties, setSelectedProperties] = useState([]);

  //the sub total
  const [theSubTotal, setTheSubTotal] = useState(0);
  //total payable
  const [totalPayable, setTotalPaybale] = useState(0);
  // paidMoney
  const [paidMoney, setPaidMoney] = useState("");
  //return
  const [returnMoneyUsd, setReturnMoneyUsd] = useState(0);

  //vat
  const [theVat, setTheVat] = useState(0);

  //deptCommission
  const [deptCommission, setDeptCommission] = useState(0);

  //vat settings
  const [newSettings, setNewSettings] = useState(null);

  //order details users
  const [orderDetailUsers, setOrderDetailusers] = useState({
    theCustomers: null,
    theTables: null,
    theWaiters: null,
  });

  //order details
  const [orderDetails, setOrderDetails] = useState({
    branch: null,
    customer: null,
    table: null,
    waiter: null,
    dept_tag: null,
    payment_type: null,
    payment_amount: null,
    total_guest: 1,
    reservation_date_time: null,
    newCustomer: false,
    newCustomerInfo: {
      name: "",
      number: "",
      address: "",
      zipcode: "",
    },
    token: null,
    serviceCharge: 0,
    discount: 0,
  });

  //orderFoodGroups
  const [orderFoodGroups, setOrderFoodGroups] = useState(null);

  //online order counter
  const [onlineCounter, setOnlineCounter] = useState(0);

  //useEffect- to get data on render
  useEffect(() => {
    if (foodGroupForSearch) {
      let tempItems =
        foodForSearch &&
        foodForSearch.filter((tempItem) => {
          return parseInt(tempItem.food_group_id) === foodGroupForSearch[0].id;
        });
      if (tempItems && tempItems.length > 0) {
        // initial group & item being active here, variations, properties
        setFoodItem({
          foodGroup: foodGroupForSearch[0],
          items: tempItems,
          selectedItem: tempItems[0],
          variations:
            parseInt(tempItems[0].has_variation) === 1
              ? tempItems[0].variations
              : null,
          properties:
            parseInt(tempItems[0].has_property) === 1
              ? tempItems[0].properties
              : null,
        });
      }
    }

    if (authUserInfo.details) {
      let theBranch =
        branchForSearch &&
        branchForSearch.find((branch) => {
          return parseInt(authUserInfo.details.branch_id) === branch.id;
        });
      setOrderDetails({
        ...orderDetails,
        branch: theBranch !== undefined ? theBranch : null,
      });

      //set work period
      let theWorkPeriod = null;
      if (theBranch !== undefined && theBranch !== null) {
        theWorkPeriod =
          workPeriodForSearch &&
          workPeriodForSearch.filter((tempWorkPeriod) => {
            return theBranch.id === parseInt(tempWorkPeriod.branch_id);
          });

        //filter it with ended_at === null;
        theWorkPeriod =
          theWorkPeriod &&
          theWorkPeriod.find((endAtNullItem) => {
            return endAtNullItem.ended_at === null;
          });
      }
      //set work period here
      setNewSettings({
        ...newSettings,
        vat: generalSettings && getSystemSettings(generalSettings, "type_vat"),
        workPeriod: theWorkPeriod !== undefined ? theWorkPeriod : null,
      });
    } else {
      // user type admin
      setNewSettings({
        ...newSettings,
        vat: generalSettings && getSystemSettings(generalSettings, "type_vat"),
      });
    }
    setOrderDetailusers({
      theCustomers: customerForSearch ? customerForSearch : null,
      theTables: tableForSearch ? tableForSearch : null,
      theWaiters: waiterForSearch ? waiterForSearch : null,
    });

    //check online orders
    const interval = setInterval(() => {
      const pendingUrl = BASE_URL + "/website/pending-order";
      return axios
        .get(pendingUrl, {
          headers: { Authorization: `Bearer ${getCookie()}` },
        })
        .then((res) => {
          if (res.data > 0) {
            setOnlineCounter(res.data);
            let order = document.getElementById("myAudioOrder");
            order.play();
          }
        })
        .catch((err) => {});
    }, 30000);

    if (branchForSearch && branchForSearch.length > 0) {
      setTimeout(() => {
        handleSetBranch(branchForSearch[0], customerForSearch); // Pass customerForSearch as an argument
      }, 1000);
    }
    // if (branchForSearch && branchForSearch.length > 0) {
    //   handleSetBranch(branchForSearch[0], customerForSearch);
    // }
  }, [authUserInfo, generalSettings, foodForSearch, foodGroupForSearch]);

  //search food here
  // const handleSearch = (e) => {
  //   let searchInput = e.target.value.toLowerCase();
  //   if (searchInput.length === 0) {
  //     setSearchedFoodItem({ ...searchedFoodItem, searched: false });
  //   } else {
  //     let searchedList = foodForSearch.filter((item) => {
  //       let lowerCaseItemName = item.name.toLowerCase();
  //       let lowerCaseItemGroup = item.food_group.toLowerCase();
  //       return (
  //         lowerCaseItemName.includes(searchInput) ||
  //         lowerCaseItemGroup.includes(searchInput)
  //       );
  //     });
  //     setSearchedFoodItem({
  //       ...searchedFoodItem,
  //       list: searchedList,
  //       searched: true,
  //     });
  //   }
  // };

  //stock
  const handleGetStock = (id) => {
    if (orderDetails.branch === null) {
      return 0;
    }
    let stock = foodItemStock.find((item) => {
      return (
        parseInt(item.food_id) === parseInt(id) &&
        parseInt(item.branch_id) === orderDetails.branch.id
      );
    });
    if (stock === undefined || stock.qty < 0) {
      return 0;
    }
    return stock.qty;
  };

  //get already ordered qty
  const handleAlreadyOrderedQty = (id) => {
    let temp = 0;
    if (newOrder) {
      newOrder.map((item) => {
        if (parseInt(item.item.id) === id) {
          temp += parseInt(item.quantity);
        }
      });
    }
    return temp;
  };

  const [inputValue, setInputValue] = useState("");

  // const handleKitchenNote = (event) => {
  //   setInputValue(event.target.value);
  //   if (activeItemInOrder != null) {
  //     let updated = [...newOrder];
  //     updated[activeItemInOrder].item.note = event.target.value;
  //     setNewOrder(updated);
  //   }
  // };

  const handleKitchenNote = (event) => {
    setInputValue(event.target.value);
    if (activeItemInOrder != null) {
      // Create a deep copy of the newOrder array
      let updated = JSON.parse(JSON.stringify(newOrder));
  
      // Update the kitchen note of the specific item in the cloned array
      updated[activeItemInOrder].item.note = event.target.value;
  
      // Update the state with the cloned and updated array
      setNewOrder(updated);
    }
  };

  //add new item to order list
  const handleOrderItem = (tempFoodItem) => {
    setInputValue("");
    // if manage is stock is enable
    if (showManageStock) {
      if (
        handleGetStock(tempFoodItem.id) >
        handleAlreadyOrderedQty(tempFoodItem.id)
      ) {
        let oldOrderItems = [];
        let newOrderItem = null;
        let tempSelectedVariations = [];
        if (newOrder) {
          newOrder.map((eachOldOrderItem) => {
            //push all old items to new array to setNewOrder
            oldOrderItems.push(eachOldOrderItem);

            //set selected variations of each order item
            let tempArray = [];
            if (eachOldOrderItem.variation !== null) {
              tempArray.push(eachOldOrderItem.variation.food_with_variation_id);
            } else {
              tempArray.push(null);
            }
            tempSelectedVariations.push(tempArray);
          });

          //add new order item
          newOrderItem = {
            item: tempFoodItem,
            variation:
              parseInt(tempFoodItem.has_variation) === 1
                ? tempFoodItem.variations[0]
                : null,
            quantity: 1,
          };

          //set selected variations of new item
          let tempArray = [];
          if (parseInt(tempFoodItem.has_variation) === 1) {
            tempArray.push(tempFoodItem.variations[0].food_with_variation_id);
          } else {
            tempArray.push(null);
          }
          tempSelectedVariations.push(tempArray);
          //push new item to new array to setNewOrder
          oldOrderItems.push(newOrderItem);
        } else {
          //if no item in newOrder List
          setOrderDetails({
            //set token here on first order item add,
            ...orderDetails,
            token: {
              time: new Date().getTime(),
              id: newSettings.workPeriod.token,
            },
          });
          newOrderItem = {
            //add new order item
            item: tempFoodItem,
            variation:
              parseInt(tempFoodItem.has_variation) === 1
                ? tempFoodItem.variations[0]
                : null,
            quantity: 1,
          };

          //set selected variations of new item
          let tempArray = [];
          if (parseInt(tempFoodItem.has_variation) === 1) {
            tempArray.push(tempFoodItem.variations[0].food_with_variation_id);
          } else {
            tempArray.push(null);
          }
          tempSelectedVariations.push(tempArray);

          //push new item to new array to setNewOrder
          oldOrderItems.push(newOrderItem);
        }

        //set new order list with new array of all order items
        setNewOrder(oldOrderItems);

        //set order list active item index to add class "actve"
        setActiveItemInOrder(oldOrderItems.length - 1);

        //set selected variations
        setSelectedVariation(tempSelectedVariations);

        //calculate subTotalPrice
        totalPrice(oldOrderItems);

        //set order unique food groups
        let newSelectedGroup = [];
        oldOrderItems.map((eachOrderGroup) => {
          let theGroup = foodGroupForSearch.find(
            (grpFilter, grpFilterIndex) => {
              return (
                grpFilter.id === parseInt(eachOrderGroup.item.food_group_id)
              );
            }
          );

          if (!newSelectedGroup.includes(parseInt(theGroup.id))) {
            newSelectedGroup.push(parseInt(theGroup.id));
          }
        });
        let theOrderFoodGroups = [];
        newSelectedGroup.forEach((thisItem, thisItemIndex) => {
          let findThegroup = foodGroupForSearch.find(
            (filterThisGroup, filterThisGroupIndex) => {
              return filterThisGroup.id === thisItem;
            }
          );
          theOrderFoodGroups.push(findThegroup);
        });

        setOrderFoodGroups(theOrderFoodGroups);

        //sound
        if (getSystemSettings(generalSettings, "play_sound") === "1") {
          let beep = document.getElementById("myAudio");
          beep.play();
        }
      } else {
        toast.error(`${_t(t("Stock Out"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      }
    } else {
      let oldOrderItems = [];
      let newOrderItem = null;
      let tempSelectedVariations = [];
      if (newOrder) {
        newOrder.map((eachOldOrderItem) => {
          //push all old items to new array to setNewOrder
          oldOrderItems.push(eachOldOrderItem);

          //set selected variations of each order item
          let tempArray = [];
          if (eachOldOrderItem.variation !== null) {
            tempArray.push(eachOldOrderItem.variation.food_with_variation_id);
          } else {
            tempArray.push(null);
          }
          tempSelectedVariations.push(tempArray);
        });

        //add new order item
        newOrderItem = {
          item: tempFoodItem,
          variation:
            parseInt(tempFoodItem.has_variation) === 1
              ? tempFoodItem.variations[0]
              : null,
          quantity: 1,
        };

        //set selected variations of new item
        let tempArray = [];
        if (parseInt(tempFoodItem.has_variation) === 1) {
          tempArray.push(tempFoodItem.variations[0].food_with_variation_id);
        } else {
          tempArray.push(null);
        }
        tempSelectedVariations.push(tempArray);
        //push new item to new array to setNewOrder
        oldOrderItems.push(newOrderItem);
      } else {
        //if no item in newOrder List
        setOrderDetails({
          //set token here on first order item add,
          ...orderDetails,
          token: {
            time: new Date().getTime(),
            id: newSettings.workPeriod.token,
          },
        });
        newOrderItem = {
          //add new order item
          item: tempFoodItem,
          variation:
            parseInt(tempFoodItem.has_variation) === 1
              ? tempFoodItem.variations[0]
              : null,
          quantity: 1,
        };

        //set selected variations of new item
        let tempArray = [];
        if (parseInt(tempFoodItem.has_variation) === 1) {
          tempArray.push(tempFoodItem.variations[0].food_with_variation_id);
        } else {
          tempArray.push(null);
        }
        tempSelectedVariations.push(tempArray);

        //push new item to new array to setNewOrder
        oldOrderItems.push(newOrderItem);
      }

      //set new order list with new array of all order items
      setNewOrder(oldOrderItems);

      //set order list active item index to add class "actve"
      setActiveItemInOrder(oldOrderItems.length - 1);

      //set selected variations
      setSelectedVariation(tempSelectedVariations);

      //calculate subTotalPrice
      totalPrice(oldOrderItems);

      //set order unique food groups
      let newSelectedGroup = [];
      oldOrderItems.map((eachOrderGroup) => {
        let theGroup = foodGroupForSearch.find((grpFilter, grpFilterIndex) => {
          return grpFilter.id === parseInt(eachOrderGroup.item.food_group_id);
        });

        if (!newSelectedGroup.includes(parseInt(theGroup.id))) {
          newSelectedGroup.push(parseInt(theGroup.id));
        }
      });
      let theOrderFoodGroups = [];
      newSelectedGroup.forEach((thisItem, thisItemIndex) => {
        let findThegroup = foodGroupForSearch.find(
          (filterThisGroup, filterThisGroupIndex) => {
            return filterThisGroup.id === thisItem;
          }
        );
        theOrderFoodGroups.push(findThegroup);
      });

      setOrderFoodGroups(theOrderFoodGroups);

      //sound
      if (getSystemSettings(generalSettings, "play_sound") === "1") {
        let beep = document.getElementById("myAudio");
        beep.play();
      }
    }
  };

  //set order item's variation on change of variation
  const handleOrderItemVariation = (tempFoodItemVariation) => {
    if (activeItemInOrder !== null) {
      if (newOrder) {
        let oldOrderItems = []; //array to push order items
        let newOrderItemTemp = null; //to edit selected item
        let tempSelectedVariations = []; //to set selected variations array for order items
        newOrder.map((newOrderItem, index) => {
          let tempArray = [];
          if (index === activeItemInOrder) {
            //changing variation of selected food item
            newOrderItemTemp = {
              ...newOrderItem,
              variation: tempFoodItemVariation,
            };
            //push updated item to orderlist
            oldOrderItems.push(newOrderItemTemp);

            //set updated variation for selected variation
            tempArray.push(tempFoodItemVariation.food_with_variation_id);
          } else {
            //set other items as it was which are not selected to edit
            newOrderItemTemp = newOrderItem;
            oldOrderItems.push(newOrderItemTemp);
            if (newOrderItemTemp.variation) {
              //set updated variation for selected variations
              tempArray.push(newOrderItemTemp.variation.food_with_variation_id);
            }
          }

          //push to the array to set selectedVariations
          tempSelectedVariations.push(tempArray);
        });
        //set variations here
        setSelectedVariation(tempSelectedVariations);

        //set updated order list
        setNewOrder(oldOrderItems);

        //calculate subTotalPrice
        totalPrice(oldOrderItems);
      }
    }
  };

  //to check which variation is selected
  const checkChecked = (variationItem) => {
    //if variationItem.food_with_variation_id of selected item exist in selectedVariation - return true
    if (selectedVariation[activeItemInOrder] !== undefined) {
      if (
        selectedVariation[activeItemInOrder][0] ===
        variationItem.food_with_variation_id
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  //delete confirmation modal of item from order list
  const handleDeleteConfirmation = (removeIndex) => {
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
                  handleRemoveItemFromOrderList(removeIndex);
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

  //remove item from order list
  const handleRemoveItemFromOrderList = (removeIndex) => {
    let oldOrderItems = []; //array to push order items
    newOrder.map((newOrderItem, index) => {
      if (index !== removeIndex) {
        //push item to orderlist
        oldOrderItems.push(newOrderItem);
      }
    });

    //delete variations here
    let tempSelectedVariations = selectedVariation.filter(
      (selectedVariationItem, variationIndex) => {
        return variationIndex !== removeIndex;
      }
    );
    //delete properties here
    let tempSelectedProperties = selectedProperties.filter(
      (selectedPropertyItem, propertyIndex) => {
        return propertyIndex !== removeIndex;
      }
    );

    //delete property group here
    let tempSelectedPropertyGroup = selectedPropertyGroup.filter(
      (selectedPropertyGroupItem, propertyGroupIndex) => {
        return propertyGroupIndex !== removeIndex;
      }
    );

    //set property group here
    setSelectedPropertyGroup(tempSelectedPropertyGroup);

    //set variations here
    setSelectedVariation(tempSelectedVariations);

    //set properties here
    setSelectedProperties(tempSelectedProperties);

    //set updated order list
    setNewOrder(oldOrderItems);

    //set active item in order list
    setActiveItemInOrder(null);

    //calculate subTotalPrice
    totalPrice(oldOrderItems);

    //set order unique food groups
    let newSelectedGroup = [];
    oldOrderItems.map((eachOrderGroup) => {
      let theGroup = foodGroupForSearch.find((grpFilter, grpFilterIndex) => {
        return grpFilter.id === parseInt(eachOrderGroup.item.food_group_id);
      });

      if (!newSelectedGroup.includes(parseInt(theGroup.id))) {
        newSelectedGroup.push(parseInt(theGroup.id));
      }
    });
    let theOrderFoodGroups = [];
    newSelectedGroup.forEach((thisItem, thisItemIndex) => {
      let findThegroup = foodGroupForSearch.find(
        (filterThisGroup, filterThisGroupIndex) => {
          return filterThisGroup.id === thisItem;
        }
      );
      theOrderFoodGroups.push(findThegroup);
    });

    setOrderFoodGroups(theOrderFoodGroups);

    //sound
    if (getSystemSettings(generalSettings, "play_sound") === "1") {
      let beep = document.getElementById("myAudio");
      beep.play();
    }
  };

  //handle order item quantity
  const handleOrderItemQty = (action) => {
    if (activeItemInOrder !== null) {
      if (newOrder) {
        let newOrderItemTemp = null; //to edit selected item
        let oldOrderItems = []; //array to push order items
        newOrder.map((newOrderItem, index) => {
          if (index === activeItemInOrder) {
            //update qty here
            if (action === "+") {
              // if manage is stock is enable
              if (showManageStock) {
                if (
                  handleGetStock(newOrderItem.item.id) >
                  handleAlreadyOrderedQty(newOrderItem.item.id)
                ) {
                  //increase qty
                  newOrderItemTemp = {
                    ...newOrderItem,
                    quantity: newOrderItem.quantity + 1,
                  };
                } else {
                  newOrderItemTemp = {
                    ...newOrderItem,
                    quantity: newOrderItem.quantity,
                  };
                  toast.error(`${_t(t("Reached Stock Limit"))}`, {
                    position: "bottom-center",
                    closeButton: false,
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  });
                }
              } else {
                //increase qty
                newOrderItemTemp = {
                  ...newOrderItem,
                  quantity: newOrderItem.quantity + 1,
                };
              }
            } else {
              //if qty !==1 decrease
              if (newOrderItem.quantity !== 1) {
                newOrderItemTemp = {
                  ...newOrderItem,
                  quantity: newOrderItem.quantity - 1,
                };
              } else {
                newOrderItemTemp = {
                  ...newOrderItem,
                  quantity: newOrderItem.quantity,
                };
              }
            }
            oldOrderItems.push(newOrderItemTemp);
          } else {
            // set other items as it was which are not selected to edit
            oldOrderItems.push(newOrderItem);
          }
        });

        //calculate subTotalPrice
        totalPrice(oldOrderItems);
        //set updated order list
        setNewOrder(oldOrderItems);
      }
    }
  };

  //cancel order confirmation
  const handleCancelConfirmation = () => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div className="card card-body bg-primary text-white">
            <h1 className="text-white">{_t(t("Are you sure?"))}</h1>
            <p className="text-center">
              {_t(t("You want to cancel this order?"))}
            </p>
            <div className="d-flex justify-content-center">
              <button
                className="btn btn-warning text-dark"
                onClick={() => {
                  handleCancel();
                  onClose();
                }}
              >
                {_t(t("Yes!"))}
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

  //cancel order
  const handleCancel = () => {
    setLoading(true);
    setNewOrder(null);
    setActiveItemInOrder(null);
    setSelectedVariation([]);
    setSelectedPropertyGroup([]);
    setSelectedProperties([]);
    setTheSubTotal(0);
    setDeptCommission(0);
    setTheVat(0);
    setTotalPaybale(0);
    setReturnMoneyUsd(0);
    setPaidMoney("");
    setOrderDetails({
      branch: orderDetails.branch,
      customer: null,
      table: null,
      waiter: null,
      dept_tag: null,
      payment_type: null,
      payment_amount: null,
      total_guest: 1,
      reservation_date_time: null,
      newCustomer: false,
      newCustomerInfo: {
        name: "",
        number: "",
        address: "",
        zipcode: "",
      },
      token: null,
      serviceCharge: 0,
      discount: 0,
    });
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  //add properties
  const handleAddProperties = (property) => {
    let propertyItem = {
      item: property,
      quantity: 1,
    };
    if (activeItemInOrder !== null) {
      if (newOrder) {
        let oldOrderItems = []; //array to push order items
        let newOrderItemTemp = null; //to edit selected item

        let tempSelectedProperties = []; //to set selected properties array for order items
        let tempSelectedPropertyGroup = []; //to set selected property group array for order items properties

        newOrder.map((newOrderItem, index) => {
          let tempArray = []; //for selected properties
          let tempArrayPropertyGroup = []; //for selected property groups

          if (index === activeItemInOrder) {
            let tempPropertyArray = []; //for property items
            if (newOrderItem.properties) {
              newOrderItem.properties.map((eachPropertyItem) => {
                tempPropertyArray.push(eachPropertyItem);
                //set updated property for selected variation
                tempArray.push(eachPropertyItem.item.id);

                //handle selected property group
                tempArrayPropertyGroup.push(
                  parseInt(eachPropertyItem.item.property_group_id)
                );
              });
              tempPropertyArray.push(propertyItem);
              //for selected properties
              tempArray.push(propertyItem.item.id);
              //handle selected property group
              tempArrayPropertyGroup.push(
                parseInt(propertyItem.item.property_group_id)
              );
            } else {
              tempPropertyArray.push(propertyItem);
              //for selected properties
              tempArray.push(propertyItem.item.id);
              //handle selected property group
              tempArrayPropertyGroup.push(
                parseInt(propertyItem.item.property_group_id)
              );
            }

            //changing properties of selected food item
            newOrderItemTemp = {
              ...newOrderItem,
              properties: tempPropertyArray,
            };
            //push updated item to orderlist
            oldOrderItems.push(newOrderItemTemp);
          } else {
            // set other items as it was which are not selected to edit
            newOrderItemTemp = newOrderItem;
            oldOrderItems.push(newOrderItemTemp);
            if (newOrderItem.properties) {
              newOrderItem.properties.map((eachPropertyItem) => {
                //set updated properties for selected properties
                tempArray.push(eachPropertyItem.item.id);

                //set updated property groups for selected groups
                tempArrayPropertyGroup.push(
                  parseInt(eachPropertyItem.item.property_group_id)
                );
              });
            }
          }
          //push to the array to set selected properties
          tempSelectedProperties.push(tempArray);
          //push to the array to set selected property groups
          tempSelectedPropertyGroup.push(tempArrayPropertyGroup);
        });

        //set selected properties here
        setSelectedProperties(tempSelectedProperties);

        //handle selected property groups
        let newSelectedPropertyGroup = [];
        tempSelectedPropertyGroup.map((eachSelectedGroupArray) => {
          let unique = [...new Set(eachSelectedGroupArray)];
          newSelectedPropertyGroup.push(unique);
        });
        //set selected property groups here
        setSelectedPropertyGroup(newSelectedPropertyGroup);

        //calculate subTotalPrice
        totalPrice(oldOrderItems);
        //set updated order list
        setNewOrder(oldOrderItems);
      }
    }
  };

  //remove properties
  const handleRemoveProperties = (propertyItem) => {
    if (activeItemInOrder !== null) {
      if (newOrder) {
        let oldOrderItems = []; //array to push order items
        let newOrderItemTemp = null; //to edit selected item
        let newSelectedProperties = []; //for selected properties
        let allPropertyGroups = []; //for selected property groups

        newOrder.map((newOrderItem, index) => {
          if (index === activeItemInOrder) {
            let tempPropertyArray = []; //for property items
            if (newOrderItem.properties) {
              newOrderItem.properties.map((eachPropertyItem) => {
                if (eachPropertyItem.item.id !== propertyItem.id) {
                  tempPropertyArray.push(eachPropertyItem);
                }
              });

              //removing properties from selected properties array
              selectedProperties.map((selectedProperty, propertyIndex) => {
                if (propertyIndex !== activeItemInOrder) {
                  //pushing other order items properties in selected array
                  newSelectedProperties.push(selectedProperty);
                } else {
                  let theProperties = selectedProperty.filter((filterThis) => {
                    return filterThis !== propertyItem.id;
                  });
                  //pushing this order items properties in selected array or [] if not a single property item is selected
                  newSelectedProperties.push(theProperties);
                }
              });
            }

            //changing properties of selected food item
            newOrderItemTemp = {
              ...newOrderItem,
              properties: tempPropertyArray,
            };

            //set selected properties here
            setSelectedProperties(newSelectedProperties);
            //push updated item to orderlist
            oldOrderItems.push(newOrderItemTemp);

            //property group for selected property group array
            selectedPropertyGroup.map((groupItem, groupItemIndex) => {
              if (index === groupItemIndex) {
                let tempGroupArray = []; // for selected group of each order item (index of array wise new array)
                groupItem.map((filterThisItem) => {
                  if (
                    filterThisItem !== parseInt(propertyItem.property_group_id)
                  ) {
                    //push if removable property item's group !== groupItem
                    tempGroupArray.push(filterThisItem);
                  }
                });

                //push all groups of modified new properties array of this item
                tempPropertyArray.map((pushThis) => {
                  tempGroupArray.push(
                    parseInt(pushThis.item.property_group_id)
                  );
                });

                //remove duplicate groups
                let unique = [...new Set(tempGroupArray)];
                allPropertyGroups.push(unique);
              } else {
                //keep other selected groups as it was
                allPropertyGroups.push(groupItem);
              }
            });
          } else {
            // set other items as it was which are not selected to edit
            newOrderItemTemp = newOrderItem;
            oldOrderItems.push(newOrderItemTemp);
          }
        });

        //set new selected property groups
        setSelectedPropertyGroup(allPropertyGroups);

        //calculate subTotalPrice
        totalPrice(oldOrderItems);

        //set updated order list
        setNewOrder(oldOrderItems);
      }
    }
  };

  //to check which property is selected
  const checkCheckedProperties = (propertyItem) => {
    //if property.id of selected item exist in selected properties - return true
    if (selectedProperties[activeItemInOrder] !== undefined) {
      if (selectedProperties[activeItemInOrder].includes(propertyItem.id)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  //handle property quantity
  const handlePropertyQty = (propertyItem, action) => {
    if (activeItemInOrder !== null) {
      if (newOrder) {
        let newOrderItemTemp = null; //to edit selected item
        let oldOrderItems = []; //array to push order items
        let tempPropertyItemsArray = []; //for each property items
        newOrder.map((newOrderItem, index) => {
          if (index === activeItemInOrder) {
            //if has property items
            if (newOrderItem.properties) {
              newOrderItem.properties.map((eachPropertyItem) => {
                //loop through the properties to change the specific one's quantity and keep the rest as it was
                if (eachPropertyItem.item.id !== propertyItem.id) {
                  //keep others as it was
                  tempPropertyItemsArray.push(eachPropertyItem);
                } else {
                  //coming here if the specific item's id === selected property item's id
                  let newPropertyItemForQtyUpdate = null;
                  //update qty here
                  if (action === "+") {
                    //increase qty
                    newPropertyItemForQtyUpdate = {
                      ...eachPropertyItem,
                      quantity: eachPropertyItem.quantity + 1,
                    };
                    tempPropertyItemsArray.push(newPropertyItemForQtyUpdate);
                  } else {
                    //if qty !==1 decrease
                    if (eachPropertyItem.quantity !== 1) {
                      newPropertyItemForQtyUpdate = {
                        ...eachPropertyItem,
                        quantity: eachPropertyItem.quantity - 1,
                      };
                      tempPropertyItemsArray.push(newPropertyItemForQtyUpdate);
                    } else {
                      tempPropertyItemsArray.push(eachPropertyItem);
                    }
                  }
                }
              });
              //changing properties of selected food item
              newOrderItemTemp = {
                ...newOrderItem,
                properties: tempPropertyItemsArray,
              };
              //push updated item to orderlist
              oldOrderItems.push(newOrderItemTemp);
            } else {
              //push updated item to orderlist
              oldOrderItems.push(newOrderItem);
            }
          } else {
            // set other items as it was which are not selected to edit
            oldOrderItems.push(newOrderItem);
          }
        });

        //calculate subTotalPrice
        totalPrice(oldOrderItems);
        //set updated order list
        setNewOrder(oldOrderItems);
      }
    }
  };

  //to check selected property item's quantity
  const checkCheckedPropertyQuantity = (propertyItem) => {
    //if propertyItem.id of selected item exist in selectedProperties - return the quantity of that property item from the order list item
    if (selectedProperties[activeItemInOrder] !== undefined) {
      if (selectedProperties[activeItemInOrder].includes(propertyItem.id)) {
        //get order of activeItemInOrder index
        if (newOrder) {
          if (newOrder[activeItemInOrder] !== undefined) {
            let orderItem = newOrder[activeItemInOrder];
            let theItem = orderItem.properties.find((theItemTemp) => {
              return theItemTemp.item.id === propertyItem.id;
            });
            return theItem.quantity;
          } else {
            return 1;
          }
        } else {
          return 1;
        }
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  };

  //show price of each item in order list
  const showPriceOfEachOrderItem = (itemIndex) => {
    if (newOrder) {
      let price = 0;
      let orderItem = newOrder[itemIndex];
      //check price * quantity (variation price / item price)
      if (parseInt(orderItem.item.has_variation) === 1) {
        price = parseFloat(orderItem.variation.food_with_variation_price);
      } else {
        price = parseFloat(orderItem.item.price);
      }

      //calculate total price of properties
      if (orderItem.properties) {
        if (orderItem.properties.length > 0) {
          orderItem.properties.map((getEachItemPrice) => {
            let totalPropertyPrice =
              parseFloat(getEachItemPrice.item.extra_price) *
              getEachItemPrice.quantity;
            price = price + totalPropertyPrice;
          });
        }
      }

      let formattedPrice = formatPrice(price * orderItem.quantity);
      return formattedPrice;
    }
  };

  //show price of each item in print
  const showPriceOfEachOrderItemPrint = (itemIndex) => {
    if (newOrder) {
      let price = 0;
      let orderItem = newOrder[itemIndex];
      //check price * quantity (variation price / item price)
      if (parseInt(orderItem.item.has_variation) === 1) {
        price = parseFloat(orderItem.variation.food_with_variation_price);
      } else {
        price = parseFloat(orderItem.item.price);
      }

      let formattedPrice = formatPrice(price * orderItem.quantity);
      return formattedPrice;
    }
  };

  //show total price
  const totalPrice = (allOrderItems) => {
    let subTotal = 0;
    allOrderItems.map((orderItem) => {
      let price = 0;
      //check price * quantity (variation price / item price)
      if (parseInt(orderItem.item.has_variation) === 1) {
        price = parseFloat(orderItem.variation.food_with_variation_price);
      } else {
        price = parseFloat(orderItem.item.price);
      }

      //calculate total price of properties
      if (orderItem.properties) {
        if (orderItem.properties.length > 0) {
          orderItem.properties.map((getEachItemPrice) => {
            let totalPropertyPrice =
              parseFloat(getEachItemPrice.item.extra_price) *
              getEachItemPrice.quantity;
            price = price + totalPropertyPrice;
          });
        }
      }
      subTotal = subTotal + price * orderItem.quantity;
    });
    setTheSubTotal(subTotal);

    let tempVat = 0;
    if (newSettings) {
      tempVat = (subTotal * parseFloat(newSettings.vat)) / 100;
      setTheVat(tempVat);
    }

    let tempCommission = 0;
    if (orderDetails && orderDetails.dept_tag) {
      tempCommission =
        (subTotal * parseFloat(orderDetails.dept_tag.commission)) / 100;
      setDeptCommission(tempCommission);
    }

    let totalPayable = 0;
    let localCurrency = JSON.parse(localStorage.getItem("currency"));

    let usdServiceCharge;
    let usdDiscount;
    if (getSystemSettings(generalSettings, "sDiscount") === "flat") {
      usdServiceCharge =
        parseFloat(orderDetails.serviceCharge) / localCurrency.rate;
      usdDiscount = parseFloat(orderDetails.discount) / localCurrency.rate;
    } else {
      usdServiceCharge =
        subTotal * (parseFloat(orderDetails.serviceCharge) / 100);
      usdDiscount = subTotal * (parseFloat(orderDetails.discount) / 100);
    }

    totalPayable =
      subTotal + tempVat + usdServiceCharge - usdDiscount - tempCommission;
    setTotalPaybale(totalPayable);
    //calculate paid amount to set return amount
    handleCalculatePaid(orderDetails.payment_amount, orderDetails.payment_type);
  };

  //search food here
  const handleSearch = (e) => {
    setActiveItemInOrder(null);
    let searchInput = e.target.value.toLowerCase();
    let searchedList = foodForSearch.filter((item) => {
      let lowerCaseItemName = item.name.toLowerCase();
      let lowerCaseItemGroup = item.food_group.toLowerCase();
      return (
        lowerCaseItemName.includes(searchInput) ||
        lowerCaseItemGroup.includes(searchInput)
      );
    });
    setFoodItem({
      foodGroup: null,
      items: searchedList.length > 0 ? searchedList : null,
      selectedItem: null,
      variations: null,
      properties: null,
    });
  };

  //set order detals additional info here
  //set branch
  const handleSetBranch = (branch, customerData) => {
    setLoading(true);

    // Check if customerData is available before filtering
    let tempCustomers =
      customerData !== null &&
      customerData.filter((eachCustomer) => {
        return parseInt(eachCustomer.branch_id) === branch.id;
      });
    let tempTables =
      tableForSearch !== null &&
      tableForSearch.filter((eachTable) => {
        return parseInt(eachTable.branch_id) === branch.id;
      });
    let tempWaiters =
      waiterForSearch !== null &&
      waiterForSearch.filter((eachWaiter) => {
        return parseInt(eachWaiter.branch_id) === branch.id;
      });
    setOrderDetailusers({
      theCustomers: tempCustomers,
      theTables: tempTables,
      theWaiters: tempWaiters,
    });

    setNewOrder(null);
    setActiveItemInOrder(null);
    setSelectedVariation([]);
    setSelectedPropertyGroup([]);
    setSelectedProperties([]);
    setTheSubTotal(0);
    setTheVat(0);
    setTotalPaybale(0);
    setReturnMoneyUsd(0);
    setPaidMoney("");
    setOrderDetails({
      branch: branch,
      customer: null,
      table: null,
      waiter: null,
      dept_tag: null,
      payment_type: null,
      payment_amount: null,
      total_guest: 1,
      reservation_date_time: null,
      newCustomer: false,
      newCustomerInfo: {
        name: "",
        number: "",
        address: "",
        zipcode: "",
      },
      token: null,
      serviceCharge: 0,
      discount: 0,
    });
    // set work period according to branch for admin on branch change
    let theWorkPeriod = null;
    theWorkPeriod =
      workPeriodForSearch &&
      workPeriodForSearch.filter((tempWorkPeriod) => {
        return branch.id === parseInt(tempWorkPeriod.branch_id);
      });

    theWorkPeriod = theWorkPeriod.find((endAtNullItem) => {
      return endAtNullItem.ended_at === null;
    });
    setNewSettings((prevSettings) => ({
      ...prevSettings,
      workPeriod: theWorkPeriod !== undefined ? theWorkPeriod : null,
      vat: prevSettings && prevSettings.vat,
    }));

    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  //customer
  const handleSetCustomer = (customer) => {
    setOrderDetails({
      ...orderDetails,
      customer,
    });
  };

  //new Customer
  const handleNewCustomer = (e) => {
    //if name is not there, set new customer === false
    if (e.target.name === "name") {
      if (e.target.value.length > 0) {
        setOrderDetails({
          ...orderDetails,
          newCustomer: true,
          newCustomerInfo: {
            ...orderDetails.newCustomerInfo,
            [e.target.name]: e.target.value,
          },
        });
      } else {
        setOrderDetails({
          ...orderDetails,
          newCustomer: false,
          newCustomerInfo: {
            ...orderDetails.newCustomerInfo,
            [e.target.name]: e.target.value,
          },
        });
      }
    } else {
      //set phn number here
      setOrderDetails({
        ...orderDetails,
        newCustomerInfo: {
          ...orderDetails.newCustomerInfo,
          [e.target.name]: e.target.value,
        },
      });
    }
  };

  //  table
  const handleSetTable = (table) => {
    setOrderDetails({
      ...orderDetails,
      table,
    });
  };

  // waiter
  const handleSetWaiter = (waiter) => {
    setOrderDetails({
      ...orderDetails,
      waiter,
    });
  };

  // department tag
  const handleSetDeptTag = (dept_tag) => {
    if (dept_tag.id == 9) {
      setIsReservation(true);
    } else {
      setIsReservation(false);
    }
    setOrderDetails({
      ...orderDetails,
      dept_tag,
    });

    let allOrderItems = newOrder;
    if (allOrderItems) {
      let subTotal = 0;
      allOrderItems.map((orderItem) => {
        let price = 0;
        //check price * quantity (variation price / item price)
        if (parseInt(orderItem.item.has_variation) === 1) {
          price = parseFloat(orderItem.variation.food_with_variation_price);
        } else {
          price = parseFloat(orderItem.item.price);
        }

        //calculate total price of properties
        if (orderItem.properties) {
          if (orderItem.properties.length > 0) {
            orderItem.properties.map((getEachItemPrice) => {
              let totalPropertyPrice =
                parseFloat(getEachItemPrice.item.extra_price) *
                getEachItemPrice.quantity;
              price = price + totalPropertyPrice;
            });
          }
        }
        subTotal = subTotal + price * orderItem.quantity;
      });
      setTheSubTotal(subTotal);

      let tempVat = 0;
      if (newSettings) {
        tempVat = (subTotal * parseFloat(newSettings.vat)) / 100;
        setTheVat(tempVat);
      }

      let tempCommission = 0;
      tempCommission = (subTotal * parseFloat(dept_tag.commission)) / 100;
      setDeptCommission(tempCommission);

      let totalPayable = 0;
      let localCurrency = JSON.parse(localStorage.getItem("currency"));

      let usdServiceCharge;
      let usdDiscount;
      if (getSystemSettings(generalSettings, "sDiscount") === "flat") {
        usdServiceCharge =
          parseFloat(orderDetails.serviceCharge) / localCurrency.rate;
        usdDiscount = parseFloat(orderDetails.discount) / localCurrency.rate;
      } else {
        usdServiceCharge =
          subTotal * (parseFloat(orderDetails.serviceCharge) / 100);
        usdDiscount = subTotal * (parseFloat(orderDetails.discount) / 100);
      }

      totalPayable =
        subTotal + tempVat + usdServiceCharge - usdDiscount - tempCommission;
      setTotalPaybale(totalPayable);

      //calculate paid amount to set return amount
      handleCalculatePaid(
        orderDetails.payment_amount,
        orderDetails.payment_type
      );
    }
  };

  //payment type
  const handleSetpaymentType = (payment_type) => {
    setOrderDetails({
      ...orderDetails,
      payment_type,
    });

    //calculate paid amount to set return amount
    handleCalculatePaid(orderDetails.payment_amount, payment_type);
  };

  const [paymentType, setPaymentType] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isShow, setIsShow] = useState(false);
  const checkPaymentIsStripe = () => {
    localStorage.setItem("payment_amount", totalPayable.toString());
    if (paymentType == 2) {
      // if (orderDetails.payment_type) {
        // const tempPaymentType = orderDetails.payment_type;
        // setOrderDetails({
        //   ...orderDetails,
        //   payment_type: orderDetails.payment_type,
        // });
        // setTimeout(() => {
        //   setOrderDetails({
        //     ...orderDetails,
        //     payment_type: [tempPaymentType],
        //   });
        // }, 500);
      // }
      localStorage.setItem("newOrder", JSON.stringify(newOrder));
      localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
      localStorage.setItem("newSettings", JSON.stringify(newSettings));
      localStorage.setItem("theSubTotal", theSubTotal.toString());
      localStorage.setItem("theVat", theVat.toString());
      // history.push(`/dashboard/manage/stripe/payment`);
    }
    setIsShow(true);
  };

  //payment type pos 2
  const handleSetpaymentTypeSingle = (payment_type) => {
    setPaymentType(payment_type.id);
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    let theUsdPaid = paidMoney / localCurrency.rate;
    if (theUsdPaid < totalPayable && payment_type.id !== 1) {
      setReturnMoneyUsd(0);
      toast.error(
        `${_t(
          t("Please enter paid amount atleast equal to the total bill amount")
        )}`,
        {
          position: "bottom-center",
          closeButton: false,
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        }
      );
    } else {
      setOrderDetails({
        ...orderDetails,
        payment_type: [payment_type],
      });
      let theReturnMoney = theUsdPaid - totalPayable;
      setReturnMoneyUsd(theReturnMoney);
      checkPaymentIsStripe();
    }

    setTimeout(() => {
      if (
        payment_type.id == 1
      ) {
        if (!loading) {
          handleSubmitOrder();
        }
      }
    }, 500);
  };

  //payment type amount
  const handlePaymentTypeAmount = (e) => {
    let tempPaymentAmount = {
      ...orderDetails.payment_amount,
      [e.target.name]: e.target.value,
    };

    setOrderDetails({
      ...orderDetails,
      payment_amount: tempPaymentAmount,
    });

    //calculate paid amount to set return amount
    handleCalculatePaid(tempPaymentAmount, orderDetails.payment_type);
  };

  //guest
  const handleTotalGuest = (e) => {
    setOrderDetails({
      ...orderDetails,
      total_guest: e.target.value,
    });
  };
  const [isReservation, setIsReservation] = useState(false);

  //guest
  const handleReservationDateTime = (e) => {
    setOrderDetails({
      ...orderDetails,
      reservation_date_time: e.target.value,
    });
  };

  //calculate paid amount
  const handleCalculatePaid = (paymentAmount, paymentType) => {
    let paidAmount = 0;
    if (paymentAmount !== null && paymentType !== null) {
      let thePaymentArray = [];
      if (paymentAmount) {
        thePaymentArray = Object.entries(paymentAmount);
      }
      thePaymentArray.map((eachPaymentItem) => {
        let thePaymentType = paymentType.find((paymentTypeItem) => {
          return paymentTypeItem.id === parseInt(eachPaymentItem[0]);
        });
        if (eachPaymentItem[1] !== "") {
          if (
            thePaymentType &&
            thePaymentType.id === parseInt(eachPaymentItem[0])
          ) {
            paidAmount = paidAmount + parseFloat(eachPaymentItem[1]);
          }
        }
      });
      let localCurrency = JSON.parse(localStorage.getItem("currency"));
      paidAmount = paidAmount / localCurrency.rate;
      let theReturnMoney = paidAmount - totalPayable;
      setReturnMoneyUsd(theReturnMoney);
    } else {
      setReturnMoneyUsd(0);
    }
    setPaidMoney(paidAmount);
  };

  //send server req
  const handleSubmitOrder = (e) => {
    // e.preventDefault();
    if (newOrder && newOrder.length > 0) {
      // console.log(orderDetails);
      axiosRequest();
      // if (paidMoney !== 0) {
      //   toast.error(
      //     `${_t(
      //       t("Settle order to add payments, or remove payment's amount")
      //     )}`,
      //     {
      //       position: "bottom-center",
      //       closeButton: false,
      //       autoClose: 10000,
      //       hideProgressBar: false,
      //       closeOnClick: true,
      //       pauseOnHover: true,
      //       className: "text-center toast-notification",
      //     }
      //   );
      // } else {
      //   axiosRequest();
      // }
    } else {
      toast.error(`${_t(t("Please add items in order list"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //axios request for submit
  const axiosRequest = () => {
    let url = BASE_URL + "/settings/new-order";
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    let formData = {
      branch: orderDetails.branch,
      customer: orderDetails.customer,
      table: orderDetails.table,
      waiter: orderDetails.waiter,
      dept_tag: orderDetails.dept_tag,
      payment_type: orderDetails.payment_type,
      payment_amount: orderDetails.payment_amount,
      newCustomer: orderDetails.newCustomer ? 1 : 0,
      newCustomerInfo: orderDetails.newCustomerInfo,
      token: orderDetails.token,
      total_guest: orderDetails.total_guest,
      reservation_date_time: orderDetails.reservation_date_time,
      orderItems: newOrder,
      serviceCharge: orderDetails.serviceCharge,
      discount: orderDetails.discount,
      subTotal: theSubTotal,
      totalPayable: totalPayable,
      paidMoney: paidMoney,
      theVat: theVat,
      dept_commission: deptCommission,
      localCurrency: localCurrency,
      workPeriod: newSettings.workPeriod,
    };
    setLoading(true);
    axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data !== "ended") {
          getFoodGroup();
          handlePrint();
          setCustomerForSearch(res.data[0][1]);
          setWorkPeriodListForSearch(res.data[1][1]);
          let tempCustomers =
            res.data[0][1] !== null &&
            res.data[0][1].filter((eachCustomer) => {
              return (
                parseInt(eachCustomer.branch_id) === orderDetails.branch.id
              );
            });
          setOrderDetailusers({
            ...orderDetailUsers,
            theCustomers: tempCustomers,
          });

          //set work period
          let theWorkPeriod = null;
          if (
            orderDetails.branch !== undefined &&
            orderDetails.branch !== null
          ) {
            theWorkPeriod =
              res.data[1][1] &&
              res.data[1][1].filter((tempWorkPeriod) => {
                return (
                  orderDetails.branch.id === parseInt(tempWorkPeriod.branch_id)
                );
              });

            //filter it with ended_at === null;
            theWorkPeriod =
              theWorkPeriod &&
              theWorkPeriod.find((endAtNullItem) => {
                return endAtNullItem.ended_at === null;
              });
          }
          //set work period here
          setNewSettings({
            ...newSettings,
            vat:
              generalSettings && getSystemSettings(generalSettings, "type_vat"),
            workPeriod: theWorkPeriod !== undefined ? theWorkPeriod : null,
          });

          setLoading(false);
        } else {
          setLoading(false);
          toast.error(`${_t(t("Please restart the work period"))}`, {
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

  //settle button
  const handleSettleOrderButton = (e) => {
    checkPaymentIsStripe();
    if (newOrder && newOrder.length > 0) {
      if (
        orderDetails &&
        orderDetails.customer == null &&
        orderDetails.newCustomerInfo.name == ""
      ) {
        toast.error(`${_t(t("Please select a customer first"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      } else if (orderDetails && orderDetails.dept_tag !== null) {
        setShowSettle(true);
      } else {
        toast.error(`${_t(t("Please select a department tag"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      }
    } else {
      toast.error(`${_t(t("Please add items in order first"))}`, {
        position: "bottom-center",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //handle settle order
  const handleSettleOrder = (e) => {
    checkPaymentIsStripe();
    e.preventDefault();
    if (newOrder && newOrder.length > 0) {
      if (paidMoney < totalPayable) {
        toast.error(
          `${_t(
            t("Please enter paid amount atleast equal to the total bill amount")
          )}`,
          {
            position: "bottom-center",
            closeButton: false,
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          }
        );
      } else {
        axiosRequestForSettle();
      }
    } else {
      toast.error(`${_t(t("Please add items in order list"))}`, {
        position: "bottom-center",
        closeButton: false,
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        className: "text-center toast-notification",
      });
    }
  };

  //axios request for settlement
  const axiosRequestForSettle = () => {
    let url = BASE_URL + "/settings/settle-order";
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    let formData = {
      branch: orderDetails.branch,
      customer: orderDetails.customer,
      table: orderDetails.table,
      waiter: orderDetails.waiter,
      dept_tag: orderDetails.dept_tag,
      payment_type: orderDetails.payment_type,
      payment_amount: orderDetails.payment_amount,
      newCustomer: orderDetails.newCustomer ? 1 : 0,
      newCustomerInfo: orderDetails.newCustomerInfo,
      token: orderDetails.token,
      total_guest: orderDetails.total_guest,
      reservation_date_time: orderDetails.reservation_date_time,
      orderItems: newOrder,
      serviceCharge: orderDetails.serviceCharge,
      discount: orderDetails.discount,
      subTotal: theSubTotal,
      totalPayable: totalPayable,
      paidMoney: paidMoney,
      theVat: theVat,
      dept_commission: deptCommission,
      localCurrency: localCurrency,
      workPeriod: newSettings.workPeriod,
    };
    setLoading(true);
    axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data !== "ended") {
          if (res.data !== "paymentIssue") {
            getFoodGroup();
            handlePrint();
            setCustomerForSearch(res.data[0][1]);
            setWorkPeriodListForSearch(res.data[1][1]);
            let tempCustomers =
              res.data[0][1] !== null &&
              res.data[0][1].filter((eachCustomer) => {
                return (
                  parseInt(eachCustomer.branch_id) === orderDetails.branch.id
                );
              });
            setOrderDetailusers({
              ...orderDetailUsers,
              theCustomers: tempCustomers,
            });
            //set work period
            let theWorkPeriod = null;
            if (
              orderDetails.branch !== undefined &&
              orderDetails.branch !== null
            ) {
              theWorkPeriod =
                res.data[1][1] &&
                res.data[1][1].filter((tempWorkPeriod) => {
                  return (
                    orderDetails.branch.id ===
                    parseInt(tempWorkPeriod.branch_id)
                  );
                });

              //filter it with ended_at === null;
              theWorkPeriod =
                theWorkPeriod &&
                theWorkPeriod.find((endAtNullItem) => {
                  return endAtNullItem.ended_at === null;
                });
            }
            //set work period here
            setNewSettings({
              ...newSettings,
              vat:
                generalSettings &&
                getSystemSettings(generalSettings, "type_vat"),
              workPeriod: theWorkPeriod !== undefined ? theWorkPeriod : null,
            });
          } else {
            setLoading(false);
            toast.error(
              `${_t(
                t(
                  "Please enter paid amount atleast equal to the total bill amount"
                )
              )}`,
              {
                position: "bottom-center",
                closeButton: false,
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              }
            );
          }
        } else {
          setLoading(false);
          toast.error(`${_t(t("Please restart the work period"))}`, {
            position: "bottom-center",
            closeButton: false,
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
          closeButton: false,
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      });
  };

  //print bills
  const componentRef = useRef();
  const component2Ref = useRef();

  // only print bill
  //for pos manager
  const handleOnlyPrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      if (getSystemSettings(generalSettings, "print_kitchen_bill") === "1") {
        handleOnlyPrint2();
      }
    },
  });

  //for kithcen
  const handleOnlyPrint2 = useReactToPrint({
    content: () => component2Ref.current,
  });

  //after order submit or settle
  //for pos manager
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      // if (getSystemSettings(generalSettings, "print_kitchen_bill") === "1") {
      //   setTimeout(() => {
      //     handlePrint2();
      //   }, 1000);
      // } else {
        handleOrderSubmitSuccessful();
      // }
    },
  });

  //for kithcen
  const handlePrint2 = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      handleOrderSubmitSuccessful();
    },
  });

  //call after successful order submit and settle
  const handleOrderSubmitSuccessful = () => {
    setNewOrder(null);
    setActiveItemInOrder(null);
    setSelectedVariation([]);
    setSelectedPropertyGroup([]);
    setSelectedProperties([]);
    setTheSubTotal(0);
    setTheVat(0);
    setTotalPaybale(0);
    setReturnMoneyUsd(0);
    setPaidMoney("");
    setOrderDetails({
      branch: orderDetails.branch,
      customer: null,
      table: null,
      waiter: null,
      dept_tag: null,
      payment_type: null,
      payment_amount: null,
      total_guest: 1,
      reservation_date_time: null,
      newCustomer: false,
      newCustomerInfo: {
        name: "",
        number: "",
        address: "",
        zipcode: "",
      },
      token: null,
      serviceCharge: 0,
      discount: 0,
    });
    toast.success(`${_t(t("Order has been taken"))}`, {
      position: "bottom-center",
      closeButton: false,
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });

    setShowSettle(false);

    setLoading(false);

    //sound
    if (getSystemSettings(generalSettings, "play_sound") === "1") {
      let beep = document.getElementById("myAudio");
      beep.play();
    }
  };

  // stripe payment area
  // const [name, setName] = useState("");
  // const [success, setSuccess] = useState(false);
  // const [message, setMessage] = useState({
  //   success: false,
  //   text: "",
  // });
  // const [cardNumber, setCardNumber] = useState("");

  // const stripe = useStripe();
  // const elements = useElements();

  // const handleName = (e) => {
  //   setName(e.target.value);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   console.log(cardNumber);
  //   const { error, paymentMethod } = await stripe.createPaymentMethod({
  //     type: "card",
  //     card: elements.getElement(CardElement),
  //   });

  //   if (paymentMethod && paymentMethod.card) {
  //     setCardNumber(paymentMethod.card.last4);
  //   } else {
  //     setCardNumber("");
  //   }

  //   if (!error) {
  //     try {
  //       const { id } = paymentMethod;
  //       let url = BASE_URL + "/settings/stripe";
  //       let localCurrency = JSON.parse(localStorage.getItem("currency"));

  //       let formData = {
  //         name: name,
  //         currency: localCurrency.code,
  //         amount: paymentAmount,
  //         stripeToken: id,
  //       };

  //       axios
  //         .post(url, formData, {
  //           headers: { Authorization: `Bearer ${getCookie()}` },
  //         })
  //         .then((res) => {
  //           setSuccess(true);
  //           setMessage({
  //             success: res.data.success,
  //             text: res.data.message,
  //           });
  //           handlePrint();
  //           setTimeout(() => {
  //             if (res.data.success) {
  //               // removeLocalStorage();
  //               history.push("/dashboard/pos");
  //             } else {
  //               window.location.reload();
  //             }
  //           }, 2000);
  //         })
  //         .catch((err) => {
  //           console.log(err);
  //         });
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   } else {
  //     console.log(error.message);
  //   }
  // };

  return (
    <>
      <Helmet>
        <title>{_t(t("POS"))}</title>
      </Helmet>

      {/* beep sound */}
      <audio id="myAudio">
        <source src="/assets/beep/beep.mp3" type="audio/mpeg" />
      </audio>

      <audio id="myAudioOrder">
        <source src="/assets/beep/order.mp3" type="audio/mpeg" />
      </audio>

      {/* Print bill */}
      <div className="d-none">
        <div ref={componentRef}>
          {newOrder && (
            <div className="fk-print">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <span className="d-block fk-print-text font-weight-bold text-uppercase text-center sm-text">
                      {getSystemSettings(generalSettings, "siteName")}
                      {","}
                      {orderDetails &&
                        orderDetails.branch !== null &&
                        orderDetails.branch.name}
                    </span>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {orderDetails &&
                        orderDetails.branch !== null &&
                        orderDetails.branch.address}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {_t(t("call"))}:{" "}
                      {orderDetails &&
                      orderDetails.branch !== null &&
                      orderDetails.branch.phn_no
                        ? orderDetails.branch.phn_no
                        : ""}
                    </p>
                    <p className="mb-0 sm-text fk-print-text text-center text-capitalize">
                      {getSystemSettings(generalSettings, "type_print_heading")}
                    </p>
                    <span className="d-block fk-print-text text-uppercase text-center lg-text myBorderTopCustomer">
                      {_t(t("Token No"))}-
                      {orderDetails && orderDetails.token.id}
                    </span>
                    <p className="mb-0 fk-print-text text-capitalize lg-text text-center">
                      {orderDetails &&
                        orderDetails.dept_tag &&
                        orderDetails.dept_tag.name}
                    </p>

                    {/* <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Vat reg"))}: {_t(t("Applied"))}
                    </p> */}
                    

                    {orderDetails && orderDetails.waiter !== null ? (
                      <p className="mb-0 xsm-text fk-print-text text-capitalize">
                        {_t(t("waiter name"))}: {orderDetails.waiter.name}
                      </p>
                    ) : (
                      ""
                    )}

                    <p className="mb-0 sm-text fk-print-text text-capitalize lg-text text-center">
                      {paymentType &&
                        paymentType == 1
                        ? "UNPAID"
                        : "PAID"}
                    </p>

                    <table className="table mb-0 table-borderless akash-table-for-print-padding">
                      <thead>
                        <tr>
                          <th
                            scope="col"
                            className="fk-print-text text-capitalize"
                            style={{fontSize: '14px'}}
                          >
                            {_t(t("qty"))} {_t(t("item"))}
                          </th>
                          <th
                            scope="col"
                            className="fk-print-text text-capitalize text-right"
                            style={{fontSize: '14px'}}
                          >
                            {_t(t("T"))}.{_t(t("price"))}
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {newOrder.map((printItem, printItemIndex) => {
                          return (
                            <tr>
                              <td className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                                <div className="d-flex flex-wrap">
                                  <span className="d-inline-block" style={{fontSize: '14px'}}>
                                    -{printItem.quantity} {printItem.item.name}
                                    {printItem.item.note && <span><b> Note:</b> {printItem.item.note}</span>}
                                    {parseInt(printItem.item.has_variation) ===
                                      1 &&
                                      printItem.variation &&
                                      "(" +
                                        printItem.variation.variation_name +
                                        ")"}
                                  </span>
                                </div>

                                {/* properties */}
                                {printItem.properties &&
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
                                                  <span className="text-capitalize d-inline-block mr-1" style={{fontSize: '14px'}}>
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
                                  )}
                              </td>
                              <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                <div className="d-block" style={{fontSize: '14px'}}>
                                  {showPriceOfEachOrderItemPrint(
                                    printItemIndex
                                  )}
                                </div>

                                {printItem.properties &&
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
                                        style={{fontSize: '14px'}}
                                          className={`text-capitalize d-block ${
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
                                  )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="myBorder"></div>
                    <table className="table mb-0 table-borderless">
                      <tbody>
                        <tr>
                          <th className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                            <span className="d-block">{_t(t("total"))}</span>
                          </th>
                          <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                            {formatPrice(theSubTotal)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {theVat > 0 && (
                      <table className="table mb-0 table-borderless">
                        <tbody>
                          {getSystemSettings(generalSettings, "vat_system") ===
                          "igst" ? (
                            <tr>
                              <th className="fk-print-text" style={{fontSize: '14px'}}>
                                <span className="d-block" style={{fontSize: '14px'}}>
                                  VAT({newSettings !== null && newSettings.vat}
                                  %)
                                </span>
                              </th>
                              <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                {formatPrice(theVat)}
                              </td>
                            </tr>
                          ) : getSystemSettings(
                              generalSettings,
                              "vat_system"
                            ) === "cgst" ? (
                            <>
                              <tr>
                                <th className="fk-print-text" style={{fontSize: '14px'}}>
                                  <span className="d-block" style={{fontSize: '14px'}}>
                                    CGST(
                                    {getSystemSettings(generalSettings, "cgst")}
                                    %)
                                  </span>
                                </th>
                                <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                  {formatPrice(
                                    theSubTotal *
                                      (parseFloat(
                                        getSystemSettings(
                                          generalSettings,
                                          "cgst"
                                        )
                                      ) /
                                        100)
                                  )}
                                </td>
                              </tr>
                              <tr>
                                <th className="fk-print-text" style={{fontSize: '14px'}}>
                                  <span className="d-block" style={{fontSize: '14px'}}>
                                    SGST(
                                    {getSystemSettings(generalSettings, "sgst")}
                                    %)
                                  </span>
                                </th>
                                <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                  {formatPrice(
                                    theSubTotal *
                                      (parseFloat(
                                        getSystemSettings(
                                          generalSettings,
                                          "sgst"
                                        )
                                      ) /
                                        100)
                                  )}
                                </td>
                              </tr>
                            </>
                          ) : (
                            <tr>
                              <th className="fk-print-text" style={{fontSize: '14px'}}>
                                <span className="d-block" style={{fontSize: '14px'}}>
                                  TAX({newSettings !== null && newSettings.tax}
                                  %)
                                </span>
                              </th>
                              <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                {formatPrice(theVat)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    )}

                    {getSystemSettings(generalSettings, "sDiscount") ===
                      "flat" && (
                      <>
                        {orderDetails.serviceCharge > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                                  <span className="d-block">
                                    {_t(t("S.Charge"))}
                                  </span>
                                </th>

                                {orderDetails && (
                                  <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                    {formatPrice(orderDetails.serviceCharge)}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {orderDetails.discount > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                                  <span className="d-block">
                                    {_t(t("discount"))}
                                  </span>
                                </th>
                                {orderDetails && (
                                  <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                    {formatPrice(orderDetails.discount)}
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
                        {orderDetails.serviceCharge > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                                  <span className="d-block">
                                    {_t(t("S.Charge"))}
                                    {orderDetails &&
                                      "(" + orderDetails.serviceCharge + "%)"}
                                  </span>
                                </th>

                                {orderDetails && (
                                  <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                    {formatPrice(
                                      theSubTotal *
                                        (orderDetails.serviceCharge / 100)
                                    )}
                                  </td>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {orderDetails.discount > 0 && (
                          <table className="table mb-0 table-borderless">
                            <tbody>
                              <tr>
                                <th className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                                  <span className="d-block">
                                    {_t(t("discount"))}
                                    {orderDetails &&
                                      "(" + orderDetails.discount + "%)"}
                                  </span>
                                </th>
                                {orderDetails && (
                                  <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                                    {formatPrice(
                                      theSubTotal *
                                        (orderDetails.discount / 100)
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
                          <th className="fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                            <span className="d-block">
                              {_t(t("grand total"))}
                            </span>
                          </th>
                          <td className="fk-print-text text-capitalize text-right" style={{fontSize: '14px'}}>
                            {formatPrice(totalPayable)}
                          </td>
                        </tr>
                        {/* <tr>
                          <th className="fk-print-text xsm-text text-capitalize">
                            <span className="d-block">
                              {_t(t("Return Amount"))}
                            </span>
                          </th>
                          <td className="fk-print-text xsm-text text-capitalize text-right">
                            {formatPrice(returnMoneyUsd)}
                          </td>
                        </tr> */}
                      </tbody>
                    </table>

                    <div className="myBorder"></div>
                    <p className="mb-0 fk-print-text text-center text-capitalize" style={{fontSize: '14px'}}>
                      {getSystemSettings(generalSettings, "type_print_footer")}
                    </p>
                    <p className="mb-0 fk-print-text text-capitalize text-center" style={{fontSize: '14px'}}>
                      {_t(t("bill prepared by"))}:{" "}
                      {authUserInfo &&
                        authUserInfo.details &&
                        authUserInfo.details.name}
                    </p>

                    {orderDetails.newCustomer ? (
                      <>
                      <br/>
                        {/* <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize text-center">
                          {_t(t("Customer Copy"))}
                        </p> */}
                        <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize">
                          Customer Name :{" "}
                          {orderDetails.newCustomerInfo &&
                            orderDetails.newCustomerInfo.name}
                        </p>
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Address :{" "}
                          {orderDetails.newCustomerInfo &&
                            orderDetails.newCustomerInfo.address}
                        </p>
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Phone :{" "}
                          {orderDetails.newCustomerInfo &&
                            orderDetails.newCustomerInfo.number}
                        </p>
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Zipcode :{" "}
                          {orderDetails.newCustomerInfo &&
                            orderDetails.newCustomerInfo.zipcode}
                        </p>
                      </>
                    ) : (
                      <>
                      <br/>
                        {/* <p className="mb-0 mt-0 sm-text fk-print-text text-capitalize text-center">
                          {_t(t("Customer Copy"))}
                        </p> */}
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Name :{" "}
                          {orderDetails.customer && orderDetails.customer.name}
                        </p>
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Address :{" "}
                          {orderDetails.customer &&
                            orderDetails.customer.address}
                        </p>
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Phone :{" "}
                          {orderDetails.customer &&
                            orderDetails.customer.phn_no}
                        </p>
                        <p className="mb-0 mt-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                          Customer Zipcode :{" "}
                          {orderDetails.customer &&
                            orderDetails.customer.zipcode}
                        </p>
                        <p className="mb-0 fk-print-text text-capitalize" style={{fontSize: '14px'}}>
                      {_t(t("date"))}: <Moment format="LL">{new Date()}</Moment>
                      {", "}
                      {orderDetails && (
                        <Moment format="LT">{orderDetails.token.time}</Moment>
                      )}
                    </p>
                    {/* <p className="mb-0 xsm-text fk-print-text text-capitalize">
                      {_t(t("Total guests"))}:{" "}
                      {orderDetails && orderDetails.total_guest}
                    </p> */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print bill kitchen */}
      <div className="d-none">
        <div ref={component2Ref}>
          {newOrder && (
            <div className="fk-print">
              <div className="container">
                <div className="row">
                  <div className="col-12">
                    <span className="d-block fk-print-text fk-print-text--bold text-uppercase text-center lg-text">
                      {_t(t("Token No"))}-
                      {orderDetails && orderDetails.token.id}
                    </span>
                    <p className="mb-0 fk-print-text text-capitalize lg-text fk-print-text--bold">
                      {orderDetails &&
                        orderDetails.dept_tag &&
                        orderDetails.dept_tag.name}
                    </p>
                    <p className="mb-0 mt-0 fk-print-text text-capitalize text-center">
                      {_t(t("kitchen orders"))}
                    </p>

                    <table className="table mb-0 table-borderless">
                      <tbody>
                        {orderFoodGroups &&
                          orderFoodGroups.map((theGrp, grpIndex) => {
                            return (
                              <>
                                <tr>
                                  <td className="text-center">
                                    <div
                                      className={`${
                                        grpIndex === 0
                                          ? "myBorder"
                                          : "myBorderBottom"
                                      } lg-text fk-print-text--bold fk-print-text`}
                                    >
                                      {theGrp.name}
                                    </div>
                                  </td>
                                </tr>

                                {newOrder.map((printItem, printItemIndex) => {
                                  if (
                                    theGrp.id ===
                                    parseInt(printItem.item.food_group_id)
                                  ) {
                                    return (
                                      <>
                                        <tr className="myBorderBottom">
                                          <th className="fk-print-text text-capitalize">
                                            <div className="d-flex flex-wrap">
                                              <span className="d-inline-block lg-text fk-print-text--bold fk-print-text">
                                                {printItem.item.name}
                                              </span>
                                              {parseInt(
                                                printItem.item.has_variation
                                              ) === 1 &&
                                                printItem.variation && (
                                                  <span className="d-inline-block lg-text fk-print-text--bold fk-print-text">
                                                    (
                                                    {
                                                      printItem.variation
                                                        .variation_name
                                                    }
                                                    )
                                                  </span>
                                                )}
                                              :-{printItem.quantity}|{" "}
                                              <span>
                                                <b>Note:</b>
                                                {printItem.item.note}
                                              </span>
                                            </div>

                                            {/* properties */}
                                            {printItem.properties &&
                                              printItem.properties.length > 0 &&
                                              selectedPropertyGroup[
                                                printItemIndex
                                              ] !== undefined &&
                                              selectedPropertyGroup[
                                                printItemIndex
                                              ].map((thisIsGroup) => {
                                                let theGroup =
                                                  propertyGroupForSearch &&
                                                  propertyGroupForSearch.find(
                                                    (theItem) => {
                                                      return (
                                                        theItem.id ===
                                                        thisIsGroup
                                                      );
                                                    }
                                                  );
                                                return (
                                                  <div className="d-flex flex-wrap">
                                                    {printItem.properties.map(
                                                      (
                                                        propertyName,
                                                        propertyIndex
                                                      ) => {
                                                        if (
                                                          parseInt(
                                                            propertyName.item
                                                              .property_group_id
                                                          ) === theGroup.id
                                                        ) {
                                                          return (
                                                            <span className="text-capitalize d-inline-block mr-1 fk-print-text lg-text fk-print-text--bold">
                                                              {
                                                                propertyName
                                                                  .item.name
                                                              }{" "}
                                                              <span>
                                                                {" "}
                                                                {propertyName.quantity >
                                                                  1 &&
                                                                  "(" +
                                                                    propertyName.quantity +
                                                                    ")"}
                                                              </span>
                                                              {printItem
                                                                .properties
                                                                .length -
                                                                1 !==
                                                                propertyIndex &&
                                                                ","}
                                                            </span>
                                                          );
                                                        } else {
                                                          return true;
                                                        }
                                                      }
                                                    )}
                                                  </div>
                                                );
                                              })}
                                          </th>
                                        </tr>
                                      </>
                                    );
                                  }
                                })}
                              </>
                            );
                          })}
                      </tbody>
                    </table>

                    <div className="">
                      <p className="mb-0 xsm-text fk-print-text text-capitalize lg-text fk-print-text--bold">
                        {_t(t("date"))}:{" "}
                        <Moment format="LL">{new Date()}</Moment>
                      </p>
                      <p className="mb-0 xsm-text fk-print-text text-capitalize lg-text fk-print-text--bold">
                        {_t(t("Time"))}:
                        {orderDetails && (
                          <Moment format="LT">{orderDetails.token.time}</Moment>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Addons  */}
      <div className="modal fade" id="menuAddons" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header align-items-start">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {foodItem.selectedItem !== null && foodItem.selectedItem.name}
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
              {/* Variations */}
              <div className="fk-sm-card__container">
                <div className="fk-sm-card__content">
                  <h6 className="text-capitalize fk-sm-card__title t-mb-5">
                    {_t(t("Variations"))}
                  </h6>
                </div>
                {foodItem.variations && (
                  <span className="text-capitalize xxsm-text fk-badge fk-badge--secondary">
                    {_t(t("Required"))}
                  </span>
                )}
              </div>
              <hr />
              <ul className="t-list addons-list">
                {foodItem.variations ? (
                  <>
                    {foodItem.variations.map((variationItem) => {
                      return (
                        <li className="addons-list__item">
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="col">
                              <label className="mx-checkbox flex-grow-1">
                                <input
                                  type="checkbox"
                                  className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                  name="variation"
                                  onChange={() => {
                                    handleOrderItemVariation(variationItem);
                                  }}
                                  checked={checkChecked(variationItem)}
                                />
                                <span className="mx-checkbox__text text-capitalize t-text-heading t-ml-8">
                                  {variationItem.variation_name}
                                </span>
                              </label>
                            </div>
                            <div className="col text-right">
                              <span className="t-text-heading text-uppercase sm-text flex-grow-1">
                                {currencySymbolLeft()}
                                {formatPrice(
                                  variationItem.food_with_variation_price
                                )}
                                {currencySymbolRight()}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </>
                ) : (
                  <li className="addons-list__item">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="col text-center text-primary text-uppercase">
                        {_t(t("No Variations"))}
                      </div>
                    </div>
                  </li>
                )}
                {/* Variations end*/}
              </ul>

              <div className={foodItem.properties ? "" : "d-none"}>
                {/* Property group and items */}
                {foodItem.properties && (
                  <>
                    {foodItem.properties.length > 0 ? (
                      foodItem.properties.map((propertyItem) => {
                        let selectedGroup = null;
                        //property group
                        if (propertyItem.length > 0) {
                          selectedGroup =
                            propertyGroupForSearch &&
                            propertyGroupForSearch.find(
                              (singlePropertyGroup) => {
                                return (
                                  singlePropertyGroup.id ===
                                  parseInt(propertyItem[0].property_group_id)
                                );
                              }
                            );
                        }

                        return (
                          <>
                            <div className="fk-sm-card__container t-mt-30">
                              <div className="fk-sm-card__content">
                                <h6 className="text-capitalize fk-sm-card__title t-mb-5">
                                  {selectedGroup && selectedGroup.name}
                                </h6>
                              </div>
                              <span className="text-capitalize xxsm-text fk-badge fk-badge--secondary">
                                {_t(t("Optional"))}
                              </span>
                            </div>
                            <hr />
                            <ul className="t-list addons-list">
                              {propertyItem.map((eachItem) => {
                                return (
                                  <li className="addons-list__item">
                                    <div className="d-flex align-items-center justify-content-between">
                                      <div className="col">
                                        <label className="mx-checkbox flex-grow-1">
                                          <input
                                            type="checkbox"
                                            className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                            onChange={() => {
                                              newOrder &&
                                                newOrder.map(
                                                  (newOrderItem, index) => {
                                                    if (
                                                      index ===
                                                      activeItemInOrder
                                                    ) {
                                                      if (
                                                        newOrderItem.properties
                                                      ) {
                                                        let theItem =
                                                          newOrderItem.properties.find(
                                                            (
                                                              eachPropertyItem
                                                            ) => {
                                                              return (
                                                                eachPropertyItem
                                                                  .item.id ===
                                                                eachItem.id
                                                              );
                                                            }
                                                          );

                                                        if (
                                                          theItem === undefined
                                                        ) {
                                                          handleAddProperties(
                                                            eachItem
                                                          );
                                                        } else {
                                                          handleRemoveProperties(
                                                            eachItem
                                                          );
                                                        }
                                                      } else {
                                                        handleAddProperties(
                                                          eachItem
                                                        );
                                                      }
                                                    }
                                                  }
                                                );
                                            }}
                                            checked={checkCheckedProperties(
                                              eachItem
                                            )}
                                          />
                                          <span className="mx-checkbox__text text-capitalize t-text-heading t-ml-8">
                                            {eachItem.name}
                                          </span>
                                        </label>
                                      </div>
                                      <div className="col">
                                        <div className="fk-qty flex-grow-1 justify-content-end">
                                          {parseInt(
                                            eachItem.allow_multi_quantity
                                          ) === 1 && (
                                            <span
                                              className="fk-qty__icon fk-qty__deduct"
                                              onClick={() => {
                                                handlePropertyQty(
                                                  eachItem,
                                                  "-"
                                                );
                                              }}
                                            >
                                              <i className="las la-minus"></i>
                                            </span>
                                          )}
                                          {parseInt(
                                            eachItem.allow_multi_quantity
                                          ) === 1 ? (
                                            <input
                                              type="text"
                                              value={checkCheckedPropertyQuantity(
                                                eachItem
                                              )}
                                              className="fk-qty__input t-bg-clear"
                                              readOnly
                                            />
                                          ) : (
                                            "-"
                                          )}
                                          {parseInt(
                                            eachItem.allow_multi_quantity
                                          ) === 1 && (
                                            <span
                                              className="fk-qty__icon fk-qty__add"
                                              onClick={() => {
                                                handlePropertyQty(
                                                  eachItem,
                                                  "+"
                                                );
                                              }}
                                            >
                                              <i className="las la-plus"></i>
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="col text-right">
                                        <span className="t-text-heading text-uppercase sm-text flex-grow-1">
                                          {currencySymbolLeft()}
                                          {formatPrice(eachItem.extra_price)}
                                          {currencySymbolRight()}
                                        </span>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                            <hr />
                          </>
                        );
                      })
                    ) : (
                      <li className="addons-list__item">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="col text-center text-primary text-uppercase">
                            {_t(t("No properties"))}
                          </div>
                        </div>
                      </li>
                    )}
                  </>
                )}
              </div>
              {/* Property group and items */}
            </div>
          </div>
        </div>
      </div>
      {/* Menu Addons End */}

      {/* Show Cart  */}
      <div className="modal fade" id="showCart" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <h3>{_t(t("Order details"))}</h3>
              <button
                type="button"
                className="btn-close"
                data-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-12">
                  <span className="sm-text font-weight-bold text-uppercase font-italic">
                    {_t(t("Order token"))}:{" "}
                    {newOrder ? (
                      <>
                        #{orderDetails.token.id} -{" "}
                        <Moment format="LT">{orderDetails.token.time}</Moment>
                      </>
                    ) : (
                      ""
                    )}
                  </span>
                </div>
              </div>
              <div className="fk-sm-card__container t-mt-30">
                <div className="fk-sm-card__content">
                  <h6 className="text-capitalize fk-sm-card__title t-mb-5">
                    {_t(t("order items"))}
                  </h6>
                </div>
              </div>
              <hr />
              <ul className="t-list addons-list">
                {/* loop through order list items */}
                {newOrder && newOrder.length > 0 ? (
                  newOrder.map((orderListItem, orderListItemIndex) => {
                    return (
                      <>
                        <li
                          className={`addons-list__item px-1 ${
                            orderListItemIndex === activeItemInOrder && "active"
                          }`}
                        >
                          <div
                            className="d-flex align-items-center justify-content-between"
                            onClick={(e) => {
                              e.preventDefault();
                              //orderListItem's group wise all items
                              let tempItems =
                                foodForSearch &&
                                foodForSearch.filter((tempItem) => {
                                  return (
                                    tempItem.food_group_id ===
                                    orderListItem.item.food_group_id
                                  );
                                });

                              //orderListItem's group
                              let foodGroup =
                                foodGroupForSearch &&
                                foodGroupForSearch.find((groupItem) => {
                                  return (
                                    groupItem.id ===
                                    parseInt(orderListItem.item.food_group_id)
                                  );
                                });

                              // selected pos item
                              let selectedItemTemp =
                                tempItems &&
                                tempItems.find((tempSelectedItem) => {
                                  return (
                                    tempSelectedItem.id ===
                                    orderListItem.item.id
                                  );
                                });

                              // Set variations, properties, selected item
                              setFoodItem({
                                ...foodItem,
                                foodGroup: foodGroup,
                                items: tempItems,
                                selectedItem: selectedItemTemp,
                                variations:
                                  selectedItemTemp &&
                                  parseInt(selectedItemTemp.has_variation) === 1
                                    ? selectedItemTemp.variations
                                    : null,
                                properties:
                                  selectedItemTemp &&
                                  parseInt(selectedItemTemp.has_property) === 1
                                    ? selectedItemTemp.properties
                                    : null,
                              });

                              //set active order list index for background color of selected
                              setActiveItemInOrder(orderListItemIndex);
                            }}
                          >
                            <div className="col">
                              <span
                                className={`t-text-heading sm-text text-capitalize d-block ${
                                  orderListItemIndex === activeItemInOrder &&
                                  "text-white"
                                }`}
                              >
                                {orderListItem.item.name}
                              </span>
                              {parseInt(orderListItem.item.has_variation) ===
                                1 &&
                                orderListItem.variation && (
                                  <span
                                    className={`xxsm-text text-capitalize d-block ${
                                      orderListItemIndex ===
                                        activeItemInOrder && "text-white"
                                    }`}
                                  >
                                    {_t(t("Variation"))}:{" "}
                                    {orderListItem.variation.variation_name}
                                  </span>
                                )}

                              {/* properties */}
                              {orderListItem.properties &&
                                orderListItem.properties.length > 0 &&
                                selectedPropertyGroup[orderListItemIndex] !==
                                  undefined &&
                                selectedPropertyGroup[orderListItemIndex].map(
                                  (thisIsGroup) => {
                                    let theGroup =
                                      propertyGroupForSearch &&
                                      propertyGroupForSearch.find((theItem) => {
                                        return theItem.id === thisIsGroup;
                                      });
                                    return (
                                      <div className="d-block">
                                        <span className="text-capitalize xxsm-text d-inline-block mr-1">
                                          {theGroup && theGroup.name} :
                                        </span>
                                        {orderListItem.properties.map(
                                          (propertyName, propertyIndex) => {
                                            if (
                                              parseInt(
                                                propertyName.item
                                                  .property_group_id
                                              ) === theGroup.id
                                            ) {
                                              return (
                                                <span className="text-capitalize xxsm-text d-inline-block mr-1">
                                                  {propertyName.item.name}{" "}
                                                  <span>
                                                    {" "}
                                                    {propertyName.quantity >
                                                      1 &&
                                                      "(" +
                                                        propertyName.quantity +
                                                        ")"}
                                                  </span>
                                                  {orderListItem.properties
                                                    .length -
                                                    1 !==
                                                    propertyIndex && ","}
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
                                )}
                            </div>

                            {/* Quantity */}
                            <div className="col">
                              <div className="fk-qty flex-grow-1 justify-content-end">
                                <span
                                  className="fk-qty__icon"
                                  onClick={() => {
                                    handleOrderItemQty("-");
                                  }}
                                >
                                  <i className="las la-minus"></i>
                                </span>
                                <input
                                  type="text"
                                  value={orderListItem.quantity}
                                  className={`fk-qty__input t-bg-clear ${
                                    orderListItemIndex === activeItemInOrder &&
                                    "text-white"
                                  }`}
                                  readOnly
                                />
                                <span
                                  className="fk-qty__icon"
                                  onClick={() => {
                                    handleOrderItemQty("+");
                                  }}
                                >
                                  <i className="las la-plus"></i>
                                </span>
                              </div>
                            </div>

                            <div className="col text-right">
                              <span
                                className={`t-text-heading text-uppercase sm-text flex-grow-1 ${
                                  orderListItemIndex === activeItemInOrder &&
                                  "text-white"
                                }`}
                              >
                                {parseInt(orderListItem.item.has_variation) ===
                                1 ? (
                                  <>
                                    {currencySymbolLeft()}

                                    {showPriceOfEachOrderItem(
                                      orderListItemIndex
                                    )}
                                    {currencySymbolRight()}
                                  </>
                                ) : (
                                  <>
                                    {currencySymbolLeft()}
                                    {showPriceOfEachOrderItem(
                                      orderListItemIndex
                                    )}
                                    {currencySymbolRight()}
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                        <span className="text-capitalize  t-pt-5 t-pb-5 t-pl-5 t-pr-5 sm-text font-weight-bold make-this-relative-mobile">
                          <span
                            className="badge rounded-pill bg-secondary text-capitalize"
                            onClick={() => {
                              handleRemoveItemFromOrderList(orderListItemIndex);
                            }}
                          >
                            <i className="fa fa-times"></i>
                          </span>
                        </span>
                      </>
                    );
                  })
                ) : (
                  <div className="text-primary text-center font-weight-bold pt-2 xsm-text text-uppercase">
                    {_t(t("Select food item to add to the list"))}
                  </div>
                )}
              </ul>
              <hr />
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col">
                      <span className="text-capitalize sm-text">
                        {" "}
                        {_t(t("sub total"))}{" "}
                      </span>
                    </div>
                    <div className="col text-center">:</div>
                    <div className="col text-right">
                      <span className="text-capitalize sm-text font-weight-bold">
                        {newOrder ? (
                          <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                            {currencySymbolLeft()}
                            {formatPrice(theSubTotal)}
                            {currencySymbolRight()}
                          </span>
                        ) : (
                          <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                            {currencySymbolLeft()}
                            {formatPrice(0)}
                            {currencySymbolRight()}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="row">
                    <div className="col">
                      <span className="sm-text">
                        {getSystemSettings(generalSettings, "vat_system") ===
                        "igst"
                          ? `vat(${newSettings !== null && newSettings.vat})`
                          : getSystemSettings(generalSettings, "vat_system") ===
                            "cgst"
                          ? "cgst+sgst" +
                            "(" +
                            getSystemSettings(generalSettings, "cgst") +
                            "+" +
                            getSystemSettings(generalSettings, "sgst") +
                            ")"
                          : `tax(${newSettings !== null && newSettings.tax})`}
                        %:
                      </span>
                    </div>
                    <div className="col text-center">:</div>
                    <div className="col text-right">
                      <span className="text-capitalize sm-text font-weight-bold">
                        {currencySymbolLeft()}
                        {formatPrice(theVat)}
                        {currencySymbolRight()}
                      </span>
                    </div>
                  </div>
                </div>
                {getSystemSettings(generalSettings, "sDiscount") === "flat" && (
                  <>
                    <div className="col-12 mb-2">
                      <div className="row">
                        <div className="col">
                          <span className="text-capitalize sm-text">
                            {" "}
                            {_t(t("service"))}{" "}
                          </span>
                        </div>
                        <div className="col text-center">:</div>
                        <div className="col text-right">
                          <span className="text-capitalize sm-text font-weight-bold">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="text-capitalize xsm-text d-inline-block font-weight-bold form-control rounded-0 text-right"
                              onChange={(e) => {
                                if (e.target.value !== "") {
                                  setOrderDetails({
                                    ...orderDetails,
                                    serviceCharge: parseFloat(e.target.value),
                                  });
                                  let totalPayable = 0;
                                  let localCurrency = JSON.parse(
                                    localStorage.getItem("currency")
                                  );
                                  let usdServiceCharge =
                                    parseFloat(e.target.value) /
                                    localCurrency.rate;
                                  let usdDiscount =
                                    parseFloat(orderDetails.discount) /
                                    localCurrency.rate;

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;
                                  setTotalPaybale(totalPayable);
                                  setReturnMoneyUsd(totalPayable - paidMoney);
                                } else {
                                  setOrderDetails({
                                    ...orderDetails,
                                    serviceCharge: 0,
                                  });
                                  let totalPayable = 0;
                                  let localCurrency = JSON.parse(
                                    localStorage.getItem("currency")
                                  );
                                  let usdServiceCharge =
                                    parseFloat(0) / localCurrency.rate;
                                  let usdDiscount =
                                    parseFloat(orderDetails.discount) /
                                    localCurrency.rate;

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;
                                  setTotalPaybale(totalPayable);
                                  setReturnMoneyUsd(totalPayable - paidMoney);
                                }
                              }}
                              value={
                                orderDetails.serviceCharge !== 0 &&
                                orderDetails.serviceCharge
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="row">
                        <div className="col">
                          <span className="text-capitalize sm-text">
                            {" "}
                            {_t(t("discount"))}{" "}
                          </span>
                        </div>
                        <div className="col text-center">:</div>
                        <div className="col text-right">
                          <span className="text-capitalize sm-text font-weight-bold">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="text-capitalize xsm-text d-inline-block font-weight-bold form-control rounded-0 text-right"
                              onChange={(e) => {
                                if (e.target.value !== "") {
                                  setOrderDetails({
                                    ...orderDetails,
                                    discount: parseFloat(e.target.value),
                                  });
                                  let totalPayable = 0;
                                  let localCurrency = JSON.parse(
                                    localStorage.getItem("currency")
                                  );
                                  let usdServiceCharge =
                                    parseFloat(orderDetails.serviceCharge) /
                                    localCurrency.rate;
                                  let usdDiscount =
                                    parseFloat(e.target.value) /
                                    localCurrency.rate;

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;

                                  setTotalPaybale(totalPayable);
                                  setReturnMoneyUsd(totalPayable - paidMoney);
                                } else {
                                  setOrderDetails({
                                    ...orderDetails,
                                    discount: 0,
                                  });
                                  let totalPayable = 0;
                                  let localCurrency = JSON.parse(
                                    localStorage.getItem("currency")
                                  );
                                  let usdServiceCharge =
                                    parseFloat(orderDetails.serviceCharge) /
                                    localCurrency.rate;
                                  let usdDiscount =
                                    parseFloat(0) / localCurrency.rate;

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;
                                  setTotalPaybale(totalPayable);
                                  setReturnMoneyUsd(totalPayable - paidMoney);
                                }
                              }}
                              value={
                                orderDetails.discount !== 0 &&
                                orderDetails.discount
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {getSystemSettings(generalSettings, "sDiscount") ===
                  "percentage" && (
                  <>
                    <div className="col-12 mb-2">
                      <div className="row">
                        <div className="col">
                          <span className="text-capitalize sm-text">
                            {" "}
                            {_t(t("service"))}
                            {" %"}
                          </span>
                        </div>
                        <div className="col text-center">:</div>
                        <div className="col text-right">
                          <span className="text-capitalize sm-text font-weight-bold">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="text-capitalize xsm-text d-inline-block font-weight-bold form-control rounded-0 text-right"
                              onChange={(e) => {
                                if (e.target.value !== "") {
                                  setOrderDetails({
                                    ...orderDetails,
                                    serviceCharge: parseFloat(e.target.value),
                                  });
                                  let totalPayable = 0;
                                  // let localCurrency = JSON.parse(
                                  //   localStorage.getItem(
                                  //     "currency"
                                  //   )
                                  // );
                                  // let usdServiceCharge =
                                  //   parseFloat(e.target.value) /
                                  //   localCurrency.rate;
                                  // console.log("coming");
                                  let usdServiceCharge =
                                    theSubTotal *
                                    (parseFloat(e.target.value) / 100);

                                  // let usdDiscount =
                                  //   parseFloat(
                                  //     orderDetails.discount
                                  //   ) / localCurrency.rate;

                                  let usdDiscount =
                                    theSubTotal *
                                    (parseFloat(orderDetails.discount) / 100);

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;
                                  setTotalPaybale(totalPayable);
                                } else {
                                  setOrderDetails({
                                    ...orderDetails,
                                    serviceCharge: 0,
                                  });
                                  let totalPayable = 0;
                                  // let localCurrency = JSON.parse(
                                  //   localStorage.getItem(
                                  //     "currency"
                                  //   )
                                  // );
                                  // let usdServiceCharge =
                                  //   parseFloat(0) /
                                  //   localCurrency.rate;
                                  let usdServiceCharge = 0;

                                  // let usdDiscount =
                                  //   parseFloat(
                                  //     orderDetails.discount
                                  //   ) / localCurrency.rate;

                                  let usdDiscount =
                                    theSubTotal *
                                    (parseFloat(orderDetails.discount) / 100);

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;
                                  setTotalPaybale(totalPayable);
                                }
                              }}
                              value={
                                orderDetails.serviceCharge !== 0 &&
                                orderDetails.serviceCharge
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="row">
                        <div className="col">
                          <span className="text-capitalize sm-text">
                            {" "}
                            {_t(t("discount"))}
                            {" %"}
                          </span>
                        </div>
                        <div className="col text-center">:</div>
                        <div className="col text-right">
                          <span className="text-capitalize sm-text font-weight-bold">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="text-capitalize xsm-text d-inline-block font-weight-bold form-control rounded-0 text-right"
                              onChange={(e) => {
                                if (e.target.value !== "") {
                                  setOrderDetails({
                                    ...orderDetails,
                                    discount: parseFloat(e.target.value),
                                  });
                                  let totalPayable = 0;
                                  // let localCurrency = JSON.parse(
                                  //   localStorage.getItem(
                                  //     "currency"
                                  //   )
                                  // );
                                  // let usdServiceCharge =
                                  //   parseFloat(
                                  //     orderDetails.serviceCharge
                                  //   ) / localCurrency.rate;
                                  let usdServiceCharge =
                                    theSubTotal *
                                    (parseFloat(orderDetails.serviceCharge) /
                                      100);

                                  // let usdDiscount =
                                  //   parseFloat(e.target.value) /
                                  //   localCurrency.rate;

                                  let usdDiscount =
                                    theSubTotal *
                                    (parseFloat(e.target.value) / 100);

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;

                                  setTotalPaybale(totalPayable);
                                } else {
                                  setOrderDetails({
                                    ...orderDetails,
                                    discount: 0,
                                  });
                                  let totalPayable = 0;
                                  // let localCurrency = JSON.parse(
                                  //   localStorage.getItem(
                                  //     "currency"
                                  //   )
                                  // );

                                  let usdServiceCharge =
                                    theSubTotal *
                                    (parseFloat(orderDetails.serviceCharge) /
                                      100);

                                  let usdDiscount = 0;

                                  totalPayable =
                                    theSubTotal +
                                    theVat +
                                    usdServiceCharge -
                                    usdDiscount;
                                  setTotalPaybale(totalPayable);
                                }
                              }}
                              value={
                                orderDetails.discount !== 0 &&
                                orderDetails.discount
                              }
                            />
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <hr />
              <div className="row">
                <div className="col-12">
                  <div className="row">
                    <div className="col">
                      <span className="text-capitalize sm-text font-weight-bold">
                        {_t(t("total bill"))}
                      </span>
                    </div>
                    <div className="col text-center">:</div>
                    <div className="col text-right">
                      <span className="text-capitalize sm-text font-weight-bold">
                        {currencySymbolLeft()}
                        {formatPrice(totalPayable)}
                        {currencySymbolRight()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
              {returnMoneyUsd > 0 && (
                <div className="row">
                  <div className="col-12 mb-2">
                    <div className="row">
                      <div className="col">
                        <span className="text-capitalize sm-text font-weight-bold text-primary">
                          {_t(t("Return"))}
                        </span>
                      </div>
                      <div className="col text-center">:</div>
                      <div className="col text-right">
                        <span className="text-capitalize sm-text font-weight-bold text-primary">
                          {currencySymbolLeft()}
                          {formatPrice(Math.abs(returnMoneyUsd))}
                          {currencySymbolRight()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <hr />
                </div>
              )}
            </div>
            <div className="row py-2 mx-1">
              <button
                type="button"
                className="btn btn-secondary xsm-text text-uppercase col-3"
                onClick={handleCancel}
              >
                {_t(t("Cancel"))}
              </button>
              <button
                type="button"
                className="btn btn-primary xsm-text text-uppercase ml-auto mr-1 col-4"
                onClick={!loading && handleSettleOrder}
              >
                {!loading ? _t(t("settle")) : _t(t("Please wait"))}
              </button>
              <button
                type="button"
                className="btn btn-success xsm-text text-uppercase col-4"
                onClick={!loading && handleSubmitOrder}
              >
                {!loading ? _t(t("submit")) : _t(t("Please wait"))}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Show Cart End */}

      {/* Extra Info  */}
      <div className="modal fade" id="extraInfo" aria-hidden="true">
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header align-items-center">
              <div className="fk-sm-card__content">
                <h5 className="text-capitalize fk-sm-card__title">
                  {_t(t("additional information"))}
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
              <ul className="t-list addons-list">
                {authUserInfo.details &&
                  authUserInfo.details.user_type !== "staff" && (
                    <li className="addons-list__item mt-1 mx-1">
                      {/* <Select
                        options={branchForSearch && branchForSearch}
                        components={makeAnimated()}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.name}
                        classNamePrefix="select"
                        className="xsm-text"
                        onChange={handleSetBranch}
                        maxMenuHeight="200px"
                        placeholder={_t(t("Branch")) + ".."}
                      /> */}
                      {branchForSearch[0].name}
                    </li>
                  )}
                {!loading && (
                  <>
                    {orderDetails.branch !== null && (
                      <>
                        <li
                          className={`addons-list__item mx-1 ${
                            authUserInfo.details &&
                            authUserInfo.details.user_type === "staff" &&
                            "mt-1"
                          }`}
                        >
                          <Select
                            options={
                              orderDetailUsers.theCustomers !== null &&
                              orderDetailUsers.theCustomers
                            }
                            components={makeAnimated()}
                            getOptionLabel={(option) =>
                              option.name + " (" + option.phn_no + ")"
                            }
                            getOptionValue={(option) => option.name}
                            classNamePrefix="select"
                            className="xsm-text"
                            onChange={handleSetCustomer}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Customer")) + ".."}
                          />
                        </li>
                        <li className="addons-list__item mx-1 border border-2 rounded-lg">
                          <div className="btn-group w-100">
                            <button
                              type="button"
                              className="fk-right-nav__guest-btn btn w-100 t-bg-white dropdown-toggle new-customer-pos xsm-text pl-2"
                              data-toggle="dropdown"
                              aria-expanded="false"
                            >
                              + {_t(t("Customer"))}?
                            </button>
                            <ul className="dropdown-menu w-100 border-0 pt-4 change-background">
                              <li>
                                <input
                                  type="text"
                                  name="name"
                                  className="form-control font-10px rounded-lg"
                                  placeholder="Name"
                                  autoComplete="off"
                                  value={orderDetails.newCustomerInfo.name}
                                  onChange={handleNewCustomer}
                                />
                              </li>
                              <li className="pb-2">
                                <input
                                  type="text"
                                  name="number"
                                  className="form-control font-10px mt-2 rounded-lg"
                                  autoComplete="off"
                                  placeholder="Number"
                                  value={orderDetails.newCustomerInfo.number}
                                  onChange={handleNewCustomer}
                                />
                              </li>
                              <li className="pb-2">
                                <input
                                  type="text"
                                  name="address"
                                  className="form-control font-10px mt-2 rounded-lg"
                                  autoComplete="off"
                                  placeholder="Address"
                                  value={orderDetails.newCustomerInfo.address}
                                  onChange={handleNewCustomer}
                                />
                              </li>
                              <li className="pb-2">
                                <input
                                  type="text"
                                  name="zipcode"
                                  className="form-control font-10px mt-2 rounded-lg"
                                  autoComplete="off"
                                  placeholder="Zipcode"
                                  value={orderDetails.newCustomerInfo.zipcode}
                                  onChange={handleNewCustomer}
                                />
                              </li>
                              <li className="pb-1 text-right">
                                <button
                                  className="btn t-bg-white text-dark xsm-text text-uppercase btn-sm py-0 px-2 mr-1"
                                  onClick={() => {
                                    setOrderDetails({
                                      ...orderDetails,
                                      newCustomer: false,
                                      newCustomerInfo: {
                                        name: "",
                                        number: "",
                                        address: "",
                                        zipcode: "",
                                      },
                                    });
                                  }}
                                >
                                  {_t(t("Cancel"))}
                                </button>
                              </li>
                            </ul>
                          </div>
                        </li>

                        <li className="addons-list__item mx-1">
                          <Select
                            options={deptTagForSearch && deptTagForSearch}
                            components={makeAnimated()}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            classNamePrefix="select"
                            className="xsm-text"
                            onChange={handleSetDeptTag}
                            maxMenuHeight="200px"
                            placeholder={_t(t("Dept tag")) + ".."}
                          />
                        </li>
                        <li
                          className={`addons-list__item mx-1 payment-type-parent ${
                            orderDetails.payment_type !== null && "mb-1"
                          }`}
                        >
                          <Select
                            options={
                              paymentTypeForSearch && paymentTypeForSearch
                            }
                            components={makeAnimated()}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.name}
                            classNamePrefix="select"
                            className="xsm-text"
                            onChange={handleSetpaymentType}
                            maxMenuHeight="200px"
                            isMulti
                            backspaceRemovesValue={false}
                            clearIndicator={null}
                            placeholder={_t(t("Payments")) + ".."}
                          />
                        </li>
                        {orderDetails.payment_type !== null && (
                          <div className="border mt-0 mb-2 change-background mx-1 rounded-lg">
                            <div className="xsm-text text-center text-white pt-1">
                              {_t(t("Amount"))}
                            </div>
                            {orderDetails.payment_type.map(
                              (eachPaymentType, paymentTypeIndex) => {
                                return (
                                  <li className="addons-list__item mx-1 mb-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      name={eachPaymentType.id}
                                      autoComplete="off"
                                      className="form-control xsm-text pl-2"
                                      onChange={handlePaymentTypeAmount}
                                      placeholder={eachPaymentType.name}
                                      value={
                                        orderDetails.payment_amount &&
                                        orderDetails.payment_amount[
                                          eachPaymentType.id
                                        ]
                                      }
                                    />
                                  </li>
                                );
                              }
                            )}
                          </div>
                        )}

                        {getSystemSettings(generalSettings, "table_waiter") ===
                        "1" ? (
                          <>
                            <li className="addons-list__item mx-1">
                              <Select
                                options={
                                  orderDetailUsers.theTables !== null &&
                                  orderDetailUsers.theTables
                                }
                                components={makeAnimated()}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.name}
                                classNamePrefix="select"
                                className="xsm-text"
                                onChange={handleSetTable}
                                maxMenuHeight="200px"
                                placeholder={_t(t("Table")) + ".."}
                              />
                            </li>
                            <li className="addons-list__item mx-1">
                              <Select
                                options={
                                  orderDetailUsers.theWaiters !== null &&
                                  orderDetailUsers.theWaiters
                                }
                                components={makeAnimated()}
                                getOptionLabel={(option) => option.name}
                                getOptionValue={(option) => option.name}
                                classNamePrefix="select"
                                className="xsm-text"
                                onChange={handleSetWaiter}
                                maxMenuHeight="200px"
                                placeholder={_t(t("Waiter")) + ".."}
                              />
                            </li>
                          </>
                        ) : (
                          ""
                        )}

                        <li className="addons-list__item mx-1">
                          <input
                            type="number"
                            className="form-control xsm-text py-2 pl-2"
                            min="1"
                            onChange={handleTotalGuest}
                            placeholder={_t(t("Total guests")) + ".."}
                          />
                        </li>
                      </>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Info End */}
      <div className={` ${showSettle ? "d-none" : ""}`}>
        <main id="main" data-simplebar>
          {/* Mobile Screen Only   */}
          <div className="d-md-none t-mb-15">
            {/* Show start work period options here */}
            {/* {newSettings && newSettings.workPeriod === null && (
              <div className="fk-left-overlay">
                <div className="fk-left-overlay__content text-center m-auto">
                  <h5
                    className={`text-primary text-uppercase ${
                      authUserInfo.details &&
                      authUserInfo.details.user_type !== "staff" &&
                      "mb-0"
                    }`}
                  >
                    {authUserInfo.details &&
                    authUserInfo.details.user_type !== "staff"
                      ? _t(t("Select branch to active POS"))
                      : _t(t("start workperiod"))}
                  </h5>
                  {authUserInfo.details &&
                    authUserInfo.details.user_type !== "staff" && (
                      <>
                        <h6 className="mt-1 text-uppercase xsm-text mb-1">
                          {_t(t("Start workperiod if it is not started"))}
                        </h6>
                        <small className="d-flex justify-content-center text-lowercase xsm-text mt-0 mb-2">
                          (
                          {_t(
                            t(
                              "Use staff account not to see this multiple times"
                            )
                          )}
                          )
                        </small>
                      </>
                    )}
                  <NavLink
                    to="/dashboard"
                    className="t-heading-font btn btn-primary btn-sm text-uppercase sm-text"
                  >
                    {_t(t("Goto Dashboard"))}
                  </NavLink>
                </div>
              </div>
            )} */}
            {/* Show start work period options here */}
            {foodGroupForSearch &&
              foodGroupForSearch.map((mobileGroup, mobileGroupIndex) => {
                let tempItems =
                  foodForSearch &&
                  foodForSearch.filter((tempItem) => {
                    return parseInt(tempItem.food_group_id) === mobileGroup.id;
                  });
                return (
                  <div
                    className="fk-sm-card t-mt-10"
                    id={`card-${mobileGroupIndex + 1}`}
                  >
                    <h3 className="mt-0 t-mb-30 text-capitalize">
                      {mobileGroup.name}
                    </h3>
                    <ul className="t-list fk-sm-card-list">
                      {tempItems !== null && tempItems.length > 0
                        ? [
                            tempItems.map((mobileItem, mobileItemIndex) => {
                              return (
                                <li
                                  className="fk-sm-card-list__item"
                                  data-toggle={
                                    handleGetStock(mobileItem.id) === 0
                                      ? ""
                                      : "modal"
                                  }
                                  data-target={
                                    handleGetStock(mobileItem.id) === 0
                                      ? ""
                                      : "#menuAddons"
                                  }
                                  key={mobileItemIndex}
                                  onClick={() => {
                                    // if manage is stock is enable
                                    if (showManageStock) {
                                      if (handleGetStock(mobileItem.id) === 0) {
                                        toast.error(
                                          `${_t(t("Out of stock"))}`,
                                          {
                                            position: "bottom-center",
                                            closeButton: false,
                                            autoClose: 10000,
                                            hideProgressBar: false,
                                            closeOnClick: true,
                                            pauseOnHover: true,
                                            className:
                                              "text-center toast-notification",
                                          }
                                        );
                                      } else {
                                        //set active item in order list
                                        setActiveItemInOrder(mobileItemIndex);
                                        // set variations, properties and selected items here
                                        setFoodItem({
                                          ...foodItem,
                                          foodGroup: mobileGroup,
                                          selectedItem: mobileItem,
                                          variations:
                                            mobileItem &&
                                            parseInt(
                                              mobileItem.has_variation
                                            ) === 1
                                              ? mobileItem.variations
                                              : null,
                                          properties:
                                            mobileItem &&
                                            parseInt(
                                              mobileItem.has_property
                                            ) === 1
                                              ? mobileItem.properties
                                              : null,
                                        });
                                        handleOrderItem(mobileItem);
                                      }
                                    } else {
                                      setActiveItemInOrder(mobileItemIndex);
                                      // set variations, properties and selected items here
                                      setFoodItem({
                                        ...foodItem,
                                        foodGroup: mobileGroup,
                                        selectedItem: mobileItem,
                                        variations:
                                          mobileItem &&
                                          parseInt(mobileItem.has_variation) ===
                                            1
                                            ? mobileItem.variations
                                            : null,
                                        properties:
                                          mobileItem &&
                                          parseInt(mobileItem.has_property) ===
                                            1
                                            ? mobileItem.properties
                                            : null,
                                      });
                                      handleOrderItem(mobileItem);
                                    }
                                  }}
                                >
                                  <div className="fk-sm-card__container align-items-center">
                                    <div className="fk-sm-card__content">
                                      <h6 className="text-capitalize fk-sm-card__title">
                                        {/* {mobileItem.name}, {_t(t("In Stock"))}:{" "}
                                      {handleGetStock(mobileItem.id)} */}
                                        stock na thakleo baire theke khuje ene
                                        dibo
                                      </h6>
                                      {mobileItem.has_variation === "0" && (
                                        <p className="t-mt-10 mb-0 sm-text text-uppercase t-text-dark--light-20">
                                          {currencySymbolLeft()}
                                          {formatPrice(
                                            parseFloat(mobileItem.price)
                                          )}
                                          {currencySymbolRight()}
                                        </p>
                                      )}
                                    </div>
                                    <div className="fk-sm-card__action">
                                      <div
                                        className="fk-sm-card__img fk-sm-card__img--1"
                                        style={{
                                          backgroundImage: `url(${mobileItem.image})`,
                                        }}
                                      ></div>
                                      <div className="fk-sm-card__cart">
                                        <i className="las la-plus"></i>
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            }),
                          ]
                        : ""}
                    </ul>
                  </div>
                );
              })}

            <div className="fk-sm-footnav" style={{ zIndex: 10 }}>
              <div className="fk-sm-footnav__container">
                <ul className="t-list fk-sm-footnav__list justify-content-center">
                  <li
                    className="fk-sm-footnav__list-item"
                    data-toggle="modal"
                    data-target="#extraInfo"
                  >
                    <span className="t-link fk-sm-footnav__link">
                      <i className="las la-edit"></i>
                    </span>
                  </li>
                  <li
                    className="fk-sm-footnav__list-item"
                    data-toggle="modal"
                    data-target="#showCart"
                  >
                    <span className="t-link fk-sm-footnav__link">
                      <i className="las la-shopping-cart"></i>
                    </span>
                  </li>
                  <li className="fk-sm-footnav__list-item">
                    <NavLink
                      to="/dashboard/pos/submitted"
                      className="t-link fk-sm-footnav__link"
                    >
                      <i className="las la-share-square"></i>
                    </NavLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* Mobile Screen Only   */}

          {/* Show In Tab   */}
          <div className="fk-main d-none d-md-block t-mt-10">
            <div className="container-fluid">
              <div className="row gx-2">
                {/* Left Side  */}
                <div className="col-md-7">
                  <div className="fk-left-over">
                    {/* Show start work period options here */}
                    {/* {newSettings && newSettings.workPeriod === "null" && (
                      <div className="fk-left-overlay">
                        <div className="fk-left-overlay__content text-center m-auto">
                          <h5
                            className={`text-primary text-uppercase ${
                              authUserInfo.details &&
                              authUserInfo.details.user_type !== "staff" &&
                              "mb-0"
                            }`}
                          >
                            {authUserInfo.details &&
                            authUserInfo.details.user_type !== "staff"
                              ? _t(t("Select branch to active POS"))
                              : _t(t("start workperiod"))}
                          </h5>
                          {authUserInfo.details &&
                            authUserInfo.details.user_type !== "staff" && (
                              <>
                                <h6 className="mt-1 text-uppercase xsm-text mb-1">
                                  {_t(
                                    t("Start workperiod if it is not started")
                                  )}
                                </h6>
                                <small className="d-flex justify-content-center text-lowercase xsm-text mt-0 mb-2">
                                  (
                                  {_t(
                                    t(
                                      "Use staff account not to see this multiple times"
                                    )
                                  )}
                                  )
                                </small>
                              </>
                            )}
                          <NavLink
                            to="/dashboard"
                            className="t-heading-font btn btn-primary btn-sm text-uppercase sm-text"
                          >
                            {_t(t("Goto Dashboard"))}
                          </NavLink>
                        </div>
                      </div>
                    )} */}
                    {/* Show start work period options here */}

                    <div className="row gx-2 align-items-center">
                      {/* <div className="col-md-4 col-lg-5 col-xl-6 col-xxl-7">
                        <NavLink
                          to="/dashboard/pos/online-orders"
                          className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-outline-danger xsm-text text-uppercase text-center w-100"
                        >
                          {_t(t("Online Orders"))}{" "}
                          {onlineCounter > 0 && (
                            <span className="bg-danger text-white p-2 rounded-md">
                              ({onlineCounter})
                            </span>
                          )}
                        </NavLink>
                      </div> */}
                      <div className="col-md-12 col-lg-12 col-xl-12 col-xxl-12">
                        <div className="row align-items-center gx-2">
                          <div className="col">
                          <input type="text" className="form-control" placeholder="Search item type..." onChange={handleSearch}></input>
                          </div>
                          <div className="col">
                            {window.location.pathname ===
                            "/dashboard/pos/settled" ? (
                              <NavLink
                                to="/refresh"
                                className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-success xsm-text text-uppercase text-center w-100"
                              >
                                {_t(t("Settled"))}
                              </NavLink>
                            ) : (
                              <NavLink
                                to="/dashboard/pos/settled"
                                className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-success xsm-text text-uppercase text-center w-100"
                              >
                                {_t(t("Settled"))}
                              </NavLink>
                            )}
                          </div>
                          <div className="col">
                            {window.location.pathname ===
                            "/dashboard/pos/submitted" ? (
                              <NavLink
                                to="/refresh"
                                className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-primary xsm-text text-uppercase text-center w-100"
                              >
                                {_t(t("Submitted"))}
                              </NavLink>
                            ) : (
                              <NavLink
                                to="/dashboard/pos/submitted"
                                className="t-link t-pt-8 t-pb-8 t-pl-12 t-pr-12 btn btn-primary xsm-text text-uppercase text-center w-100"
                              >
                                {_t(t("Submitted"))}
                              </NavLink>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row t-mt-10 gx-2">
                      {/* Left Menu   */}
                      <div className="col-md-4 col-xl-3">
                        <div className="fk-scroll--pos-menu" data-simplebar>
                          <ul className="t-list fk-pos-nav list-group">
                            {getSystemSettings(
                              generalSettings,
                              "pos_screen"
                            ) === "1" &&
                              deptTagForSearch && (
                                <>
                                  {deptTagForSearch.map(
                                    (deptItem, deptItemIndex) => {
                                      return (
                                        <li
                                          className={`t-mb-10 ${
                                            deptItemIndex ===
                                            deptTagForSearch.length - 1
                                              ? "t-mb-30"
                                              : ""
                                          }`}
                                        >
                                          <style></style>
                                          <button
                                            className={`button arrow text-uppercase ${
                                              orderDetails &&
                                              orderDetails.dept_tag &&
                                              orderDetails.dept_tag.id ===
                                                deptItem.id
                                                ? "active"
                                                : ""
                                            }`}
                                            onClick={() => {
                                              handleSetDeptTag(deptItem);
                                            }}
                                          >
                                            {deptItem.name}
                                          </button>
                                        </li>
                                      );
                                    }
                                  )}
                                </>
                              )}

                            {/* Food groups */}
                            {foodGroupForSearch &&
                              foodGroupForSearch.map(
                                (groupItem, groupIndex) => {
                                  return (
                                    <li
                                      className="fk-pos-nav__list"
                                      key={groupIndex}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // set active group, group items, initial item active, todo:: set variations and properties
                                          let tempItems =
                                            foodForSearch &&
                                            foodForSearch.filter((tempItem) => {
                                              return (
                                                parseInt(
                                                  tempItem.food_group_id
                                                ) === groupItem.id
                                              );
                                            });

                                          if (
                                            tempItems &&
                                            tempItems.length > 0
                                          ) {
                                            setFoodItem({
                                              ...foodItem,
                                              foodGroup: groupItem,
                                              items: tempItems,
                                              selectedItem:
                                                tempItems && tempItems[0],
                                              variations:
                                                tempItems &&
                                                parseInt(
                                                  tempItems[0].has_variation
                                                ) === 1
                                                  ? tempItems[0].variations
                                                  : null,
                                              properties:
                                                tempItems &&
                                                parseInt(
                                                  tempItems[0].has_property
                                                ) === 1
                                                  ? tempItems[0].properties
                                                  : null,
                                            });
                                          } else {
                                            setFoodItem({
                                              foodGroup: groupItem,
                                              items: null,
                                              selectedItem: null,
                                              variations: null,
                                              properties: null,
                                            });
                                          }

                                          //set active item in order list
                                          setActiveItemInOrder(null);
                                        }}
                                        //set active or !
                                        className={`w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase ${
                                          foodItem.foodGroup &&
                                          foodItem.foodGroup.id ===
                                            groupItem.id &&
                                          "active"
                                        }`}
                                      >
                                        {groupItem.name}
                                      </button>
                                    </li>
                                  );
                                }
                              )}
                            {/* Food groups */}
                          </ul>
                        </div>
                      </div>
                      {/* Left Menu  End */}

                      {/* Dish Addons   */}
                      <div className="col-md-8 col-xl-9">
                        <div className="">
                          <div className="active" id="nav-1">
                            <div className="row gx-1">
                              <div className="col-xl-6 col-xxl-5 order-xl-2">
                                <div className="tab-content t-mb-10 mb-xl-0">
                                  <div className="" id="addons-1">
                                    <div className="t-bg-white">
                                      <div
                                        className="fk-addons-variation"
                                        data-simplebar
                                      >
                                        <div>
                                          {/* Kitchen Note */}
                                          <div className="fk-addons-table">
                                            <div className="fk-addons-table__head text-center">
                                              {_t(t("Add Kitchen Note"))}
                                            </div>
                                            <div className="fk-addons-table__body">
                                              <div className="fk-addons-table__body-row">
                                                <input
                                                  value={inputValue}
                                                  onChange={handleKitchenNote}
                                                  className="form-control my-2"
                                                  placeholder="Type kitchen note..."
                                                />
                                              </div>
                                            </div>
                                          </div>
                                          {/* Kitchen Note end*/}
                                          {/* Ingredients */}
                                          <div className="fk-addons-table">
                                            <div className="fk-addons-table__head text-center">
                                              {_t(t("Ingredients List"))}
                                            </div>
                                            <div className="fk-addons-table__body">
                                              <div
                                                className="fk-addons-table__body-row"
                                                style={{ fontSize: "14px" }}
                                              >
                                                {foodItem.selectedItem &&
                                                  foodItem.selectedItem
                                                    .ingredients}
                                              </div>
                                            </div>
                                          </div>
                                          {/* Ingredients end*/}
                                          {/* Allergies items */}
                                          <div className="fk-addons-table">
                                            <div className="fk-addons-table__head text-center">
                                              {_t(t("Items Allergies"))}
                                            </div>
                                            <div className="fk-addons-table__body">
                                              <div
                                                className="fk-addons-table__body-row"
                                                style={{ fontSize: "14px" }}
                                              >
                                                {foodItem.selectedItem &&
                                                  foodItem.selectedItem
                                                    .allergies}
                                              </div>
                                            </div>
                                          </div>
                                          {/* Allergies items end*/}
                                        </div>
                                        <div
                                          className={
                                            foodItem.properties ? "" : "d-none"
                                          }
                                        >
                                          {/* Property group and items */}
                                          {foodItem.properties && (
                                            <>
                                              {foodItem.properties.length >
                                              0 ? (
                                                foodItem.properties.map(
                                                  (propertyItem) => {
                                                    //property group
                                                    let selectedGroup = null;
                                                    //property group
                                                    if (
                                                      propertyItem.length > 0
                                                    ) {
                                                      selectedGroup =
                                                        propertyGroupForSearch &&
                                                        propertyGroupForSearch.find(
                                                          (
                                                            singlePropertyGroup
                                                          ) => {
                                                            return (
                                                              singlePropertyGroup.id ===
                                                              parseInt(
                                                                propertyItem[0]
                                                                  .property_group_id
                                                              )
                                                            );
                                                          }
                                                        );
                                                    }
                                                    return (
                                                      <div className="fk-addons-table">
                                                        <div className="fk-addons-table__head text-center">
                                                          {selectedGroup &&
                                                            selectedGroup.name}
                                                        </div>
                                                        <div className="fk-addons-table__info">
                                                          <div className="row g-0">
                                                            <div className="col-5 pl-3 border-right">
                                                              <span className="fk-addons-table__info-text text-capitalize">
                                                                {_t(t("name"))}
                                                              </span>
                                                            </div>
                                                            <div className="col-3 text-center border-right">
                                                              <span className="fk-addons-table__info-text text-capitalize">
                                                                {_t(t("QTY"))}
                                                              </span>
                                                            </div>
                                                            <div className="col-4 text-center">
                                                              <span className="fk-addons-table__info-text text-capitalize">
                                                                {_t(
                                                                  t(
                                                                    "Unit price"
                                                                  )
                                                                )}
                                                              </span>
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="fk-addons-table__body">
                                                          {propertyItem.map(
                                                            (eachItem) => {
                                                              return (
                                                                <div className="fk-addons-table__body-row">
                                                                  <div className="row g-0">
                                                                    <div className="col-5 border-right t-pl-10 t-pr-10">
                                                                      <label className="mx-checkbox">
                                                                        <input
                                                                          type="checkbox"
                                                                          className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm"
                                                                          onChange={() => {
                                                                            newOrder &&
                                                                              newOrder.map(
                                                                                (
                                                                                  newOrderItem,
                                                                                  index
                                                                                ) => {
                                                                                  if (
                                                                                    index ===
                                                                                    activeItemInOrder
                                                                                  ) {
                                                                                    if (
                                                                                      newOrderItem.properties
                                                                                    ) {
                                                                                      let theItem =
                                                                                        newOrderItem.properties.find(
                                                                                          (
                                                                                            eachPropertyItem
                                                                                          ) => {
                                                                                            return (
                                                                                              eachPropertyItem
                                                                                                .item
                                                                                                .id ===
                                                                                              eachItem.id
                                                                                            );
                                                                                          }
                                                                                        );

                                                                                      if (
                                                                                        theItem ===
                                                                                        undefined
                                                                                      ) {
                                                                                        handleAddProperties(
                                                                                          eachItem
                                                                                        );
                                                                                      } else {
                                                                                        handleRemoveProperties(
                                                                                          eachItem
                                                                                        );
                                                                                      }
                                                                                    } else {
                                                                                      handleAddProperties(
                                                                                        eachItem
                                                                                      );
                                                                                    }
                                                                                  }
                                                                                }
                                                                              );
                                                                          }}
                                                                          checked={checkCheckedProperties(
                                                                            eachItem
                                                                          )}
                                                                        />
                                                                        <span className="mx-checkbox__text text-capitalize t-text-heading t-ml-8 fk-addons-table__body-text">
                                                                          {
                                                                            eachItem.name
                                                                          }
                                                                        </span>
                                                                      </label>
                                                                    </div>
                                                                    <div className="col-3 text-center border-right">
                                                                      <div className="fk-qty justify-content-center t-pt-10 t-pb-10">
                                                                        {parseInt(
                                                                          eachItem.allow_multi_quantity
                                                                        ) ===
                                                                          1 && (
                                                                          <span
                                                                            className="fk-qty__icon fk-qty__deduct"
                                                                            onClick={() => {
                                                                              handlePropertyQty(
                                                                                eachItem,
                                                                                "-"
                                                                              );
                                                                            }}
                                                                          >
                                                                            <i className="las la-minus"></i>
                                                                          </span>
                                                                        )}
                                                                        {parseInt(
                                                                          eachItem.allow_multi_quantity
                                                                        ) ===
                                                                        1 ? (
                                                                          <input
                                                                            type="text"
                                                                            value={checkCheckedPropertyQuantity(
                                                                              eachItem
                                                                            )}
                                                                            className="fk-qty__input t-bg-clear"
                                                                            readOnly
                                                                          />
                                                                        ) : (
                                                                          "-"
                                                                        )}
                                                                        {parseInt(
                                                                          eachItem.allow_multi_quantity
                                                                        ) ===
                                                                          1 && (
                                                                          <span
                                                                            className="fk-qty__icon fk-qty__add"
                                                                            onClick={() => {
                                                                              handlePropertyQty(
                                                                                eachItem,
                                                                                "+"
                                                                              );
                                                                            }}
                                                                          >
                                                                            <i className="las la-plus"></i>
                                                                          </span>
                                                                        )}
                                                                      </div>
                                                                    </div>
                                                                    <div className="col-4 text-center">
                                                                      <span className="fk-addons-table__body-text sm-text">
                                                                        {currencySymbolLeft()}
                                                                        {formatPrice(
                                                                          eachItem.extra_price
                                                                        )}
                                                                        {currencySymbolRight()}
                                                                      </span>
                                                                    </div>
                                                                  </div>
                                                                </div>
                                                              );
                                                            }
                                                          )}
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                )
                                              ) : (
                                                <div className="fk-addons-table__info py-4">
                                                  <div className="row g-0">
                                                    <div className="col-12 text-center border-right">
                                                      <span className="fk-addons-table__info-text text-capitalize text-primary">
                                                        {_t(t("No properties"))}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </div>
                                        {/* Property group and items */}
                                        {/* Variations */}
                                        <div className="fk-addons-table">
                                          <div className="fk-addons-table__head text-center">
                                            {_t(t("variations"))}
                                          </div>
                                          {foodItem.variations ? (
                                            <>
                                              <div className="fk-addons-table__info">
                                                <div className="row g-0">
                                                  <div className="col-8 pl-3 border-right">
                                                    <span className="fk-addons-table__info-text text-capitalize">
                                                      {_t(t("name"))}
                                                    </span>
                                                  </div>
                                                  <div className="col-4 text-center">
                                                    <span className="fk-addons-table__info-text text-capitalize">
                                                      {_t(t("price"))}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                              <div className="fk-addons-table__body">
                                                {foodItem.variations.map(
                                                  (variationItem) => {
                                                    return (
                                                      <div className="fk-addons-table__body-row">
                                                        <div className="row g-0">
                                                          <div className="col-8 border-right t-pl-10 t-pr-10">
                                                            <label className="mx-checkbox">
                                                              <input
                                                                type="radio"
                                                                className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm"
                                                                name="variation"
                                                                onChange={() => {
                                                                  handleOrderItemVariation(
                                                                    variationItem
                                                                  );
                                                                }}
                                                                checked={checkChecked(
                                                                  variationItem
                                                                )}
                                                              />
                                                              <span className="mx-checkbox__text text-capitalize t-text-heading t-ml-8 fk-addons-table__body-text">
                                                                {
                                                                  variationItem.variation_name
                                                                }
                                                              </span>
                                                            </label>
                                                          </div>
                                                          <div className="col-4 text-center">
                                                            <span className="fk-addons-table__body-text sm-text">
                                                              {currencySymbolLeft()}
                                                              {formatPrice(
                                                                variationItem.food_with_variation_price
                                                              )}
                                                              {currencySymbolRight()}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            </>
                                          ) : (
                                            <div className="fk-addons-table__info py-4">
                                              <div className="row g-0">
                                                <div className="col-12 text-center border-right">
                                                  <span className="fk-addons-table__info-text text-capitalize text-primary">
                                                    {_t(t("No variations"))}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        {/* Variations end*/}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="col-xl-6 col-xxl-7 order-xl-1">
                                <div className="fk-dish--scroll" data-simplebar>
                                  <div className="list-group fk-dish row gx-2">
                                    {foodItem.items &&
                                      foodItem.items.map(
                                        (tempFoodItem, tempFoodItemIndex) => {
                                          return (
                                            <div
                                              onClick={() => {
                                                setActiveItemInOrder(
                                                  tempFoodItemIndex
                                                );
                                                if (showManageStock) {
                                                  if (
                                                    handleGetStock(
                                                      tempFoodItem.id
                                                    ) === 0
                                                  ) {
                                                    toast.error(
                                                      `${_t(
                                                        t("Out of stock")
                                                      )}`,
                                                      {
                                                        position:
                                                          "bottom-center",
                                                        closeButton: false,
                                                        autoClose: 10000,
                                                        hideProgressBar: false,
                                                        closeOnClick: true,
                                                        pauseOnHover: true,
                                                        className:
                                                          "text-center toast-notification",
                                                      }
                                                    );
                                                  } else {
                                                    // set variations, properties and selected items here
                                                    setFoodItem({
                                                      ...foodItem,
                                                      selectedItem:
                                                        tempFoodItem,
                                                      variations:
                                                        tempFoodItem &&
                                                        parseInt(
                                                          tempFoodItem.has_variation
                                                        ) === 1
                                                          ? tempFoodItem.variations
                                                          : null,
                                                      properties:
                                                        tempFoodItem &&
                                                        parseInt(
                                                          tempFoodItem.has_property
                                                        ) === 1
                                                          ? tempFoodItem.properties
                                                          : null,
                                                    });
                                                    handleOrderItem(
                                                      tempFoodItem
                                                    );
                                                  }
                                                } else {
                                                  // set variations, properties and selected items here
                                                  setFoodItem({
                                                    ...foodItem,
                                                    selectedItem: tempFoodItem,
                                                    variations:
                                                      tempFoodItem &&
                                                      parseInt(
                                                        tempFoodItem.has_variation
                                                      ) === 1
                                                        ? tempFoodItem.variations
                                                        : null,
                                                    properties:
                                                      tempFoodItem &&
                                                      parseInt(
                                                        tempFoodItem.has_property
                                                      ) === 1
                                                        ? tempFoodItem.properties
                                                        : null,
                                                  });
                                                  handleOrderItem(tempFoodItem);
                                                }
                                              }}
                                              className={`fk-dish__link t-mb-10 col-md-6 col-lg-4 col-xl-6 col-xxl-4 t-link border-0 pointer-cursor ${
                                                foodItem.selectedItem &&
                                                foodItem.selectedItem.id ===
                                                  tempFoodItem.id &&
                                                "active"
                                              }`}
                                            >
                                              <div className="fk-dish-card w-100">
                                                <div className="fk-dish-card__img w-100">
                                                  <img
                                                    src={tempFoodItem.image}
                                                    alt=""
                                                    className="img-fluid m-auto w-100"
                                                  />
                                                </div>
                                                <span className="fk-dish-card__title text-center text-uppercase">
                                                  {tempFoodItem.name} <br />
                                                  {/* check is manage menu is active or not  */}
                                                  {showManageStock ? (
                                                    <>
                                                      {_t(t("In Stock"))}:{" "}
                                                      {handleGetStock(
                                                        tempFoodItem.id
                                                      )}
                                                    </>
                                                  ) : null}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Dish Addons  End */}
                    </div>
                  </div>
                </div>
                {/* Left Side End */}

                {/* Right Side  */}
                <div className="col-md-5">
                  <div className="row gx-2">
                    <div className="col-md-4 col-xl-3">
                      <div className="fk-right-nav">
                        <div className="row flex-column justify-content-between h-100">
                          <div className="col-12 flex-grow-1">
                            <div
                              className="fk-right-nav__scroll"
                              data-simplebar
                            >
                              <ul className="t-list addons-list">
                                {authUserInfo.details &&
                                  authUserInfo.details.user_type !==
                                    "staff" && (
                                    <li className="addons-list__item mt-1 mx-1">
                                      {/* <Select
                                        options={
                                          branchForSearch && branchForSearch
                                        }
                                        components={makeAnimated()}
                                        getOptionLabel={(option) => option.name}
                                        getOptionValue={(option) => option.name}
                                        classNamePrefix="select"
                                        className="xsm-text"
                                        onChange={() => handleSetBranch(branchForSearch && branchForSearch[0])}
                                        maxMenuHeight="200px"
                                        placeholder={_t(t("Branch")) + ".."}
                                        defaultValue={branchForSearch && branchForSearch[0]}
                                      /> */}
                                      {branchForSearch[0].name}
                                    </li>
                                  )}
                                {!loading && (
                                  <>
                                    {orderDetails.branch !== null && (
                                      <>
                                        <li
                                          className={`addons-list__item mx-1 ${
                                            authUserInfo.details &&
                                            authUserInfo.details.user_type ===
                                              "staff" &&
                                            "mt-1"
                                          }`}
                                        >
                                          <Select
                                            options={
                                              orderDetailUsers.theCustomers !==
                                                null &&
                                              orderDetailUsers.theCustomers
                                            }
                                            required
                                            components={makeAnimated()}
                                            getOptionLabel={(option) =>
                                              option.name +
                                              " (" +
                                              option.phn_no +
                                              ")"
                                            }
                                            getOptionValue={(option) =>
                                              option.name
                                            }
                                            classNamePrefix="select"
                                            className="xsm-text"
                                            onChange={handleSetCustomer}
                                            maxMenuHeight="200px"
                                            placeholder={
                                              _t(t("Customers")) + ".."
                                            }
                                          />
                                        </li>
                                        <li className="addons-list__item mx-1 border border-2 rounded-lg">
                                          <div className="btn-group w-100">
                                            <button
                                              type="button"
                                              className="fk-right-nav__guest-btn btn w-100 t-bg-white dropdown-toggle new-customer-pos xsm-text pl-2"
                                              data-toggle="dropdown"
                                              aria-expanded="false"
                                            >
                                              + {_t(t("Customer"))}?
                                            </button>
                                            <ul className="dropdown-menu w-100 border-0 pt-4 change-background">
                                              <li>
                                                <input
                                                  type="text"
                                                  name="name"
                                                  className="form-control font-10px rounded-lg"
                                                  placeholder="Name"
                                                  autoComplete="off"
                                                  value={
                                                    orderDetails.newCustomerInfo
                                                      .name
                                                  }
                                                  onChange={handleNewCustomer}
                                                />
                                              </li>
                                              <li className="pb-2">
                                                <input
                                                  type="text"
                                                  name="number"
                                                  className="form-control font-10px mt-2 rounded-lg"
                                                  autoComplete="off"
                                                  placeholder="Number"
                                                  value={
                                                    orderDetails.newCustomerInfo
                                                      .number
                                                  }
                                                  onChange={handleNewCustomer}
                                                />
                                              </li>
                                              <li className="pb-2">
                                                <input
                                                  type="text"
                                                  name="address"
                                                  className="form-control font-10px mt-2 rounded-lg"
                                                  autoComplete="off"
                                                  placeholder="Address"
                                                  value={
                                                    orderDetails.newCustomerInfo
                                                      .address
                                                  }
                                                  onChange={handleNewCustomer}
                                                />
                                              </li>
                                              <li className="pb-2">
                                                <input
                                                  type="text"
                                                  name="zipcode"
                                                  className="form-control font-10px mt-2 rounded-lg"
                                                  autoComplete="off"
                                                  placeholder="Zipcode"
                                                  value={
                                                    orderDetails.newCustomerInfo
                                                      .zipcode
                                                  }
                                                  onChange={handleNewCustomer}
                                                />
                                              </li>
                                              <li className="pb-1 text-right">
                                                <button
                                                  className="btn t-bg-white text-dark xsm-text text-uppercase btn-sm py-0 px-2 mr-1"
                                                  onClick={() => {
                                                    setOrderDetails({
                                                      ...orderDetails,
                                                      newCustomer: false,
                                                      newCustomerInfo: {
                                                        name: "",
                                                        number: "",
                                                        address: "",
                                                        zipcode: "",
                                                      },
                                                    });
                                                  }}
                                                >
                                                  {_t(t("Cancel"))}
                                                </button>
                                              </li>
                                            </ul>
                                          </div>
                                        </li>
                                        {getSystemSettings(
                                          generalSettings,
                                          "pos_screen"
                                        ) === "0" && (
                                          <>
                                            <li className="addons-list__item mx-1">
                                              <Select
                                                options={
                                                  deptTagForSearch &&
                                                  deptTagForSearch
                                                }
                                                components={makeAnimated()}
                                                getOptionLabel={(option) =>
                                                  option.name
                                                }
                                                getOptionValue={(option) =>
                                                  option.name
                                                }
                                                classNamePrefix="select"
                                                className="xsm-text"
                                                onChange={handleSetDeptTag}
                                                maxMenuHeight="200px"
                                                placeholder={
                                                  _t(t("Dept tag")) + ".."
                                                }
                                              />
                                            </li>

                                            <li
                                              className={`addons-list__item mx-1 payment-type-parent ${
                                                orderDetails.payment_type !==
                                                  null && "mb-1"
                                              }`}
                                            >
                                              <Select
                                                options={
                                                  paymentTypeForSearch &&
                                                  paymentTypeForSearch
                                                }
                                                components={makeAnimated()}
                                                getOptionLabel={(option) =>
                                                  option.name
                                                }
                                                getOptionValue={(option) =>
                                                  option.name
                                                }
                                                classNamePrefix="select"
                                                className="xsm-text"
                                                onChange={handleSetpaymentType}
                                                maxMenuHeight="200px"
                                                isMulti
                                                backspaceRemovesValue={false}
                                                clearIndicator={null}
                                                placeholder={
                                                  _t(t("Payments")) + ".."
                                                }
                                              />
                                            </li>
                                            {orderDetails.payment_type !==
                                              null && (
                                              <div className="border mt-0 mb-2 change-background mx-1 rounded-lg">
                                                <div className="xsm-text text-center text-white pt-1">
                                                  {_t(t("Amount"))}
                                                </div>
                                                {orderDetails.payment_type.map(
                                                  (
                                                    eachPaymentType,
                                                    paymentTypeIndex
                                                  ) => {
                                                    return (
                                                      <li className="addons-list__item mx-1 mb-1">
                                                        <input
                                                          type="number"
                                                          min="0"
                                                          step="0.01"
                                                          name={
                                                            eachPaymentType.id
                                                          }
                                                          autoComplete="off"
                                                          className="form-control xsm-text pl-2"
                                                          onChange={
                                                            handlePaymentTypeAmount
                                                          }
                                                          placeholder={
                                                            eachPaymentType.name
                                                          }
                                                          value={
                                                            orderDetails.payment_amount &&
                                                            orderDetails
                                                              .payment_amount[
                                                              eachPaymentType.id
                                                            ]
                                                          }
                                                        />
                                                      </li>
                                                    );
                                                  }
                                                )}
                                              </div>
                                            )}
                                          </>
                                        )}

                                        {getSystemSettings(
                                          generalSettings,
                                          "table_waiter"
                                        ) === "1" ? (
                                          <>
                                            <li className="addons-list__item mx-1">
                                              <Select
                                                options={
                                                  orderDetailUsers.theTables !==
                                                    null &&
                                                  orderDetailUsers.theTables
                                                }
                                                components={makeAnimated()}
                                                getOptionLabel={(option) =>
                                                  option.name
                                                }
                                                getOptionValue={(option) =>
                                                  option.name
                                                }
                                                classNamePrefix="select"
                                                className="xsm-text"
                                                onChange={handleSetTable}
                                                maxMenuHeight="200px"
                                                placeholder={
                                                  _t(t("Table")) + ".."
                                                }
                                              />
                                            </li>
                                            <li className="addons-list__item mx-1">
                                              <Select
                                                options={
                                                  orderDetailUsers.theWaiters !==
                                                    null &&
                                                  orderDetailUsers.theWaiters
                                                }
                                                components={makeAnimated()}
                                                getOptionLabel={(option) =>
                                                  option.name
                                                }
                                                getOptionValue={(option) =>
                                                  option.name
                                                }
                                                classNamePrefix="select"
                                                className="xsm-text"
                                                onChange={handleSetWaiter}
                                                maxMenuHeight="200px"
                                                placeholder={
                                                  _t(t("Waiter")) + ".."
                                                }
                                              />
                                            </li>
                                          </>
                                        ) : (
                                          ""
                                        )}

                                        {isReservation && (
                                          <>
                                            <li
                                              className="addons-list__item mx-1"
                                              style={{ paddingBottom: "10px" }}
                                            >
                                              <input
                                                type="number"
                                                className="form-control xsm-text py-2 pl-2"
                                                min="1"
                                                onChange={handleTotalGuest}
                                                placeholder={
                                                  _t(t("Total guest")) + ".."
                                                }
                                              />
                                            </li>
                                            <li
                                              className="addons-list__item mx-1"
                                              style={{ paddingBottom: "10px" }}
                                            >
                                              <input
                                                type="datetime-local"
                                                className="form-control xsm-text py-2 pl-2"
                                                onChange={
                                                  handleReservationDateTime
                                                }
                                                placeholder={
                                                  _t(t("reservation time")) +
                                                  ".."
                                                }
                                              />
                                            </li>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                              </ul>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="row">
                              <div className="col-12 t-mb-10">
                                {/* <button
                                  onClick={() => {
                                    if (newOrder) {
                                      handleOnlyPrint();
                                    } else {
                                      toast.error(
                                        `${_t(
                                          t(
                                            "Please add items in order list to print bill"
                                          )
                                        )}`,
                                        {
                                          position: "bottom-center",
                                          closeButton: false,
                                          autoClose: 10000,
                                          hideProgressBar: false,
                                          closeOnClick: true,
                                          pauseOnHover: true,
                                          className:
                                            "text-center toast-notification",
                                        }
                                      );
                                    }
                                  }}
                                  className="w-100 t-heading-font btn btn-outline-danger font-weight-bold text-uppercase sm-text"
                                >
                                  {_t(t("print bill"))}
                                </button> */}
                              </div>
                              <div className="col-12">
                                <button
                                  className="w-100 t-heading-font btn btn-primary font-weight-bold text-uppercase sm-text"
                                  onClick={handleCancelConfirmation}
                                >
                                  {_t(t("cancel"))}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-8 col-xl-9">
                      <div className="fk-right-nav p-2 p-xl-3 t-bg-white">
                        {/* Disply Only Small Screen   */}
                        <div className="h-100 w-100 d-none" data-simplebar>
                          <div className="fk-receipt-content">
                            <div className="fk-receipt-body t-mt-10">
                              <div className="row g-0">
                                <div className="col-12">
                                  <span className="sm-text font-weight-bold text-uppercase font-italic">
                                    {_t(t("Order token"))}:{" "}
                                    {newOrder ? (
                                      <>
                                        #{orderDetails.token.id} -{" "}
                                        <Moment format="LT">
                                          {orderDetails.token.time}
                                        </Moment>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div className="fk-sm-card__container t-mt-30">
                                <div className="fk-sm-card__content">
                                  <h6 className="text-capitalize fk-sm-card__title t-mb-5">
                                    food items
                                  </h6>
                                  <p className="mb-0 xsm-text t-text-heading fk-sm-card__description text-capitalize">
                                    properties & bill
                                  </p>
                                </div>
                                <span className="text-capitalize xxsm-text fk-badge fk-badge--dark">
                                  total
                                </span>
                              </div>
                              <hr />
                              <ul className="t-list addons-list">
                                <li className="addons-list__item active">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="col">
                                      <span className=" sm-text text-capitalize">
                                        chicken burger
                                      </span>
                                      <span className=" xsm-text text-capitalize d-block">
                                        large
                                      </span>
                                    </div>
                                    <div className="col">
                                      <div className="fk-qty flex-grow-1 justify-content-end">
                                        <span className="fk-qty__icon fk-qty__deduct">
                                          <i className="las la-minus"></i>
                                        </span>
                                        <input
                                          type="text"
                                          value="0"
                                          className="fk-qty__input"
                                        />
                                        <span className="fk-qty__icon fk-qty__add">
                                          <i className="las la-plus"></i>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col text-right">
                                      <span className=" text-uppercase sm-text flex-grow-1">
                                        +tk 100
                                      </span>
                                    </div>
                                  </div>
                                </li>
                                <li className="addons-list__item">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="col">
                                      <span className="t-text-heading sm-text text-capitalize">
                                        beef burger
                                      </span>
                                    </div>
                                    <div className="col">
                                      <div className="fk-qty flex-grow-1 justify-content-end">
                                        <span className="fk-qty__icon fk-qty__deduct">
                                          <i className="las la-minus"></i>
                                        </span>
                                        <input
                                          type="text"
                                          value="0"
                                          className="fk-qty__input"
                                        />
                                        <span className="fk-qty__icon fk-qty__add">
                                          <i className="las la-plus"></i>
                                        </span>
                                      </div>
                                    </div>
                                    <div className="col text-right">
                                      <span className="t-text-heading text-uppercase sm-text flex-grow-1">
                                        +tk 230
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              </ul>
                              <hr />
                              <div className="row">
                                <div className="col-12">
                                  <div className="row">
                                    <div className="col">
                                      <span className="text-capitalize sm-text">
                                        sub total
                                      </span>
                                    </div>
                                    <div className="col text-center">:</div>
                                    <div className="col text-right">
                                      <span className="text-capitalize sm-text font-weight-bold">
                                        {newOrder ? (
                                          <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                            {currencySymbolLeft()}
                                            {formatPrice(theSubTotal)}
                                            {currencySymbolRight()}
                                          </span>
                                        ) : (
                                          <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                            {currencySymbolLeft()}
                                            {formatPrice(0)}
                                            {currencySymbolRight()}
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="row">
                                    <div className="col">
                                      <span className="sm-text">
                                        {getSystemSettings(
                                          generalSettings,
                                          "vat_system"
                                        ) === "igst"
                                          ? `vat(${
                                              newSettings !== null &&
                                              newSettings.vat
                                            })`
                                          : getSystemSettings(
                                              generalSettings,
                                              "vat_system"
                                            ) === "cgst"
                                          ? "cgst+sgst" +
                                            "(" +
                                            getSystemSettings(
                                              generalSettings,
                                              "cgst"
                                            ) +
                                            "+" +
                                            getSystemSettings(
                                              generalSettings,
                                              "sgst"
                                            ) +
                                            ")"
                                          : `tax(${
                                              newSettings !== null &&
                                              newSettings.tax
                                            })`}
                                        %:
                                      </span>
                                    </div>
                                    <div className="col text-center">:</div>
                                    <div className="col text-right">
                                      <span className="text-capitalize sm-text font-weight-bold">
                                        {currencySymbolLeft()}
                                        {formatPrice(theVat)}
                                        {currencySymbolRight()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="row">
                                    <div className="col">
                                      <span className="text-capitalize sm-text">
                                        service
                                      </span>
                                    </div>
                                    <div className="col text-center">:</div>
                                    <div className="col text-right">
                                      <span className="text-capitalize sm-text font-weight-bold">
                                        20.00
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="row">
                                    <div className="col">
                                      <span className="text-capitalize sm-text">
                                        discount
                                      </span>
                                    </div>
                                    <div className="col text-center">:</div>
                                    <div className="col text-right">
                                      <span className="text-capitalize sm-text font-weight-bold">
                                        100.00
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="row">
                                <div className="col-12">
                                  <div className="row">
                                    <div className="col">
                                      <span className="text-capitalize sm-text font-weight-bold">
                                        total bill
                                      </span>
                                    </div>
                                    <div className="col text-center">:</div>
                                    <div className="col text-right">
                                      <span className="text-capitalize sm-text font-weight-bold">
                                        2000.00
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <hr />
                              <div className="row">
                                <div className="col-6">
                                  <button
                                    type="button"
                                    className="btn btn-primary w-100 xsm-text text-uppercase"
                                  >
                                    settle
                                  </button>
                                </div>
                                <div className="col-6">
                                  <button
                                    type="button"
                                    className="btn btn-success w-100 xsm-text text-uppercase"
                                  >
                                    submit
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Disply Only Small Screen End  */}

                        {/* Display Only Large Screen   */}
                        <div className="h-100 w-100 d-none d-md-block">
                          <div className="fk-price-table">
                            <div className="fk-price-table__head">
                              <div className="row gx-0 align-items-center">
                                <div className="col-12 text-right">
                                  <span className="d-block sm-text font-weight-bold text-uppercase">
                                    {_t(t("Order token"))}:{" "}
                                    {newOrder ? (
                                      <>
                                        #{orderDetails.token.id} -{" "}
                                        <Moment format="LT">
                                          {orderDetails.token.time}
                                        </Moment>
                                      </>
                                    ) : (
                                      ""
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="fk-price-table__body t-mt-10">
                              <div className="fk-price-table__body-top">
                                <div className="fk-table">
                                  <div className="fk-table__head">
                                    <div className="row g-0 border">
                                      <div className="col-1 text-center border-right">
                                        <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                          {_t(t("S/L"))}
                                        </span>
                                      </div>
                                      <div className="col-6 text-center border-right">
                                        <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                          {_t(t("food item"))}
                                        </span>
                                      </div>
                                      <div className="col-2 text-center border-right">
                                        <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                          {_t(t("QTY"))}
                                        </span>
                                      </div>
                                      <div className="col-3 text-center">
                                        <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                          {_t(t("price"))}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div
                                    className="fk-table__body border-bottom"
                                    data-simplebar
                                  >
                                    <div className="sky-is-blue reverse-this">
                                      {/* loop through order list items */}
                                      {newOrder && newOrder.length > 0 ? (
                                        newOrder.map(
                                          (
                                            orderListItem,
                                            orderListItemIndex
                                          ) => {
                                            return (
                                              <>
                                                <div
                                                  className={`fk-table-container-order ${
                                                    orderListItemIndex ===
                                                      activeItemInOrder &&
                                                    "active"
                                                  } `}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    //orderListItem's group wise all items
                                                    let tempItems =
                                                      foodForSearch &&
                                                      foodForSearch.filter(
                                                        (tempItem) => {
                                                          return (
                                                            tempItem.food_group_id ===
                                                            orderListItem.item
                                                              .food_group_id
                                                          );
                                                        }
                                                      );

                                                    //orderListItem's group
                                                    let foodGroup =
                                                      foodGroupForSearch &&
                                                      foodGroupForSearch.find(
                                                        (groupItem) => {
                                                          return (
                                                            groupItem.id ===
                                                            parseInt(
                                                              orderListItem.item
                                                                .food_group_id
                                                            )
                                                          );
                                                        }
                                                      );

                                                    // selected pos item
                                                    let selectedItemTemp =
                                                      tempItems &&
                                                      tempItems.find(
                                                        (tempSelectedItem) => {
                                                          return (
                                                            tempSelectedItem.id ===
                                                            orderListItem.item
                                                              .id
                                                          );
                                                        }
                                                      );

                                                    // Set variations, properties, selected item
                                                    setFoodItem({
                                                      ...foodItem,
                                                      foodGroup: foodGroup,
                                                      items: tempItems,
                                                      selectedItem:
                                                        selectedItemTemp,
                                                      variations:
                                                        selectedItemTemp &&
                                                        parseInt(
                                                          selectedItemTemp.has_variation
                                                        ) === 1
                                                          ? selectedItemTemp.variations
                                                          : null,
                                                      properties:
                                                        selectedItemTemp &&
                                                        parseInt(
                                                          selectedItemTemp.has_property
                                                        ) === 1
                                                          ? selectedItemTemp.properties
                                                          : null,
                                                    });

                                                    //set active order list index for background color of selected
                                                    setActiveItemInOrder(
                                                      orderListItemIndex
                                                    );
                                                    setInputValue(orderListItem.item
                                                              .note)
                                                  }}
                                                >
                                                  <div
                                                    className={`row g-0 border-top-0 border-bottom `}
                                                  >
                                                    <div className="col-1 text-center border-left d-flex justify-content-center align-items-center">
                                                      {newOrder.length -
                                                        orderListItemIndex}
                                                    </div>
                                                    <div
                                                      className={`col-6 border-left border-right py-2`}
                                                    >
                                                      <div className="d-flex justify-content-between">
                                                        <span className="text-capitalize d-block t-pt-5 t-pb-5 t-pl-5 t-pr-5 sm-text font-weight-bold t-mr-8">
                                                          {
                                                            orderListItem.item
                                                              .name
                                                          }
                                                        </span>
                                                      </div>

                                                      <div className="d-flex justify-content-between">
                                                        <span className="d-block t-pt-5 t-pb-5 t-pl-5 t-pr-5 sm-text t-mr-8">
                                                          {
                                                            orderListItem.item
                                                              .note
                                                          }
                                                          
                                                        </span>
                                                      </div>

                                                      <div className="row g-0">
                                                        {/* if item has variations show the selected in order list */}
                                                        {parseInt(
                                                          orderListItem.item
                                                            .has_variation
                                                        ) === 1 && (
                                                          <div className="col-12">
                                                            <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pr-5 t-pl-5">
                                                              variation :
                                                            </span>
                                                            <span className="text-capitalize xsm-text d-inline-block badge rounded-pill bg-warning text-dark font-weight-md">
                                                              {orderListItem.variation
                                                                ? orderListItem
                                                                    .variation
                                                                    .variation_name
                                                                : "-"}
                                                            </span>
                                                          </div>
                                                        )}

                                                        {/* if item has properties show the selected in order list, loop here  */}
                                                        {orderListItem.properties &&
                                                          orderListItem
                                                            .properties.length >
                                                            0 &&
                                                          selectedPropertyGroup[
                                                            orderListItemIndex
                                                          ] !== undefined &&
                                                          selectedPropertyGroup[
                                                            orderListItemIndex
                                                          ].map(
                                                            (thisIsGroup) => {
                                                              let theGroup =
                                                                propertyGroupForSearch &&
                                                                propertyGroupForSearch.find(
                                                                  (theItem) => {
                                                                    return (
                                                                      theItem.id ===
                                                                      thisIsGroup
                                                                    );
                                                                  }
                                                                );
                                                              return (
                                                                <div className="col-12">
                                                                  <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pr-5 t-pl-5">
                                                                    {theGroup &&
                                                                      theGroup.name}{" "}
                                                                    :
                                                                  </span>
                                                                  {orderListItem.properties.map(
                                                                    (
                                                                      propertyName
                                                                    ) => {
                                                                      if (
                                                                        parseInt(
                                                                          propertyName
                                                                            .item
                                                                            .property_group_id
                                                                        ) ===
                                                                        theGroup.id
                                                                      ) {
                                                                        return (
                                                                          <span className="text-capitalize xsm-text d-inline-block badge rounded-pill bg-warning text-dark font-weight-md mr-1">
                                                                            {
                                                                              propertyName
                                                                                .item
                                                                                .name
                                                                            }{" "}
                                                                            <span>
                                                                              {" "}
                                                                              {propertyName.quantity >
                                                                                1 &&
                                                                                "(" +
                                                                                  propertyName.quantity +
                                                                                  ")"}
                                                                            </span>
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
                                                          )}

                                                        {/* if item has properties show the selected in order list  */}
                                                      </div>
                                                    </div>
                                                    {/* Quantity */}
                                                    <div className="col-2 text-center border-right d-flex justify-content-center align-items-center">
                                                      <div className="fk-qty t-pt-5 t-pb-5 justify-content-center">
                                                        <span
                                                          className="fk-qty__icon"
                                                          onClick={() => {
                                                            handleOrderItemQty(
                                                              "-"
                                                            );
                                                          }}
                                                        >
                                                          <i className="las la-minus"></i>
                                                        </span>
                                                        <input
                                                          type="text"
                                                          value={
                                                            orderListItem.quantity
                                                          }
                                                          className="fk-qty__input t-bg-clear"
                                                          readOnly
                                                        />
                                                        <span
                                                          className="fk-qty__icon"
                                                          onClick={() => {
                                                            handleOrderItemQty(
                                                              "+"
                                                            );
                                                          }}
                                                        >
                                                          <i className="las la-plus"></i>
                                                        </span>
                                                      </div>
                                                    </div>
                                                    {/* Quantity */}

                                                    {/* Price */}
                                                    <div className="col-3 text-center border-right d-flex justify-content-center align-items-center">
                                                      <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                                        {parseInt(
                                                          orderListItem.item
                                                            .has_variation
                                                        ) === 1 ? (
                                                          <>
                                                            {currencySymbolLeft()}

                                                            {showPriceOfEachOrderItem(
                                                              orderListItemIndex
                                                            )}
                                                            {currencySymbolRight()}
                                                          </>
                                                        ) : (
                                                          <>
                                                            {currencySymbolLeft()}
                                                            {showPriceOfEachOrderItem(
                                                              orderListItemIndex
                                                            )}
                                                            {currencySymbolRight()}
                                                          </>
                                                        )}
                                                      </span>
                                                    </div>
                                                    {/* Price */}
                                                  </div>
                                                </div>
                                                <span className="text-capitalize  t-pt-5 t-pb-5 t-pr-5 sm-text font-weight-bold make-this-relative">
                                                  <span
                                                    className="badge rounded-pill bg-secondary text-capitalize"
                                                    onClick={() => {
                                                      handleRemoveItemFromOrderList(
                                                        orderListItemIndex
                                                      );
                                                    }}
                                                  >
                                                    <i className="fa fa-times"></i>
                                                  </span>
                                                </span>
                                              </>
                                            );
                                          }
                                        )
                                      ) : (
                                        <div className="text-primary text-center font-weight-bold pt-5 xsm-text text-uppercase">
                                          {_t(
                                            t(
                                              "Select food item to add to the list"
                                            )
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="fk-price-table__body-bottom t-mt-10">
                                <div className="fk-table__head">
                                  <div className="row g-0 border">
                                    <div className="col-6 text-center border-right">
                                      <div className="row g-0">
                                        <div className="col-6">
                                          <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                            {_t(t("sub total"))}
                                          </span>
                                        </div>
                                        <div className="col-6">
                                          {newOrder ? (
                                            <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                              {currencySymbolLeft()}
                                              {formatPrice(theSubTotal)}
                                              {currencySymbolRight()}
                                            </span>
                                          ) : (
                                            <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                              {currencySymbolLeft()}
                                              {formatPrice(0)}
                                              {currencySymbolRight()}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-6 text-center">
                                      <div className="row g-0">
                                        <div className="col-6">
                                          <span className="xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                            {getSystemSettings(
                                              generalSettings,
                                              "vat_system"
                                            ) === "igst"
                                              ? `vat(${
                                                  newSettings !== null &&
                                                  newSettings.vat
                                                })`
                                              : getSystemSettings(
                                                  generalSettings,
                                                  "vat_system"
                                                ) === "cgst"
                                              ? "cgst+sgst" +
                                                "(" +
                                                getSystemSettings(
                                                  generalSettings,
                                                  "cgst"
                                                ) +
                                                "+" +
                                                getSystemSettings(
                                                  generalSettings,
                                                  "sgst"
                                                ) +
                                                ")"
                                              : `tax(${
                                                  newSettings !== null &&
                                                  newSettings.vat
                                                })`}
                                            %:
                                          </span>
                                        </div>
                                        <div className="col-6">
                                          <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                            {currencySymbolLeft()}
                                            {formatPrice(theVat)}
                                            {currencySymbolRight()}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="row g-0 border">
                                    <div className="col-12 text-center border-right">
                                      <div className="row g-0 justify-content-end">
                                        <div
                                          className="col-12 text-right"
                                          style={{
                                            textAlign: "start",
                                            paddingRight: "50px",
                                          }}
                                        >
                                          <div className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                            {_t(t("Department Tag Commission"))}
                                            {orderDetails &&
                                              orderDetails.dept_tag &&
                                              " (" +
                                                orderDetails.dept_tag
                                                  .commission +
                                                "%" +
                                                ")"}{" "}
                                            :{" "}
                                            {newOrder ? (
                                              <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                                {currencySymbolLeft()}
                                                {formatPrice(deptCommission)}
                                                {currencySymbolRight()}
                                              </span>
                                            ) : (
                                              <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                                {currencySymbolLeft()}
                                                {formatPrice(0)}
                                                {currencySymbolRight()}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {getSystemSettings(
                                    generalSettings,
                                    "sDiscount"
                                  ) === "flat" && (
                                    <div className="row g-0 border">
                                      <div className="col-6 text-center border-right">
                                        <div className="row g-0">
                                          <div className="col-6">
                                            <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                              {_t(t("delivery charges"))}
                                            </span>
                                          </div>
                                          <div className="col-6">
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5 form-control rounded-0 text-center"
                                              onChange={(e) => {
                                                if (e.target.value !== "") {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    serviceCharge: parseFloat(
                                                      e.target.value
                                                    ),
                                                  });
                                                  let totalPayable = 0;
                                                  let localCurrency =
                                                    JSON.parse(
                                                      localStorage.getItem(
                                                        "currency"
                                                      )
                                                    );
                                                  let usdServiceCharge =
                                                    parseFloat(e.target.value) /
                                                    localCurrency.rate;
                                                  let usdDiscount =
                                                    parseFloat(
                                                      orderDetails.discount
                                                    ) / localCurrency.rate;

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;
                                                  setTotalPaybale(totalPayable);
                                                  setReturnMoneyUsd(
                                                    totalPayable - paidMoney
                                                  );
                                                } else {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    serviceCharge: 0,
                                                  });
                                                  let totalPayable = 0;
                                                  let localCurrency =
                                                    JSON.parse(
                                                      localStorage.getItem(
                                                        "currency"
                                                      )
                                                    );
                                                  let usdServiceCharge =
                                                    parseFloat(0) /
                                                    localCurrency.rate;
                                                  let usdDiscount =
                                                    parseFloat(
                                                      orderDetails.discount
                                                    ) / localCurrency.rate;

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;
                                                  setTotalPaybale(totalPayable);
                                                  setReturnMoneyUsd(
                                                    totalPayable - paidMoney
                                                  );
                                                }
                                              }}
                                              value={
                                                orderDetails.serviceCharge !==
                                                  0 &&
                                                orderDetails.serviceCharge
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-6 text-center">
                                        <div className="row g-0">
                                          <div className="col-6">
                                            <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                              {_t(t("discount"))}
                                            </span>
                                          </div>
                                          <div className="col-6">
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5 form-control rounded-0 text-center"
                                              onChange={(e) => {
                                                if (e.target.value !== "") {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    discount: parseFloat(
                                                      e.target.value
                                                    ),
                                                  });
                                                  let totalPayable = 0;
                                                  let localCurrency =
                                                    JSON.parse(
                                                      localStorage.getItem(
                                                        "currency"
                                                      )
                                                    );
                                                  let usdServiceCharge =
                                                    parseFloat(
                                                      orderDetails.serviceCharge
                                                    ) / localCurrency.rate;
                                                  let usdDiscount =
                                                    parseFloat(e.target.value) /
                                                    localCurrency.rate;

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;

                                                  setTotalPaybale(totalPayable);
                                                  setReturnMoneyUsd(
                                                    totalPayable - paidMoney
                                                  );
                                                } else {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    discount: 0,
                                                  });
                                                  let totalPayable = 0;
                                                  let localCurrency =
                                                    JSON.parse(
                                                      localStorage.getItem(
                                                        "currency"
                                                      )
                                                    );
                                                  let usdServiceCharge =
                                                    parseFloat(
                                                      orderDetails.serviceCharge
                                                    ) / localCurrency.rate;
                                                  let usdDiscount =
                                                    parseFloat(0) /
                                                    localCurrency.rate;

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;
                                                  setTotalPaybale(totalPayable);
                                                  setReturnMoneyUsd(
                                                    totalPayable - paidMoney
                                                  );
                                                }
                                              }}
                                              value={
                                                orderDetails.discount !== 0 &&
                                                orderDetails.discount
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {getSystemSettings(
                                    generalSettings,
                                    "sDiscount"
                                  ) === "percentage" && (
                                    <div className="row g-0 border">
                                      <div className="col-6 text-center border-right">
                                        <div className="row g-0">
                                          <div className="col-6">
                                            <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                              {_t(t("service charge"))} %
                                            </span>
                                          </div>
                                          <div className="col-6">
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5 form-control rounded-0 text-center"
                                              onChange={(e) => {
                                                if (e.target.value !== "") {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    serviceCharge: parseFloat(
                                                      e.target.value
                                                    ),
                                                  });
                                                  let totalPayable = 0;
                                                  // let localCurrency = JSON.parse(
                                                  //   localStorage.getItem(
                                                  //     "currency"
                                                  //   )
                                                  // );
                                                  // let usdServiceCharge =
                                                  //   parseFloat(e.target.value) /
                                                  //   localCurrency.rate;
                                                  // console.log("coming");
                                                  let usdServiceCharge =
                                                    theSubTotal *
                                                    (parseFloat(
                                                      e.target.value
                                                    ) /
                                                      100);

                                                  // let usdDiscount =
                                                  //   parseFloat(
                                                  //     orderDetails.discount
                                                  //   ) / localCurrency.rate;

                                                  let usdDiscount =
                                                    theSubTotal *
                                                    (parseFloat(
                                                      orderDetails.discount
                                                    ) /
                                                      100);

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;
                                                  setTotalPaybale(totalPayable);
                                                } else {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    serviceCharge: 0,
                                                  });
                                                  let totalPayable = 0;
                                                  // let localCurrency = JSON.parse(
                                                  //   localStorage.getItem(
                                                  //     "currency"
                                                  //   )
                                                  // );
                                                  // let usdServiceCharge =
                                                  //   parseFloat(0) /
                                                  //   localCurrency.rate;
                                                  let usdServiceCharge = 0;

                                                  // let usdDiscount =
                                                  //   parseFloat(
                                                  //     orderDetails.discount
                                                  //   ) / localCurrency.rate;

                                                  let usdDiscount =
                                                    theSubTotal *
                                                    (parseFloat(
                                                      orderDetails.discount
                                                    ) /
                                                      100);

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;
                                                  setTotalPaybale(totalPayable);
                                                }
                                              }}
                                              value={
                                                orderDetails.serviceCharge !==
                                                  0 &&
                                                orderDetails.serviceCharge
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="col-6 text-center">
                                        <div className="row g-0">
                                          <div className="col-6">
                                            <span className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                              {_t(t("discount"))} %
                                            </span>
                                          </div>
                                          <div className="col-6">
                                            <input
                                              type="number"
                                              step="0.01"
                                              min="0"
                                              className="text-capitalize xsm-text d-inline-block font-weight-bold t-pt-5 t-pb-5 form-control rounded-0 text-center"
                                              onChange={(e) => {
                                                if (e.target.value !== "") {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    discount: parseFloat(
                                                      e.target.value
                                                    ),
                                                  });
                                                  let totalPayable = 0;
                                                  // let localCurrency = JSON.parse(
                                                  //   localStorage.getItem(
                                                  //     "currency"
                                                  //   )
                                                  // );
                                                  // let usdServiceCharge =
                                                  //   parseFloat(
                                                  //     orderDetails.serviceCharge
                                                  //   ) / localCurrency.rate;
                                                  let usdServiceCharge =
                                                    theSubTotal *
                                                    (parseFloat(
                                                      orderDetails.serviceCharge
                                                    ) /
                                                      100);

                                                  // let usdDiscount =
                                                  //   parseFloat(e.target.value) /
                                                  //   localCurrency.rate;

                                                  let usdDiscount =
                                                    theSubTotal *
                                                    (parseFloat(
                                                      e.target.value
                                                    ) /
                                                      100);

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;

                                                  setTotalPaybale(totalPayable);
                                                } else {
                                                  setOrderDetails({
                                                    ...orderDetails,
                                                    discount: 0,
                                                  });
                                                  let totalPayable = 0;
                                                  // let localCurrency = JSON.parse(
                                                  //   localStorage.getItem(
                                                  //     "currency"
                                                  //   )
                                                  // );

                                                  let usdServiceCharge =
                                                    theSubTotal *
                                                    (parseFloat(
                                                      orderDetails.serviceCharge
                                                    ) /
                                                      100);

                                                  let usdDiscount = 0;

                                                  totalPayable =
                                                    theSubTotal +
                                                    theVat +
                                                    usdServiceCharge -
                                                    usdDiscount;
                                                  setTotalPaybale(totalPayable);
                                                }
                                              }}
                                              value={
                                                orderDetails.discount !== 0 &&
                                                orderDetails.discount
                                              }
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="t-bg-epsilon t-pl-10 t-pr-10">
                                  <div className="row">
                                    <div className="col-6">
                                      <span className="text-capitalize font-weight-bold text-light d-block t-pt-8 t-pb-10">
                                        {_t(t("total bill"))}
                                      </span>
                                    </div>
                                    <div className="col-6 text-right">
                                      {totalPayable ? (
                                        <span className="text-capitalize font-weight-bold text-light d-block t-pt-8 t-pb-10">
                                          {currencySymbolLeft()}
                                          {formatPrice(totalPayable)}
                                          {currencySymbolRight()}
                                        </span>
                                      ) : (
                                        <span className="text-capitalize font-weight-bold text-light d-block t-pt-8 t-pb-10">
                                          {currencySymbolLeft()}
                                          {formatPrice(0)}
                                          {currencySymbolRight()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="row g-0 align-items-center t-mt-10">
                                  <div className="col-4">
                                    <div className="t-mr-8">
                                      <div className="fk-calculator-container">
                                        {/* <button
                                          type="button"
                                          className="btn btn-info text-uppercase"
                                          onClick={() =>
                                            setCalculatorMenu(!calculatorMenu)
                                          }
                                        >
                                          <i className="fa fa-calculator"></i>
                                        </button> */}
                                        <div
                                          className={`calculator ${
                                            calculatorMenu && "active"
                                          }`}
                                        >
                                          <Calculator />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {getSystemSettings(
                                    generalSettings,
                                    "pos_screen"
                                  ) === "0" && (
                                    <div className="col-8">
                                      <div className="d-flex justify-content-end align-items-center">
                                        {returnMoneyUsd > 0 && (
                                          <div className="t-mr-8">
                                            <span className="text-capitalize font-weight-bold mr-2">
                                              {_t(t("Return"))}
                                            </span>
                                            {totalPayable ? (
                                              <span className="text-capitalize font-weight-bold t-pt-8 t-pb-10">
                                                {currencySymbolLeft()}
                                                {formatPrice(returnMoneyUsd)}
                                                {currencySymbolRight()}
                                              </span>
                                            ) : (
                                              <span className="text-capitalize font-weight-bold t-pt-8 t-pb-10">
                                                {currencySymbolLeft()}
                                                {formatPrice(0)}
                                                {currencySymbolRight()}
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        <div className="t-mr-8">
                                          <button
                                            type="button"
                                            className="btn btn-primary sm-text text-uppercase font-weight-bold"
                                            onClick={
                                              !loading && handleSettleOrder
                                            }
                                          >
                                            {!loading
                                              ? _t(t("settle"))
                                              : _t(t("Please wait"))}
                                          </button>
                                        </div>
                                        {/* <div>
                                            <button
                                              type="button"
                                              className="btn btn-success sm-text text-uppercase font-weight-bold"
                                              onClick={
                                                !loading && handleSubmitOrder
                                              }
                                            >
                                              {!loading
                                                ? _t(t("submit"))
                                                : _t(t("Please wait"))}
                                            </button>
                                          </div> */}
                                      </div>
                                    </div>
                                  )}
                                  {getSystemSettings(
                                    generalSettings,
                                    "pos_screen"
                                  ) === "1" && (
                                    <div className="col-8">
                                      <div className="d-flex justify-content-end align-items-center">
                                        <div className="t-mr-8">
                                          <button
                                            type="button"
                                            className="btn btn-primary sm-text text-uppercase font-weight-bold"
                                            onClick={handleSettleOrderButton}
                                          >
                                            {!loading
                                              ? _t(t("settle"))
                                              : _t(t("Please wait"))}
                                          </button>
                                        </div>
                                        {/* <div>
                                          <button
                                            type="button"
                                            className="btn btn-success sm-text text-uppercase font-weight-bold"
                                            onClick={
                                              !loading && handleSubmitOrder
                                            }
                                          >
                                            {!loading
                                              ? _t(t("submit"))
                                              : _t(t("Please wait"))}
                                          </button>
                                        </div> */}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Display Only Large Screen End  */}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right Side End */}
              </div>
            </div>
          </div>
          {/* Show In Tab   */}
        </main>
      </div>

      {/* show settle  */}
      <div
        className={`fk-settle-container d-flex flex-column justify-content-center ${
          showSettle ? "" : "d-none"
        }`}
      >
        <div className="fk-settle">
          <div className="container-fluid">
            <div className="row gx-3">
              {isShow &&
              orderDetails.payment_type &&
              orderDetails.payment_type[0].id == 2 ? (
                <div className="col-lg-6 px-5">
                  <div className="fk-settle-cal container-fluid mt-5">
                    <Elements stripe={stripeTestPromise}>
                      <StripeForm />
                    </Elements>
                  </div>
                </div>
              ) : (
                <div className="col-lg-6 d-none d-lg-block">
                  <span className="sm-text d-block text-capitalize font-weight-bold py-3">
                    new order
                  </span>
                  <div
                    className="fk-settle__products d-flex flex-column"
                    data-simplebar
                  >
                    <div className="container-fluid">
                      <div className="row gx-3">
                        <div className="col-12">
                          {/* POS Product list will be here  */}
                          <div className="fk-price-table__body t-mt-10">
                            <div className="fk-price-table__body-top">
                              <div className="fk-table">
                                <div className="fk-table__head">
                                  <div className="row g-0 border">
                                    <div className="col-1 text-center border-right">
                                      <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                        {_t(t("S/L"))}
                                      </span>
                                    </div>
                                    <div className="col-6 text-center border-right">
                                      <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                        {_t(t("food item"))}
                                      </span>
                                    </div>
                                    <div className="col-2 text-center border-right">
                                      <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                        {_t(t("QTY"))}
                                      </span>
                                    </div>
                                    <div className="col-3 text-center">
                                      <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pt-5 t-pb-5">
                                        {_t(t("price"))}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="t-pb-30">
                                  <div className="sky-is-blue reverse-this">
                                    {/* loop through order list items */}
                                    {newOrder && newOrder.length > 0 ? (
                                      newOrder.map(
                                        (orderListItem, orderListItemIndex) => {
                                          return (
                                            <>
                                              <div
                                                className={`fk-table-container-order ${
                                                  orderListItemIndex ===
                                                    activeItemInOrder &&
                                                  "active"
                                                } `}
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  //orderListItem's group wise all items
                                                  let tempItems =
                                                    foodForSearch &&
                                                    foodForSearch.filter(
                                                      (tempItem) => {
                                                        return (
                                                          tempItem.food_group_id ===
                                                          orderListItem.item
                                                            .food_group_id
                                                        );
                                                      }
                                                    );

                                                  //orderListItem's group
                                                  let foodGroup =
                                                    foodGroupForSearch &&
                                                    foodGroupForSearch.find(
                                                      (groupItem) => {
                                                        return (
                                                          groupItem.id ===
                                                          parseInt(
                                                            orderListItem.item
                                                              .food_group_id
                                                          )
                                                        );
                                                      }
                                                    );

                                                  // selected pos item
                                                  let selectedItemTemp =
                                                    tempItems &&
                                                    tempItems.find(
                                                      (tempSelectedItem) => {
                                                        return (
                                                          tempSelectedItem.id ===
                                                          orderListItem.item.id
                                                        );
                                                      }
                                                    );

                                                  // Set variations, properties, selected item
                                                  setFoodItem({
                                                    ...foodItem,
                                                    foodGroup: foodGroup,
                                                    items: tempItems,
                                                    selectedItem:
                                                      selectedItemTemp,
                                                    variations:
                                                      selectedItemTemp &&
                                                      parseInt(
                                                        selectedItemTemp.has_variation
                                                      ) === 1
                                                        ? selectedItemTemp.variations
                                                        : null,

                                                    properties:
                                                      selectedItemTemp &&
                                                      parseInt(
                                                        selectedItemTemp.has_property
                                                      ) === 1
                                                        ? selectedItemTemp.properties
                                                        : null,
                                                  });

                                                  //set active order list index for background color of selected
                                                  setActiveItemInOrder(
                                                    orderListItemIndex
                                                  );
                                                }}
                                              >
                                                <div
                                                  className={`row g-0 border-top-0 border-bottom `}
                                                >
                                                  <div className="col-1 text-center border-left d-flex justify-content-center align-items-center">
                                                    {newOrder.length -
                                                      orderListItemIndex}
                                                  </div>
                                                  <div
                                                    className={`col-6 border-left border-right py-2`}
                                                  >
                                                    <div className="d-flex justify-content-between">
                                                      <span className="text-capitalize d-block t-pt-5 t-pb-5 t-pl-5 t-pr-5 sm-text font-weight-bold t-mr-8">
                                                        {
                                                          orderListItem.item
                                                            .name
                                                        }
                                                      </span>
                                                    </div>
                                                    <div className="row g-0">
                                                      {/* if item has variations show the selected in order list */}
                                                      {parseInt(
                                                        orderListItem.item
                                                          .has_variation
                                                      ) === 1 && (
                                                        <div className="col-12">
                                                          <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pr-5 t-pl-5">
                                                            variation :
                                                          </span>
                                                          <span className="text-capitalize xsm-text d-inline-block badge rounded-pill bg-warning text-dark font-weight-md">
                                                            {orderListItem.variation
                                                              ? orderListItem
                                                                  .variation
                                                                  .variation_name
                                                              : "-"}
                                                          </span>
                                                        </div>
                                                      )}

                                                      {/* if item has properties show the selected in order list, loop here  */}
                                                      {orderListItem.properties &&
                                                        orderListItem.properties
                                                          .length > 0 &&
                                                        selectedPropertyGroup[
                                                          orderListItemIndex
                                                        ] !== undefined &&
                                                        selectedPropertyGroup[
                                                          orderListItemIndex
                                                        ].map((thisIsGroup) => {
                                                          let theGroup =
                                                            propertyGroupForSearch &&
                                                            propertyGroupForSearch.find(
                                                              (theItem) => {
                                                                return (
                                                                  theItem.id ===
                                                                  thisIsGroup
                                                                );
                                                              }
                                                            );
                                                          return (
                                                            <div className="col-12">
                                                              <span className="text-capitalize sm-text d-inline-block font-weight-bold t-pr-5 t-pl-5">
                                                                {theGroup &&
                                                                  theGroup.name}{" "}
                                                                :
                                                              </span>
                                                              {orderListItem.properties.map(
                                                                (
                                                                  propertyName
                                                                ) => {
                                                                  if (
                                                                    parseInt(
                                                                      propertyName
                                                                        .item
                                                                        .property_group_id
                                                                    ) ===
                                                                    theGroup.id
                                                                  ) {
                                                                    return (
                                                                      <span className="text-capitalize xsm-text d-inline-block badge rounded-pill bg-warning text-dark font-weight-md mr-1">
                                                                        {
                                                                          propertyName
                                                                            .item
                                                                            .name
                                                                        }{" "}
                                                                        <span>
                                                                          {" "}
                                                                          {propertyName.quantity >
                                                                            1 &&
                                                                            "(" +
                                                                              propertyName.quantity +
                                                                              ")"}
                                                                        </span>
                                                                      </span>
                                                                    );
                                                                  } else {
                                                                    return true;
                                                                  }
                                                                }
                                                              )}
                                                            </div>
                                                          );
                                                        })}

                                                      {/* if item has properties show the selected in order list  */}
                                                    </div>
                                                  </div>
                                                  {/* Quantity */}
                                                  <div className="col-2 text-center border-right d-flex justify-content-center align-items-center">
                                                    <div className="fk-qty t-pt-5 t-pb-5 justify-content-center">
                                                      <input
                                                        type="text"
                                                        value={
                                                          orderListItem.quantity
                                                        }
                                                        className="fk-qty__input t-bg-clear"
                                                        readOnly
                                                      />
                                                    </div>
                                                  </div>
                                                  {/* Quantity */}

                                                  {/* Price */}
                                                  <div className="col-3 text-center border-right d-flex justify-content-center align-items-center">
                                                    <div className="text-capitalize sm-text font-weight-bold t-pt-5 t-pb-5">
                                                      {parseInt(
                                                        orderListItem.item
                                                          .has_variation
                                                      ) === 1 ? (
                                                        <>
                                                          {currencySymbolLeft()}

                                                          {showPriceOfEachOrderItem(
                                                            orderListItemIndex
                                                          )}
                                                          {currencySymbolRight()}
                                                        </>
                                                      ) : (
                                                        <>
                                                          {currencySymbolLeft()}
                                                          {showPriceOfEachOrderItem(
                                                            orderListItemIndex
                                                          )}
                                                          {currencySymbolRight()}
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                  {/* Price */}
                                                </div>
                                              </div>
                                            </>
                                          );
                                        }
                                      )
                                    ) : (
                                      <div className="text-primary text-center font-weight-bold pt-5 xsm-text text-uppercase">
                                        {_t(
                                          t(
                                            "Select food item to add to the list"
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-lg-6">
                <div className="row gx-3">
                  <div className="col-md-9">
                    {returnMoneyUsd > 0 ? (
                      <div
                        className="alert alert-danger text-center"
                        style={{ height: "56px", marginTop: "16px" }}
                      >
                        Return Amount: {formatPrice(returnMoneyUsd)}
                      </div>
                    ) : (
                      <>
                        <div className="fk-settle-group d-flex t-mt-15">
                          <label
                            htmlFor="settle-total"
                            className="text-capitalize w-50 fk-settle-group__label font-weight-bold"
                          >
                            total:
                          </label>
                          <div
                            id="settle-total"
                            className="w-50 fk-settle-group__input text-right pr-2 font-weight-bold"
                          >
                            {formatPrice(totalPayable)}
                          </div>
                        </div>
                        <div className="fk-settle-group d-flex t-mt-10 t-mb-15">
                          <label
                            htmlFor="settle-paid-amount"
                            className="text-capitalize w-50 fk-settle-group__label font-weight-bold"
                          >
                            paid amount:
                          </label>
                          <div
                            id="settle-total"
                            className="w-50 fk-settle-group__input text-right pr-2 font-weight-bold"
                          >
                            {paidMoney == "0" ? setPaidMoney("") : paidMoney}
                          </div>
                        </div>
                      </>
                    )}
                    <div className="fk-settle-cal container-fluid">
                      <div className="row h-100 g-2 mt-1">
                        <div className="col-2">
                          <div className="row g-2 h-100">
                            <div className="col-12">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + "" + 10);
                                  }
                                }}
                              >
                                10
                              </button>
                            </div>
                            <div className="col-12">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + "" + 20);
                                  }
                                }}
                              >
                                20
                              </button>
                            </div>
                            <div className="col-12">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + "" + 50);
                                  }
                                }}
                              >
                                50
                              </button>
                            </div>
                            <div className="col-12 mb-2">
                              <button
                                className="fk-settle-cal-btn t-bg-p t-text-white"
                                onClick={() => {
                                  if (!returnMoneyUsd > 0) {
                                    setPaidMoney(paidMoney + "" + 100);
                                  }
                                }}
                              >
                                100
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="col-10">
                          <div className="row g-2 h-100">
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 1);
                                      }
                                    }}
                                  >
                                    1
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 4);
                                      }
                                    }}
                                  >
                                    4
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 7);
                                      }
                                    }}
                                  >
                                    7
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-p t-text-white"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 500);
                                      }
                                    }}
                                  >
                                    500
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 2);
                                      }
                                    }}
                                  >
                                    2
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 5);
                                      }
                                    }}
                                  >
                                    5
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 8);
                                      }
                                    }}
                                  >
                                    8
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-p t-text-white"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 1000);
                                      }
                                    }}
                                  >
                                    1000
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 3);
                                      }
                                    }}
                                  >
                                    3
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 6);
                                      }
                                    }}
                                  >
                                    6
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-bg-w"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 9);
                                      }
                                    }}
                                  >
                                    9
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn  t-bg-d t-text-white"
                                    onClick={() => {
                                      setPaidMoney("");
                                      setReturnMoneyUsd(0);
                                      setOrderDetails({
                                        ...orderDetails,
                                        payment_type: null,
                                      });
                                    }}
                                  >
                                    C
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="col-3">
                              <div className="row g-2 h-100">
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-text-white t-bg-ac text-capitalize"
                                    onClick={() => {
                                      let theP = parseFloat(
                                        formatPrice(totalPayable)
                                      );
                                      setPaidMoney(theP);
                                    }}
                                  >
                                    all
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-text-white t-bg-ac text-capitalize"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + ".");
                                      }
                                    }}
                                  >
                                    .
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn t-text-white t-bg-ac text-capitalize"
                                    onClick={() => {
                                      if (!returnMoneyUsd > 0) {
                                        setPaidMoney(paidMoney + "" + 0);
                                      }
                                    }}
                                  >
                                    0
                                  </button>
                                </div>
                                <div className="col-12">
                                  <button
                                    className="fk-settle-cal-btn bg-primary t-text-white t-bg-r text-capitalize"
                                    onClick={!loading && handleSettleOrder}
                                  >
                                    {!loading ? _t(t("settle")) : _t(t("wait"))}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex flex-column justify-content-center t-mt-15">
                      <div className="fk-settle__pay" data-simplebar>
                        <div className="row gx-3">
                          <div className="col-12">
                            {/* POS Navigation will ber here */}
                            <ul className="t-list fk-pos-nav list-group">
                              <li className="fk-pos-nav__list">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsShow(false);
                                    setShowSettle(false);
                                  }}
                                  className="w-100 t-text-dark t-heading-font btn alert alert-danger font-weight-bold text-uppercase py-3 mb-3"
                                >
                                  Go back
                                </button>
                              </li>
                              {/* paymentTypes */}
                              {paymentTypeForSearch &&
                                paymentTypeForSearch.map(
                                  (groupItem, groupIndex) => {
                                    return (
                                      <li
                                        className="fk-pos-nav__list"
                                        key={groupIndex}
                                      >
                                        <button
                                          type="button"
                                          //set active or !
                                          className={`w-100 t-text-dark t-heading-font btn btn-outline-danger font-weight-bold text-uppercase py-3 ${
                                            orderDetails &&
                                            orderDetails.payment_type !==
                                              null &&
                                            orderDetails.payment_type[0].id ===
                                              groupItem.id
                                              ? "active"
                                              : ""
                                          }`}
                                          onClick={() => {
                                            handleSetpaymentTypeSingle(
                                                groupItem
                                              );
                                             
                                          }}
                                        >
                                          {groupItem.name}
                                        </button>
                                      </li>
                                    );
                                  }
                                )}
                              {/* paymentTypes */}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="col-lg-6">
              <div id="card-element"></div>
              <div className="panel panel-default credit-card-box">
                <div className="panel-heading display-table">
                  <h3 className="panel-title">Payment Details</h3>
                </div>
                <div className="panel-body">
                  {!success ? (
                    <form onSubmit={handleSubmit}>
                      <fieldset>
                        <div className="row">
                          <div className="col-xs-12 form-group required">
                            <label className="control-label">
                              Name on Card
                            </label>{" "}
                            <input
                              className="form-control"
                              value={name}
                              size="4"
                              type="text"
                              id="name"
                              onChange={handleName}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-xs-12 form-group required">
                            <label className="control-label">Card Details</label>
                            <CardElement
                              options={CARD_OPTIONS}
                            />
                          </div>
                        </div>
                      </fieldset>
                      <div className="row mt-4">
                        <div className="col-xs-12">
                          <button
                            className="btn btn-danger btn-lg btn-block"
                            type="submit"
                          >
                            Pay Now (${paymentAmount})
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <h4
                      className={`alert alert-${
                        message.success ? "success" : "danger"
                      } text-center py-3`}
                    >
                      {message.text}
                    </h4>
                  )}
                </div>
              </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pos;
