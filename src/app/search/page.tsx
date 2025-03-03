import SearchResults from '@/components/SearchResults';

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  return <SearchResults  />;
}