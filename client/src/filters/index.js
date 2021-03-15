import uppercase from "./upperCase";
import formatdate from "./formatDate";
import round from "./round";

export default {
  install(Vue) {
    Vue.filter("uppercase", uppercase);
    Vue.filter("formatdate", formatdate);
    Vue.filter("round", round);
  }
};
