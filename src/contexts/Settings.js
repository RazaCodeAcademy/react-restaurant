import React, { useState, useEffect } from "react";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../BaseUrl";

//functions
import { getCookie, getSystemSettings } from "../functions/Functions";

//3rd party packages

//creating context api
const SettingsContext = React.createContext();

const SettingsProvider = ({ children }) => {
  // State hooks  here
  //loading
  const [loading, setLoading] = useState(false);
  const [dataPaginating, setDataPaginating] = useState(false);

  //permission group
  const [permissionGroup, setPermissionGroup] = useState(null);
  const [permissionGroupForSearch, setPermissionGroupForSearch] =
    useState(null);

  //permissions
  const [permissions, setPermissions] = useState(null);

  //languages
  const [languageList, setLanguageList] = useState(null);
  const [navLanguageList, setNavLanguageList] = useState(null);
  const [languageListForSearch, setLanguageListForSearch] = useState(null);

  //currencies
  const [currencyList, setCurrencyList] = useState(null);
  const [navCurrencyList, setNavCurrencyList] = useState(null);
  const [currencyListForSearch, setCurrencyListForSearch] = useState(null);

  //settings
  const [generalSettings, setGeneralSettings] = useState(null);

  //smtp
  const [smtp, setSmtp] = useState({
    MAIL_MAILER: null,
    MAIL_HOST: null,
    MAIL_PORT: null,
    MAIL_USERNAME: null,
    MAIL_PASSWORD: null,
    MAIL_ENCRYPTION: null,
    MAIL_FROM_ADDRESS: null,
    MAIL_FROM_NAME: null,
  });

  // show manage stock value
  const [showManageStock, setshowManageStock] = useState(true);

  // paypal 
  const [paymentDetails, setpaymentDetails] = useState([]);
  const [paypal_client_id, setpaypal_client_id] = useState(null);
  //useEffect- to get data on render
  useEffect(() => {
    const fetchData = async () => {
      let result = await checkInstall();
      if (result === "YES") {
        //call- unauthenticated
        getLanguages();
        getCurrency();
        getSettings();

        //call if authenticated
        if (getCookie() !== undefined) {
          getSmtp();
          getPermissionGroups();
        }
      }
    };

    // show manage stock function
    const updateManageStockValue = () => {
      const url = BASE_URL + `/settings/show-manage-stock-menu-info`;
      axios.get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      }).then((res) => {

        if (res.data.length == 0 || res.data[0].value == 1) {
          setshowManageStock(true);
        } else {
          setshowManageStock(false);
        }
      });
    };

    const getpaypalpaid = () => {
      const url = BASE_URL + `/get-payment-client-id`;
      axios.get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
        .then((res) => {
          if (res.data === " ") {
            setpaypal_client_id(null)
          } else {
            setpaypal_client_id(res.data.value)
          }
          setpaymentDetails(res.data);
        })
    }

    fetchData();
    const checkMngStk = setInterval(updateManageStockValue, 5000);
    const checkpaypal = setInterval(getpaypalpaid, 10000);
    updateManageStockValue();
    getpaypalpaid();
    return () => {
      clearInterval(checkMngStk, checkpaypal);
    }
  }, []);

  // install check
  const checkInstall = async () => {
    const url = BASE_URL + "/check-install";
    let result = await axios.get(url);
    return result.data;
  };

  //get all languages
  const getLanguages = () => {
    setLoading(true);
    const langUrl = BASE_URL + "/settings/get-lang";
    return axios.get(langUrl).then((res) => {
      setLanguageList(res.data[0]);
      setNavLanguageList(res.data[1]);
      setLanguageListForSearch(res.data[1]);
      setLoading(false);
    });
  };

  // get paginated languages
  const setPaginatedLanguages = (pageNo) => {
    setDataPaginating(true);
    const langUrl = BASE_URL + "/settings/get-lang?page=" + pageNo;
    return axios
      .get(langUrl)
      .then((res) => {
        setLanguageList(res.data[0]);
        setDataPaginating(false);
      })
      .catch((error) => { });
  };

  //get smtp settings
  const getSmtp = () => {
    setLoading(true);
    const smtpUrl = BASE_URL + "/settings/get-smtp";
    return axios
      .get(smtpUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setSmtp({
          ...smtp,
          MAIL_MAILER: res.data[0].MAIL_MAILER,
          MAIL_HOST: res.data[0].MAIL_HOST,
          MAIL_PORT: res.data[0].MAIL_PORT,
          MAIL_USERNAME: res.data[0].MAIL_USERNAME,
          MAIL_PASSWORD: res.data[0].MAIL_PASSWORD,
          MAIL_ENCRYPTION: res.data[0].MAIL_ENCRYPTION,
          MAIL_FROM_ADDRESS: res.data[0].MAIL_FROM_ADDRESS,
          MAIL_FROM_NAME: res.data[0].MAIL_FROM_NAME,
        });
        setLoading(false);
      });
  };

  //get permission groups
  const getPermissionGroups = () => {
    setLoading(true);
    const permissionGroupUrl = BASE_URL + "/settings/permission-group-list";
    return axios
      .get(permissionGroupUrl, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPermissionGroup(res.data[0]);
        setPermissionGroupForSearch(res.data[1]);
        setPermissions(res.data[2]);
        setLoading(false);
      });
  };

  // get paginated groups
  const setPaginatedGropus = (pageNo) => {
    setDataPaginating(true);
    const url = BASE_URL + "/settings/permission-group-list?page=" + pageNo;
    return axios
      .get(url, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setPermissionGroup(res.data[0]);
        setPermissionGroupForSearch(res.data[1]);
        setPermissions(res.data[2]);
        setDataPaginating(false);
      })
      .catch(() => { });
  };

  //get all currency
  const getCurrency = () => {
    setLoading(true);
    const currencyUrl = BASE_URL + "/settings/get-currency";
    return axios.get(currencyUrl).then((res) => {
      setCurrencyList(res.data[0]);
      setNavCurrencyList(res.data[1]);
      setCurrencyListForSearch(res.data[1]);
      setLoading(false);
    });
  };

  // get paginated currency
  const setPaginatedCurrencies = (pageNo) => {
    setDataPaginating(true);
    const currencyUrl = BASE_URL + "/settings/get-currency?page=" + pageNo;
    return axios
      .get(currencyUrl)
      .then((res) => {
        setCurrencyList(res.data[0]);
        setDataPaginating(false);
      })
      .catch((error) => { });
  };

  //get all languages
  const getSettings = () => {
    setLoading(true);
    const url = BASE_URL + "/settings/general-settings";
    return axios.get(url).then((res) => {
      setGeneralSettings(res.data);
      const favicon = document.getElementById("favicon");
      favicon.href = BASE_URL + getSystemSettings(res.data, "favicon");
      setLoading(false);
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        //common
        loading,
        setLoading,

        //general settings
        generalSettings,
        setGeneralSettings,
        getLanguages,
        getCurrency,
        getSettings,

        //currencies
        currencyList,
        setCurrencyList,
        setPaginatedCurrencies,
        navCurrencyList,
        setNavCurrencyList,
        currencyListForSearch,
        setCurrencyListForSearch,

        //languages
        languageList,
        setLanguageList,
        setPaginatedLanguages,
        navLanguageList,
        setNavLanguageList,
        languageListForSearch,
        setLanguageListForSearch,

        //smtp
        smtp,
        getSmtp,
        setSmtp,

        //permission group
        getPermissionGroups,
        permissionGroup,
        setPermissionGroup,
        setPaginatedGropus,
        permissionGroupForSearch,
        setPermissionGroupForSearch,

        //permissions
        permissions,
        setPermissions,

        //pagination
        dataPaginating,
        setDataPaginating,

        //show  manage stock
        showManageStock,
        setshowManageStock,

        // paypal_paypal_client_id
        paypal_client_id,
        setpaypal_client_id,

        paymentDetails,
        // setpaymentDetails
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export { SettingsContext, SettingsProvider };
