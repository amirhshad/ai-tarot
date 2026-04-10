import SubHubPage, { generateSubHubMetadata } from '@/components/seo/SubHubPage';

export const metadata = generateSubHubMetadata('major-arcana');

export default function MajorArcanaPage() {
  return <SubHubPage configKey="major-arcana" />;
}
