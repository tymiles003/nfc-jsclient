import PaginationInfo, { ListResponse } from '../models/pagination';
import { JobRunResource, JobRunStatus, JobRunListResource, RunFilter, StepResultResource } from '../models/run';
import { buildJobRunsQueryParams } from '../helpers/runs';
import { Tag } from './tags';
import { Command, CommandStatus } from '../models/commands';
import { IApi } from '../interfaces';

export class StepResult {
    command: Command;
    params: object;
    output: object;
    status: CommandStatus;
    message: string;

    constructor(s: StepResultResource) {
        this.command = Command.parse(s.command);
        this.params = s.params;
        this.output = s.output;
        this.status = CommandStatus.parse(s.status);
        this.message = s.message;
    }
}

export class JobRun {
    runID: string;
    jobID: string;
    jobName: string;
    status: JobRunStatus;
    adapterID: string;
    adapterName: string;
    tag: Tag;
    results: StepResult[];
    createdAt: Date;

    constructor(e: JobRunResource) {
        this.createdAt = new Date(e.created_at);
        this.runID = e.run_id;
        this.jobID = e.job_id;
        this.jobName = e.job_name;
        this.status = JobRunStatus.parse(e.status);
        this.adapterID = e.adapter_id;
        this.adapterName = e.adapter_name;
        this.tag = new Tag(e.tag);
        this.results = e.results.map(s => new StepResult(s));
    }
}

interface NewEvent {
    name: string;
    adapter_id: string;
    data?: any;
}

export default class RunService {
    private readonly url: string;
    private api: IApi;
    private path = '/runs';
    private basePath = '/adapters';

    constructor(api: IApi, url: string) {
        this.url = url;
        this.api = api;
    }

    getAll = (adapterId: string): Promise<ListResponse<JobRun> | Error> => this.getFiltered(adapterId, {});

    getFiltered = (adapterId: string, filter: RunFilter): Promise<ListResponse<JobRun> | Error> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path + buildJobRunsQueryParams(filter);

        return this.api
            .call<JobRunListResource>(({ get }) => get(url, {}))
            .then<ListResponse<JobRun>>(resp => ({
                pagInfo: new PaginationInfo(resp),
                items: resp.items.map(j => new JobRun(j)),
            }))
            .catch((err: Error) => new Error('Error on job runs get filtered: ' + err.name + err.message));
    };

    get = (adapterId: string, runId: string): Promise<JobRun | Error> => {
        const url = this.url + this.basePath + '/' + adapterId + this.path + '/' + runId;

        return this.api
            .call<JobRunResource>(({ get }) => get(url, {}))
            .then<JobRun>(resp => new JobRun(resp))
            .catch((err: Error) => new Error('Error on job run get: ' + err.name + err.message));
    };
}
