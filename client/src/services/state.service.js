import ApiService from "@/services/api.service";

export default {
  readState() {
    return ApiService.post("state");
  }
};
