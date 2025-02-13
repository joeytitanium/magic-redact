import { SearchParams } from '@/types/search-params';
import { generateMetadata } from '@/utils/metadata';
import { ClientPage } from './client-page';

export const metadata = generateMetadata();

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const showPricing = (await searchParams).pricing === 'true';

  return <ClientPage showPricing={showPricing} />;
}
