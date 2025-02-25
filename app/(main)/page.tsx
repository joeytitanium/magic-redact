import { Editor } from '@/components/editor';
import { SearchParamsPromise } from '@/types/search-params';
import { generateMetadata } from '@/utils/metadata';
import { Suspense } from 'react';
import { z } from 'zod';

export const metadata = generateMetadata();

const LANDING_PAGE_SEARCH_PARAMS_SCHEMA = z.object({
  ref: z.string().optional(),
});
export type LandingPageSearchParams = z.infer<typeof LANDING_PAGE_SEARCH_PARAMS_SCHEMA>;

export default async function HomePage({ searchParams }: { searchParams: SearchParamsPromise }) {
  const query = LANDING_PAGE_SEARCH_PARAMS_SCHEMA.safeParse(await searchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Editor searchParams={query.data ?? {}} />
    </Suspense>
  );
}
