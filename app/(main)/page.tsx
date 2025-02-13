import { Editor } from '@/components/editor';
import { SearchParams } from '@/types/search-params';
import { generateMetadata } from '@/utils/metadata';

export const metadata = generateMetadata();

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const showPricing = (await searchParams).pricing === 'true';

  return <Editor showPricing={showPricing} />;
}
