import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('suit-of-cups');

export default function SuitOfCupsPage() {
  return <SubHubPage configKey="suit-of-cups" />;
}
