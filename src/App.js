import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

//axios and base url
import axios from "axios";
import { BASE_URL } from "./BaseUrl";

//routes
import RestaurantRoute from "./routes/RestaurantRoute";
import CustomerRoute from "./routes/CustomerRoute";


//functions
import {
  // consolee,
  checkPermission,
  getSystemSettings,
} from "./functions/Functions";

//3rd party packages
import { ToastContainer } from "react-toastify";

//pages & includes
import {
  //installation
  Welcome,
  InstallPermission,
  DbSetup,
  ImportDb,
  InstallationUser,
  InstallationCongratulation,
  //landing
  RestaurantLanding,
  CustomerProfile,
  MyOrders,

  //common
  Refresh,
  Login,
  SignUp,
  BeDeliveryMan,
  NotFound,
  ForgetPw,
  SetNewPw,
  NoPermission,

  //dashboard
  RestaurantHome,
  UpdateProfile,
  WorkPeriod,
  OpeningClosingStock,

  //delivery
  AssignedOrders,
  DeliveredOrders,

  //pos
  Pos,
  Submitted,
  Settled,
  OnlineOrders,
  EditSubmittedOrder,
  //customers
  StripePayment,
  Customers,
  OnlineCustomerList,
  //
  OnlineOrderHistories,
  OrderHistories,
  Kitchen,
  KitchenOnline,
  //Reports
  Dashboard,
  Daily,
  Monthly,
  // Yearly,
  ItemWise,
  GroupWise,
  BranchWise,
  UserWise,
  DeptWise,
  ServiceChargeWise,
  DiscountWise,
  StockDashboard,
  FoodStockReport,
  IngredientStockReport,
  OpeningClosingStockIngredientReport,
  OpeningClosingStockFoodReport,

  //manage->food
  GroupCrud,
  // UnitCrud,
  VariationCrud,
  PropertyCrud,
  PropertyItemCrud,
  FoodItemCrud,
  AllItemList,
  //manage->website
  HeroSection,
  Promotions,
  //manage->settings
  Currency,
  Lang,
  Translation,
  Smtp,
  PosScreen,
  General,
  UpdateSystem,

  //manage->stock
  FoodPurchase,
  FoodPurchaseEdit,
  FoodPurchaseHistory,
  FoodReturn,
  IngredientGroup,
  IngredientItem,
  IngredientPurchase,
  IngredientPurchaseEdit,
  IngredientPurchaseHistory,
  IngredientUsage,
  IngredientReturn,
  ManageSupplier,
  SupplierHistory,
  StockOutFood,
  StockOutIngredient,

  //manage->user
  AdminStaffCrud,
  DeliveryMen,
  NewDeliveryMen,
  Waiter,
  Permissions,
  CustomerCrud,

  //manage->restaurantDetails
  BranchCrud,
  TableCrud,
  DeptTagCrud,
  PaymentTypeCrud,
} from "./imports/Pages";
import { Navbar, Footer } from "./imports/Components";

//context consumer
import { SettingsContext } from "./contexts/Settings";
import { UserContext } from "./contexts/User";
import Showdeliveryman from "./resources/restaurant/auth/manage/settings/ShowDeliveryman";

