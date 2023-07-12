import React, { useState, useEffect } from "react";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../BaseUrl";

//functions
import { getCookie } from "../functions/Functions";

//3rd party packages

// creating context api
const RestaurantContext = React.createContext();

const RestaurantProvider = ({ children }) => {
  // State hooks  here
  //loading
  const [loading, setLoading] = useState(false);
  const [dataPaginating, setDataPaginating] = useState(false);

  //website
  const [branchListWeb, setBranchListWeb] = useState(null);

  //delivery user
  const [pendingOrdersDelivery, setPendingOrdersDelivery] = useState(null);
  const [pendingOrdersDeliveryForSearch, setPendingOrdersDeliveryForSearch] =
    useState(null);
  const [deliveredOrdersDelivery, setDeliveredOrdersDelivery] = useState(null);
  const [
    deliveredOrdersDeliveryForSearch,
    setDeliveredOrdersDeliveryForSearch,
  ] = useState(null);

  //ingredientGroup
  const [ingredientGroupList, setIngredientGroupList] = useState(null);
  const [ingredientGroupForSearch, setIngredientGroupForSearch] =
    useState(null);

  //ingredientItem
  const [ingredientItemList, setIngredientItemList] = useState(null);
  const [ingredientItemForSearch, setIngredientItemForSearch] = useState(null);
  const [ingredientItemStock, setIngredientItemStock] = useState(null);
  const [ingredientPurchaseHistory, setIngredientPurchaseHistory] =
    useState(null);
  const [
    ingredientPurchaseHistoryForSearch,
    setIngredientPurchaseHistoryForSearch,
  ] = useState(null);

  //branch
  const [branchList, setBranchList] = useState(null);
  const [branchForSearch, setBranchforSearch] = useState(null);

  //table
  const [tableList, setTableList] = useState(null);
  const [tableForSearch, setTableforSearch] = useState(null);

  //table
  const [deptTagList, setDeptTagList] = useState(null);
  const [deptTagForSearch, setDeptTagForSearch] = useState(null);

  //Payment Type
  const [paymentTypeList, setPaymentTypeList] = useState(null);
  const [paymentTypeForSearch, setPaymentTypeforSearch] = useState(null);

  //work period
  const [workPeriodList, setWorkPeriodList] = useState(null);
  const [workPeriodForSearch, setWorkPeriodListForSearch] = useState(null);

  //submitted orders
  const [submittedOrders, setSubmittedOrders] = useState(null);
  const [submittedOrdersForSearch, setSubmittedOrdersForSearch] =
    useState(null);

  //settled orders
  const [settledOrders, setSettledOrders] = useState(null);
  const [settledOrdersForSearch, setSettledOrdersForSearch] = useState(null);

  //kitchen new orders
  const [kithcenNewOrders, setKithcenNewOrders] = useState(null);
  const [kithcenNewOrdersOnline, setKithcenNewOrdersOnline] = useState(null);

  //all orders
  const [allOrders, setAllOrders] = useState(null);
  const [allOrdersForSearch, setAllOrdersForSearch] = useState(null);

  //all orders
  const [allOnlineOrders, setAllOnlineOrders] = useState(null);
  const [allOnlineOrdersForSearch, setAllOnlineOrdersForSearch] =
    useState(null);

  //useEffect- to get data on render
  useEffect(() => {
    //call- unauthenticated
    getBranchWeb();
    //call if authenticated
    if (getCookie() !== undefined) {
      getBranch();
      getTable();
      getDeptTag();
      getPaymentType();
      getWorkPeriod();
      getDeliveryPendingOrders();
      getDeliveryDeliveredOrders();
    }
  }, []);

  //get deliveryman pending orders
  const getDeliveryPendingOrders = () => {
    setLoading(true);
    const ordersUrl = BASE_URL + "/settings/get-assigned-orders";
    return axios
      .get(ordersUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPendingOrdersDelivery(res.data[0]);
        setPendingOrdersDeliveryForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated deliveryman pending orders
  const setPaginatedDeliveryPendingOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-assigned-orders?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPendingOrdersDelivery(res.data[0]);
        setPendingOrdersDeliveryForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get deliveryman delivered orders
  const getDeliveryDeliveredOrders = () => {
    setLoading(true);
    const ordersUrl = BASE_URL + "/settings/get-delivered-orders";
    return axios
      .get(ordersUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeliveredOrdersDelivery(res.data[0]);
        setDeliveredOrdersDeliveryForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated deliveryman delivered orders
  const setPaginatedDeliveryDeliveredOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-delivered-orders?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeliveredOrdersDelivery(res.data[0]);
        setDeliveredOrdersDeliveryForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get ingredient group
  const getIngredientGroup = () => {
    setLoading(true);
    const supplierUrl = BASE_URL + "/settings/get-ingredient_group";
    return axios
      .get(supplierUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientGroupList(res.data[0]);
        setIngredientGroupForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated ingredient group
  const setPaginatedIngredientGroup = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-ingredient_group?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientGroupList(res.data[0]);
        setIngredientGroupForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get ingredient item
  const getIngredientItem = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-ingredient_item";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientItemList(res.data[0]);
        setIngredientItemForSearch(res.data[1]);
        setIngredientItemStock(res.data[2]);
        setLoading(false);
      });
  };

  // get paginated ingredient item
  const setPaginatedIngredientItem = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-ingredient_item?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientItemList(res.data[0]);
        setIngredientItemForSearch(res.data[1]);
        setIngredientItemStock(res.data[2]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get branchWeb
  const getBranchWeb = () => {
    setLoading(true);
    const branchUrl = BASE_URL + "/website/get-branch-web";
    return axios.get(branchUrl).then((res) => {
      setBranchListWeb(res.data);
      setLoading(false);
    });
  };

  //get branch
  const getBranch = () => {
    setLoading(true);
    const branchUrl = BASE_URL + "/settings/get-branch";
    return axios
      .get(branchUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setBranchList(res.data[0]);
        setBranchforSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated branch
  const setPaginatedBranch = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-branch?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setBranchList(res.data[0]);
        setBranchforSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get tables
  const getTable = () => {
    setLoading(true);
    const branchUrl = BASE_URL + "/settings/get-table";
    return axios
      .get(branchUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setTableList(res.data[0]);
        setTableforSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated tables
  const setPaginatedTable = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-table?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setTableList(res.data[0]);
        setTableforSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get payment types
  const getPaymentType = () => {
    setLoading(true);
    const paymentTypeUrl = BASE_URL + "/settings/get-payment-type";
    return axios
      .get(paymentTypeUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPaymentTypeList(res.data[0]);
        setPaymentTypeforSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated payment types
  const setPaginatedPaymentType = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-payment-type?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPaymentTypeList(res.data[0]);
        setPaymentTypeforSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get dept Tag
  const getDeptTag = () => {
    setLoading(true);
    const deptTagUrl = BASE_URL + "/settings/get-dept-tag";
    return axios
      .get(deptTagUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeptTagList(res.data[0]);
        setDeptTagForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated dept Tag
  const setPaginatedDeptTag = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-dept-tag?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeptTagList(res.data[0]);
        setDeptTagForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get work period
  const getWorkPeriod = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-work-period";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setWorkPeriodList(res.data[0]);
        setWorkPeriodListForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated work period
  const setPaginatedWorkPeriod = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-work-period?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setWorkPeriodList(res.data[0]);
        setWorkPeriodListForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get submitted orders- not settled
  const getSubmittedOrders = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-submitted-orders";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSubmittedOrders(res.data[0]);
        setSubmittedOrdersForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated submitted orders- not settled
  const setPaginatedSubmittedOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-submitted-orders?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSubmittedOrders(res.data[0]);
        setSubmittedOrdersForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get settled orders
  const getSettledOrders = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-settled-orders";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSettledOrders(res.data[0]);
        setSettledOrdersForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated settled orders
  const setPaginatedSettledOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-settled-orders?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSettledOrders(res.data[0]);
        setSettledOrdersForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get kithcen new orders
  const getKitchenNewOrders = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-new-orders";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setKithcenNewOrders(res.data[0]);
        setLoading(false);
      });
  };

  // kitchen online orders
  const getKitchenNewOrdersOnline = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-new-orders-online";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setKithcenNewOrdersOnline(res.data[0]);
        setLoading(false);
      });
  };

  //get all orders for order history
  const getAllOrders = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-order-history-all";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAllOrdersForSearch(res.data);
        setLoading(false);
      });
  };

  // get paginated settled orders
  const setPaginatedAllOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-order-history?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAllOrders(res.data);
        setDataPaginating(false);
        setLoading(false);
      })
      .catch(() => { });
  };

  //get all  online orders for order history
  const getAllOnlineOrders = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-online-order-history-all";
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAllOnlineOrdersForSearch(res.data);
        setLoading(false);
      });
  };

  // get paginated online  orders
  const setPaginatedAllOnlineOrders = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-online-order-history?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAllOnlineOrders(res.data);
        setDataPaginating(false);
        setLoading(false);
      })
      .catch(() => { });
  };

  //get food purchases
  const getIngredientPurchase = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/get-ingredient_purchase";
    return axios.get(url).then((res) => {
      setIngredientPurchaseHistory(res.data[0]);
      setIngredientPurchaseHistoryForSearch(res.data[1]);
      setLoading(false);
    });
  };

  // get paginated purchases
  const setPaginatedIngredientPurchase = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-ingredient_purchase?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setIngredientPurchaseHistory(res.data[0]);
        setIngredientPurchaseHistoryForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  return (
    <RestaurantContext.Provider
      value={{
        //common
        loading,
        setLoading,
        //delvery pending
        getDeliveryPendingOrders,
        pendingOrdersDelivery,
        setPendingOrdersDelivery,
        pendingOrdersDeliveryForSearch,
        setPendingOrdersDeliveryForSearch,
        setPaginatedDeliveryPendingOrders,

        //delivery delivered
        getDeliveryDeliveredOrders,
        deliveredOrdersDelivery,
        setDeliveredOrdersDelivery,
        deliveredOrdersDeliveryForSearch,
        setDeliveredOrdersDeliveryForSearch,
        setPaginatedDeliveryDeliveredOrders,

        //ingredient group
        getIngredientGroup,
        ingredientGroupList,
        setIngredientGroupList,
        setPaginatedIngredientGroup,
        ingredientGroupForSearch,
        setIngredientGroupForSearch,

        //ingredient item
        getIngredientItem,
        ingredientItemList,
        setIngredientItemList,
        setPaginatedIngredientItem,
        ingredientItemForSearch,
        setIngredientItemForSearch,
        ingredientItemStock,
        setIngredientItemStock,

        //ingredient purchases
        getIngredientPurchase,
        ingredientPurchaseHistory,
        setIngredientPurchaseHistory,
        setPaginatedIngredientPurchase,
        ingredientPurchaseHistoryForSearch,
        setIngredientPurchaseHistoryForSearch,

        //website
        getBranchWeb,
        branchListWeb,
        setBranchListWeb,
        //branch
        getBranch,
        branchList,
        setBranchList,
        setPaginatedBranch,
        branchForSearch,
        setBranchforSearch,

        //table
        getTable,
        tableList,
        setTableList,
        setPaginatedTable,
        tableForSearch,
        setTableforSearch,

        //dept-tag
        getDeptTag,
        deptTagList,
        setDeptTagList,
        setPaginatedDeptTag,
        deptTagForSearch,
        setDeptTagForSearch,

        //payment types
        getPaymentType,
        paymentTypeList,
        setPaymentTypeList,
        setPaginatedPaymentType,
        paymentTypeForSearch,
        setPaymentTypeforSearch,

        //work period
        getWorkPeriod,
        workPeriodList,
        setWorkPeriodList,
        setPaginatedWorkPeriod,
        workPeriodForSearch,
        setWorkPeriodListForSearch,

        //submitted orders
        getSubmittedOrders,
        submittedOrders,
        setSubmittedOrders,
        setPaginatedSubmittedOrders,
        submittedOrdersForSearch,
        setSubmittedOrdersForSearch,

        //settled orders
        getSettledOrders,
        settledOrders,
        setSettledOrders,
        setPaginatedSettledOrders,
        settledOrdersForSearch,
        setSettledOrdersForSearch,

        //kitchen dashboard
        getKitchenNewOrders,
        kithcenNewOrders,
        setKithcenNewOrders,
        getKitchenNewOrdersOnline,
        kithcenNewOrdersOnline,
        setKithcenNewOrdersOnline,

        //order histories
        getAllOrders,
        allOrders,
        setAllOrders,
        setPaginatedAllOrders,
        allOrdersForSearch,
        setAllOrdersForSearch,

        //onlineOrder histories
        getAllOnlineOrders,
        allOnlineOrders,
        setAllOnlineOrders,
        setPaginatedAllOnlineOrders,
        allOnlineOrdersForSearch,
        setAllOnlineOrdersForSearch,

        //pagination
        dataPaginating,
        setDataPaginating,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export { RestaurantContext, RestaurantProvider };
