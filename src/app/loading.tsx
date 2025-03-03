import LoadingSpinner from '@/components/Hero/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner />
    </div>
  );
}