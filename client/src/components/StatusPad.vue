<template>
  <div class="statuspad" :style="statusPadStyle">
    <b-container class="mx-0 my-0 px-0 py-0 h-100 d-flex">
      <b-row class="h-100 mx-auto">
        <b-col class="my-auto">
          <span v-html="name" class="mr-2"></span>
          <span v-if="value">{{ value | round(1) }}{{ unit }}</span>
          <br />
          <sub v-if="extravalue">
            <span v-html="extraname"></span>
            {{ extravalue | round(1) }}{{ unit }}
          </sub>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  data: function() {
    return { isActive: false };
  },
  props: {
    name: { required: true },
    value: { default: "" },
    unit: { default: "" },
    extraname: { required: false, default: "" },
    extravalue: { default: "" },
    extraunit: { default: "" },
    selected: { default: false },
    callback: { default: null },
    backgroundcolor: { type: String, default: "rgba(0, 0, 0, 0)" },
    color: { type: String, default: "#FFF" }
  },
  computed: {
    type() {
      if (this.href) {
        return "a";
      } else {
        return "button";
      }
    },
    statusPadStyle() {
      return {
        backgroundColor: this.backgroundcolor,
        color: this.color
      };
    }
  },
  mounted() {
    this.isActive = this.selected;
  }
};
</script>

<style scoped>
.statuspad {
  display: inline-block;
  margin: 0;
  padding: 0.1em;
  background: rgba(0, 0, 0, 0);
  /* border: 0px solid tomato; */
  border-radius: 1vh;
  color: #fff;
  font-family: "Quicksand", sans-serif;
  font-size: 3vw;
  letter-spacing: 0.02em;
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  transition: 0.3s;
  width: 95%;
  height: 100%;
  overflow: hidden;
  text-align: center;
  height: 10vh;

  box-shadow: 3px 3px 10px black inset;
}
</style>
