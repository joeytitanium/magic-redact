import type { Route } from './routes';

export type NavigationLink = {
  route: Route;
  label: string;
};

export type NavigationLinkGroup = Pick<NavigationLink, 'label'> & {
  links: NavigationLink[];
};
