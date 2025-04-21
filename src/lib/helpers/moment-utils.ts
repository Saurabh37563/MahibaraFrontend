import moment from "moment";

export class MomentUtils {
  // Format date relative to now
  static formatDate(dateString: string): string {
    const date = moment(dateString);
    const now = moment();
    const diff = now.diff(date);

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return date.format("dddd");
    return date.format("MMM D, YYYY");
  }

  // Format date with custom format
  static formatCustom(dateString: string, format: string = "YYYY-MM-DD"): string {
    return moment(dateString).format(format);
  }

  // Add days to current date
  static addDays(days: number): string {
    return moment().add(days, "days").format("YYYY-MM-DD");
  }

  // Get UTC string for cookie expiration
  static getCookieExpiry(days: number): string {
    return moment().add(days, "days").toDate().toUTCString();
  }
}
