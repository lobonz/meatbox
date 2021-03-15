<template>
  <div id="app">
    <div v-if="loading"><centered-loader /></div>
    <div v-if="!loading && !error">
      <router-view />
    </div>
    <div v-if="!loading && error">Oops Something went wrong!</div>
    <navigation-bar />
  </div>
</template>

<script>
import NavigationBar from "./layouts/NavigationBar";
import { mapActions } from "vuex";
import config from "../config.js";

export default {
  name: "App",
  data() {
    return {
      server:
        config.APIPROTOCOL + "://" + config.APISERVER + ":" + config.APIPORT,
      loading: true,
      error: false
    };
  },
  computed: {},
  components: { NavigationBar },
  methods: {
    ...mapActions("auth", ["initialLoad"])
  },
  async mounted() {
    try {
      await this.initialLoad();
      this.loading = false;
    } catch (err) {
      console.log("error=" + err);
      this.loading = false;
      this.error = true;
    }
  }
};
</script>

<style></style>
