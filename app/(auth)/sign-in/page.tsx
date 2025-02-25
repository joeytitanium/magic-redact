import { PRICE_IDS } from '@/types/product';
import { SearchParamsPromise } from '@/types/search-params';
import { generateMetadata } from '@/utils/metadata';
import { Suspense } from 'react';
import { z } from 'zod';
import SignInPage from './client';

const SCHEMA = z.object({
  priceId: z.enum(PRICE_IDS).optional(),
});

export const metadata = generateMetadata();

const Page = async ({ searchParams }: { searchParams: SearchParamsPromise }) => {
  const query = SCHEMA.safeParse(await searchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage priceId={query.data?.priceId} />
    </Suspense>
  );
};

export default Page;
