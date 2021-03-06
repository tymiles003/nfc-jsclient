// will be npm module name instead of the dist import
import NfcClient from '../dist';
import { EventName } from '../dist/models/events';
import { CommandString } from '../dist/models/commands';
import { Adapter } from '../src/client/adapters';
import { NdefRecordPayloadTypeString } from '../src/models/ndefconv';
import { JobRun } from '../src/client/runs';
import { base64ToHex, hexToBase64 } from '../src/helpers/base64';

console.log('====>TEST base64ToHex:');
console.log('BCJs2qdkgQ==', 'converts to', base64ToHex('BCJs2qdkgQ=='));

console.log('====>TEST hexToBase64:');
console.log('04 22 6c da a7 64 81', 'converts to', hexToBase64('04 22 6c da a7 64 81'));
console.log('04226cdaa76481', 'converts to', hexToBase64('04226cdaa76481'));

let adapterId = undefined;

const getAdapterId = (adapters: Adapter[]): string | undefined => {
    return adapters?.find(a => a.adapterId).adapterId ?? undefined;
};

let testIterator = 0;
const client = new NfcClient('127.0.0.1:3011', 'en');

const ArrayOfTestes = (id: string) => [
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.WriteNdef,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.WriteNdef,
                    params: {
                        message: [
                            {
                                type: NdefRecordPayloadTypeString.Url,
                                data: {
                                    url: 'https://tagl.me',
                                },
                            },
                        ],
                    },
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.GetTags,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.GetTags,
                    params: {},
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.ReadNdef,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.ReadNdef,
                    params: {},
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.TransmitTag,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.TransmitTag,
                    params: {
                        tx_bytes: '0x60',
                    },
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.GetDump,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.GetDump,
                    params: {},
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.FormatDefault,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.FormatDefault,
                    params: {},
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.SetPassword,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.SetPassword,
                    params: {
                        password: '0x11, 0x11, 0x11, 0x11',
                    },
                },
            ],
        }),
    () =>
        client.Jobs.add(id, {
            job_name: CommandString.RemovePassword,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.AuthPassword,
                    params: {
                        password: '0x11, 0x11, 0x11, 0x11',
                    },
                },
                {
                    command: CommandString.RemovePassword,
                    params: {},
                },
            ],
        }),
];

client.About.get().then(a => console.log('about info: ', a, '\n'));
client.Ws.connect();
client.Adapters.getAll().then(a => {
    adapterId = getAdapterId(a);

    if (adapterId) {
        ArrayOfTestes(adapterId)[testIterator]();
    }

    console.log(
        '\nadapters names: ',
        a.map(({ name }) => name),
        '\n',
    );
});

console.log('Client has been connected to the WS\n');

client.Ws.onEvent((e): void => {
    console.log('Event received: ', e.name, EventName.toString(e.name));
    switch (e.name) {
        case EventName.AdapterDiscovery:
            console.log('Adapter discovery:', e.data.name, '\n\n');
            client.Adapters.getAll().then(a => {
                console.log(
                    'adapters names: ',
                    a.map(({ name }) => name),
                );
            });
        case EventName.AdapterRelease:
            console.log('Adapter released:', e.data.name, '\n\n');
            client.Adapters.getAll().then(a => {
                console.log(
                    'adapters names: ',
                    a.map(({ name }) => name),
                );
            });
            break;
        case EventName.JobFinished:
            console.log(`\n\n===> JOB ${e.data.job_name} HAS BEEN FINISHED: `, e.data, '\n\n');
            testIterator++;
            client.Adapters.getAll().then(a => {
                adapterId = getAdapterId(a);
                if (adapterId && testIterator < ArrayOfTestes(adapterId).length) {
                    ArrayOfTestes(adapterId)[testIterator]();
                }
            });
            break;
        case EventName.JobActivated:
            console.log(`\n\n===> JOB ${e.data.job_name} HAS BEEN ACTIVATED: `, e.data, '\n\n');
            break;
        case EventName.TagDiscovery:
        case EventName.TagRelease:
        case EventName.JobSubmitted:
            console.log(EventName.toString(e.name), e.data);
            break;
        case EventName.RunStarted:
        case EventName.RunSuccess:
        case EventName.RunError:
            console.log(EventName.toString(e.name), new JobRun(e.data));
            break;
        default:
            break;
    }
});
