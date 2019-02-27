import { OpenArenaProcess } from '../process/open-arena-process';

const p = new OpenArenaProcess('/opt/openarena-0.8.8');
p.settings.svHostname = process.env.OA_NAME;
p.settings.g_motd = process.env.OA_WELCOME;
p.settings.net_port = 27951;
p.settings.rconPassword = process.env.OA_PASSWORD;
p.settings.svDownloadURL = process.env.OA_HTTP;

p.start()
    .then(() => console.log('started'));

process.stdin.on('data', e => p.send(e));

console.log('done'); 