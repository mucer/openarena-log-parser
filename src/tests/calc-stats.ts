import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";
import { GameDao } from "../db/game-dao";
import { GameLogParser } from "../log/game-log-parser";

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'test',
    port: 5432
});
client.connect();

const dao = new GameDao(client);

async function write() {

    const parser = new GameLogParser();
    parser.parse(readFileSync(join(__dirname, '../../logs/server1.log'), 'utf8'));
    const games = parser.getGames();
    for (let i = 0; i < games.length; i++) {
        console.log(`writing game ${games[i].options.timestamp} (${i} of ${games.length})`);
        await dao.writeGame(games[i]);
    }
}

write().then(() => client.end());

// const users = {
//     AA: ['D5E70E825B96E3A5AEDFF0C1E8315D08'],
//     AD: ['D163B398FC55878831128437385285D9'],
//     AME: ['D118F0D3CC47B1005B84A9DEA0D4DF81'],
//     AST: ['4685E4A391E2862150E77298DF2BC9AE', '275CDC8C327FCE1336F37C235ADD89F0'],
//     AV: ['D7B046A373702247AA4A01708535AD2E'],
//     AWA: ['3122D9EC0F5E394ACCAE00589A22BB33', '5C271C45F4719B6C3F8B718AC364ACDF', '731A1A56F4AF71B28E8283F097DC2513'],
//     CHO: ['A82E2E8C9E657A81F2B33161FE6CA089'],
//     DBE: ['00056657D2235F2758F3F39B22582280', '53CCEDD49136ACB464E02938E6E91EB2'],
//     DL: ['1137CA01A721C0FE97BE4458D13B52F0', 'AD4B38B22B068D8F38FEEC96B31480EB'],
//     DM: ['AC54F62E7CA40397213EBF55B01A1529', 'F6C187E639431217C4484FBB85838CE1'],
//     FBE: ['22AE19331C4A49AD00B90AC32EDCB594'],
//     FK: ['8F15AEF7FA5EF4805C7668265C85D1DB'],
//     FSA: ['851D88869F77EA9FDAB1009612FF6743', 'E149ACC26BAE0D89A3E6E87A66C3E41E'],
//     FSP: ['1AD7D518026F46C384401522ECD027A4'],
//     HBA: ['96629579904B12263B5AABED15D5001D'],
//     JEI: ['757AE61EBC89A43C45816810FC3507FA'],
//     JG: ['6B3134C031E35E21ED23902DD13CC36F'],
//     JN: ['D74100A053BD4FD108951A7B65BBBA0C', 'E0E4AF6FD5EBF4729D836781F47C30EC'],
//     MAS: ['A677A3BB692B68C9091A1BE5A20BDB43'],
//     MKRU: ['D584F2471C6234BE5C6D4E7AF5A5091C'],
//     MSCHO: ['E2A39740874581BC96D7DCCA097F4291'],
//     RTE: ['F7F43F1B6D49946154D357757CEB17E0'],
//     TI: ['478561C592383850B713596B50666793'],
//     TS: ['350AFE181B3921E62A97292A06BC9BC9'],
//     Yoshiii: ['1106C1777983530AEEAB186EE44B9EF0']
// };

// const clients: Dictionary<{ name: string, count: number }[]> = {}
// games.forEach(game => {
//     game.clients.forEach(client => {
//         if (client && !client.id.match(/BOT\d+/)) {
//             const ary = clients[client.id] = clients[client.id] || [];
//             const obj = ary.find(c => c.name === client.name);
//             if (obj) {
//                 obj.count += 1;
//             } else {
//                 ary.push({ name: client.name, count: 1 });
//             }
//         }
//     });
// });

// Object.keys(clients).forEach(id => {
//     console.log(id + ": " + clients[id].map(c => `${c.name} (${c.count})`).join(', '));
// })