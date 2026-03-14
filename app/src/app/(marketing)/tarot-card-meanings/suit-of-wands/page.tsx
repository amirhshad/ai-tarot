import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-wands');

export default function SuitOfWandsPage() {
  return <SubHubPage configKey="suit-of-wands" />;
}
