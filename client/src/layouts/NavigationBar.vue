<template>
  <quick-menu
    :menu-count="4"
    :icon-class="['icon-status', 'icon-load', 'icon-users', 'icon-exit']"
    :menu-url-list="[
      { isLink: false },
      { isLink: false },
      { isLink: false },
      { isLink: false }
    ]"
    background-color="rgba(0,0,0,0)"
    color="#FFFFFF"
    position="top-right"
    :is-open-new-tab="false"
    @process="menuRouter"
  >
    ></quick-menu
  >
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "NavigationBar",
  computed: {
    ...mapGetters("auth", ["loggedIn"])
  },
  methods: {
    ...mapActions("auth", ["logout"]),
    menuRouter(key) {
      if (key === 0) {
        this.$router.push("/");
      }
      if (key === 1) {
        this.$router.push("/load");
      }
      if (key === 2) {
        this.$router.push("/users");
      }
      if (key === 3) {
        this.logout();
      }
    }
  }
};
</script>
<style></style>
