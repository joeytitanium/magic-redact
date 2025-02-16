import { CONFIG } from '@/config';
import { TemplateString } from 'next/dist/lib/metadata/types/metadata-types';
import { isDevelopment } from './is-development';

export const pageTitle = (title: string | TemplateString) =>
  `${isDevelopment ? '[DEV] ' : ''}${title} | ${CONFIG.site.name}`;
