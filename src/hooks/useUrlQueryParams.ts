import { useSearchParams } from 'react-router-dom';

export function useUrlQueryParams(defaultOrdering: string) {
    const [searchParams, setSearchParams] = useSearchParams();

    const queryParams = {
        page: Number(searchParams.get('page')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 10,
        ordering: searchParams.get('ordering') || defaultOrdering,
        filters: searchParams.get('filters') ? JSON.parse(decodeURIComponent(searchParams.get('filters') as string)) : {}
    };

    const setQueryParams = (newParams: any) => {
        const nextParams = new URLSearchParams(searchParams);
        if (newParams.page) nextParams.set('page', newParams.page.toString());
        if (newParams.pageSize) nextParams.set('pageSize', newParams.pageSize.toString());
        if (newParams.ordering) nextParams.set('ordering', newParams.ordering);
        if (newParams.filters) {
            const cleanFilters = Object.fromEntries(
                Object.entries(newParams.filters).filter(([_, v]) => v !== null && v !== undefined && v !== '')
            );
            if (Object.keys(cleanFilters).length > 0) {
                nextParams.set('filters', encodeURIComponent(JSON.stringify(cleanFilters)));
            } else {
                nextParams.delete('filters');
            }
        }
        setSearchParams(nextParams, { replace: true });
    };

    return [queryParams, setQueryParams] as const;
}
