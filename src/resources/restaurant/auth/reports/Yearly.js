import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "../../../../BaseUrl";

//functions
import { _t, getCookie, tableLoading } from "../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import Chart from "react-apexcharts";

//pages & includes
import ReportSidebar from "./ReportSidebar";

//context consumer
import { SettingsContext } from "../../../../contexts/Settings";
import { FoodContext } from "../../../../contexts/Food";

const Yearly = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);

  let {
    setFoodForSearch,
    foodGroupForSearch,
    propertyGroupForSearch,
    variationForSearch,
  } = useContext(FoodContext);

  // States hook here
  //new item
  let [newItem, setNewItem] = useState({
    itemGroup: null,
    name: "",
    price: "",
    image: null,
    hasProperty: false,
    properties: null,
    hasVariation: false,
    variations: null,
  });

  let [priceForVariations, setPriceForVariations] = useState(null);

  const [chart, setChart] = useState({
    options: {
      chart: {
        id: "basic-bar",
      },
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
      },
    },
    series: [
      {
        name: "series-1",
        data: [30, 40, 45, 50, 49, 60, 70, 91],
      },
    ],
  });

  //useEffect == componentDidMount()
  useEffect(() => {}, []);

  //on change input field
  const handleChange = (e) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  //set image hook
  const handleItemImage = (e) => {
    setNewItem({
      ...newItem,
      [e.target.name]: e.target.files[0],
    });
  };

  //set properties hook
  const handleSetPropertes = (properties) => {
    setNewItem({ ...newItem, properties });
  };

  //set variations hook
  const handleSetVariations = (variations) => {
    setNewItem({ ...newItem, variations });
  };

  //set each variation price
  const handleVariationPrice = (e) => {
    setPriceForVariations({
      ...priceForVariations,
      [e.target.name]: e.target.value,
    });
  };

  //handle Set item group hook
  const handleSetItemGroup = (itemGroup) => {
    setNewItem({ ...newItem, itemGroup });
  };

  //has Property
  const handlePropertyCheckboxChange = (e) => {
    if (newItem.hasProperty === true) {
      setNewItem({
        ...newItem,
        properties: null,
        hasProperty: !newItem.hasProperty,
      });
    } else {
      setNewItem({ ...newItem, hasProperty: !newItem.hasProperty });
    }
  };

  //has variations
  const handleVariationCheckboxChange = (e) => {
    if (newItem.hasVariation === true) {
      setNewItem({
        ...newItem,
        variations: null,
        hasVariation: !newItem.hasVariation,
      });
    } else {
      setNewItem({ ...newItem, hasVariation: !newItem.hasVariation });
    }
  };

  //post req of food item add
  const foodItemAxios = () => {
    setLoading(true);
    let formData = new FormData();
    formData.append("food_group_id", newItem.itemGroup.id);
    formData.append("name", newItem.name);
    formData.append("hasProperty", newItem.hasProperty === true ? 1 : 0);
    if (newItem.hasProperty === true) {
      formData.append("hasProperty", 1);
      let tempArray = [];
      newItem.properties.map((pItem) => {
        tempArray.push(pItem.id);
      });
      formData.append("properties", tempArray);
    }

    formData.append("hasVariation", newItem.hasVariation === true ? 1 : 0);
    if (newItem.hasVariation === false) {
      formData.append("price", newItem.price);
    } else {
      //converting variations and prices to array
      let slugArray = [];
      newItem.variations.map((newVarItem) => {
        slugArray.push(newVarItem.slug);
      });
      slugArray.map((slugItem) => {
        formData.append("slugOfVariations[]", slugItem);
      });

      let tempData = Object.entries(priceForVariations);
      tempData.map((item) => {
        formData.append("variations[]", item);
      });
    }

    formData.append("image", newItem.image);
    const url = BASE_URL + "/settings/new-food-item";
    return axios
      .post(url, formData, {
        headers: { Authorization: `Bearer ${getCookie()}` },
      })
      .then((res) => {
        setFoodForSearch(res.data[1]);
        setNewItem({
          itemGroup: null,
          name: "",
          price: "",
          image: null,
          hasProperty: false,
          properties: null,
          hasVariation: false,
          variations: null,
        });
        setLoading(false);
        toast.success(`${_t(t("Food item has been added"))}`, {
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
        if (error.response.data.errors.image) {
          error.response.data.errors.image.forEach((item) => {
            if (item === "Please select a valid image file") {
              toast.error(`${_t(t("Please select a valid image file"))}`, {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              });
            }
            if (item === "Please select a file less than 5MB") {
              toast.error(`${_t(t("Please select a file less than 5MB"))}`, {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              });
            }
          });
        }
      });
  };

  //send to server
  const handleSubmit = (e) => {
    e.preventDefault();
    //check item group selected
    if (newItem.itemGroup !== null) {
      //check property is selected or not if property checkbox is checked
      if (newItem.hasProperty === true && newItem.properties === null) {
        toast.error(`${_t(t("Please select properties"))}`, {
          position: "bottom-center",
          autoClose: 10000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          className: "text-center toast-notification",
        });
      } else {
        //if property checkbox is not selected
        if (newItem.hasProperty === false) {
          //check variation is selected or not if variation checkbox is checked
          if (newItem.hasVariation === true && newItem.variations === null) {
            toast.error(`${_t(t("Please select variations"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
          } else {
            //if variation checkbox is not selected
            if (newItem.hasVariation === false) {
              foodItemAxios();
            } else {
              //if variation checkbox is selected, options selected, but deleted all selected options at once
              if (newItem.variations.length > 0) {
                foodItemAxios();
              } else {
                toast.error(`${_t(t("Please select variations"))}`, {
                  position: "bottom-center",
                  autoClose: 10000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  className: "text-center toast-notification",
                });
              }
            }
          }
        } else {
          //if property checkbox is selected, options selected, but deleted all selected options at once
          if (newItem.properties.length > 0) {
            if (newItem.hasVariation === true && newItem.variations === null) {
              toast.error(`${_t(t("Please select variations"))}`, {
                position: "bottom-center",
                autoClose: 10000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                className: "text-center toast-notification",
              });
            } else {
              //if variation checkbox is not selected
              if (newItem.hasVariation === false) {
                foodItemAxios();
              } else {
                //if variation checkbox is selected, options selected, but deleted all selected options at once
                if (newItem.variations.length > 0) {
                  foodItemAxios();
                } else {
                  toast.error(`${_t(t("Please select variations"))}`, {
                    position: "bottom-center",
                    autoClose: 10000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    className: "text-center toast-notification",
                  });
                }
              }
            }
          } else {
            toast.error(`${_t(t("Please select properties"))}`, {
              position: "bottom-center",
              autoClose: 10000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              className: "text-center toast-notification",
            });
          }
        }
      }
    } else {
      //if item group not selected
      toast.error(`${_t(t("Please select a Food Group for this item"))}`, {
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
        <title>{_t(t("Yearly reports"))}</title>
      </Helmet>

      {/* main body */}
      <main id="main" data-simplebar>
        <div className="container">
          <div className="row t-mt-10 gx-2">
            {/* left Sidebar */}
            <div className="col-lg-3 col-xxl-2 t-mb-30 mb-lg-0">
              <ReportSidebar />
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
                          <div className="col-12 t-mb-15 mb-md-0">
                            <ul className="t-list fk-breadcrumb">
                              <li className="fk-breadcrumb__list">
                                <span className="t-link fk-breadcrumb__link text-capitalize">
                                  {_t(t("Yearly reports"))}
                                </span>
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="row gx-2 justify-content-center t-pt-15 t-pb-15">
                          <div className="col-12 t-mb-15 mb-md-0">
                            <Chart
                              options={chart.options}
                              series={chart.series}
                              type="bar"
                              width="100%"
                              height="300"
                            />
                          </div>
                        </div>
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

export default Yearly;
