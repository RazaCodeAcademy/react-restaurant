import React, { useContext, useState, useEffect } from "react";
import ReactDOM from "react-dom"
import { Link, NavLink, useHistory } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons, BraintreePayPalButtons } from "@paypal/react-paypal-js";

//importing context consumer here
import { UserContext } from "../../../contexts/User";
import { FoodContext } from "../../../contexts/Food";
import { RestaurantContext } from "../../../contexts/Restaurant";
import { SettingsContext } from "../../../contexts/Settings";

//axios and base url
import axios from "axios";
import { BASE_URL, SAAS_APPLICATION } from "../../../BaseUrl";

//functions
import {
  _t,
  modalLoading,
  restaurantMenuLink,
  getSystemSettings,
  getCookie,
  deleteCookie,
  currencySymbolLeft,
  formatPrice,
  currencySymbolRight,
} from "../../../functions/Functions";

//3rd party packages
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//jQuery initialization
import $ from "jquery";

const RestaurantLanding = () => {
  const { t, i18n } = useTranslation();
  const history = useHistory();

  //getting context values here
  let { navLanguageList, navCurrencyList, generalSettings, showManageStock, paypal_client_id } =
    useContext(SettingsContext);
  //auth user
  const { authUserInfo } = useContext(UserContext);
  //restaurant
  let { branchForSearch } = useContext(RestaurantContext);
  //food
  let {
    getFoodWeb,
    foodListWeb,
    foodGroupWeb,
    propertyGroupWeb,
    workPeriodWeb,
    foodStockWeb,
    setFoodStockWeb,
  } = useContext(FoodContext);

  //use state
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVariation, setShowVariation] = useState(false);

  const [deliverymenShow, setdeliverymenShow] = useState(false);
  const [checkLoginUser, setCheckLoginUser] = useState(0);
  //
  const [defaultLang, setDefaultLang] = useState(null);
  const [defaultCurrency, setDefaultCurrency] = useState(null);

  //food and group
  const [foodItems, setFoodItems] = useState({
    list: null,
    group: null,
    selectedItem: null,
    variations: null,
    properties: null,
  });

  //new order
  const [newOrder, setNewOrder] = useState({
    variation: null,
    quantity: 1,
    properties: null,
  });

  //order details
  const [orderDetails, setOrderDetails] = useState({
    items: [],
    branch: null,
    workPeriod: null,
    workPeriodStatus: false,
    address: null,//null
    name: null,
    phn_no: null,
    note: null,
    payment_type: "COD",
    uploading: false,
  });

  // check auth user 
  const checkLoginfunc = () => {
    getCookie() !== undefined ? setCheckLoginUser(0) : setCheckLoginUser(1);
  }

  //useeffect == componentDidMount()
  useEffect(() => {
    handleJquery();
    getFoodWeb();
    deliveryMenu();
    handleOnLoadDefaultLang();
    handleOnLoadDefaultCurrency();
    checkLoginfunc();

    setOrderDetails({
      ...orderDetails,
      address: authUserInfo.details && authUserInfo.details.address,
      name: authUserInfo.details && authUserInfo.details.name,
      phn_no: authUserInfo.details && authUserInfo.details.phn_no,
    });
    if (foodGroupWeb && foodListWeb) {
      let temp = foodListWeb.filter((foodItem, foodItemIndex) => {
        return parseInt(foodItem.food_group_id) === foodGroupWeb[0].id;
      });
      setFoodItems({ ...foodItems, list: temp, group: foodGroupWeb[0] });
    }
    setTimeout(() => {
      setLoading(false);
    }, 2500);

  }, [authUserInfo, navCurrencyList,]);


  // deliveryman menu update
  const deliveryMenu = () => {

    const url = BASE_URL + `/settings/deliverymen-menu-info`;
    axios.get(url, {
      headers: { Authorization: `Bearer ${getCookie()}` },
    }).then((res) => {
      if (res.data.length == 0 || res.data[0].value == 1) {
        setdeliverymenShow(true);
      } else {
        setdeliverymenShow(false);
      }
    });

  }

  //handle jQuery
  const handleJquery = () => {
    $(window).on("scroll", function () {
      var toTopVisible = $("html").scrollTop();
      if (toTopVisible > 500) {
        $(".scrollup").fadeIn();
      } else {
        $(".scrollup").fadeOut();
      }
    });

    // MouseHover Animation home 1
    var hoverLayer = $(".banner-area");
    var heroImgOne = $(".p-shape-1");
    var heroImgTwo = $(".p-shape-2");
    var heroImgThree = $(".p-shape-3");
    var heroImgFour = $(".p-shape-4");
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 100;
      var valueY = (e.pageY * -1) / 120;
      heroImgOne.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      heroImgTwo.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 40;
      var valueY = (e.pageY * -1) / 60;
      heroImgThree.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 80;
      var valueY = (e.pageY * -1) / 100;
      heroImgFour.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });

    // MouseHover Animation home 2
    var hoverLayer2 = $(".burger-promo-area");
    var heroImgfive = $(".bs1");
    var heroImgsix = $(".bs2");
    var heroImgseven = $(".bs5");
    var heroImgeight = $(".bs6");
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 100;
      var valueY = (e.pageY * -1) / 120;
      heroImgfive.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      heroImgsix.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 40;
      var valueY = (e.pageY * -1) / 60;
      heroImgseven.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer2.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 80;
      var valueY = (e.pageY * -1) / 100;
      heroImgeight.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });

    // MouseHover Animation home 3
    var hoverLayer3 = $(".snack-section");
    var heroImgnine = $(".ss1");
    var heroImgten = $(".ss2");
    var heroImgeleven = $(".ss3");
    var heroImgtweleve = $(".mss2");
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 100;
      var valueY = (e.pageY * -1) / 120;
      heroImgtweleve.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 60;
      var valueY = (e.pageY * -1) / 80;
      heroImgnine.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 40;
      var valueY = (e.pageY * -1) / 60;
      heroImgten.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
    hoverLayer3.mousemove(function (e) {
      var valueX = (e.pageX * -1) / 80;
      var valueY = (e.pageY * -1) / 100;
      heroImgeleven.css({
        transform: "translate3d(" + valueX + "px," + valueY + "px, 0)",
      });
    });
  };

  //dynamic style
  const style = {
    logo: {
      backgroundImage:
        generalSettings &&
        `url(${getSystemSettings(generalSettings, "type_logo")})`,
    },
    currency: {
      backgroundColor:
        generalSettings && getSystemSettings(generalSettings, "type_clock"),
      color:
        generalSettings && getSystemSettings(generalSettings, "type_color"),
    },
  };

  //logout
  const handleLogout = () => {
    deleteCookie();
  };

  //orders variation
  const handleOrderItemVariation = (item) => {
    setNewOrder({
      ...newOrder,
      variation: item,
    });
  };

  //property
  const handleOrderItemProperty = (propertyItem) => {
    let newTemp = [];
    if (newOrder.properties !== null && newOrder.properties.length > 0) {
      let checkExist = newOrder.properties.find((exist) => {
        return exist.id === propertyItem.id;
      });
      if (checkExist === undefined) {
        newOrder.properties.map((oldItem) => {
          newTemp.push(oldItem);
        });
        propertyItem.quantity = 1;
        newTemp.push(propertyItem);
      } else {
        newOrder.properties.map((oldItem) => {
          if (oldItem.id !== propertyItem.id) {
            newTemp.push(oldItem);
          }
        });
      }
      setNewOrder({
        ...newOrder,
        properties: newTemp,
      });
    } else {
      propertyItem.quantity = 1;
      setNewOrder({
        ...newOrder,
        properties: [propertyItem],
      });
    }
  };

  //multiple qty
  const checkedProperty = (eachItem) => {
    if (newOrder.properties !== null) {
      let findChecked = newOrder.properties.find((checkIt) => {
        return checkIt.id === eachItem.id;
      });
      if (findChecked === undefined) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  //property checked
  const checkCheckedPropertyQuantity = (propertyItem) => {
    if (newOrder.properties !== null) {
      let theItem = newOrder.properties.find((findThis) => {
        return findThis.id === propertyItem.id;
      });
      if (theItem !== undefined) {
        return theItem.quantity;
      } else {
        return 1;
      }
    } else {
      return 1;
    }
  };

  //set propertyqty
  const handlePropertyQty = (propertyItem, action) => {
    let newTemp = [];
    if (newOrder.properties !== null && newOrder.properties.length > 0) {
      newOrder.properties.map((pushThis) => {
        if (pushThis.id === propertyItem.id) {
          if (action === "+") {
            pushThis.quantity = pushThis.quantity + 1;
            newTemp.push(pushThis);
          } else {
            if (pushThis.quantity > 1) {
              pushThis.quantity = pushThis.quantity - 1;
            }
            newTemp.push(pushThis);
          }
        } else {
          newTemp.push(pushThis);
        }
      });
      setNewOrder({
        ...newOrder,
        properties: newTemp,
      });
    }
  };

  //get already ordered qty
  const handleAlreadyOrderedQty = (id) => {
    let temp = 0;
    if (orderDetails.items.length > 0) {
      orderDetails.items.map((item) => {
        if (parseInt(item.item.id) === id) {
          temp += parseInt(item.quantity);
        }
      });
    }
    return temp;
  };

  //add to cart
  const handleOrder = () => {
    // check if manage stock is enable
    if (showManageStock) {
      if (
        handleGetStock(foodItems.selectedItem.id) >
        handleAlreadyOrderedQty(foodItems.selectedItem.id)
      ) {
        let tempPrice = 0;
        //if no variation
        if (newOrder.variation !== null) {
          tempPrice = parseFloat(newOrder.variation.food_with_variation_price);
        } else {
          tempPrice = parseFloat(foodItems.selectedItem.price);
        }

        if (newOrder.properties !== null && newOrder.properties.length > 0) {
          let tempPropertyPrice = 0;
          newOrder.properties.map((propertyItem, propertyItemIndex) => {
            tempPropertyPrice =
              tempPropertyPrice +
              parseFloat(propertyItem.extra_price) * propertyItem.quantity;
          });
          tempPrice = tempPrice + tempPropertyPrice;
        }

        let tempOrderItem = {
          item: foodItems.selectedItem,
          quantity: newOrder.quantity,
          variation: newOrder.variation,
          properties: newOrder.properties,
          subTotal: tempPrice,
        };
        setOrderDetails({
          ...orderDetails,
          items: [...orderDetails.items, tempOrderItem],
        });
        setShowVariation(false);
        setShowCheckout(false);
        setShowCart(true);
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
      let tempPrice = 0;
      //if no variation
      if (newOrder.variation !== null) {
        tempPrice = parseFloat(newOrder.variation.food_with_variation_price);
      } else {
        tempPrice = parseFloat(foodItems.selectedItem.price);
      }

      if (newOrder.properties !== null && newOrder.properties.length > 0) {
        let tempPropertyPrice = 0;
        newOrder.properties.map((propertyItem, propertyItemIndex) => {
          tempPropertyPrice =
            tempPropertyPrice +
            parseFloat(propertyItem.extra_price) * propertyItem.quantity;
        });
        tempPrice = tempPrice + tempPropertyPrice;
      }

      let tempOrderItem = {
        item: foodItems.selectedItem,
        quantity: newOrder.quantity,
        variation: newOrder.variation,
        properties: newOrder.properties,
        subTotal: tempPrice,
      };
      setOrderDetails({
        ...orderDetails,
        items: [...orderDetails.items, tempOrderItem],
      });
      setShowVariation(false);
      setShowCheckout(false);
      setShowCart(true);
    }

  };

  //stock
  const handleGetStock = (id) => {
    if (orderDetails.branch === null) {
      return 0;
    }
    let stock = foodStockWeb.find((item) => {
      return (
        parseInt(item.food_id) === parseInt(id) &&
        parseInt(item.branch_id) === parseInt(orderDetails.branch)
      );
    });
    if (stock === undefined || stock.qty < 0) {
      return 0;
    }
    return stock.qty;
  };

  //order quantity
  const handleQty = (cartItemIndex, action) => {
    let oldItems = [];
    orderDetails.items.map((orderItem, orderItemIndex) => {
      if (orderItemIndex !== cartItemIndex) {
        oldItems.push(orderItem);
      } else {
        if (action === "+") {
          let temp = orderItem;

          // check manage stock enable
          if (showManageStock) {
            let stock = handleGetStock(temp.item.id);
            if (stock > handleAlreadyOrderedQty(temp.item.id)) {
              temp.quantity = temp.quantity + 1;
            } else {
              toast.error(`${_t(t("Reached Stock Limit"))}`, {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              });
            }
          } else {
            temp.quantity = temp.quantity + 1;
          }

          let tempPrice = 0;
          //if no variation
          if (newOrder.variation !== null) {
            tempPrice = parseFloat(
              newOrder.variation.food_with_variation_price
            );
          } else {
            tempPrice = parseFloat(foodItems.selectedItem.price);
          }

          if (newOrder.properties !== null && newOrder.properties.length > 0) {
            let tempPropertyPrice = 0;
            newOrder.properties.map((propertyItem, propertyItemIndex) => {
              tempPropertyPrice =
                tempPropertyPrice +
                parseFloat(propertyItem.extra_price) * propertyItem.quantity;
            });
            tempPrice = tempPrice + tempPropertyPrice;
          }

          temp.subTotal = tempPrice * temp.quantity;
          oldItems.push(temp);
        } else {
          let temp = orderItem;
          if (temp.quantity > 1) {
            temp.quantity = temp.quantity - 1;
            let tempPrice = 0;
            //if no variation
            if (newOrder.variation !== null) {
              tempPrice = parseFloat(
                newOrder.variation.food_with_variation_price
              );
            } else {
              tempPrice = parseFloat(foodItems.selectedItem.price);
            }

            if (
              newOrder.properties !== null &&
              newOrder.properties.length > 0
            ) {
              let tempPropertyPrice = 0;
              newOrder.properties.map((propertyItem, propertyItemIndex) => {
                tempPropertyPrice =
                  tempPropertyPrice +
                  parseFloat(propertyItem.extra_price) * propertyItem.quantity;
              });
              tempPrice = tempPrice + tempPropertyPrice;
            }

            temp.subTotal = tempPrice * temp.quantity;
            oldItems.push(temp);
          }
        }
      }
    });
    setOrderDetails({ ...orderDetails, items: oldItems });
  };

  //calculate total
  const getTotal = () => {
    let total = 0;
    if (orderDetails.items.length > 0) {
      orderDetails.items.map((temp) => {
        total += temp.subTotal;
      });
    }
    return total;
  };

  //calculate vat
  const getVat = () => {
    let vat = 0;
    let rate = parseFloat(getSystemSettings(generalSettings, "type_vat"));
    vat = (getTotal() * rate) / 100;
    return vat;
  };

  //handle changes
  const handleChange = (e) => {
    e.preventDefault();
    setOrderDetails({
      ...orderDetails,
      [e.target.name]: e.target.value,
    });
  };

  //submit order
  const handleOrderSubmit = (e) => {
    setOrderDetails({
      ...orderDetails,
      uploading: true,
    });
    e.preventDefault();
    let url = BASE_URL + "/website/order";
    let formData = orderDetails;
    formData.subTotal = getTotal();
    formData.vat = getVat();
    return axios
      .post(url, orderDetails, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data !== "ended") {
          setShowCheckout(false);
          setFoodStockWeb(res.data);
          setOrderDetails({
            items: [],
            branch: null,
            workPeriod: null,
            workPeriodStatus: false,
            address: authUserInfo.details && authUserInfo.details.address,
            name: authUserInfo.details && authUserInfo.details.name,
            phn_no: authUserInfo.details && authUserInfo.details.phn_no,
            note: null,
            payment_type: "COD",
            uploading: false,
          });
          toast.success(`${_t(t("Your order has been placed"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
        } else {
          toast.error(`${_t(t("Sorry, this branch is closed now"))}`, {
            position: "bottom-center",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            className: "text-center toast-notification",
          });
          setOrderDetails({
            ...orderDetails,
            uploading: false,
          });
        }
      })
      .catch((err) => {
        setOrderDetails({
          ...orderDetails,
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

  //set default language on site load
  const handleOnLoadDefaultLang = () => {
    let localLang = localStorage.i18nextLng;
    if (localLang) {
      if (localLang === undefined || localLang.includes("en-")) {
        navLanguageList &&
          navLanguageList.map((item) => {
            if (item.is_default === true) {
              i18n.changeLanguage(item.code);
              setDefaultLang(item);
            }
            return true;
          });
      } else {
        const temp =
          navLanguageList &&
          navLanguageList.find((item) => {
            return item.code === localLang;
          });
        setDefaultLang(temp);
        i18n.changeLanguage(localLang);
      }
    }
  };

  //change language to selected
  const handleDefaultLang = (e) => {
    let lang =
      navLanguageList &&
      navLanguageList.find((theItem) => {
        return theItem.id === parseInt(e.target.value);
      });
    i18n.changeLanguage(lang.code);
    setDefaultLang(lang);
    toast.success(`${_t(t("Language has been switched!"))}`, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });
  };

  //set default currency on site load
  const handleOnLoadDefaultCurrency = () => {
    let localCurrency = JSON.parse(localStorage.getItem("currency"));
    if (localCurrency === null) {
      navCurrencyList &&
        navCurrencyList.map((item) => {
          if (item.is_default === true) {
            setDefaultCurrency(item);
            localStorage.setItem("currency", JSON.stringify(item));
          }
          return true;
        });
    } else {
      const temp =
        navCurrencyList &&
        navCurrencyList.find((item) => {
          return item.code === localCurrency.code;
        });
      setDefaultCurrency(temp);
    }
  };

  //change currency to selected
  const handleDefaultCurrency = (e) => {
    let item =
      navCurrencyList &&
      navCurrencyList.find((theItem) => {
        return theItem.id === parseInt(e.target.value);
      });
    localStorage.setItem("currency", JSON.stringify(item));
    setDefaultCurrency(item);
    toast.success(`${_t(t("Currency has been changed!"))}`, {
      position: "bottom-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      className: "text-center toast-notification",
    });
  };

  //get selected branch
  const getSelectedBranch = (id) => {
    if (orderDetails && orderDetails.branch !== null) {
      if (id === orderDetails.branch.id) {
        return true;
      }
    }
    return false;
  };



  //paypal integration
  const initialOptions = {
    // "client-id": { paypal_client_id },
    "client-id": "AWOafqislzl8zx6-w5BwIOu9p-7DXKNt3Ly4hGzXYNRYBKJkY_yrUcAYSc5RP6YFz_ckikuYoDoBs9NK",
    currency: "USD",
    intent: "capture",
  };

  return (
    <>
      {/* paypal modal */}
      <div className="modal fade" id="exampleModalCenter" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title" id="exampleModalLongTitle">pay online</h6>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <PayPalScriptProvider
                options={initialOptions}>
                <PayPalButtons
                  forceReRender={[orderDetails]}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{
                        amount: {
                          value: formatPrice(getTotal() + getVat())
                        }
                      }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then(function (orderData) {
                      var transaction_id = orderData.purchase_units[0].payments.captures[0].id;
                      console.log(transaction_id);
                      // order 
                      setOrderDetails({
                        ...orderDetails,
                        uploading: true,
                      });

                      let url = BASE_URL + "/website/order";
                      let formData = orderDetails;
                      formData.subTotal = getTotal();
                      formData.vat = getVat();
                      formData.payment_type = 'PAYPAL';
                      formData.payment_id = transaction_id;
                      console.log(formData);
                      return axios
                        .post(url, orderDetails, {
                          headers: { Authorization: `Bearer ${getCookie()}` },
                        })
                        .then((res) => {
                          if (res.data !== "ended") {
                            setShowCheckout(false);
                            setFoodStockWeb(res.data);
                            setOrderDetails({
                              items: [],
                              branch: null,
                              workPeriod: null,
                              workPeriodStatus: false,
                              address: authUserInfo.details && authUserInfo.details.address,
                              name: authUserInfo.details && authUserInfo.details.name,
                              phn_no: authUserInfo.details && authUserInfo.details.phn_no,
                              note: null,
                              payment_type: "COD",
                              uploading: false,
                            });
                            toast.success(`${_t(t("Your order has been placed"))}`, {
                              position: "bottom-center",
                              autoClose: 10000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              className: "text-center toast-notification",
                            });
                            history.push('/');
                          } else {
                            toast.error(`${_t(t("Sorry, this branch is closed now"))}`, {
                              position: "bottom-center",
                              autoClose: 10000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              className: "text-center toast-notification",
                            });
                            setOrderDetails({
                              ...orderDetails,
                              uploading: false,
                            });
                          }
                        })
                        .catch((err) => {
                          setOrderDetails({
                            ...orderDetails,
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
                      // end here

                    });
                  }}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        </div>
      </div>
      {/* paypal modal */}

      <Helmet>
        <title>
          {generalSettings && getSystemSettings(generalSettings, "siteName")}
        </title>
        <link rel="stylesheet" href="/website/css/animate.css" />
        <link rel="stylesheet" href="/website/css/meanmenu.min.css" />
        <link rel="stylesheet" href="./website/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/website/css/font-awsome-all.min.css" />
        <link rel="stylesheet" href="/website/css/magnific-popup.css" />
        <link rel="stylesheet" href="/website/css/slick.css" />
        <link rel="stylesheet" href="/website/css/jquery-ui.css" />
        <link rel="stylesheet" href="/website/css/style.css" />

        <script src="/website/js/vendor/jquery-2.2.4.min.js"></script>
        <script src="/website/js/vendor/bootstrap.min.js"></script>
        <script src="./website/js/vendor/jquery.meanmenu.min.js"></script>
        <script src="/website/js/vendor/jquery.magnific-popup.min.js"></script>
        <script src="/website/js/vendor/slick.min.js"></script>
        <script src="/website/js/vendor/counterup.min.js"></script>
        <script src="/website/js/vendor/countdown.js"></script>
        <script src="/website/js/vendor/waypoints.min.js"></script>
        <script src="/website/js/vendor/jquery-ui.js"></script>
        <script src="/website/js/vendor/isotope.pkgd.min.js"></script>
        <script src="/website/js/vendor/easing.min.js"></script>
        <script src="/website/js/vendor/wow.min.js"></script>
        <script src="/website/js/simplebar.js"></script>
        <script src="/website/js/main.js"></script>
      </Helmet>

      {/* <!-- Preloader Starts --> */}
      <div className={`preloader02 ${!loading && "d-none"}`} id="preloader02">
        <div className="preloader-inner">
          <div className="spinner">
            <div className="bounce1"></div>
            <div className="bounce2"></div>
            <div className="bounce3"></div>
          </div>
        </div>
      </div>

      {/* Floating Cart button*/}
      <div
        className={`kh-floating-cart pointer-cursor ${loading && "d-none"}`}
        onClick={() => {
          setShowCart(true);
        }}
      >
        <div className="kh-floating-cart__container">
          <span className="kh-floating-cart__text text-capitalize pb-2">
            <i className="fas fa-shopping-cart"></i>{" "}
            {orderDetails.items ? orderDetails.items.length : 0} {_t(t("item"))}
          </span>
          <span className="kh-floating-cart__money text-uppercase py-2 text-center">
            {currencySymbolLeft()}
            {formatPrice(getTotal() + getVat())}
            {currencySymbolRight()}
          </span>
        </div>
      </div>
      {/* Floating Cart End */}

      {/* cart drawer */}
      {showCart && (
        <div className={`kh-drawer`}>
          <div className="kh-drawer__container">
            <div className="kh-drawer__head py-3 my-3 d-flex align-items-center justify-content-between">
              <span className="kh-drawer__head-title text-capitalize">
                {getSystemSettings(generalSettings, "siteName")}
              </span>
              <button
                type="button"
                className="kh-drawer__close"
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(false);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="kh-drawer__body py-3" data-simplebar>
              <div className="kh-drawer__container">
                <ul className="kh-drawer__list" style={{ minHeight: "300px" }}>
                  {orderDetails.items && orderDetails.items.length > 0 ? (
                    orderDetails.items.map((cartItem, cartItemIndex) => {
                      return (
                        <li className="kh-drawer__list-item border-bottom" key={cartItemIndex}>
                          <div className="kh-drawer__product py-1 d-flex justify-content-between align-items-center">
                            <a
                              href="#"
                              className="kh-drawer__product-title text-capitalize pointer-cursor"
                            >
                              {cartItem.item.name}
                            </a>
                            <span className="kh-drawer__product-price text-uppercase text-right">
                              {currencySymbolLeft()}
                              {formatPrice(cartItem.subTotal)}
                              {currencySymbolRight()}
                            </span>
                          </div>

                          <div className="kh-drawer__product d-flex justify-content-between ">
                            {cartItem.variation && (
                              <a
                                href="#"
                                className="kh-drawer__product-subtitle text-capitalize pointer-cursor"
                              >
                                {cartItem.variation && (
                                  <span className="d-block">
                                    + {cartItem.variation.variation_name}
                                  </span>
                                )}
                              </a>
                            )}
                          </div>

                          <div className="kh-drawer__product d-flex justify-content-between ">
                            {cartItem.properties &&
                              cartItem.properties.length > 0 && (
                                <a
                                  href="#"
                                  className="kh-drawer__product-subtitle text-capitalize pointer-cursor"
                                >
                                  {cartItem.properties.map((eachProperty) => {
                                    return (
                                      <span className="d-block">
                                        + {eachProperty.name}
                                        {eachProperty.quantity > 1
                                          ? "(" + eachProperty.quantity + ")"
                                          : ""}
                                      </span>
                                    );
                                  })}
                                </a>
                              )}
                            {!cartItem.properties && (
                              <a
                                href="#"
                                className="kh-drawer__product-subtitle text-capitalize pointer-cursor"
                              >
                                <span className="d-block"></span>
                              </a>
                            )}

                            <div className="kh-drawer__product-quantity d-flex justify-content-between align-items-center">
                              <button
                                className="kh-drawer__product-quantity-decrease kh-drawer__product-quantity-btn"
                                onClick={() => {
                                  handleQty(cartItemIndex, "-");
                                }}
                              >
                                <i
                                  className={`fas ${cartItem.quantity > 1
                                    ? "fa-minus"
                                    : "fa-trash"
                                    }`}
                                ></i>
                              </button>
                              <div className="kh-drawer__product-quantity-value text-center flex-grow-1">
                                {cartItem.quantity}
                              </div>
                              <button
                                className="kh-drawer__product-quantity-increase kh-drawer__product-quantity-btn"
                                onClick={() => {
                                  handleQty(cartItemIndex, "+");
                                }}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <div
                      className="text-center"
                      style={{ minHeight: "300px", paddingTop: "100px" }}
                    >
                      {_t(t("No item added"))}
                    </div>
                  )}
                </ul>
              </div>
            </div>
            <div className="kh-drawer__foot py-3 my-3">
              <div className="kh-drawer__container">
                <div className="d-flex align-items-center justify-content-between my-2">
                  <div className="kh-drawer__text text-capitalize">
                    {_t(t("subtotal"))}
                  </div>
                  <div className="kh-drawer__text text-right text-uppercase sm-text">
                    {currencySymbolLeft()}
                    {formatPrice(getTotal())}
                    {currencySymbolRight()}
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between my-2">
                  <div className="kh-drawer__text text-capitalize">
                    {getSystemSettings(generalSettings, "vat_system") ===
                      "igst"
                      ? `${_t(t("vat"))}(${getSystemSettings(
                        generalSettings,
                        "type_vat"
                      )}%)`
                      : getSystemSettings(generalSettings, "vat_system") ===
                        "cgst" ? "cgst+sgst" +
                        "(" +
                        getSystemSettings(generalSettings, "cgst") + "%" +
                        "+" +
                        getSystemSettings(generalSettings, "sgst") +
                      "%)" :
                        `${_t(t("tax"))}(${getSystemSettings(
                          generalSettings,
                          "tax"
                        )}%)`}

                  </div>
                  <div className="kh-drawer__text text-right text-uppercase sm-text">
                    {currencySymbolLeft()}
                    {formatPrice(getVat())}
                    {currencySymbolRight()}
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between my-2">
                  <div className="kh-drawer__text text-capitalize">total</div>
                  <div className="kh-drawer__text text-right text-uppercase sm-text">
                    {currencySymbolLeft()}
                    {formatPrice(getTotal() + getVat())}
                    {currencySymbolRight()}
                  </div>
                </div>

                {getCookie() === undefined ? (
                  <NavLink to="/login" className="btn w-100 text-uppercase">
                    {_t(t("Login"))}
                  </NavLink>
                ) : (
                  <>
                    {orderDetails.items.length > 0 ? (
                      <button
                        className="btn w-100 text-uppercase"
                        onClick={() => {
                          setShowCart(false);
                          setShowCheckout(true);
                        }}
                      >
                        {_t(t("go to checkout"))}
                      </button>
                    ) : (
                      <button
                        className="btn w-100 text-uppercase"
                        onClick={() => {
                          setShowCart(false);
                          setShowCheckout(true);
                        }}
                        disabled
                      >
                        {_t(t("go to checkout"))}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* cart drawer ends*/}

      {/* Checkout drawer */}
      {showCheckout && (
        <div className="kh-drawer">
          <form onSubmit={handleOrderSubmit}>
            <div className="kh-drawer__container">
              <div className="kh-drawer__head py-3 my-3 d-flex align-items-center justify-content-between">
                <button
                  type="button"
                  className="kh-drawer__back"
                  onClick={() => {
                    setShowCart(true);
                    setShowCheckout(false);
                  }}
                >
                  <i className="fas fa-arrow-left"></i>
                </button>
                <span className="kh-drawer__head-title text-capitalize">
                  {getSystemSettings(generalSettings, "siteName")}
                </span>
                <button
                  type="button"
                  className="kh-drawer__close"
                  onClick={() => {
                    setShowCart(false);
                    setShowCheckout(false);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="kh-drawer__body py-3" data-simplebar>
                <div className="kh-drawer__container">
                  <ul className="kh-drawer__list">
                    <li className="kh-drawer__list-item">
                      <div className="kh-drawer__details">
                        <div className="kh-drawer__details-head d-flex align-items-center">
                          <div className="kh-drawer__details-count text-center d-flex align-items-center justify-content-center">
                            {_t(t("1"))}
                          </div>
                          <div className="kh-drawer__details-title text-capitalize">
                            {_t(t("Delivery Details"))}
                          </div>
                        </div>
                        <div className="kh-drawer__details-body my-3">
                          <div className="form-group">
                            <label
                              htmlFor="location"
                              className="sm-text text-capitalize"
                            >
                              {_t(t("enter delivery address"))}
                            </label>
                            <textarea
                              className="form-control sm-text"
                              rows="3"
                              placeholder={_t(t("Address"))}
                              required
                              name="address"
                              onChange={handleChange}
                            >
                              {orderDetails.address}
                            </textarea>
                          </div>
                          <div className="form-group">
                            <label
                              htmlFor="note"
                              className="sm-text text-capitalize"
                            >
                              {_t(t("note to rider"))}
                            </label>
                            <input
                              type="text"
                              className="form-control rounded-0 sm-text"
                              id="note"
                              onChange={handleChange}
                              name="note"
                              placeholder={_t(t("note to rider"))}
                              value={orderDetails.note}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                    <li className="kh-drawer__list-item">
                      <div className="kh-drawer__details">
                        <div className="kh-drawer__details-head d-flex align-items-center">
                          <div className="kh-drawer__details-count text-center d-flex align-items-center justify-content-center">
                            {_t(t("2"))}
                          </div>
                          <div className="kh-drawer__details-title text-capitalize">
                            {_t(t("Personal Details"))}
                          </div>
                        </div>
                        <div className="kh-drawer__details-body my-3">
                          <div className="form-group">
                            <label
                              htmlFor="firstName"
                              className="sm-text text-capitalize"
                            >
                              {_t(t("name"))}
                            </label>
                            <input
                              type="text"
                              className="form-control rounded-0 sm-text"
                              id="firstName"
                              placeholder={_t(t("name"))}
                              name="name"
                              disabled
                              value={orderDetails.name}
                            />
                          </div>

                          <div className="form-group">
                            <label
                              htmlFor="phone"
                              className="sm-text text-capitalize"
                            >
                              {_t(t("mobile number"))}
                            </label>
                            <input
                              type="text"
                              className="form-control rounded-0 sm-text"
                              id="phone"
                              placeholder={_t(t("mobile number"))}
                              name="phn_no"
                              required
                              onChange={handleChange}
                              value={orderDetails.phn_no}
                            />
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="kh-drawer__foot py-3 my-3">
                <div className="kh-drawer__container" >
                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div className="kh-drawer__text text-capitalize">
                      {_t(t("subtotal"))}
                    </div>
                    <div className="kh-drawer__text text-right text-uppercase sm-text">
                      {currencySymbolLeft()}
                      {formatPrice(getTotal())}
                      {currencySymbolRight()}
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div className="kh-drawer__text text-capitalize">
                      {getSystemSettings(generalSettings, "vat_system") ===
                        "igst"
                        ? `${_t(t("vat"))}(${getSystemSettings(
                          generalSettings,
                          "type_vat"
                        )}%)`
                        : getSystemSettings(generalSettings, "vat_system") ===
                          "cgst" ? "cgst+sgst" +
                          "(" +
                          getSystemSettings(generalSettings, "cgst") + "%" +
                          "+" +
                          getSystemSettings(generalSettings, "sgst") +
                        "%)" :
                          `${_t(t("tax"))}(${getSystemSettings(
                            generalSettings,
                            "tax"
                          )}%)`}
                      {/* <span>kno</span> */}
                    </div>
                    <div className="kh-drawer__text text-right text-uppercase sm-text">
                      {currencySymbolLeft()}
                      {formatPrice(getVat())}
                      {currencySymbolRight()}
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div className="kh-drawer__text text-capitalize">total</div>
                    <div className="kh-drawer__text text-right text-uppercase sm-text">
                      {currencySymbolLeft()}
                      {formatPrice(getTotal() + getVat())}
                      {currencySymbolRight()}
                    </div>
                  </div>
                  {getCookie() === undefined ? (
                    <NavLink to="/login" className="btn w-100 text-uppercase">
                      {_t(t("Login"))}
                    </NavLink>
                  ) : (
                    <>
                      {orderDetails.uploading ? (
                        modalLoading(2)
                      ) : (
                        <>
                          <div data-simplebar className="d-flex align-items-center justify-content-between">
                            <button
                              type="submit"
                              className="btn-danger payment-btn btn-sm mr-4"
                              disabled={orderDetails.branch === null}
                            >
                              {_t(t("place order"))}
                            </button>

                            {/* activate for paypal */}

                            {/* {paypal_client_id !== null ?
                              [orderDetails.address === null ? <button onClick={(e) => {
                                e.preventDefault();
                              }} className="btn-danger payment-btn btn-sm"
                              >
                                paypal
                              </button> : <button onClick={(e) => {
                                e.preventDefault();
                              }} className="btn-danger payment-btn btn-sm" data-toggle="modal" data-target="#exampleModalCenter"
                              >
                                paypal
                              </button>] : null
                            } */}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
      {/* Checkout drawer ends */}

      {/* Variation and property drawer */}
      {showVariation && (
        <div className="kh-drawer">
          <div className="kh-drawer__container">
            <div className="kh-drawer__head py-3 my-3 d-flex align-items-center justify-content-between">
              <span className="kh-drawer__head-title text-capitalize">
                {_t(t("Add item to cart"))}
              </span>
              <button
                type="button"
                className="kh-drawer__close"
                onClick={() => {
                  setShowVariation(false);
                  setShowCart(false);
                  setShowCheckout(false);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="kh-drawer__body_cart py-3" data-simplebar>
              <div className="kh-drawer__container">
                <div className="form-group">
                  <label htmlFor="branch" className="sm-text">
                    {_t(t("Select a branch"))}{" "}
                    {orderDetails.workPeriodStatus === true && (
                      <small className="text-danger">
                        {" "}
                        ( {_t(t("This branch is closed now"))})
                        {/* {
                          
                          toast.error(`${_t(t("Sorry, this branch is closed now"))}`, {
                          position: "bottom-center",
                          autoClose: 2000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          className: "text-center toast-notification",
                          })
                          } */}
                      </small>

                    )}
                  </label>
                  <select
                    className="form-control"
                    onChange={(e) => {
                      //new order
                      setNewOrder({
                        variation: null,
                        quantity: 1,
                        properties: null,
                      });

                      let theWorkPeriod =
                        workPeriodWeb &&
                        workPeriodWeb.find((thisItem) => {
                          return (
                            parseInt(thisItem.branch_id) ===
                            parseInt(e.target.value)
                          );
                        });
                      if (theWorkPeriod !== undefined) {
                        setOrderDetails({
                          ...orderDetails,
                          items: [],
                          branch: e.target.value,
                          workPeriod: theWorkPeriod,
                          workPeriodStatus: false,
                        });
                      } else {
                        setOrderDetails({
                          ...orderDetails,
                          items: [],

                          branch: null,
                          workPeriod: null,
                          workPeriodStatus: true,
                        });
                      }
                    }}
                  >
                    <option value="">{_t(t("Please select a branch"))}</option>
                    {branchForSearch &&
                      branchForSearch.map((eachBranch) => {
                        return (
                          <option
                            value={eachBranch.id}
                            selected={
                              eachBranch.id === parseInt(orderDetails.branch)
                            }
                          >
                            {eachBranch.name}
                          </option>
                        );
                      })

                    }
                  </select>
                </div>
                <ul className="kh-drawer__list">
                  {!foodItems.variations && !foodItems.properties && (
                    <img
                      src={foodItems.selectedItem.image}
                      alt=""
                      className="img-fluid"
                    />
                  )}
                  {/* Variations */}
                  {foodItems.variations && (
                    <>
                      <div className="fk-sm-card__container mb-1">
                        <div className="fk-sm-card__content">
                          <h6 className="text-capitalize fk-sm-card__title t-mb-5">
                            {_t(t("Variations"))}
                          </h6>
                        </div>

                        <span className="text-capitalize xxsm-text fk-badge fk-badge--secondary">
                          {_t(t("Required"))}
                        </span>
                      </div>
                      {foodItems.variations.map(
                        (variationItem, varItemIndex) => {
                          return (
                            <li className="kh-drawer__list-item my-0 py-0">
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
                                      checked={
                                        newOrder.variation &&
                                        newOrder.variation
                                          .food_with_variation_id ===
                                        variationItem.food_with_variation_id
                                      }
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
                        }
                      )}
                      {foodItems.properties && <hr />}
                    </>
                  )}

                  {foodItems.properties &&
                    foodItems.properties.map(
                      (propertyItem, propertyItemIndex) => {
                        let selectedGroup = null;
                        //property group
                        if (propertyItem.length > 0) {
                          selectedGroup =
                            propertyGroupWeb &&
                            propertyGroupWeb.find((singlePropertyGroup) => {
                              return (
                                singlePropertyGroup.id ===
                                parseInt(propertyItem[0].property_group_id)
                              );
                            });
                        }

                        return (
                          <>
                            <div className="fk-sm-card__container mb-1">
                              <div className="fk-sm-card__content">
                                <h6 className="text-capitalize fk-sm-card__title t-mb-5">
                                  {selectedGroup && selectedGroup.name}
                                </h6>
                              </div>
                              <span className="text-capitalize xxsm-text fk-badge fk-badge--secondary">
                                {_t(t("Optional"))}
                              </span>
                            </div>
                            {propertyItem.map((eachItem) => {
                              return (
                                <li className="kh-drawer__list-item my-0 py-0">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="col">
                                      <label className="mx-checkbox flex-grow-1">
                                        <input
                                          type="checkbox"
                                          className="mx-checkbox__input mx-checkbox__input-solid mx-checkbox__input-solid--danger mx-checkbox__input-sm mt-0-kitchen"
                                          onChange={() => {
                                            handleOrderItemProperty(eachItem);
                                          }}
                                          checked={checkedProperty(eachItem)}
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
                                                handlePropertyQty(eachItem, "-");
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
                                                handlePropertyQty(eachItem, "+");
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
                            {propertyItemIndex !==
                              foodItems.properties.length - 1 && <hr />}
                          </>
                        );
                      }
                    )}
                </ul>
              </div>
            </div>
            <div className="kh-drawer__foot py-3 my-3">
              <div className="kh-drawer__container">
                {/* <div className="d-flex align-items-center justify-content-between my-2">
                  <div className="kh-drawer__text text-capitalize">
                    subtotal
                  </div>
                  <div className="kh-drawer__text text-right text-uppercase sm-text">
                    bdt 16,70.00
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between my-2">
                  <div className="kh-drawer__text text-capitalize">Vat</div>
                  <div className="kh-drawer__text text-right text-uppercase sm-text">
                    bdt 12.00
                  </div>
                </div>
                <div className="d-flex align-items-center justify-content-between my-2">
                  <div className="kh-drawer__text text-capitalize">total</div>
                  <div className="kh-drawer__text text-right text-uppercase sm-text">
                    bdt 1,682.00
                  </div>
                </div> */}
                {getCookie() === undefined ? (
                  <NavLink to="/login" className="btn w-100 text-uppercase">
                    {_t(t("Login"))}
                  </NavLink>
                ) : (
                  <>
                    <button
                      className="btn w-100 text-uppercase"
                      disabled={
                        (foodItems.variations && !newOrder.variation) ||
                        orderDetails.branch == null
                      }
                      onClick={handleOrder}
                    >
                      {_t(t("Add to cart"))}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variation and property drawer ends */}
      <div className={loading ? "d-none" : ""}>
        <header id="home">
          {/* header-bottom  */}
          <div className="header-bottom home2-header-bottom margin-top-20">
            <div className="container position-relative">
              <div className="row d-flex align-items-center">
                <div className="col-lg-2 col-md-2 col-sm-2 col-6 margin-bottom-20">
                  <div className="logo">
                    {window.location.pathname === "/" ? (
                      <NavLink
                        to={{ pathname: "/refresh", state: "/" }}
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    ) : (
                      <NavLink
                        to="/"
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    )}
                  </div>
                </div>
                <div className="col-lg-5 d-none d-lg-block">
                  <nav id="mobile-menu">
                    <ul className="main-menu main-menu2">
                      {/* {SAAS_APPLICATION == 'YES' ? <li> <Link to='#'>{_t(t("from saas"))}</Link></li> : <li> <Link to='#'>{_t(t("normal app"))}</Link></li>} */}
                      <li>
                        <a href="#home">{_t(t("home"))}</a>
                      </li>
                      <li>
                        <a href="#popular">{_t(t("popular"))}</a>
                      </li>
                      <li>
                        <a href="#special">{_t(t("Special"))}</a>
                      </li>
                      <li>
                        <a href="#language">{_t(t("Language"))}</a>
                      </li>
                      {authUserInfo &&
                        authUserInfo.details &&
                        authUserInfo.details.user_type === "customer" && (
                          <li>
                            <NavLink to="/profile">{_t(t("Profile"))}</NavLink>
                          </li>
                        )}

                      {deliverymenShow == true && authUserInfo && !authUserInfo.details && (
                        <li>
                          <NavLink to="/delivery-man-registration">
                            {_t(t("deliveryman"))}
                          </NavLink>
                        </li>
                      )}
                    </ul>
                  </nav>
                </div>
                <div className="col-lg-5 col-md-9 col-12">
                  <div className="customer-area2 d-flex align-items-center justify-content-between">
                    <span className="order-img d-none d-md-block">
                      <img src="/website/images/icons/1.png" alt="" />
                    </span>
                    <div className="order-content">
                      <span className="span-1">{_t(t("Need Help"))}?</span>{" "}
                      <span className="span-2">
                        {getSystemSettings(generalSettings, "phnNo")}
                      </span>
                    </div>
                    {getCookie() === undefined ? (
                      <NavLink to="/login" className="btn">
                        {_t(t("Login"))}
                      </NavLink>
                    ) : (
                      <>
                        {authUserInfo &&
                          authUserInfo.details &&
                          authUserInfo.details.user_type !== "customer" ? (
                          <NavLink to="/dashboard" className="btn">
                            {_t(t("Dashboard"))}
                          </NavLink>
                        ) : (
                          <button className="btn" onClick={handleLogout}>
                            {_t(t("Logout"))}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* burger-promo-area */}
        <section className="delivery-area burger-promo-area padding-top-240 padding-bottom-135">
          <div className="del-shapes">
            <span className="ds-1">
              <img src="/website/images/shapes/40.png" alt="" />
            </span>
            <span className="ds-2">
              <img src="/website/images/shapes/41.png" alt="" />
            </span>
            <span className="ds-33">
              <img src="/website/images/shapes/5.png" alt="" />
            </span>
            <span className="ds-4">
              <img src="/website/images/shapes/2.png" alt="" />
            </span>
          </div>
          <div className="container">
            <div className="row flex-row-reverse align-items-center">
              <div className="col-lg-6 col-md-12 margin-bottom-20">
                <div className="delivery-left">
                  <div className="burger-shapes">
                    <span className="bs1">
                      <img src="/website/images/shapes/capsicam.png" alt="" />
                    </span>
                    <span className="bs2">
                      <img src="/website/images/shapes/sauce.png" alt="" />
                    </span>
                    {/* <span className="bs3">
                      <img src="/website/images/shapes/sale.png" alt="" />
                    </span>
                    <span className="bs4">
                      <img src="/website/images/shapes/redtpmatto.png" alt="" />
                    </span> */}
                    <span className="bs5">
                      <img src="/website/images/shapes/t-slice.png" alt="" />
                    </span>
                    <span className="bs6">
                      <img src="/website/images/shapes/113.png" alt="" />
                    </span>
                  </div>
                  <img
                    className="mp"
                    src={
                      getSystemSettings(generalSettings, "hero_image")
                        ? getSystemSettings(generalSettings, "hero_image")
                        : "/website/images/menu-item/burger-promo.png"
                    }
                    alt=""
                  />
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div className="delivery-right">
                  <div className="common-title-area padding-bottom-40">
                    <h3 style={{ color: "#2a435d" }}>
                      {getSystemSettings(generalSettings, "hero_sub_1")
                        ? getSystemSettings(generalSettings, "hero_sub_1")
                        : "Best In Town"}
                    </h3>
                    <h1>
                      <span>
                        {getSystemSettings(generalSettings, "hero_heading")
                          ? getSystemSettings(generalSettings, "hero_heading")
                          : "enjoy our chicken burger fast food "}
                      </span>
                    </h1>
                    <h5 className="margin-bottom-40 margin-top-40">
                      {getSystemSettings(generalSettings, "hero_sub_2")
                        ? getSystemSettings(generalSettings, "hero_sub_2")
                        : "Bacon-Potatos-Bbq Sauce"}
                    </h5>
                    <div className="order-box d-flex align-items-center">
                      <a href="#popular" className="btn text-uppercase">
                        {_t(t("Order Here"))}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- menu-area --> */}
        <section
          className="menu-area home2-menu-area padding-top-100"
          id="popular"
        >
          <div className="menu-shapes">
            <span className="ds-1">
              <img src="/website/images/shapes/34.png" alt="" />
            </span>
            <span className="ds-2 item-bounce">
              <img src="/website/images/shapes/sm-tomatto.png" alt="" />
            </span>
            <span className="ds-3">
              <img src="/website/images/shapes/donar.png" alt="" />
            </span>
            <span className="ds-4 item-bounce">
              <img src="/website/images/shapes/triple.png" alt="" />
            </span>
            <span className="ds-5">
              <img src="/website/images/shapes/scatter.png" alt="" />
            </span>
          </div>

          <div className="container">
            <div className="common-title-area padding-50 wow fadeInLeft">
              <h3>{_t(t("food items"))}</h3>
              <h2>
                {_t(t("popular"))} <span>{_t(t("menu"))}</span>{" "}
              </h2>
            </div>
            {/* <!-- menu-nav-wrapper --> */}
            <div className="menu-nav-wrapper">
              <div className="container">
                <div className="row">
                  <nav>
                    <div className="nav justify-content-center custom-nav">
                      {/* Food group */}
                      {foodGroupWeb &&
                        foodGroupWeb.map((groupItem, groupItemIndex) => {
                          return (
                            <a
                              href="#menus"
                              className={`nav-item nav-link ${foodItems.group &&
                                foodItems.group.id === groupItem.id
                                ? "active"
                                : ""
                                }`}
                              onClick={() => {
                                if (foodGroupWeb && foodListWeb) {
                                  let temp = foodListWeb.filter(
                                    (foodItem, foodItemIndex) => {
                                      return (
                                        parseInt(foodItem.food_group_id) ===
                                        groupItem.id
                                      );
                                    }
                                  );
                                  setFoodItems({
                                    ...foodItems,
                                    list: temp,
                                    group: groupItem,
                                  });
                                }
                              }}
                            >
                              <div className="single-menu-nav text-center">
                                <h6>{groupItem.name}</h6>
                                <span className="g-s-4">
                                  <img
                                    src="/website/images/shapes/10.png"
                                    alt=""
                                  />
                                </span>
                                <span className="g-s-5">
                                  <img
                                    src="/website/images/shapes/14.png"
                                    alt=""
                                  />
                                </span>
                              </div>
                            </a>
                          );
                        })}
                    </div>
                  </nav>
                </div>
              </div>
            </div>
            {/* <!-- menu-items-wrapper --> */}
            <div className="tab-content" id="nav-tabContent">
              {/* <!-- menu-items --> */}
              <div>
                <div className="menu-items-wrapper">
                  <div className="menu-i-shapes">
                    <span className="mis-3">
                      <img src="/website/images/shapes/7.png" alt="" />
                    </span>
                  </div>
                  <div className="row" id="menus">
                    {foodItems.list &&
                      foodItems.list.map((foodItem, foodItemIndex) => {
                        return (
                          <div className="col-lg-4 col-md-4 t-mt-30" key={foodItemIndex}>
                            <div className="single-menu-item d-flex align-items-center h-100">
                              <div className="menu-img">
                                <img src={foodItem.image} alt="" />
                              </div>
                              <div className="menu-content">
                                <h5>
                                  <a
                                    className="pointer-cursor"
                                    onClick={() => {
                                      if (checkLoginUser === 0) {
                                        setFoodItems({
                                          ...foodItems,
                                          selectedItem: foodItem,
                                          variations:
                                            parseInt(foodItem.has_variation) === 1
                                              ? foodItem.variations
                                              : null,
                                          properties:
                                            parseInt(foodItem.has_property) === 1
                                              ? foodItem.properties
                                              : null,
                                        });
                                        setNewOrder({
                                          variation: null,
                                          quantity: 1,
                                          properties: null,
                                        });
                                        setShowVariation(true);
                                      } else {
                                        toast.error(`${_t(t("Please login first"))}`, {
                                          position: "bottom-center",
                                          autoClose: 10000,
                                          hideProgressBar: false,
                                          closeOnClick: true,
                                          pauseOnHover: true,
                                          className: "text-center toast-notification",
                                        });
                                      }

                                    }}
                                  >
                                    {foodItem.name}
                                  </a>
                                </h5>
                                <p>

                                  <small>

                                    {showManageStock ? ([_t(t("Available Stock "))]) : null}

                                    {showManageStock ? (orderDetails.branch === null
                                      ? _t(
                                        t(
                                          "To check stock select branch after clicking this food"
                                        )
                                      )
                                      : handleGetStock(foodItem.id)) : null}

                                  </small>
                                </p>
                                <span>
                                  {parseInt(foodItem.has_variation) !== 1 &&
                                    currencySymbolLeft() +
                                    formatPrice(foodItem.price) +
                                    currencySymbolRight()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- drink-items section --> */}
        <section
          className="drink-items-section  padding-top-110"
          id="special"
        >
          <div className="drink-items-shapes">
            <span className="fs-1 item-animateOne">
              <img src="/website/images/img/htshape2.png" alt="" />
            </span>
            <span className="fs-2">
              <img src="/website/images/img/htshape16.png" alt="" />
            </span>
            <span className="fs-3 item-animateTwo">
              <img src="/website/images/img/htshape17.png" alt="" />
            </span>
            <span className="fs-4">
              <img src="/website/images/img/htleaf.png" alt="" />
            </span>
          </div>
          <div className="container">
            <div className="common-title-area text-center padding-bottom-30 wow fadeInUp">
              <h2>
                {_t(t("Explore Our"))} <span>{_t(t("Special Menu"))}</span>
              </h2>
            </div>
            <div className="row">
              {foodListWeb &&
                foodListWeb.map((special, index) => {
                  if (parseInt(special.is_special) === 1) {
                    return (
                      <div
                        className="col-xl-3 col-lg-3 col-md-6 wow fadeIn t-mt-30"
                        data-wow-delay=".2s"
                        key={index}
                      >
                        <div
                          className="single-dishes"
                          style={{ height: "100%" }}
                        >
                          <div
                            className="dish-img"
                            style={{ background: "transparent" }}
                          >
                            <img
                              src={special.image}
                              alt=""
                              style={{ width: "auto" }}
                            />
                          </div>
                          <div className="dish-content">
                            <h5>
                              <a
                                href="#!"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFoodItems({
                                    ...foodItems,
                                    selectedItem: special,
                                    variations:
                                      parseInt(special.has_variation) === 1
                                        ? special.variations
                                        : null,
                                    properties:
                                      parseInt(special.has_property) === 1
                                        ? special.properties
                                        : null,
                                  });
                                  setNewOrder({
                                    variation: null,
                                    quantity: 1,
                                    properties: null,
                                  });
                                  setShowVariation(true);
                                }}
                              >
                                {special.name}
                              </a>
                            </h5>
                            {parseInt(special.has_variation) === 0 && (
                              <span className="price">
                                {_t(t("price"))} :{" "}
                                {currencySymbolLeft() +
                                  formatPrice(special.price) +
                                  currencySymbolRight()}
                              </span>
                            )}
                          </div>
                          <span className="badge">{_t(t("special"))}</span>
                          <div className="cart-opt">
                            <span>
                              <a
                                className="pointer-cursor"
                                onClick={() => {
                                  setFoodItems({
                                    ...foodItems,
                                    selectedItem: special,
                                    variations:
                                      parseInt(special.has_variation) === 1
                                        ? special.variations
                                        : null,
                                    properties:
                                      parseInt(special.has_property) === 1
                                        ? special.properties
                                        : null,
                                  });
                                  setNewOrder({
                                    variation: null,
                                    quantity: 1,
                                    properties: null,
                                  });
                                  setShowVariation(true);
                                }}
                              >
                                <i className="fas fa-shopping-basket"></i>
                              </a>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return false;
                  }
                })}
            </div>
          </div>
        </section>

        {/* Banner */}
        <section className="banner-gallery banner-gallery2  padding-bottom-60">
          <div className="container position-relative">
            <div className="del-shapes">
              <span className="ds-1 item-bounce">
                <img src="/website/images/shapes/26.png" alt="" />
              </span>
              <span className="ds-2 item-bounce">
                <img src="/website/images/shapes/28.png" alt="" />
              </span>
            </div>
            <div className="row">
              <div className="col-lg-6 col-md-12">
                <div
                  className="gallery-img-1"
                  style={{
                    backgroundImage: `url(${getSystemSettings(
                      generalSettings,
                      "banner_image_1"
                    )})`,
                  }}
                >
                  <h3>
                    {getSystemSettings(generalSettings, "banner_heading_1")
                      ? getSystemSettings(generalSettings, "banner_heading_1")
                      : "Buzzed Burger"}
                  </h3>
                  <p>
                    {getSystemSettings(generalSettings, "banner_sub_heading_1")
                      ? getSystemSettings(
                        generalSettings,
                        "banner_sub_heading_1"
                      )
                      : "Sale off 50% only this week"}
                  </p>
                  <img
                    className="pos1"
                    src="/website/images/shapes/bbr.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div
                  className="gallery-img-3"
                  style={{
                    backgroundImage: `url(${getSystemSettings(
                      generalSettings,
                      "banner_image_2"
                    )})`,
                  }}
                >
                  <h5>
                    {getSystemSettings(generalSettings, "banner_heading_2")
                      ? getSystemSettings(generalSettings, "banner_heading_2")
                      : "Buzzed Burger"}
                  </h5>

                  <img
                    src="/website/images/shapes/41.png"
                    alt=""
                    className="s1"
                  />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div
                  className="gallery-img-2 d-flex justify-content-end"
                  style={{
                    backgroundImage: `url(${getSystemSettings(
                      generalSettings,
                      "banner_image_3"
                    )})`,
                  }}
                >
                  <div className="gimg-content">
                    <h5 className="margin-bottom-20">
                      {getSystemSettings(generalSettings, "banner_heading_3")
                        ? getSystemSettings(generalSettings, "banner_heading_3")
                        : "Buzzed Burger"}
                    </h5>
                  </div>
                </div>
              </div>
            </div>
            <div className="row margin-top-30">
              <div className="col-lg-3 col-md-6">
                <div
                  className="gallery-img-3 gallery-img-33"
                  style={{
                    backgroundImage: `url(${getSystemSettings(
                      generalSettings,
                      "banner_image_4"
                    )})`,
                  }}
                >
                  <h5>
                    {getSystemSettings(generalSettings, "banner_heading_4")
                      ? getSystemSettings(generalSettings, "banner_heading_4")
                      : "Buzzed Burger"}
                  </h5>

                  <img
                    src="/website/images/shapes/41.png"
                    alt=""
                    className="s1"
                  />
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div
                  className="gallery-img-22 d-flex justify-content-end"
                  style={{
                    backgroundImage: `url(${getSystemSettings(
                      generalSettings,
                      "banner_image_5"
                    )})`,
                  }}
                >
                  <div className="gimg-content">
                    <h5 className="margin-bottom-20">
                      {getSystemSettings(generalSettings, "banner_heading_5")
                        ? getSystemSettings(generalSettings, "banner_heading_5")
                        : "Buzzed Burger"}
                    </h5>
                    <img
                      src="/website/images/shapes/42.png"
                      alt=""
                      className="s1"
                    />
                  </div>
                </div>
              </div>
              <div className="col-lg-6 col-md-12">
                <div
                  className="gallery-img-1 gallery-img-11 gallery-img-01"
                  style={{
                    backgroundImage: `url(${getSystemSettings(
                      generalSettings,
                      "banner_image_6"
                    )})`,
                  }}
                >
                  <h5 className="margin-bottom-10">
                    {getSystemSettings(generalSettings, "banner_heading_6")
                      ? getSystemSettings(generalSettings, "banner_heading_6")
                      : "Buzzed Burger"}
                  </h5>
                  <p>
                    {" "}
                    {getSystemSettings(generalSettings, "banner_sub_heading_6")
                      ? getSystemSettings(
                        generalSettings,
                        "banner_sub_heading_6"
                      )
                      : "Buzzed Burger"}
                  </p>

                  <img
                    className="gs1"
                    src="/website/images/shapes/bbs.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* <!-- footer area --> */}
        <footer
          className="padding-top-40 padding-bottom-40 footer2"
          id="language"
        >
          <div className="fo-shapes">
            <span className="fs-1 item-animateTwo">
              <img src="/website/images/shapes/capsicam.png" alt="" />
            </span>
            <span className="fss-2">
              <img src="/website/images/shapes/fshape1.png" alt="" />
            </span>
            <span className="fss-3">
              <img src="/website/images/shapes/41.png" alt="" />
            </span>
            <span className="fss-4 item-bounce">
              <img src="/website/images/shapes/sauce.png" alt="" />
            </span>
            <span className="fss-5 item-bounce">
              <img src="/website/images/shapes/scatter.png" alt="" />
            </span>
            <span className="fss-6 item-animateTwo">
              <img src="/website/images/shapes/layer.png" alt="" />
            </span>
          </div>
          <div className="footer-top">
            <div className="container">
              <div className="row align-items-center justify-content-between pb-3">
                <div className="col-lg-6 col-md-12">
                  <div className="f-title">
                    <h4>
                      {_t(t("Set your"))} <span>{_t(t("local language"))}</span>
                    </h4>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="d-flex align-items-center justify-content-center justify-content-lg-between">
                    <div className="form2 ml-lg-auto">
                      <select
                        className="langSelect"
                        onChange={handleDefaultLang}
                      >
                        {navLanguageList &&
                          navLanguageList.map((item, index) => {
                            return (
                              <option
                                key={index}
                                className={`dropdown-item sm-text text-capitalize`}
                                value={item.id}
                                selected={
                                  defaultLang && item.code === defaultLang.code
                                }
                              >
                                {item.name}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container">
              <div className="row align-items-center justify-content-between padding-bottom-45">
                <div className="col-lg-6 col-md-12">
                  <div className="f-title">
                    <h4>
                      {_t(t("Set your"))}{" "}
                      <span className="text-success">
                        {_t(t("local currency"))}
                      </span>
                    </h4>
                  </div>
                </div>
                <div className="col-lg-6 col-md-12">
                  <div className="d-flex align-items-center justify-content-center justify-content-lg-between">
                    <div className="form2 ml-lg-auto">
                      <select
                        className="langSelect"
                        onChange={handleDefaultCurrency}
                      >
                        {navCurrencyList &&
                          navCurrencyList.map((item, index) => {
                            return (
                              <option
                                key={index}
                                className={`dropdown-item sm-text text-capitalize`}
                                value={item.id}
                                selected={
                                  defaultCurrency &&
                                  item.code === defaultCurrency.code
                                }
                              >
                                {item.name}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <hr />
            </div>
          </div>
          <div className="copyright-area text-center">
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-lg-6 justify-content-self-center">
                  <div className="copyright-content">
                    <div className="f-logo">
                      <NavLink
                        to={{ pathname: "/refresh", state: "/" }}
                        exact
                        className="t-link w-100"
                        key="logokey"
                      >
                        <img
                          src={getSystemSettings(generalSettings, "type_logo")}
                          alt="logo"
                        />
                      </NavLink>
                    </div>
                    <div className="footer-nav text-center">
                      <nav>
                        <ul className="main-menu main-menu2">
                          <li>
                            <a href="#home">{_t(t("home"))}</a>
                          </li>
                          <li>
                            <a href="#popular">{_t(t("popular"))}</a>
                          </li>
                          <li>
                            <a href="#special">{_t(t("special"))}</a>
                          </li>
                          <li>
                            <a href="#language">{_t(t("Language"))}</a>
                          </li>
                        </ul>
                      </nav>
                    </div>
                    <p>{getSystemSettings(generalSettings, "type_footer")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* <!-- ToTop Button --> */}
        <button
          className="scrollup"
          onClick={() => {
            window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          }}
        >
          <i className="fas fa-angle-up"></i>
        </button>
      </div>
    </>
  );
};

export default RestaurantLanding;