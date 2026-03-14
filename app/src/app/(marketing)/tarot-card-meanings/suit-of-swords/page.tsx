import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-swords');

export default function SuitOfSwordsPage() {
  return <SubHubPage configKey="suit-of-swords" />;
}
