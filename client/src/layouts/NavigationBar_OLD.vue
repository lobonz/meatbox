<template>
  <b-navbar toggleable="lg" type="dark" variant="primary">
    <b-navbar-brand to="/"
      ><img src="/img/mm.svg" style="width: 40px;"
    /></b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav v-if="loggedIn == true">
        <b-nav-item to="/">Hud</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto" v-if="loggedIn == true">
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template #button-content>
            <font-awesome-icon icon="cog" />
          </template>
          <b-dropdown-item to="/users">Users</b-dropdown-item>
          <b-dropdown-item @click="logout()">Logout</b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "NavigationBar",
  computed: {
    ...mapGetters("auth", ["loggedIn"])
  },
  methods: {
    ...mapActions("auth", ["logout"])
  }
};
</script>
<style></style>
