<script>
import { Line, mixins } from "vue-chartjs";
import "chartjs-adapter-luxon";
const { reactiveProp } = mixins;

//Good turorial on formatting axis labels etc.
//https://code.tutsplus.com/tutorials/getting-started-with-chartjs-scales--cms-28477

//multiple axis - to graph also the loadcells
//https://www.chartjs.org/docs/master/axes/cartesian/index/#axis-position

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: {
    chartData: {
      type: Array, //Array | Object
      required: false
    },
    chartLabels: {
      type: Array,
      required: true
    },
    chartHumidityData: {
      type: Array, //Array | Object
      required: false
    }
    // ,
    // chartHumidityMaData: {
    //   type: Array, //Array | Object
    //   required: false
    // }
  },
  data() {
    return {
      gradient: null,
      options: {
        showScale: true,
        scales: {
          yAxes: [
            {
              id: "Humidity",
              position: "left",
              ticks: {
                beginAtZero: false
              },
              gridLines: {
                display: true,
                color: "#222",
                //borderDash: [5, 15],
                lineWidth: 0.5
              }
            },
            {
              id: "Temperature",
              position: "right",
              ticks: {
                beginAtZero: false
              },
              gridLines: {
                display: true,
                color: "#666",
                //borderDash: [5, 15],
                lineWidth: 0.5
              }
            }
          ],
          xAxes: [
            {
              type: "time",
              distribution: "linear",
              time: {
                unit: "hour",
                unitStepSize: 0.25,
                //round: "hour",
                tooltipFormat: "h:mm:ss a",
                displayFormats: {
                  hour: "h:mm"
                }
              },
              gridLines: {
                display: true,
                color: "#666",
                //borderDash: [5, 15],
                lineWidth: 0.5
              }
            }
          ]
        },
        tooltips: {
          backgroundColor: "#4F5565",
          titleFontStyle: "normal",
          titleFontSize: 18,
          bodyFontFamily: "'Proxima Nova', sans-serif",
          cornerRadius: 3,
          bodyFontColor: "#20C4C8",
          bodyFontSize: 14,
          xPadding: 14,
          yPadding: 14,
          displayColors: false,
          mode: "index",
          intersect: false,
          callbacks: {
            title: tooltipItem => {
              let time = tooltipItem[0].xLabel;
              return `⏱ ${time.slice(0, -6)}`;
            },
            label: (tooltipItem, data) => {
              let dataset = data.datasets[tooltipItem.datasetIndex];
              let currentValue = dataset.data[tooltipItem.index];
              if (tooltipItem.datasetIndex == 0) {
                //humidity is 0
                return `   🌫️ ${currentValue.toFixed(2)}`;
              } else {
                //temperature must be 1
                return `    🌡️ ${currentValue.toFixed(2)}`;
              }
            }
          }
        },
        legend: {
          display: false
        },
        responsive: true,
        maintainAspectRatio: false
      }
    };
  },
  mounted() {
    this.gradient = this.$refs.canvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, 450);
    this.gradient.addColorStop(0, "rgba(52, 217, 221, 0.6)");
    this.gradient.addColorStop(0.5, "rgba(52, 217, 221, 0.25)");
    this.gradient.addColorStop(1, "rgba(52, 217, 221, 0)");
    this.renderChart(
      {
        labels: this.chartLabels,
        datasets: [
          {
            label: "Humidity",
            order: 1,
            borderColor: "#3b67c5",
            pointBackgroundColor: "rgba(0,0,0,0)",
            pointBorderColor: "rgba(0,0,0,0)",
            pointHoverBorderColor: "#249EBF",
            pointHoverBackgroundColor: "#fff",
            pointHoverRadius: 4,
            pointHitRadius: 10,
            pointHoverBorderWidth: 1,
            borderWidth: 2,
            backgroundColor: "rgba(0,0,255,.1)", //this.gradient,
            yAxisID: "Humidity",
            data: this.chartHumidityData
          },
          {
            label: "Temperature",
            order: 2,
            borderColor: "#df444e",
            pointBackgroundColor: "rgba(0,0,0,0)",
            pointBorderColor: "rgba(0,0,0,0)",
            pointHoverBorderColor: "#249EBF",
            pointHoverBackgroundColor: "#fff",
            pointHoverRadius: 4,
            pointHitRadius: 10,
            pointHoverBorderWidth: 1,
            borderWidth: 2,
            backgroundColor: "rgba(255,0,0,.1)",
            yAxisID: "Temperature",
            data: this.chartData
          }
          // {
          //   label: "Humidity",
          //   order: 1,
          //   borderColor: "#0F0",
          //   pointBackgroundColor: "rgba(0,0,0,0)",
          //   pointBorderColor: "rgba(0,0,0,0)",
          //   pointHoverBorderColor: "#249EBF",
          //   pointHoverBackgroundColor: "#fff",
          //   pointHoverRadius: 4,
          //   pointHitRadius: 10,
          //   pointHoverBorderWidth: 1,
          //   borderWidth: 2,
          //   backgroundColor: "rgba(0,0,255,.1)", //this.gradient,
          //   yAxisID: "Humidity",
          //   data: this.chartHumidityMaData
          // }
        ]
      },
      this.options
    );
    // console.log("chartData");
    // console.log(this.chartData);
    // console.log("chartHumidityData");
    // console.log(this.chartHumidityData);
  },
  methods: {}
};
</script>
