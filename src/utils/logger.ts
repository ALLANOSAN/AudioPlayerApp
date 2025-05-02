type LogLevel = 'info' | 'error' | 'warn' | 'debug';

export const Logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};