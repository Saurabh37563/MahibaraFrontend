import { MomentUtils } from "./moment-utils";

export class CookieUtils {
  // Set a cookie
  static setCookie(name: string, value: string, days: number): void {
    const expires = MomentUtils.getCookieExpiry(days);
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
  }

  // Get a cookie
  static getCookie(name: string): string | null {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${name.replace(/([.$?*|{}()\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Delete a cookie
  static deleteCookie(name: string): void {
    this.setCookie(name, "", -1);
  }

  // Check if running in browser
  static isClient(): boolean {
    return typeof window !== "undefined";
  }
}
