import Vue from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import App from "./App.vue";
import router from "./router";
import "./registerServiceWorker";

import store from "./store";
import config from "../config.js";
import ApiService from "./services/api.service";
import { TokenService } from "./services/storage.service";

// eslint-disable-next-line no-unused-vars
import _ from "lodash";

import CenteredLoader from "./components/global/CenteredLoader";
import ScanningLoader from "./components/global/ScanningLoader";

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
// Import Bootstrap an BootstrapVue CSS files (order is important)
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue);
Vue.use(VueAxios, axios);
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin);

Vue.component("centered-loader", CenteredLoader);
Vue.component("scanning-loader", ScanningLoader);

import "./assets/style.scss";

import filters from "./filters";
// Uses filters
Vue.use(filters);

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons";

library.add(faSignInAlt);
library.add(faUsers);
library.add(faEdit);
library.add(faTimes);
library.add(faCog);

import StatusIndicator from "vue-status-indicator";
Vue.use(StatusIndicator);

import quickMenu from "vue-quick-menu";
Vue.component("quick-menu", quickMenu);

// Set the base URL of the API
ApiService.init(
  `${config.APIPROTOCOL}://${config.APISERVER}:${config.APIPORT}/api`
);
// If token exists set header
if (TokenService.getToken()) {
  ApiService.setHeader();
}

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
