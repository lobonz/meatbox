import { UserService, AuthenticationError } from "../../services/user.service";
import { TokenService } from "../../services/storage.service";
import router from "../../router";

const state = {
  authenticating: false,
  accessToken: TokenService.getToken(),
  authenticationSuccess: false,
  authenticationErrorCode: 0,
  authenticationError: ""
  //permissions: TokenService.getPermissions()
};

const getters = {
  loggedIn: state => {
    return !!state.accessToken;
  },

  authenticationErrorCode: state => {
    return state.authenticationErrorCode;
  },

  authenticationError(state) {
    return state.authenticationError;
  },

  authenticationSuccess(state) {
    return state.authenticationSuccess;
  },

  authenticating: state => {
    return state.authenticating;
  }

  // permissions: state => {
  //   return state.permissions;
  // }
};

const actions = {
  async login({ commit }, { email, password }) {
    commit("loginRequest");
    try {
      const response = await UserService.login(email, password);
      // console.log(response)
      commit("loginSuccess", {
        accessToken: response.access_token
        //permissions: response.permissions
      });
      // Redirect the user to the page he first tried to visit or to the home view
      // console.log('before redirect');
      router.push(router.history.current.query.redirect || "/");
      return true;
    } catch (e) {
      if (e instanceof AuthenticationError) {
        commit("loginError", {
          errorCode: e.errorCode,
          errorMessage: e.message
        });
      }
      return false;
    }
  },

  logout({ commit }) {
    UserService.logout();
    commit("logoutSuccess");
    router.push("/login");
  },
  async initialLoad(context) {}
};

const mutations = {
  loginRequest(state) {
    state.authenticating = true;
    state.authenticationError = "";
    state.authenticationErrorCode = 0;
    //state.permissions = {};
  },

  loginSuccess(state, { accessToken }) {
    //, permissions }) {
    state.accessToken = accessToken;
    state.authenticationSuccess = true;
    state.authenticating = false;
    //state.permissions = permissions;
  },

  loginError(state, { errorCode, errorMessage }) {
    state.authenticating = false;
    state.authenticationErrorCode = errorCode;
    state.authenticationError = errorMessage;
    //state.permissions = {};
  },

  logoutSuccess(state) {
    state.accessToken = "";
    //state.permissions = {};
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
