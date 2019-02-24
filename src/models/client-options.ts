import { Team, TeamTask } from "./constants";

export class ClientOptions {
    public id = '';
    // name
    public name = '';
    // team
    public team: Team = Team.SPECTATOR;
    public model: string | undefined;
    public hmodel: string | undefined;
    // color 1
    public color1 = 0;
    // color 2
    public color2 = 0;
    // handicap
    public handicap = 100;
    // wins
    public wins = 0;
    // losses
    public losses = 0;
    // bot skill level
    public skill: number | undefined;
    // team task
    public teamTask: TeamTask = 0;
    // team leader
    public teamLeader = 0;


    constructor(data?: string) {
        if (data) {
            this.parse(data);
        }
    }

    public parse(data: string) {
        const ary = data.split('\\');
        if (ary[0] === '') {
            ary.shift();
        }

        for (let i = 0; i < ary.length + 1; i += 2) {
            switch (ary[i]) {
                case 'n':
                    this.name = ary[i + 1];
                    break;
                case 't':
                    this.team = +ary[i + 1];
                    break;
                case 'model':
                    this.model = ary[i + 1];
                    break;
                case 'hmodel':
                    this.hmodel = ary[i + 1];
                    break;
                case 'c1':
                    this.color1 = +ary[i + 1];
                    break;
                case 'c2':
                    this.color2 = +ary[i + 1];
                    break;
                case 'hc':
                    this.handicap = +ary[i + 1];
                    break;
                case 'w':
                    this.wins = +ary[i + 1];
                    break;
                case 'l':
                    this.losses = +ary[i + 1];
                    break;
                case 'skill':
                    this.skill = +ary[i + 1];
                    break;
                case 'tt':
                    this.teamTask = +ary[i + 1];
                    break;
                case 'tl':
                    this.teamLeader = +ary[i + 1];
                    break;
                case 'id':
                    this.id = ary[i + 1];
                    break;
            }
        }
    }

}