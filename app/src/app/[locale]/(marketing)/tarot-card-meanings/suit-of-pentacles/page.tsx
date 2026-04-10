import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-pentacles');

export default function SuitOfPentaclesPage() {
  return <SubHubPage configKey="suit-of-pentacles" />;
}
