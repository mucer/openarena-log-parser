import { OpenArenaProcess } from './open-arena-process';

const p = new OpenArenaProcess('D:/Spiele/openarena-0.8.8');
p.settings.sv_hostname = process.env.OA_NAME;
p.settings.g_motd = process.env.OA_WELCOME;
p.settings.net_port = 27951;
p.settings.rconPassword = process.env.OA_PASSWORD;
p.settings.sv_dlURL = process.env.OA_HTTP;


console.log(process.env.COMSPEC)
p.start()
    .then(() => console.log('started'));

// const cp = spawn('powershell', ['-Command', 'Get-Content D:\\Spiele\\openarena-0.8.8\\server.log']) //, ['D:\\Spiele\\openarena-0.8.8\\server.log']);
// cp.stdout.setEncoding('utf8');
// cp.stderr.setEncoding('utf8');
// cp.stdouecgt.on('data', console.log);
// cp.stderr.on('data', console.log);


console.log('done'); 