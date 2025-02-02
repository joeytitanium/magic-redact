import { ClientPage } from './client-page';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const isDebug = (await searchParams).debug === 'true';

  return <ClientPage isDebug={isDebug} />;
}
