export class TokenUtils {
    // Decode JWT payload
    static parseJwt(token: string): any | null {
      if (!token) return null;
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (e) {
        console.error("Invalid token", e);
        return null;
      }
    }
  
    // Check if token is expired
    static isTokenExpired(token: string): boolean {
      const decoded = this.parseJwt(token);
      if (!decoded || !decoded.exp) return true;
  
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    }
  }
  