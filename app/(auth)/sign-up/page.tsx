import { PRICE_IDS } from '@/types/product';
import { SearchParams } from '@/types/search-params';
import { Suspense } from 'react';
import { z } from 'zod';
import { SignUpPage } from './client';

const SCHEMA = z.object({
  priceId: z.enum(PRICE_IDS).optional(),
});

const Page = async ({ searchParams }: { searchParams: SearchParams }) => {
  const query = SCHEMA.safeParse(await searchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPage priceId={query.data?.priceId} />
    </Suspense>
  );
};

export default Page;
