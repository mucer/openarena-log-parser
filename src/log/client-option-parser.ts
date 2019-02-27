import { ClientOptions } from "../models/client-options";
import { Team } from "../models/constants";

export class ClientOptionsParser {
    public parse(data: string): ClientOptions {
        const options: ClientOptions = {
            id: '',
            name: '',
            team: Team.SPECTATOR
        };
        const ary = data.split('\\');
        if (ary[0] === '') {
            ary.shift();
        }

        for (let i = 0; i < ary.length + 1; i += 2) {
            switch (ary[i]) {
                case 'n':
                    options.name = ary[i + 1];
                    break;
                case 't':
                    options.team = +ary[i + 1];
                    break;
                case 'model':
                    options.model = ary[i + 1];
                    break;
                case 'hmodel':
                    options.hmodel = ary[i + 1];
                    break;
                case 'c1':
                    options.color1 = +ary[i + 1];
                    break;
                case 'c2':
                    options.color2 = +ary[i + 1];
                    break;
                case 'hc':
                    options.handicap = +ary[i + 1];
                    break;
                case 'w':
                    options.wins = +ary[i + 1];
                    break;
                case 'l':
                    options.losses = +ary[i + 1];
                    break;
                case 'skill':
                    options.skill = +ary[i + 1];
                    break;
                case 'tt':
                    options.teamTask = +ary[i + 1];
                    break;
                case 'tl':
                    options.teamLeader = +ary[i + 1];
                    break;
                case 'id':
                    options.id = ary[i + 1];
                    break;
            }
        }
        return options;
    }

}