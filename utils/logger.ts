/* eslint-disable no-console */

import { NextRequest } from 'next/server';
import { isDevelopment } from './is-development';

type LogLevel = 'info' | 'error' | 'warn';

export type LogDomain =
  | 'stripe-webhook'
  | 'create-checkout-session'
  | 'sign-up'
  | 'api-analyze-image';

export const logApiError = ({
  message,
  error,
  request,
  context,
  domain,
}: {
  domain: LogDomain;
  message: string;
  request: Request | NextRequest;
  error?: unknown;
  context?: Record<string, unknown>;
}) => {
  console.error(
    `🚨 API Error [${domain}] [${request.url}] message: ${message}`,
    'context:',
    context,
    'request:',
    request,
    'error:',
    error
  );
};

export const logMessage = ({
  message,
  level,
  request,
  context,
  domain,
}: {
  domain: LogDomain;
  message: string;
  level?: LogLevel;
  request?: Request;
  context?: Record<string, unknown>;
}) => {
  if (level === 'error') {
    console.error(
      `🚨 ERROR [${domain}]: ${message}`,
      JSON.stringify({ context, request }, null, '\t')
    );
    return;
  }

  if (level === 'info') {
    console.info(
      `ℹ INFO [${domain}]: ${message}`,
      JSON.stringify({ context, request }, null, '\t')
    );
  }

  if (level === 'warn') {
    console.warn(
      `⚠ WARN [${domain}]: ${message}`,
      JSON.stringify({ context, request }, null, '\t')
    );
  }

  console.log(`LOG [${domain}]: ${message}`, JSON.stringify({ context, request }, null, '\t'));
};

export const logDebugMessage = ({
  message,
  context,
  domain,
}: {
  message: string;
  context?: Record<string, unknown>;
  domain: LogDomain;
}) => {
  if (!isDevelopment) return;
  console.dir(
    {
      message: `🟡 DEBUG: ${message}`,
      context,
      level: 'info',
      domain,
    },
    { depth: null, colors: true }
  );
};

export const logError = ({
  message,
  error,
  context,
  domain,
}: {
  domain: LogDomain;
  message: string;
  error?: unknown;
  context?: Record<string, unknown>;
}) => {
  logMessage({ message, context: { error, context }, level: 'error', domain });
};
