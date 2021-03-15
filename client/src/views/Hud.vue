<template>
  <center>
    <div class="chart-container" v-if="loaded">
      <b-container v-if="stateloaded">
        <b-row>
          <b-col class="w-50 mx-0 my-0 px-0 py-0"
            ><status-pad
              name="RH"
              unit="%"
              :value="state.humidity"
              extraname="x&#772;"
              extraunit="%"
              :extravalue="humidityaverage"
              backgroundcolor="rgba(59, 103, 197, 1)"
            ></status-pad
          ></b-col>
          <b-col class="w-50 mx-0 my-0 px-0 py-0"
            ><status-pad
              name="Temp"
              unit="°C"
              :value="state.temperature"
              extraname="x&#772;"
              extraunit="°C"
              :extravalue="temperatureaverage"
              backgroundcolor="rgba(223, 68, 78, 1)"
            ></status-pad
          ></b-col>
        </b-row>
      </b-container>
      <line-chart
        v-if="loaded"
        :chart-data="temperatures"
        :chart-humidity-data="humiditys"
        :chart-labels="labels"
        :styles="myChartStyle"
      ></line-chart>
      <!-- 
        active: (...)
        airpump: (...)
        circulate: (...)
        cool: (...)
        dehumidify: (...)
        heat: (...)
        humidify: (...)
        humidity: (...)
        light: (...)
        loadcells: (...)
        mode: (...)
        temperature: (...)
        -->
      <b-container fluid v-if="stateloaded">
        <b-row>
          <b-col class="w-50 mx-0 my-0 px-0 py-0">
            <status-pad name="Cool">{{ state.temperature }}</status-pad>
          </b-col>
          <b-col class="w-50 mx-0 my-0 px-0 py-0">
            <status-pad name="Heat">{{ state.temperature }}</status-pad>
          </b-col>
          <b-col class="w-50 mx-0 my-0 px-0 py-0">
            <status-pad name="Airpump">{{ state.humidity }}</status-pad>
          </b-col>
          <b-col class="w-50 mx-0 my-0 px-0 py-0">
            <status-pad name="Circulation">{{ state.temperature }}</status-pad>
          </b-col>
        </b-row>
      </b-container>
    </div>
  </center>
</template>

<script>
import LogService from "@/services/log.service";
import StateService from "@/services/state.service";
import LineChart from "@/components/LineChart";
import StatusPad from "@/components/StatusPad";

export default {
  components: {
    LineChart,
    StatusPad
  },
  props: {},
  data() {
    return {
      parts: [], // docs
      timescaleminutes: 120,
      temperatures: [],
      temperatureaverage: 0,
      humiditys: [],
      humidityaverage: 0,
      labels: [],
      loaded: false,
      state: {},
      stateloaded: false
    };
  },
  mounted() {
    this.readLogs();
    this.readState();
  },
  computed: {
    myChartStyle() {
      return {
        height: "60%",
        position: "relative"
      };
    }
  },
  methods: {
    async readLogs(search = {}) {
      this.page = this.currentpage; // store in vuex

      const response = await LogService.readLogs({
        page: this.currentpage,
        limit: this.limit,
        search: search
      });

      this.temperatures = response.data.map(doc => doc.temperature);
      this.temperatureaverage = this.average(
        this.temperatures,
        this.timescaleminutes
      );
      this.humiditys = response.data.map(doc => doc.humidity * 100);
      this.humidityaverage = this.average(
        this.humiditys,
        this.timescaleminutes
      );
      this.labels = response.data.map(doc => doc.createdAt);
      this.loaded = true;
    },
    async readState() {
      this.page = this.currentpage; // store in vuex

      const response = await StateService.readState();

      this.state = response.data.state;
      this.state.humidity = this.state.humidity * 100;
      //this.state.temperature.tofixed(2);
      this.stateloaded = true;
      console.log(this.state);
    },
    /**
     * Average X many points from the end supplied array
     * To create an average of the last amount of samples
     */
    average(array, count) {
      var total = 0;
      for (var i = 1; i < count + 1; i++) {
        total = total + array[array.length - i];
      }
      console.log(total / count);
      return total / count;
    },
    /**
     * returns an array with moving average of the input array
     * @param array - the input array
     * @param count - the number of elements to include in the moving average calculation
     * @param qualifier - an optional function that will be called on each
     *  value to determine whether it should be used
     */
    movingAvg(array, count, qualifier) {
      // calculate average for subarray
      var avg = function(array, qualifier) {
        var sum = 0,
          count = 0,
          val;
        for (var i in array) {
          val = array[i];
          if (!qualifier || qualifier(val)) {
            sum += val;
            count++;
          }
        }

        return sum / count;
      };

      var result = [],
        val;

      // pad beginning of result with null values
      for (var k = 0; k < count - 1; k++) result.push(null);

      // calculate average for each subarray and add to result
      for (var j = 0, len = array.length - count; j <= len; j++) {
        val = avg(array.slice(j, j + count), qualifier);
        if (isNaN(val)) result.push(null);
        else result.push(val);
      }

      return result;
    }
  } //end methods
};
</script>

<style scoped>
.chart-container {
  position: relative;
  margin: auto;
  height: 100vh;
  width: 100vw;
}
</style>
