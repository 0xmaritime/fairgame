import { Metadata } from 'next';
import ClientEditReviewPage from './ClientEditReviewPage';

export default async function EditReviewPage({
  params,
}: {
  params: { slug: string };
}) {
  return <ClientEditReviewPage slug={params.slug} />;
}
