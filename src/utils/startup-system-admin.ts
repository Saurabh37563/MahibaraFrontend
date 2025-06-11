import fgaUtils from './fga-utils.js';
import fgaSdk from './fga-client.js';
import { ReadRequest, ReadResponse, OpenFGATupleKey } from '../types/fga.types';

interface SystemStatus {
  hasSystemAdmin: boolean;
  initializationAllowed: boolean;
  wasInitializedBefore: boolean;
}

class SystemBootstrap {
  static isInitialized = false;
  static initPromise: Promise<boolean> | null = null;

  static async initialize() {
    // Prevent multiple initializations
    if (this.isInitialized) return true;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._performInitialization();
    return this.initPromise;
  }

  static async _performInitialization() {
    try {
      // Security check 1: Environment validation
      if (!this._isInitializationAllowed()) {
        console.log('System initialization not allowed in this environment');
        this.isInitialized = true;
        return false;
      }

      // Security check 2: Check if system admin already exists
      const hasExistingAdmin = await this._checkExistingSystemAdmin();
      if (hasExistingAdmin) {
        console.log('System admin already exists');
        this.isInitialized = true;
        return false;
      }

      // Security check 3: Verify initialization requirements
      const adminId = this._getInitialAdminId();
      if (!adminId) {
        console.warn('No initial admin ID configured');
        this.isInitialized = true;
        return false;
      }

      // Create system admin
      await this._createInitialSystemAdmin(adminId);
      
      // Mark as initialized to prevent future runs
      this.isInitialized = true;
      localStorage.setItem('system_initialized', Date.now().toString());
      
      console.log(`✅ System initialized with admin: ${adminId}`);
      return true;

    } catch (error) {
      console.error('System initialization failed:', error);
      this.isInitialized = true; // Mark as initialized even on failure to prevent retries
      return false;
    }
  }

  static _isInitializationAllowed() {
    // Only allow in development or with explicit flag
    const isDev = process.env.NODE_ENV === 'development';
    const isExplicitlyAllowed = process.env.REACT_APP_ALLOW_SYSTEM_INIT === 'true';
    const hasInitSecret = !!process.env.REACT_APP_INIT_SECRET;
    
    // Check if already initialized before (extra safety)
    const wasInitialized = localStorage.getItem('system_initialized');
    if (wasInitialized) {
      return false;
    }

    return (isDev || isExplicitlyAllowed) && hasInitSecret;
  }

  static _getInitialAdminId() {
    return process.env.REACT_APP_INITIAL_ADMIN_ID;
  }

  static async _checkExistingSystemAdmin(): Promise<boolean> {
    try {
      const request: ReadRequest = {
        tuple_key: {
          user: '*',
          relation: 'system_admin',
          object: '*'
        } as OpenFGATupleKey
      };
      
      const response = await fgaSdk.read(request) as ReadResponse;
      return response.tuples && response.tuples.length > 0;
    } catch (error) {
      return false;
    }
  }

  static async _createInitialSystemAdmin(adminId: string): Promise<void> {
    await fgaUtils.makeSystemAdmin(adminId);
    
    // Create audit log
    const auditLog = {
      action: 'SYSTEM_ADMIN_CREATED',
      adminId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('[SECURITY AUDIT]', auditLog);
    
    // Store audit log (you might want to send this to your backend)
    const existingLogs = JSON.parse(localStorage.getItem('security_audit_logs') || '[]');
    existingLogs.push(auditLog);
    localStorage.setItem('security_audit_logs', JSON.stringify(existingLogs));
  }

  // Method to check system status (for admin panels)
  static async getSystemStatus(): Promise<SystemStatus> {
    const hasSystemAdmin = await this._checkExistingSystemAdmin();
    return {
      hasSystemAdmin,
      initializationAllowed: this._isInitializationAllowed(),
      wasInitializedBefore: !!localStorage.getItem('system_initialized')
    };
  }
}

export default SystemBootstrap;
