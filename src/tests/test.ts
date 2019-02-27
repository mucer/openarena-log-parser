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
// const cp = spawn('powershell',
//     ['-Command', 'Get-Content D:\\Spiele\\openarena-0.8.8\\server.log']);
// const cp = spawn('powershell',
//     ['-Command', 'D:\\Spiele\\openarena-0.8.8\\oa_ded.exe'],
//     { cwd: 'D:\\Spiele\\openarena-0.8.8' });
// const cp = spawn('cmd',
//     ['/c', 'D:\\Spiele\\openarena-0.8.8\\oa_ded.exe'],
//     { cwd: 'D:\\Spiele\\openarena-0.8.8' });
// const cp = spawn('cmd',
//     ['/c', 'oa_ded.exe'],
//     { cwd: 'D:/Spiele/openarena-0.8.8' });
// const cp = spawn('./oa_ded.x86_64', ['+exec', 'settings.cfg', '+exec', 'server1.cfg'], { cwd: '/opt/openarena-0.8.8' });
// const cp = spawn('./oa_ded.exe', ['+developer', '1', '+exec', 'settings.cfg', '+exec', 'server1.cfg'], { cwd: 'D:/Spiele/openarena-0.8.8' });
// cp.stdout.setEncoding('utf8');
// cp.stderr.setEncoding('utf8');
// cp.stdout.on('data', data => console.log(data.toString()));
// cp.stderr.on('data', data => console.log(data.toString()));


console.log('done'); 