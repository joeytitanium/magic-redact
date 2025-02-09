import { ClientPage } from './client-page';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // const isDebug = (await searchParams).debug === 'true';
  const showPricing = (await searchParams).pricing === 'true';

  return <ClientPage showPricing={showPricing} />;
}
