export const Logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (__DEV__) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
