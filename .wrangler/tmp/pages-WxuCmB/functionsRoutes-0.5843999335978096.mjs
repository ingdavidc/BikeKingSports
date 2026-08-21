import { onRequestPost as __api_auth_login_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\auth\\login.js"
import { onRequestPost as __api_auth_logout_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\auth\\logout.js"
import { onRequestGet as __api_auth_me_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\auth\\me.js"
import { onRequestGet as __api_store_products_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\store\\products.js"
import { onRequestGet as __api_media__filename__js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\media\\[filename].js"
import { onRequestGet as __api_sales__id__js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\sales\\[id].js"
import { onRequestGet as __api_content_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\content.js"
import { onRequestPost as __api_content_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\content.js"
import { onRequestGet as __api_customers_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\customers.js"
import { onRequestGet as __api_fix_db_desc_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\fix-db-desc.js"
import { onRequestGet as __api_fix_db_layaway_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\fix-db-layaway.js"
import { onRequestGet as __api_fix_db_pos_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\fix-db-pos.js"
import { onRequestGet as __api_image_search_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\image-search.js"
import { onRequestDelete as __api_inventory_js_onRequestDelete } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\inventory.js"
import { onRequestGet as __api_inventory_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\inventory.js"
import { onRequestPost as __api_inventory_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\inventory.js"
import { onRequestPut as __api_inventory_js_onRequestPut } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\inventory.js"
import { onRequestGet as __api_orders_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\orders.js"
import { onRequestPost as __api_orders_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\orders.js"
import { onRequestGet as __api_sales_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\sales.js"
import { onRequestPost as __api_sales_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\sales.js"
import { onRequestPut as __api_sales_js_onRequestPut } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\sales.js"
import { onRequestGet as __api_test_db_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\test-db.js"
import { onRequestPost as __api_upload_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\upload.js"
import { onRequestGet as __api_users_js_onRequestGet } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\users.js"
import { onRequestPost as __api_users_js_onRequestPost } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\users.js"
import { onRequest as __api_fix_db_js_onRequest } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\fix-db.js"
import { onRequest as __api_inventory_mass_js_onRequest } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\inventory-mass.js"
import { onRequest as __api_invoice_upload_js_onRequest } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\invoice-upload.js"
import { onRequest as __api_providers_js_onRequest } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\api\\providers.js"
import { onRequest as ___middleware_js_onRequest } from "C:\\Users\\LENOVO\\OneDrive\\Documents\\CORPORATIVO BIKEKING\\bikeking\\functions\\_middleware.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_js_onRequestPost],
    },
  {
      routePath: "/api/auth/me",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_me_js_onRequestGet],
    },
  {
      routePath: "/api/store/products",
      mountPath: "/api/store",
      method: "GET",
      middlewares: [],
      modules: [__api_store_products_js_onRequestGet],
    },
  {
      routePath: "/api/media/:filename",
      mountPath: "/api/media",
      method: "GET",
      middlewares: [],
      modules: [__api_media__filename__js_onRequestGet],
    },
  {
      routePath: "/api/sales/:id",
      mountPath: "/api/sales",
      method: "GET",
      middlewares: [],
      modules: [__api_sales__id__js_onRequestGet],
    },
  {
      routePath: "/api/content",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_content_js_onRequestGet],
    },
  {
      routePath: "/api/content",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_content_js_onRequestPost],
    },
  {
      routePath: "/api/customers",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_customers_js_onRequestGet],
    },
  {
      routePath: "/api/fix-db-desc",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_fix_db_desc_js_onRequestGet],
    },
  {
      routePath: "/api/fix-db-layaway",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_fix_db_layaway_js_onRequestGet],
    },
  {
      routePath: "/api/fix-db-pos",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_fix_db_pos_js_onRequestGet],
    },
  {
      routePath: "/api/image-search",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_image_search_js_onRequestGet],
    },
  {
      routePath: "/api/inventory",
      mountPath: "/api",
      method: "DELETE",
      middlewares: [],
      modules: [__api_inventory_js_onRequestDelete],
    },
  {
      routePath: "/api/inventory",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_inventory_js_onRequestGet],
    },
  {
      routePath: "/api/inventory",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_inventory_js_onRequestPost],
    },
  {
      routePath: "/api/inventory",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_inventory_js_onRequestPut],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_orders_js_onRequestGet],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_js_onRequestPost],
    },
  {
      routePath: "/api/sales",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_sales_js_onRequestGet],
    },
  {
      routePath: "/api/sales",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_sales_js_onRequestPost],
    },
  {
      routePath: "/api/sales",
      mountPath: "/api",
      method: "PUT",
      middlewares: [],
      modules: [__api_sales_js_onRequestPut],
    },
  {
      routePath: "/api/test-db",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_test_db_js_onRequestGet],
    },
  {
      routePath: "/api/upload",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_upload_js_onRequestPost],
    },
  {
      routePath: "/api/users",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_users_js_onRequestGet],
    },
  {
      routePath: "/api/users",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_users_js_onRequestPost],
    },
  {
      routePath: "/api/fix-db",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_fix_db_js_onRequest],
    },
  {
      routePath: "/api/inventory-mass",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_inventory_mass_js_onRequest],
    },
  {
      routePath: "/api/invoice-upload",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_invoice_upload_js_onRequest],
    },
  {
      routePath: "/api/providers",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_providers_js_onRequest],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]