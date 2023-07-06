import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../BaseUrl";

//functions
import { getCookie, deleteCookie } from "../functions/Functions";

//3rd party packages

// creating context api
const UserContext = React.createContext();

const UserProvider = ({ children }) => {
  const history = useHistory();

  // State hooks here
  //loading
  const [loading, setLoading] = useState(false);
  const [dataPaginating, setDataPaginating] = useState(false);

  // auth user
  const [authUserInfo, setAuthUserInfo] = useState({
    details: null,
    permissions: null,
  });

  //supplier
  const [supplierList, setSupplierList] = useState(null);
  const [supplierForSearch, setSupplierForSearch] = useState(null);

  //waiter
  const [waiterList, setWaiterList] = useState(null);
  const [waiterForSearch, setWaiterForSearch] = useState(null);

  //customer
  const [customerList, setCustomerList] = useState(null);
  const [customerForSearch, setCustomerForSearch] = useState(null);

  //customer online
  const [customerListOnline, setCustomerListOnline] = useState(null);
  const [customerOnlineForSearch, setCustomerOnlineForSearch] = useState(null);

  //adminStaff
  const [adminStaffList, setAdminStaffList] = useState(null);
  const [adminStaffForSearch, setAdminStaffListforSearch] = useState(null);

  //delivery
  const [deliveryList, setDeliveryList] = useState(null);
  const [deliveryForSearch, setDeliveryListforSearch] = useState(null);
  const [deliveryListReq, setDeliveryListReq] = useState(null);
  const [deliveryListReqForSearch, setDeliveryListReqForSearch] =
    useState(null);

  //useEffect- to get data on render
  useEffect(() => {
    //call- unauthenticated

    //call if authenticated
    if (getCookie() !== undefined) {
      getAuthUser();
      getWaiter();
      getCustomer();
      getAdminStaff();
    }
  }, []);

  //get authenticated user
  const getAuthUser = () => {
    setLoading(true);
    const langUrl = BASE_URL + "/auth/user";
    return axios
      .get(langUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        if (res.data[0].is_banned === 0 || res.data[0].is_banned === "0") {
          setAuthUserInfo({
            ...authUserInfo,
            details: res.data[0],
            permissions: res.data[1],
          });
          setLoading(false);
        } else {
          deleteCookie();
        }
      })
      .catch(() => {});
  };

  //get supplier
  const getSupplier = () => {
    setLoading(true);
    const supplierUrl = BASE_URL + "/settings/get-supplier";
    return axios
      .get(supplierUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSupplierList(res.data[0]);
        setSupplierForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated supplier
  const setPaginatedSupplier = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-supplier?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSupplierList(res.data[0]);
        setSupplierForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get waiter
  const getWaiter = () => {
    setLoading(true);
    const waiterUrl = BASE_URL + "/settings/get-waiter";
    return axios
      .get(waiterUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setWaiterList(res.data[0]);
        setWaiterForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated waiter
  const setPaginatedWaiter = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-waiter?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setWaiterList(res.data[0]);
        setWaiterForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get customer
  const getCustomer = () => {
    setLoading(true);
    const customerUrl = BASE_URL + "/settings/get-customer";
    return axios
      .get(customerUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setCustomerList(res.data[0]);
        setCustomerForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated customer
  const setPaginatedCustomer = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-customer?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setCustomerList(res.data[0]);
        setCustomerForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get customer online
  const getCustomerOnline = () => {
    setLoading(true);
    const customerUrl = BASE_URL + "/settings/get-website-customer";
    return axios
      .get(customerUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setCustomerListOnline(res.data[0]);
        setCustomerOnlineForSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated customer online
  const setPaginatedCustomerOnline = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-website-customer?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setCustomerListOnline(res.data[0]);
        setCustomerOnlineForSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get adminStaff
  const getAdminStaff = () => {
    setLoading(true);
    const adminStaffUrl = BASE_URL + "/settings/get-admin-staff";
    return axios
      .get(adminStaffUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAdminStaffList(res.data[0]);
        setAdminStaffListforSearch(res.data[1]);
        setLoading(false);
      });
  };

  // get paginated adminStaff
  const setPaginatedAdminStaff = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-admin-staff?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setAdminStaffList(res.data[0]);
        setAdminStaffListforSearch(res.data[1]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  //get delivery user
  const getDeliveryUser = () => {
    setLoading(true);
    const adminStaffUrl = BASE_URL + "/settings/get-delivery-man";
    return axios
      .get(adminStaffUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeliveryList(res.data[0]);
        setDeliveryListforSearch(res.data[1]);
        setDeliveryListReq(res.data[2]);
        setDeliveryListReqForSearch(res.data[3]);
        setLoading(false);
      });
  };

  // get paginated delivery user
  const setPaginatedDeliveryUser = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/get-delivery-man?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setDeliveryList(res.data[0]);
        setDeliveryListforSearch(res.data[1]);
        setDeliveryListReq(res.data[2]);
        setDeliveryListReqForSearch(res.data[3]);
        setDataPaginating(false);
      })
      .catch(() => {});
  };

  return (
    <UserContext.Provider
      value={{
        //auth user
        getAuthUser,
        setAuthUserInfo,
        authUserInfo,

        //supplier
        getSupplier,
        supplierList,
        setSupplierList,
        setPaginatedSupplier,
        supplierForSearch,
        setSupplierForSearch,

        //waiter
        getWaiter,
        waiterList,
        setWaiterList,
        setPaginatedWaiter,
        waiterForSearch,
        setWaiterForSearch,

        //customer
        getCustomer,
        customerList,
        setCustomerList,
        setPaginatedCustomer,
        customerForSearch,
        setCustomerForSearch,

        //customer Online
        getCustomerOnline,
        customerListOnline,
        setCustomerListOnline,
        setPaginatedCustomerOnline,
        customerOnlineForSearch,
        setCustomerOnlineForSearch,

        //adminStaff
        getAdminStaff,
        adminStaffList,
        setAdminStaffList,
        setPaginatedAdminStaff,
        adminStaffForSearch,
        setAdminStaffListforSearch,

        //delivery user
        getDeliveryUser,
        deliveryList,
        setDeliveryList,
        setPaginatedDeliveryUser,
        deliveryForSearch,
        setDeliveryListforSearch,
        deliveryListReq,
        setDeliveryListReq,
        deliveryListReqForSearch,
        setDeliveryListReqForSearch,

        //pagination
        dataPaginating,
        setDataPaginating,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
