import { SearchParams } from '@/types/search-params';
import { ClientPage } from './client-page';

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  // const isDebug = (await searchParams).debug === 'true';
  const showPricing = (await searchParams).pricing === 'true';

  return <ClientPage showPricing={showPricing} />;
}
