import { Editor } from '@/components/editor';
import { generateMetadata } from '@/utils/metadata';

export const metadata = generateMetadata();

export default function HomePage() {
  return <Editor />;
}
