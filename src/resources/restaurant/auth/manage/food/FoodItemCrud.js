import React, { useEffect, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL, SAAS_APPLICATION, saas_apiUrl, saas_apiParams, saas_form_data } from "../../../../../BaseUrl";

//functions
import {
  _t,
  getCookie,
  tableLoading,
} from "../../../../../functions/Functions";
import { useTranslation } from "react-i18next";

//3rd party packages
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";

//pages & includes
import ManageSidebar from "../ManageSidebar";

//context consumer
import { SettingsContext } from "../../../../../contexts/Settings";
import { FoodContext } from "../../../../../contexts/Food";
import Expired from "../../../../../saasHelper/Expired";
import SaasApiFailure from "../../../../../saasHelper/saasApiFailure";


const FoodItemCrud = () => {
  const { t } = useTranslation();
  const history = useHistory();
  //getting context values here
  let { loading, setLoading, dataPaginating } = useContext(SettingsContext);
  let [apiFailed, setApiFailed] = useState(false);

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
    isSpecial: false,
    variations: null,
  });

  let [priceForVariations, setPriceForVariations] = useState(null);

  // saas integration
  let [hasSaasLimit, setHasSaasLimit] = useState(true);
  // const SaasContext = React.createContext();

  const decrementSaasItem = () => {
    // after send api req decremeny by one
    const url = saas_apiUrl + '/api/user-item-limit-decrement';// replace with base url (prince.thetestserver.xyz)
    axios.post(url, saas_form_data).then((res) => {
      console.log(res);
    }).catch(() => {
      return 'NO data'
    });
  }

  // saas integration
  useEffect(() => {
    if (SAAS_APPLICATION == 'YES') {
      // check  saas limit item
      const checkHaslimit = () => {
        const url = saas_apiUrl + '/api/user-item-limit-check?' + saas_apiParams;// replace with base url (prince.thetestserver.xyz)
        axios.get(url).then((res) => {
          { res.data == 'HAS-LIMIT' ? setHasSaasLimit(true) : setHasSaasLimit(false) }
          // console.log('this is from state value : ', hasSaasLimit);
        }).catch(() => {
          setApiFailed(true);
        });
      }

      const saastoken = setInterval(checkHaslimit, 1000);
      checkHaslimit();
      return () => {
        //  cleanup the interval when this effect is loaded.
        clearInterval(saastoken);
      }
    }
  }, []);

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

  //is special
  const handleSpecialCheckboxChange = (e) => {
    setNewItem({
      ...newItem,
      isSpecial: !newItem.isSpecial,
    });
  };

  //post req of food item add
  const foodItemAxios = () => {
    setLoading(true);
    if (SAAS_APPLICATION == 'YES') {
      decrementSaasItem();
    }

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
    formData.append("isSpecial", newItem.isSpecial === true ? 1 : 0);
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
          isSpecial: false,
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
        <title>{_t(t("Add New Item"))}</title>
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
                    ) : (apiFailed ?
                      [
                        <SaasApiFailure />
                      ] : [
                        hasSaasLimit ? [
                          // start here
                          <div key="smtp-form">
                            <div className="row gx-2 align-items-center t-pt-15 t-pb-15">
                              <div className="col-md-6 col-lg-5 t-mb-15 mb-md-0">
                                <ul className="t-list fk-breadcrumb">
                                  <li className="fk-breadcrumb__list">
                                    <span className="t-link fk-breadcrumb__link text-capitalize">
                                      {_t(t("Add new item"))}
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
                                {foodGroupForSearch && (
                                  <div className="form-group mt-2">
                                    <div className="mb-2">
                                      <label
                                        htmlFor="itemGroup"
                                        className="control-label"
                                      >
                                        {_t(t("Food group"))}
                                        <span className="text-danger">*</span>
                                      </label>
                                    </div>
                                    <Select
                                      options={foodGroupForSearch}
                                      components={makeAnimated()}
                                      getOptionLabel={(option) => option.name}
                                      getOptionValue={(option) => option.name}
                                      classNamePrefix="select"
                                      onChange={handleSetItemGroup}
                                      maxMenuHeight="200px"
                                      placeholder={
                                        _t(t("Please select a food group")) + ".."
                                      }
                                    />
                                  </div>
                                )}

                                <div className="form-group mt-3">
                                  <div className="mb-2">
                                    <label htmlFor="name" className="control-label">
                                      {_t(t("Name"))}
                                      <span className="text-danger">*</span>
                                    </label>
                                  </div>
                                  <div className="mb-2">
                                    <input
                                      type="text"
                                      className="form-control"
                                      id="name"
                                      name="name"
                                      onChange={handleChange}
                                      value={newItem.name}
                                      placeholder="e.g. Spicy chicken burger"
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="form-check mt-4">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="propertyCheck"
                                    checked={newItem.hasProperty}
                                    onChange={handlePropertyCheckboxChange}
                                  />
                                  <label
                                    className="form-check-label pointer-cursor"
                                    htmlFor="propertyCheck"
                                  >
                                    {_t(t("Has properties?"))}
                                  </label>
                                </div>
                                {propertyGroupForSearch && [
                                  newItem.hasProperty && (
                                    <div className="form-group mt-2 ml-4">
                                      <div className="mb-2">
                                        <label className="control-label">
                                          {_t(t("Add properties"))}
                                        </label>
                                      </div>
                                      <Select
                                        options={propertyGroupForSearch}
                                        components={makeAnimated()}
                                        getOptionLabel={(option) => option.name}
                                        getOptionValue={(option) => option.name}
                                        className="basic-multi-select"
                                        classNamePrefix="select"
                                        isMulti
                                        maxMenuHeight="200px"
                                        onChange={handleSetPropertes}
                                        placeholder={
                                          _t(t("Please select property groups")) +
                                          ".."
                                        }
                                      />
                                    </div>
                                  ),
                                ]}

                                <div className="form-check mt-4">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="variationCheck"
                                    checked={newItem.hasVariation}
                                    onChange={handleVariationCheckboxChange}
                                  />
                                  <label
                                    className="form-check-label pointer-cursor"
                                    htmlFor="variationCheck"
                                  >
                                    {_t(t("Has variations?"))}
                                  </label>
                                </div>

                                {newItem.hasVariation && variationForSearch && (
                                  <div className="form-group mt-2 ml-4">
                                    <div className="mb-2">
                                      <label className="control-label">
                                        {_t(t("Add variations"))}
                                      </label>
                                    </div>
                                    <Select
                                      options={variationForSearch}
                                      components={makeAnimated()}
                                      getOptionLabel={(option) => option.name}
                                      getOptionValue={(option) => option.name}
                                      className="basic-multi-select"
                                      classNamePrefix="select"
                                      isMulti
                                      maxMenuHeight="200px"
                                      onChange={handleSetVariations}
                                      placeholder={
                                        _t(t("Please select variations")) + ".."
                                      }
                                    />
                                  </div>
                                )}
                                {newItem.variations !== null && [
                                  newItem.variations.length > 0 && (
                                    <div className="card ml-4 mt-3 p-3 custom-bg-secondary">
                                      <div className="card-header t-bg-epsilon text-white rounded-sm text-center">
                                        {_t(
                                          t("Please enter price for each variation")
                                        )}
                                      </div>
                                      {newItem.variations.map((variationItem) => {
                                        return (
                                          <div
                                            className="form-group mt-4"
                                            key={variationItem.id}
                                          >
                                            <div className="mb-2">
                                              <label
                                                htmlFor={variationItem.slug}
                                                className="control-label sm-text"
                                              >
                                                {_t(t("Total price of"))}{" "}
                                                <span className="text-primary text-bold">
                                                  {variationItem.name}
                                                </span>{" "}
                                                {_t(t("variation"))}
                                                <span className="text-primary">
                                                  *{" "}
                                                </span>
                                                <small className="text-secondary">
                                                  ({_t(t("Enter price in USD"))})
                                                </small>
                                              </label>
                                            </div>
                                            <div className="mb-2">
                                              <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="form-control"
                                                id={variationItem.slug}
                                                name={variationItem.slug}
                                                onChange={handleVariationPrice}
                                                placeholder="e.g. Type price of this item in 'US dollar'"
                                                required
                                              />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ),
                                ]}

                                {!newItem.hasVariation && (
                                  <div className="form-group mt-4">
                                    <div className="mb-2">
                                      <label
                                        htmlFor="price"
                                        className="control-label"
                                      >
                                        {_t(t("Price"))}
                                        <span className="text-primary">* </span>
                                        <small className="text-secondary">
                                          ({_t(t("Enter price in USD"))})
                                        </small>
                                      </label>
                                    </div>
                                    <div className="mb-2">
                                      <input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="form-control"
                                        name="price"
                                        value={newItem.price}
                                        onChange={handleChange}
                                        placeholder="e.g. Type price of this item in 'US dollar'"
                                        required
                                      />
                                    </div>
                                  </div>
                                )}

                                <div className="form-check mt-4">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="specialCheck"
                                    checked={newItem.isSpecial}
                                    onChange={handleSpecialCheckboxChange}
                                  />
                                  <label
                                    className="form-check-label pointer-cursor"
                                    htmlFor="specialCheck"
                                  >
                                    {_t(t("Is Special?"))}
                                  </label>
                                </div>
                                <div className="form-group mt-4">
                                  <div className="mb-2">
                                    <label
                                      htmlFor="image"
                                      className="control-label"
                                    >
                                      {_t(t("Image"))}
                                      <span className="text-danger">*</span>{" "}
                                      <small className="text-secondary">
                                        ({_t(t("300 x 300 Preferable"))})
                                      </small>
                                    </label>
                                  </div>
                                  <div className="mb-2">
                                    <input
                                      type="file"
                                      className="form-control sm-text"
                                      id="image"
                                      name="image"
                                      onChange={handleItemImage}
                                      required
                                    />
                                  </div>
                                </div>

                                <div className="form-group mt-5 pb-2">
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
                          // end here
                        ] : [
                          <Expired />
                        ]
                      ]
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

export default FoodItemCrud;
