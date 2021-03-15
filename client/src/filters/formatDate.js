import moment from "moment";
export default function formatDate(input) {
  if (input) {
    return moment(String(input)).format("MM/DD/YYYY");
  }
}
