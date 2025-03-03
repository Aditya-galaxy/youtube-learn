import { useRouter, usePathname } from 'next/navigation';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (path: string) => {
    if (pathname !== path) {
      router.push(path);
    }
  };

  const isCurrentPath = (path: string) => pathname === path;

  return {
    navigate,
    isCurrentPath,
    currentPath: pathname
  };
}