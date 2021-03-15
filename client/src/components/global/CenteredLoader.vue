<template>
  <div class="d-flex justify-content-center mt-5">
    <breeding-rhombus-spinner
      :animation-duration="1000"
      :size="100"
      :color="'#b70023'"
    />
  </div>
</template>

<script>
import { BreedingRhombusSpinner } from "epic-spinners";
export default {
  name: "CenteredLoader",
  components: { BreedingRhombusSpinner }
};
</script>
