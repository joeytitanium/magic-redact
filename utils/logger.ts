import { NextRequest } from 'next/server';
import { isDevelopment } from './is-development';

export const logApiError = ({
  message,
  error,
  request,
  context,
}: {
  message: string;
  error?: Error;
  request: Request | NextRequest;
  context?: Record<string, unknown>;
}) => {
  console.error(
    `🚨 API Error [${request.url}] message: ${message}`,
    error,
    request,
    JSON.stringify(context, null, '\t')
  );
};

type LogMessageOptions = {
  request?: Request;
  level?: 'info' | 'error' | 'warn';
  context?: Record<string, unknown>;
};

export const logMessage = (message: string, options: LogMessageOptions = { level: 'info' }) => {
  if (options.level === 'error') {
    console.error(
      `🚨 ERROR: ${message}`,
      options.request,
      JSON.stringify(options.context, null, '\t')
    );
    return;
  }

  if (options.level === 'info') {
    console.info(
      `ℹ INFO: ${message}`,
      options.request,
      JSON.stringify(options.context, null, '\t')
    );
  }

  if (options.level === 'warn') {
    console.warn(
      `⚠ WARN: ${message}`,
      options.request,
      JSON.stringify(options.context, null, '\t')
    );
  }

  console.log(`LOG: ${message}`, options.request, JSON.stringify(options.context, null, '\t'));
};

export const logDebugMessage = (message: string, options: LogMessageOptions) => {
  if (!isDevelopment) return;
  logMessage(message, { ...options });
};

export const logError = (
  message: string,
  error: unknown,
  options?: Omit<LogMessageOptions, 'level'>
) => {
  logMessage(message, { ...options, level: 'error', context: { error, ...options?.context } });
};
