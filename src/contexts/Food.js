import React, { useState, useEffect } from "react";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../BaseUrl";

//functions
import { getCookie } from "../functions/Functions";

//3rd party packages

// creating context api
const FoodContext = React.createContext();

const FoodProvider = ({ children }) => {
  // State hooks  here
  //loading
  const [loading, setLoading] = useState(false);
  const [dataPaginating, setDataPaginating] = useState(false);

  //website
  const [foodListWeb, setFoodListWeb] = useState(null);
  const [foodStockWeb, setFoodStockWeb] = useState(null);
  const [foodGroupWeb, setFoodGroupWeb] = useState(null);
  const [propertyGroupWeb, setPropertyGroupWeb] = useState(null);
  const [workPeriodWeb, setWorkPeriodWeb] = useState(null);
  const [onlineOrdersCustomer, setOnlineOrdersCustomer] = useState(null);

  //pos page online orders
  const [onlineOrdersAdmin, setOnlineOrdersAdmin] = useState(null);
  const [onlineOrdersAdminForSearch, setOnlineOrdersAdminForSearch] =
    useState(null);

  //foods
  const [foodList, setFoodList] = useState(null);
  const [foodForSearch, setFoodForSearch] = useState(null);

  //food stock
  const [foodItemStock, setFoodItemStock] = useState(null);
  const [foodPurchaseHistory, setFoodPurchaseHistory] = useState(null);
  const [foodPurchaseHistoryForSearch, setFoodPurchaseHistoryForSearch] =
    useState(null);

  //food group
  const [foodGroupList, setFoodGroupList] = useState(null);
  const [foodGroupForSearch, setFoodGroupforSearch] = useState(null);
  
  // food allergies
  const [foodAllergyList, setFoodAllergyList] = useState(null);
  const [foodAllergyForSearch, setFoodAllergyforSearch] = useState(null);

  //food unit
  const [foodUnitList, setFoodUnitList] = useState(null);
  const [foodUnitForSearch, setFoodUnitforSearch] = useState(null);

  //variation
  const [variationList, setVariationList] = useState(null);
  const [variationForSearch, setVariationForSearch] = useState(null);

  //property Group
  const [propertyGroupList, setPropertyGroupList] = useState(null);
  const [propertyGroupForSearch, setPropertyGroupForSearch] = useState(null);

  //property Item
  const [propertyItemList, setPropertyItemList] = useState(null);
  const [propertyItemForSearch, setPropertyItemForSearch] = useState(null);
  const [propertyItemGroup, setPropertyItemGroup] = useState(null);

  //stock
  let [items, setItems] = useState(null);
  let [theGroups, setTheGroups] = useState(null);
  let [itemsFood, setItemsFood] = useState(null);
  let [theGroupsFood, setTheGroupsFood] = useState(null);

  //useEffect- to get data on render
  useEffect(() => {
    //call- unauthenticated
    getFoodWeb();
    //call if authenticated
    if (getCookie() !== undefined) {
      getFood();
      getFoodGroup();
      getFoodAllergy();
      getFoodUnit();
      getVariation();
      getPropertyGroup();
    }
  }, []);

  //stock
  const getIngredientStock = (id) => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-closing-items/" + id;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setItems(res.data[0]);
        setTheGroups(res.data[1]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getFoodStockReport = (id) => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-closing-items-food/" + id;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setItemsFood(res.data[0]);
        setTheGroupsFood(res.data[1]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  //website
  //get foods web
  const getFoodWeb = () => {
    setLoading(true);
    const foodItemWebUrl = BASE_URL + "/website/home";
    return axios.get(foodItemWebUrl).then((res) => {
      setFoodListWeb(res.data[0]);
      setFoodGroupWeb(res.data[1]);
      setPropertyGroupWeb(res.data[2]);
      setWorkPeriodWeb(res.data[3]);
      setFoodStockWeb(res.data[[4]]);
    });
  };

  //get online orders customer
  const getOnlineOrdersCustomer = () => {
    setLoading(true);
    const ordersUrl = BASE_URL + "/website/online-orders/customer";
    return axios
      .get(ordersUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setOnlineOrdersCustomer(res.data[1]);
        setLoading(false);
      });
  };

  //get online orders
  const getOnlineOrders = () => {
    setLoading(true);
    const ordersUrl = BASE_URL + "/website/online-orders";
    return axios
      .get(ordersUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setOnlineOrdersAdmin(res.data[0]);
        setOnlineOrdersAdminForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated online orders
  const setPaginatedOnlineOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/website/online-orders?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setOnlineOrdersAdmin(res.data[0]);
        setOnlineOrdersAdminForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get foods
  const getFood = () => {
    setLoading(true);
    const foodItemUrl = BASE_URL + "/settings/get-food-item";
    return axios
      .get(foodItemUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodList(res.data[0]);
        setFoodForSearch(res.data[1]);
      });
  };

  // get paginated food
  const setPaginatedFood = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-food-item?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodList(res.data[0]);
        setFoodForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get food groups
  const getFoodGroup = () => {
    setLoading(true);
    const currentUrl = window.location.href;
    var manage = currentUrl.includes("manage/food/groups") ? true : false;
    const foodGroupUrl = BASE_URL + "/settings/get-food-group?manage="+manage;
    return axios
      .get(foodGroupUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodGroupList(res.data[0]);
        setFoodGroupforSearch(res.data[1]);
        setFoodItemStock(res.data[2]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  //get food allergies
  const getFoodAllergy = () => {
    setLoading(true);
    const currentUrl = window.location.href;
    // var manage = currentUrl.includes("manage/food/groups") ? true : false;
    const foodGroupUrl = BASE_URL + "/settings/get-food-allergy";
    return axios
      .get(foodGroupUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodAllergyList(res.data[0]);
        setFoodAllergyforSearch(res.data[1]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  // get paginated food groups
  const setPaginatedFoodGroup = (pageNo) => {
    setDataPaginating(true);
    const currentUrl = window.location.href;
    var manage = currentUrl.includes("manage/food/groups") ? true : false;
    const url = BASE_URL + "/settings/get-food-group?manage="+manage+"&page=" + pageNo;
    // const url = BASE_URL + "/settings/get-food-group?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodGroupList(res.data[0]);
        setFoodGroupforSearch(res.data[1]);
        setFoodItemStock(res.data[2]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };
  // get paginated food allergies
  const setPaginatedFoodAllergy = (pageNo) => {
    setDataPaginating(true);
    const currentUrl = window.location.href;
    // var manage = currentUrl.includes("manage/food/groups") ? true : false;
    const url = BASE_URL + "/settings/get-food-allergy?page=" + pageNo;
    // const url = BASE_URL + "/settings/get-food-group?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        console.log(res.data[0]);
        setFoodAllergyList(res.data[0]);
        setFoodAllergyforSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get food units
  const getFoodUnit = () => {
    setLoading(true);
    const foodUnitUrl = BASE_URL + "/settings/get-food-unit";
    return axios
      .get(foodUnitUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodUnitList(res.data[0]);
        setFoodUnitforSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated food units
  const setPaginatedFoodUnit = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-food-unit?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodUnitList(res.data[0]);
        setFoodUnitforSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get variations
  const getVariation = () => {
    setLoading(true);
    const variationUrl = BASE_URL + "/settings/get-variation";
    return axios
      .get(variationUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setVariationList(res.data[0]);
        setVariationForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated variations
  const setPaginatedVariation = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-variation?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setVariationList(res.data[0]);
        setVariationForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get property group
  const getPropertyGroup = () => {
    setLoading(true);
    const propertyGroupUrl = BASE_URL + "/settings/get-property-group";
    return axios
      .get(propertyGroupUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPropertyGroupList(res.data[0]);
        setPropertyGroupForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated property group
  const setPaginatedPropertyGroup = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-property-group?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPropertyGroupList(res.data[0]);
        setPropertyGroupForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get property item
  const getPropertyItem = (slug) => {
    setLoading(true);
    const propertyItemUrl = BASE_URL + "/settings/get-property-item/" + slug;
    return axios
      .get(propertyItemUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPropertyItemList(res.data[0]);
        setPropertyItemForSearch(res.data[0]);
        setPropertyItemGroup(res.data[1]);
        setLoading(false);
      });
  };

  //get food purchases
  const getFoodPurchase = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-food_purchase";
    return axios.get(url).then((res) => {
      setFoodPurchaseHistory(res.data[0]);
      setFoodPurchaseHistoryForSearch(res.data[1]);
      setLoading(false);
    });
  };

  // get paginated purchases
  const setPaginatedFoodPurchase = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-food_purchase?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodPurchaseHistory(res.data[0]);
        setFoodPurchaseHistoryForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  return (
    <FoodContext.Provider
      value={{
        // common
        loading,
        setLoading,

        //ingredient stock
        getIngredientStock,
        items,
        setItems,
        theGroups,
        setTheGroups,

        //food stock
        getFoodStockReport,
        itemsFood,
        setItemsFood,
        theGroupsFood,
        setTheGroupsFood,

        //website
        getFoodWeb,
        foodGroupWeb,
        foodListWeb,
        setFoodListWeb,
        foodStockWeb,
        setFoodStockWeb,
        propertyGroupWeb,
        setPropertyGroupWeb,
        workPeriodWeb,
        onlineOrdersAdmin,
        setOnlineOrdersAdmin,
        onlineOrdersAdminForSearch,
        setOnlineOrdersAdminForSearch,
        getOnlineOrders,
        setPaginatedOnlineOrders,
        getOnlineOrdersCustomer,
        onlineOrdersCustomer,
        setOnlineOrdersCustomer,

        //food
        getFood,
        foodList,
        setFoodList,
        setPaginatedFood,
        foodForSearch,
        setFoodForSearch,

        //food purchases
        getFoodPurchase,
        foodPurchaseHistory,
        setFoodPurchaseHistory,
        setPaginatedFoodPurchase,
        foodPurchaseHistoryForSearch,
        setFoodPurchaseHistoryForSearch,

        //stock
        foodItemStock,
        //food group
        getFoodGroup,
        getFoodAllergy,
        foodGroupList,
        foodAllergyList,
        setFoodGroupList,
        setFoodAllergyList,
        setPaginatedFoodGroup,
        setPaginatedFoodAllergy,
        foodGroupForSearch,
        setFoodGroupforSearch,
        foodAllergyForSearch,
        setFoodAllergyforSearch,

        //food units
        getFoodUnit,
        foodUnitList,
        setFoodUnitList,
        setPaginatedFoodUnit,
        foodUnitForSearch,
        setFoodUnitforSearch,

        //variation
        getVariation,
        variationList,
        setVariationList,
        setPaginatedVariation,
        variationForSearch,
        setVariationForSearch,

        //property group
        getPropertyGroup,
        propertyGroupList,
        setPropertyGroupList,
        setPaginatedPropertyGroup,
        propertyGroupForSearch,
        setPropertyGroupForSearch,

        //property Item
        getPropertyItem,
        propertyItemList,
        setPropertyItemList,
        propertyItemForSearch,
        setPropertyItemForSearch,
        propertyItemGroup,
        setPropertyItemGroup,

        //pagination
        dataPaginating,
        setDataPaginating,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export { FoodContext, FoodProvider };