function App() {
  //getting context values here
  const { loading, setLoading, generalSettings } = useContext(SettingsContext);
  let { authUserInfo } = useContext(UserContext);

  //state hooks here
  const [credentials, setCredentials] = useState({
    install_no: false,
  });

  //useEffect == componentDidMount()
  useEffect(() => {
    (async () => {
      setLoading(false);
      const url = BASE_URL + "/check-install";
      return axios
        .get(url)
        .then((res) => {
          if (res.data === "NO") {
            setCredentials({
              ...credentials,
              install_no: true,
            });
          }
        })
        .catch((error) => {
          return 'asdhfashfoasao';
        });
    })();

    if (generalSettings) {
      const favicon = document.getElementById("favicon");
      favicon.href = BASE_URL + getSystemSettings(generalSettings, "favicon");
    }
    // consolee();
  }, [authUserInfo]);
  return (


    <>
      <ToastContainer />
      {/* <Router basename="/khalaf"> */}
      {/* "homepage": "http://localhost/khadyo" */}

      <Router>
        <Navbar />
        <Switch>

          {/* installation */}
          {credentials.install_no && (
            <Route path="/installation" exact>
              <Welcome />
            </Route>
          )}

          {credentials.install_no && (
            <Route path="/installation/permission-chcek" exact>
              <InstallPermission />
            </Route>
          )}

          {credentials.install_no && (
            <Route path="/installation/database-setup" exact>
              <DbSetup />
            </Route>
          )}

          {credentials.install_no && (
            <Route path="/installation/import-database" exact>
              <ImportDb />
            </Route>
          )}

          {credentials.install_no && (
            <Route path="/installation/add-admin-user" exact>
              <InstallationUser />
            </Route>
          )}

          {credentials.install_no && (
            <Route path="/installation/congratulation" exact>
              <InstallationCongratulation />
            </Route>
          )}

          {/* common */}
          <Route path="/refresh" exact>
            <Refresh />
          </Route>

          <Route path="/login" exact>
            <Login />
          </Route>

          <Route path="/sign-up" exact>
            <SignUp />
          </Route>

          <Route path="/delivery-man-registration" exact>
            <BeDeliveryMan />
          </Route>

          <Route path="/reset-password" exact>
            <ForgetPw />
          </Route>

          <Route path="/set-new-password/:token" exact>
            <SetNewPw />
          </Route>

          {credentials.install_no ? (
            <Route path="/" exact>
              <Login />
            </Route>
          ) : (
            <Route path="/" exact>
              <RestaurantLanding />
            </Route>
          )}



          {/* Customer routes */}
          <CustomerRoute path="/profile" exact>
            <CustomerProfile />
          </CustomerRoute>
          <CustomerRoute path="/my-orders" exact>
            <MyOrders />
          </CustomerRoute>

          {/* restaurant dashboard pages */}
          <RestaurantRoute path="/dashboard" exact>
            <RestaurantHome />
          </RestaurantRoute>

          <RestaurantRoute path="/update-user-profile" exact>
            <UpdateProfile />
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/work-periods" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Work period") ? (
              <WorkPeriod />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/closing-stock/:started_at" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Work period") ? (
              <OpeningClosingStock />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/pos" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "POS") ? (
              <Pos />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* jtd */}
          <RestaurantRoute path="/dashboard/edit-submit-order/:editId" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "POS") ? (
              <EditSubmittedOrder />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/pos/submitted" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "POS") ? (
              <Submitted />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/pos/settled" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "POS") ? (
              <Settled />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/pos/online-orders" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "POS") ? (
              <OnlineOrders />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/orders" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Order history") ? (
              <OrderHistories />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/online-orders" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Order history") ? (
              <OnlineOrderHistories />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/customers" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Customer") ? (
              <Customers />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/online-customers" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Customer") ? (
              <OnlineCustomerList />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/kitchen" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Kitchen") ? (
              <Kitchen />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/kitchen/online" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Kitchen") ? (
              <KitchenOnline />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <Dashboard />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/daily-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <Daily />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/monthly-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <Monthly />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* <RestaurantRoute path="/dashboard/yearly-reports" exact>
       {authUserInfo.permissions !== null &&
       checkPermission(authUserInfo.permissions, "Report") ? (
         <Yearly />
       ) : (
         <NoPermission />
       )}
     </RestaurantRoute> */}

          <RestaurantRoute path="/dashboard/food-items-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <ItemWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/food-group-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <GroupWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/branch-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <BranchWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/pos-user-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <UserWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/dept-tag-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <DeptWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/service-charge-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <ServiceChargeWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/discount-reports" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <DiscountWise />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/stock" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <StockDashboard />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/food-stock" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <FoodStockReport />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/ingredient-stock" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <IngredientStockReport />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/food-stock/:started_at" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <OpeningClosingStockFoodReport />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/ingredient-stock/:started_at" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Report") ? (
              <OpeningClosingStockIngredientReport />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Manage routes */}
          {/* food */}
          <RestaurantRoute path="/dashboard/manage/food/groups" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <GroupCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* <RestaurantRoute path="/dashboard/manage/food/units" exact>
       {authUserInfo.permissions !== null &&
       checkPermission(authUserInfo.permissions, "Manage") ? (
         <UnitCrud />
       ) : (
         <NoPermission />
       )}
     </RestaurantRoute> */}

          <RestaurantRoute path="/dashboard/manage/food/variations" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <VariationCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/food/properties" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <PropertyCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/food/properties/:slug" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <PropertyItemCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/food/add-new" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <FoodItemCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/stripe/payment" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <StripePayment />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/food/all-items" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <AllItemList />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Stock */}
          <RestaurantRoute path="/dashboard/manage/stock/food-purchase" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <FoodPurchase />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/purchase-history-food"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <FoodPurchaseHistory />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/purchase-history-food-edit/:id"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <FoodPurchaseEdit />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/stock/food-return" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <FoodReturn />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/ingredient-group"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientGroup />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/stock/ingredient-item" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientItem />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/ingredient-purchase"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientPurchase />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/purchase-history-ingredient"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientPurchaseHistory />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/purchase-history-ingredient-edit/:id"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientPurchaseEdit />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/ingredient-return"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientReturn />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/ingredient-usage"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <IngredientUsage />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/stock/manage-supplier" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <ManageSupplier />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/supplier-history"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <SupplierHistory />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/stock/stock-out-food" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <StockOutFood />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/stock/stock-out-ingredient"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <StockOutIngredient />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Users */}
          <RestaurantRoute path="/dashboard/manage/user/customers" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <CustomerCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/user/admin-staff" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <AdminStaffCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/user/delivery-men" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <DeliveryMen />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/user/delivery-request" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <NewDeliveryMen />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/user/waiters" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Waiter />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/roles-and-permissions" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Permissions />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Restaurant */}
          <RestaurantRoute path="/dashboard/manage/restaurant/branches" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <BranchCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/restaurant/tables" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <TableCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/restaurant/dept-tags" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <DeptTagCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/restaurant/payment-type"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <PaymentTypeCrud />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Website */}
          <RestaurantRoute path="/dashboard/manage/website/hero-section" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <HeroSection />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/website/promotions" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Promotions />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Settings */}
          <RestaurantRoute path="/dashboard/manage/settings/currencies" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Currency />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/settings/languages" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Lang />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/settings/languages/:code"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Translation />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/settings/smtp-settings"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Smtp />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/manage/settings/pos-screen" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <PosScreen />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/settings/general-settings"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <General />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/settings/show-delivery-menu"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <Showdeliveryman />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute
            path="/dashboard/manage/settings/update-system"
            exact
          >
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Manage") ? (
              <UpdateSystem />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/delivery/assigned-orders" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Delivery") ? (
              <AssignedOrders />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          <RestaurantRoute path="/dashboard/delivery/delivered-orders" exact>
            {authUserInfo.permissions !== null &&
              checkPermission(authUserInfo.permissions, "Delivery") ? (
              <DeliveredOrders />
            ) : (
              <NoPermission />
            )}
          </RestaurantRoute>

          {/* Error Routing */}
          <Route component={NotFound} />
          {/* Error Routing */}




        </Switch>
        <Footer />
      </Router>


    </>
  );
}

export default App;
