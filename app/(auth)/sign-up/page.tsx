'use client';

import { Suspense } from 'react';
import { z } from 'zod';
import { SignUpPage } from './client';

const SCHEMA = z
  .object({
    variantId: z.string(),
  })
  .transform((data) => ({
    variantId: Number(data.variantId),
  }));

const Page = ({ searchParams }: { searchParams: { variantId: string } }) => {
  const query = SCHEMA.safeParse(searchParams);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpPage variantId={query.data?.variantId} />
    </Suspense>
  );
};

export default Page;
