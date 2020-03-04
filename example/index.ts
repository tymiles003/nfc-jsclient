// will be npm module name instead of the dist import
import NfcClient from '../dist';
import { EventName } from '../dist/models/events';
import { CommandString } from '../dist/models/commands';
import { NdefRecordPayloadType } from '../dist/models/ndefconv';

// Below is written for testing purposes and  will be removed

const client = new NfcClient('http://127.0.0.1:3011', 'en');
client.About.get().then(a => console.log('about info: ', a, '\n'));
client.Ws.connect();
client.Adapters.getAll().then(a =>
    console.log(
        '\nadapters names: ',
        a.map(({ name }) => name),
        '\n',
    ),
);
console.log('Client has been connected to the WS\n');

let testIterator = 0;
const ArrayOfTestes = [
    () =>
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
            job_name: CommandString.SetPassword,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.SetPassword,
                    params: {
                        password: btoa('0x11, 0x11, 0x11, 0x11'),
                    },
                },
            ],
        }),
    () =>
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
            job_name: CommandString.WriteNdef,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.WriteNdef,
                    params: {
                        message: [
                            {
                                type: NdefRecordPayloadType.toString(NdefRecordPayloadType.Url),
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
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
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
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
            job_name: CommandString.GetTags,
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
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
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
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
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
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
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
        client.Jobs.add('7f1d71b6-875a-463e-a835-707cebe1bc8c', {
            job_name: CommandString.RemovePassword,
            repeat: 1,
            expire_after: 60,
            steps: [
                {
                    command: CommandString.RemovePassword,
                    params: {},
                },
            ],
        }),
];

client.Ws.onEvent((e): void => {
    console.log('Event received: ', e.name, EventName.toString(e.name));
    switch (e.name) {
        case EventName.AdapterDiscovery:
            console.log('Adapter discovery:', e.data.name, '\n\n');
            client.Adapters.getAll().then(a =>
                console.log(
                    'adapters names: ',
                    a.map(({ name }) => name),
                ),
            );
        case EventName.AdapterRelease:
            console.log('Adapter released:', e.data.name, '\n\n');
            client.Adapters.getAll().then(a =>
                console.log(
                    'adapters names: ',
                    a.map(({ name }) => name),
                ),
            );
            break;
        case EventName.JobFinished:
            console.log(`\n\n===> JOB ${e.data.job_name} HAS BEEN FINISHED: `, e.data, '\n\n');
            testIterator++;
            if (testIterator < ArrayOfTestes.length) {
                ArrayOfTestes[testIterator]();
            }
            break;
        case EventName.JobActivated:
            console.log(`\n\n===> JOB ${e.data.job_name} HAS BEEN ACTIVATED: `, e.data, '\n\n');
            break;
        case EventName.TagDiscovery:
        case EventName.TagRelease:
        case EventName.JobSubmitted:
        case EventName.RunStarted:
        case EventName.RunSuccess:
        case EventName.RunError:
            console.log(EventName.toString(e.name), e.data);
            break;
        default:
            break;
    }
});

ArrayOfTestes[testIterator]();