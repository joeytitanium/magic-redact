import type { Route } from './routes';

type Options = {
  absoluteUrl?: boolean;
};

export const getRouteUrl = (route: Route, { absoluteUrl = false }: Options = {}) => {
  const url = (() => {
    if (!absoluteUrl) {
      return '';
    }

    return process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : `${process.env.NEXT_PUBLIC_SITE_BASE_URL}`;
  })();

  const { to, params, fragment } = route;
  let baseUrl = `${url}${to}`;

  // Handle dynamic routes with slugs
  if (to.includes(':')) {
    for (const [key, value] of Object.entries(params ?? {})) {
      baseUrl = baseUrl.replace(`:${key}`, value);
    }
    // Remove any remaining params from the URL
    const remainingParams: Record<string, string> = { ...params };
    for (const key of Object.keys(params ?? {})) {
      if (to.includes(`:${key}`)) {
        delete remainingParams[key];
      }
    }

    // Add remaining params to the URL
    if (Object.keys(remainingParams).length > 0) {
      baseUrl += `?${new URLSearchParams(remainingParams).toString()}`;
    }
  } else if (params) {
    baseUrl += `?${new URLSearchParams(params).toString()}`;
  }

  // Handle fragment
  if (fragment) {
    baseUrl += `#${fragment}`;
  }

  return baseUrl;
};
