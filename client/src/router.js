import Vue from "vue";
import Router from "vue-router";

// Authentication
import { TokenService } from "@/services/storage.service";

import Hud from "@/views/Hud.vue";
import About from "@/views/About.vue";
import Login from "@/views/Login.vue";
import NotFound from "@/views/NotFound.vue";

// Users
import Users from "@/views/Users.vue";
import UserCreate from "@/views/UserCreate.vue";
import UserEdit from "@/views/UserEdit.vue";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "hud",
      component: Hud
    },
    {
      path: "/about",
      name: "about",
      component: About //() => import("./views/About.vue")
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        public: true, // Allow access to even if not logged in
        onlyWhenLoggedOut: true
      }
    },
    // ////// USERS
    {
      path: "/users",
      name: "Users",
      component: Users
    },
    {
      path: "/users/create",
      name: "UserCreate",
      component: UserCreate
    },
    {
      path: "/users/:id",
      name: "UserEdit",
      component: UserEdit
    },
    {
      path: "*",
      component: NotFound
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some(record => record.meta.public);
  const onlyWhenLoggedOut = to.matched.some(
    record => record.meta.onlyWhenLoggedOut
  );
  const loggedIn = !!TokenService.getToken();

  if (!isPublic && !loggedIn) {
    return next({
      path: "/login",
      query: { redirect: to.fullPath } // Store the full path to redirect the user to after login
    });
  }

  // Do not allow user to visit login page or register page if they are logged in
  if (loggedIn && onlyWhenLoggedOut) {
    return next("/home");
  }

  next();
});

export default router;
