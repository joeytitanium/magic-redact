import { isDevelopment } from './is-development';

export const logApiError = (
  message: string,
  { error, request, context }: { error: Error; request: Request; context?: Record<string, unknown> }
) => {
  console.error(`🚨 API Error [${request.url}] message: ${message}`, error, request, context);
};

type LogMessageOptions = {
  request?: Request;
  level?: 'info' | 'error' | 'warn';
  context?: Record<string, unknown>;
};

export const logMessage = (message: string, options: LogMessageOptions = { level: 'info' }) => {
  if (options.level === 'error') {
    console.error(`🚨 ERROR: ${message}`, options.request, options.context);
    return;
  }

  if (options.level === 'info') {
    console.info(`ℹ INFO: ${message}`, options.request, options.context);
  }

  if (options.level === 'warn') {
    console.warn(`⚠ WARN: ${message}`, options.request, options.context);
  }

  console.log(`LOG: ${message}`, options.request, options.context);
};

export const logDebugMessage = (message: string, options: LogMessageOptions) => {
  if (!isDevelopment) return;
  logMessage(message, { ...options });
};
