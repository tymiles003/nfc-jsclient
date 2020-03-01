import { JobFilter } from './types';

export const buildJobsQueryParams = (filter: JobFilter): string => {
    let queryParams = '';

    if (filter.status) {
        queryParams += '&status=' + filter.status;
    }

    if (filter.sortBy) {
        queryParams += '&sortby=' + filter.sortBy;
    }

    if (filter.sortDir) {
        queryParams += '&sortdir=' + filter.sortDir;
    }

    if (filter.offset) {
        queryParams += '&offset=' + filter.offset;
    }

    if (filter.limit) {
        queryParams += '&limit=' + filter.limit;
    }

    return queryParams.replace('&', '?');
};
