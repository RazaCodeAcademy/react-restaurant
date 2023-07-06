
// config
let production = 'YES';//YES ==live NO ==localhost
export let SAAS_APPLICATION = 'NO'; //YES|NO

// default config
export const saas_key = '$2a$12$pkLmD5jZdxd6bSNcTg9YT.g2mXz5gS8JTArdIg68c8RK/d7w2y2Gu';
export const saas_apiUrl = 'https://automatefood.com';

export let BASE_URL = '';
export let saas_apiParams = '';
export let saas_form_data = null;

if (production === "YES") {
  // for production
  BASE_URL =
    window.location.protocol +
    "//" +
    window.location.hostname +
    `${window.location.port !== ""
      ? `:${8000}`
      : `${!window.location.href.includes(".test") ? "/public" : ""}`
    }`;

  // saas config
  saas_apiParams = `saas_key=${saas_key}&domain=${BASE_URL}`;
  saas_form_data = {
    'saas_key': saas_key,
    'domain': BASE_URL
  };
}
else {
  // for localhost development
  BASE_URL =
    window.location.protocol +
    "//" +
    window.location.hostname +
    "/khadyo_updated_production_saas/laravel/public";

  // saas config
  saas_apiParams = `saas_key=${saas_key}&domain=prince.automatefood.com`;
  saas_form_data = {
    'saas_key': saas_key,
    'domain': 'prince.automatefood.com'
  };

}