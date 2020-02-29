import Api from '../api';

enum AdapterType {
    AdapterTypeNfc = 1,
    AdapterTypeBarcode = 2,
    AdapterTypeBluetooth = 3,
}

interface AdapterResource {
    adapter_id: string;
    href: string;
    name: string;
    type: string;
    driver: string;
    kind: string;
}

interface AdapterShortResource {
    adapter_id: string;
    kind: string;
    href: string;
    name: string;
    type: string;
}

class Adapter {
    href: string;
    name: string;
    type: string;
    driver?: string;
    kind: string;
    adapterId: string;

    constructor(a: AdapterResource | AdapterShortResource) {
        this.href = a.href;
        this.name = a.name;
        this.type = a.type;
        this.kind = a.kind;
        this.adapterId = a.adapter_id;

        if ('driver' in a) {
            this.driver = a.driver;
        }
    }
}

export default class AdapterService {
    private readonly url: string;
    private api: Api;
    private path = '/adapters';

    constructor(api: Api, url: string) {
        this.url = url;
        this.api = api;
    }

    getAll = () => this.getFiltered();

    getFiltered = (adapterType?: AdapterType): Promise<Adapter[]> => {
        const url = this.url + this.path + adapterType ? '?type=' + adapterType : '';

        return this.api
            .call<AdapterShortResource[]>(({ get }) => get(url, {}))
            .then<Adapter[]>(resp => resp.map(a => new Adapter(a)));
    };

    get = (adapterID: string): Promise<Adapter> => {
        const url = this.url + this.path + '/' + adapterID;

        return this.api
            .call<AdapterResource>(({ get }) => get(url, {}))
            .then<Adapter>(resp => new Adapter(resp));
    };
}
