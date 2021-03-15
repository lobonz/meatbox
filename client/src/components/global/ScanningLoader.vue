<template>
  <div class="d-flex justify-content-center mt-5">
    <looping-rhombuses-spinner
      :animation-duration="1000"
      :size="100"
      :color="'#b70023'"
    />
  </div>
</template>

<script>
import { LoopingRhombusesSpinner } from "epic-spinners";
export default {
  name: "ScanningLoader",
  components: { LoopingRhombusesSpinner }
};
</script>
