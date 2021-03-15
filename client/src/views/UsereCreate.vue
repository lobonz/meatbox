<template>
  <div class="users">
    <h1>Add User</h1>
    <div class="form">
      <div>
        <b-form-group id="name-group" label="Name" label-for="name">
          <b-form-input
            id="name"
            v-model="name"
            required
            placeholder="NAME"
          ></b-form-input>
        </b-form-group>
      </div>

      <div>
        <b-form-group id="username-group" label="Username" label-for="username">
          <b-form-input
            id="username"
            v-model="username"
            required
            placeholder="USERNAME"
          ></b-form-input>
        </b-form-group>
      </div>

      <div>
        <b-form-group id="email-group" label="Email" label-for="email">
          <b-form-input
            id="email"
            v-model="email"
            required
            placeholder="EMAIL"
          ></b-form-input>
        </b-form-group>
      </div>

      <div>
        <b-form-group id="password-group" label="Password" label-for="password">
          <b-form-input
            id="password"
            v-model="password"
            required
            placeholder="PASSWORD"
          ></b-form-input>
        </b-form-group>
      </div>

      <div>
        <b-button class="mt-3" variant="primary" @click="addUser"
          >Next</b-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import UserService from "@/services/UserService";
export default {
  name: "UserNew",
  data() {
    return {
      name: "",
      username: "",
      email: "",
      password: null
    };
  },
  methods: {
    async addUser() {
      var response = await UserService.addUser({
        name: this.name,
        username: this.username,
        email: this.email,
        password: this.password
      });
      this.$router.push({
        name: "UserEdit",
        params: { id: response.data.userid }
      });
    }
  }
};
</script>
<style scoped></style>
