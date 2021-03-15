import ApiService from "@/services/api.service";

export default {
  readLogs(params) {
    return ApiService.post("logs/read", params);
  }
};
