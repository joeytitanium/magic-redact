/* eslint-disable no-console */

import { NextRequest } from 'next/server';
import { isDevelopment } from './is-development';

type LogLevel = 'info' | 'error' | 'warn';

export const logApiError = ({
  message,
  error,
  request,
  context,
}: {
  message: string;
  request: Request | NextRequest;
  error?: Error;
  context?: Record<string, unknown>;
}) => {
  console.error(
    `🚨 API Error [${request.url}] message: ${message}`,
    JSON.stringify({ context, request, error }, null, '\t')
  );
};

export const logMessage = ({
  message,
  level,
  request,
  context,
}: {
  message: string;
  level?: LogLevel;
  request?: Request;
  context?: Record<string, unknown>;
}) => {
  if (level === 'error') {
    console.error(`🚨 ERROR: ${message}`, JSON.stringify({ context, request }, null, '\t'));
    return;
  }

  if (level === 'info') {
    console.info(`ℹ INFO: ${message}`, JSON.stringify({ context, request }, null, '\t'));
  }

  if (level === 'warn') {
    console.warn(`⚠ WARN: ${message}`, JSON.stringify({ context, request }, null, '\t'));
  }

  console.log(`LOG: ${message}`, JSON.stringify({ context, request }, null, '\t'));
};

export const logDebugMessage = ({
  message,
  context,
}: {
  message: string;
  context?: Record<string, unknown>;
}) => {
  if (!isDevelopment) return;
  logMessage({ message: `🔫: ${message}`, context, level: 'info' });
};

export const logError = ({
  message,
  error,
  context,
}: {
  message: string;
  error?: unknown;
  context?: Record<string, unknown>;
}) => {
  logMessage({ message, context: { error, context }, level: 'error' });
};
