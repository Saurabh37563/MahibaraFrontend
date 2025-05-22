import { useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FilterState } from '@/types/project-types';
import { DEFAULT_FILTERS } from '@/constants/project-filter-constants';

export function useFilterParams(filters: FilterState, setFilters: (filters: FilterState) => void) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update URL when filters change
  const updateUrl = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== DEFAULT_FILTERS[key as keyof FilterState]) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const newFilters: Partial<FilterState> = {};
    let hasChanges = false;

    searchParams.forEach((value, key) => {
      if (key in DEFAULT_FILTERS) {
        newFilters[key as keyof FilterState] = value as any;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setFilters({ ...DEFAULT_FILTERS, ...newFilters });
    }
  }, [searchParams, setFilters]);

  return { updateUrl };
}
