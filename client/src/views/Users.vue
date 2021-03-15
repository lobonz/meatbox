<template>
  <div class="container users mt-4">
    <h1><font-awesome-icon icon="users" /> Users</h1>
    <div v-if="users.length > 0" class="table-wrap">
      <div>
        <b-button variant="outline-primary" :to="{ name: 'UserCreate' }"
          >Add User</b-button
        >
      </div>
      <b-table-simple hover small caption-top responsive>
        <thead>
          <tr>
            <td>Name</td>
            <td>Email</td>
            <td width="100" align="center">Action</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td align="center">
              <span class="pointer" @click="editUser(user._id)">
                <font-awesome-icon icon="edit" />
              </span>
              <span
                class="ml-3 pointer"
                @click="deleteUser(user._id)"
                v-if="users.length > 1"
              >
                <font-awesome-icon icon="times" />
              </span>
            </td>
          </tr>
        </tbody>
      </b-table-simple>
    </div>
    <div v-else>
      There are no users.. Lets add one now <br /><br />
      <b-button variant="outline-primary" :to="{ name: 'UserCreate' }"
        >Add User</b-button
      >
    </div>
  </div>
</template>

<script>
import UserService from "@/services/user.service";
export default {
  name: "users",
  data() {
    return {
      users: []
    };
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      const response = await UserService.fetchUsers();
      this.users = response.data;
      console.log(response.data);
    },
    async deleteUser(id) {
      await UserService.deleteUser(id);
      this.getUsers();
      this.$router.push({ name: "Users" });
    },
    async editUser(id) {
      this.$router.push({ name: "UserEdit", params: { id: id } });
    }
  }
};
</script>
<style scoped></style>
