//installation
import Welcome from "../resources/install/Welcome";
import InstallPermission from "../resources/install/InstallPermission";
import DbSetup from "../resources/install/DbSetup";
import ImportDb from "../resources/install/ImportDb";
import InstallationUser from "../resources/install/InstallationUser";
import InstallationCongratulation from "../resources/install/InstallationCongratulation";

//common pages
import Refresh from "../resources/common/Refresh";
import Login from "../resources/common/Login";
import SignUp from "../resources/common/SignUp";
import BeDeliveryMan from "../resources/common/BeDeliveryMan";
import ForgetPw from "../resources/common/ForgetPw";
import SetNewPw from "../resources/common/SetNewPw";
import NotFound from "../resources/common/NotFound";
import NoPermission from "../resources/common/NoPermission";

//public page
import RestaurantLanding from "../resources/restaurant/public/RestaurantLanding";
import CustomerProfile from "../resources/restaurant/onlineCustomer/CustomerProfile";
import MyOrders from "../resources/restaurant/onlineCustomer/MyOrders";
import StripePayment from "../resources/restaurant/payment/StripePayment";

//private pages
import RestaurantHome from "../resources/restaurant/auth/RestaurantHome";

//update profile
import UpdateProfile from "../resources/restaurant/auth/profile/UpdateProfile";

//work periods
import WorkPeriod from "../resources/restaurant/auth/workPeriod/WorkPeriod";
import OpeningClosingStock from "../resources/restaurant/auth/workPeriod/OpeningClosingStock";

//customers
import Customers from "../resources/restaurant/auth/customer/Customers";
import OnlineCustomerList from "../resources/restaurant/auth/customer/OnlineCustomerList";
//pos
import Pos from "../resources/restaurant/auth/pos/Pos";
import Submitted from "../resources/restaurant/auth/pos/Submitted";
import Settled from "../resources/restaurant/auth/pos/Settled";
import OnlineOrders from "../resources/restaurant/auth/pos/OnlineOrders";
import EditSubmittedOrder from "../resources/restaurant/auth/pos/EditSubmittedOrder";
//delivery pages
import AssignedOrders from "../resources/restaurant/auth/delivery/AssignedOrders";
import DeliveredOrders from "../resources/restaurant/auth/delivery/DeliveredOrders";

//kithcen
import Kitchen from "../resources/restaurant/auth/kitchen/Kitchen";
import KitchenOnline from "../resources/restaurant/auth/kitchen/KitchenOnline";
//order histories
import OrderHistories from "../resources/restaurant/auth/orderHistory/OrderHistories";
import OnlineOrderHistories from "../resources/restaurant/auth/orderHistory/OnlineOrderHistories";
//Reports
import Dashboard from "../resources/restaurant/auth/reports/Dashboard";
import Daily from "../resources/restaurant/auth/reports/Daily";
import Monthly from "../resources/restaurant/auth/reports/Monthly";
import Yearly from "../resources/restaurant/auth/reports/Yearly";
import ItemWise from "../resources/restaurant/auth/reports/ItemWise";
import GroupWise from "../resources/restaurant/auth/reports/GroupWise";
import BranchWise from "../resources/restaurant/auth/reports/BranchWise";
import UserWise from "../resources/restaurant/auth/reports/UserWise";
import DeptWise from "../resources/restaurant/auth/reports/DeptWise";
import ServiceChargeWise from "../resources/restaurant/auth/reports/ServiceChargeWise";
import DiscountWise from "../resources/restaurant/auth/reports/DiscountWise";

import StockDashboard from "../resources/restaurant/auth/reports/StockDashboard";
import FoodStockReport from "../resources/restaurant/auth/reports/FoodStockReport";
import IngredientStockReport from "../resources/restaurant/auth/reports/IngredientStockReport";
import OpeningClosingStockIngredientReport from "../resources/restaurant/auth/reports/OpeningClosingStockIngredientReport";
import OpeningClosingStockFoodReport from "../resources/restaurant/auth/reports/OpeningClosingStockFoodReport";

//from restaurant-auth-manage
//-food
import GroupCrud from "../resources/restaurant/auth/manage/food/GroupCrud";
import UnitCrud from "../resources/restaurant/auth/manage/food/UnitCrud";
import VariationCrud from "../resources/restaurant/auth/manage/food/VariationCrud";
import PropertyCrud from "../resources/restaurant/auth/manage/food/PropertyCrud";
import PropertyItemCrud from "../resources/restaurant/auth/manage/food/PropertyItemCrud";
import FoodItemCrud from "../resources/restaurant/auth/manage/food/FoodItemCrud";
import AllItemList from "../resources/restaurant/auth/manage/food/AllItemList";

