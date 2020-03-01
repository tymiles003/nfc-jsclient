import Api from '../../api';
import PaginationInfo, { PaginationListResource } from '../pagination';
import { Command, JobFilter, JobResource, JobStatus, JobStepResource, NewJob } from './types';
import { buildJobsQueryParams } from './helpers';

type JobListResource = {
    readonly items: JobResource[];
} & PaginationListResource;

class JobStep {
    command: Command;
    params: object;

    constructor(s: JobStepResource) {
        this.params = s.params;
        this.command = Command[Command[parseInt(s.command)]];
    }
}

class Job {
    jobID: string;
    jobName: string;
    status: JobStatus;
    adapterID: string;
    adapterName: string;
    repeat: number;
    totalRuns: number;
    successRuns: number;
    errorRuns: number;
    expireAfter: number;
    steps: JobStep[];
    createdAt: Date;

    constructor(e: JobResource) {
        this.jobID = e.job_id;
        this.jobName = e.job_name;
        this.status = JobStatus[JobStatus[parseInt(e.status)]];
        this.adapterID = e.adapter_id;
        this.adapterName = e.adapter_name;
        this.repeat = e.repeat;
        this.totalRuns = e.total_runs;
        this.successRuns = e.success_runs;
        this.errorRuns = e.error_runs;
        this.expireAfter = e.expire_after;
        this.steps = e.steps.map(s => new JobStep(s));
        this.createdAt == new Date(e.created_at);
    }
}

interface ListResponse {
    items: Job[];
    pagInfo: PaginationListResource;
}

export default class JobService {
    private readonly url: string;
    private api: Api;
    private path = '/jobs';
    private basePath = '/adapters';

    constructor(api: Api, url: string) {
        this.url = url;
        this.api = api;
    }

    getAll = (adapterId: string): Promise<ListResponse> => this.getFiltered(adapterId, {});

    getFiltered = (adapterId: string, filter: JobFilter): Promise<ListResponse> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path + buildJobsQueryParams(filter);

        return this.api
            .call<JobListResource>(({ get }) => get(url, {}))
            .then<ListResponse>(resp => ({
                pagInfo: new PaginationInfo(resp),
                items: resp.items.map(j => new Job(j)),
            }));
    };

    add = (adapterId: string, J: NewJob): Promise<Job> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path;

        return this.api
            .call<JobResource>(({ post }) => post(url, { data: J }))
            .then<Job>(resp => new Job(resp));
    };

    deleteAll = (adapterId: string): Promise<{}> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path;

        return this.api.call<{}>(({ del }) => del(url, {}));
    };

    delete = (adapterId: string, jobId: string): Promise<{}> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path + '/' + jobId;

        return this.api.call<{}>(({ del }) => del(url, {}));
    };

    updateStatus = (adapterId: string, jobId: string, status: JobStatus): Promise<Job> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path + '/' + jobId;

        return this.api
            .call<JobResource>(({ patch }) => patch(url, { data: { status } }))
            .then<Job>(resp => new Job(resp));
    };
}