// website
import HeroSection from "../resources/restaurant/auth/manage/website/HeroSection";
import Promotions from "../resources/restaurant/auth/manage/website/Promotions";

//-settings
import Currency from "../resources/restaurant/auth/manage/settings/Currency";
import Lang from "../resources/restaurant/auth/manage/settings/Lang";
import Translation from "../resources/restaurant/auth/manage/settings/Translation";
import Smtp from "../resources/restaurant/auth/manage/settings/Smtp";
import PosScreen from "../resources/restaurant/auth/manage/settings/PosScreen";
import General from "../resources/restaurant/auth/manage/settings/General";
import UpdateSystem from "../resources/restaurant/auth/manage/settings/UpdateSystem";

//stock
import FoodPurchase from "../resources/restaurant/auth/manage/stock/FoodPurchase";
import FoodPurchaseEdit from "../resources/restaurant/auth/manage/stock/FoodPurchaseEdit";
import FoodPurchaseHistory from "../resources/restaurant/auth/manage/stock/FoodPurchaseHistory";
import FoodReturn from "../resources/restaurant/auth/manage/stock/FoodReturn";
import IngredientGroup from "../resources/restaurant/auth/manage/stock/IngredientGroup";
import IngredientItem from "../resources/restaurant/auth/manage/stock/IngredientItem";
import IngredientPurchase from "../resources/restaurant/auth/manage/stock/IngredientPurchase";
import IngredientPurchaseEdit from "../resources/restaurant/auth/manage/stock/IngredientPurchaseEdit";
import IngredientPurchaseHistory from "../resources/restaurant/auth/manage/stock/IngredientPurchaseHistory";
import IngredientUsage from "../resources/restaurant/auth/manage/stock/IngredientUsage";
import IngredientReturn from "../resources/restaurant/auth/manage/stock/IngredientReturn";
import ManageSupplier from "../resources/restaurant/auth/manage/stock/ManageSupplier";
import SupplierHistory from "../resources/restaurant/auth/manage/stock/SupplierHistory";
import StockOutFood from "../resources/restaurant/auth/manage/stock/StockOutFood";
import StockOutIngredient from "../resources/restaurant/auth/manage/stock/StockOutIngredient";

//-users
import Permissions from "../resources/restaurant/auth/manage/user/Permissions";
import Waiter from "../resources/restaurant/auth/manage/user/Waiter";
import CustomerCrud from "../resources/restaurant/auth/manage/user/CustomerCrud";
import AdminStaffCrud from "../resources/restaurant/auth/manage/user/AdminStaffCrud";
import DeliveryMen from "../resources/restaurant/auth/manage/user/DeliveryMen";
import NewDeliveryMen from "../resources/restaurant/auth/manage/user/NewDeliveryMen";

//-restairantDetails
import BranchCrud from "../resources/restaurant/auth/manage/restaurantDetails/BranchCrud";
import TableCrud from "../resources/restaurant/auth/manage/restaurantDetails/TableCrud";
import DeptTagCrud from "../resources/restaurant/auth/manage/restaurantDetails/DeptTagCrud";
import PaymentTypeCrud from "../resources/restaurant/auth/manage/restaurantDetails/PaymentTypeCrud";

export {
  //installation
  Welcome,
  InstallPermission,
  DbSetup,
  ImportDb,
  InstallationUser,
  InstallationCongratulation,
  //website
  RestaurantLanding,
  CustomerProfile,
  MyOrders,
  //common
  Refresh,
  Login,
  SignUp,
  BeDeliveryMan,
  ForgetPw,
  SetNewPw,
  NotFound,
  NoPermission,
  //dashboard
  RestaurantHome,
  UpdateProfile,
  WorkPeriod,
  OpeningClosingStock,
  //delivery
  AssignedOrders,
  DeliveredOrders,
  //Pos
  Pos,
  Submitted,
  Settled,
  OnlineOrders,
  EditSubmittedOrder,
  //customers
  Customers,
  StripePayment,
  OnlineCustomerList,
  //
  OnlineOrderHistories,
  OrderHistories,
  Kitchen,
  KitchenOnline,
  //reports
  Dashboard,
  Daily,
  Monthly,
  Yearly,
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
  UnitCrud,
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
  //manage->users
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
};
