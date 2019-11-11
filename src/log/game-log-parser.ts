import { ClientOptions } from "../models/client-options";
import {
  AwardType,
  ChallengeType,
  MeanOfDeath,
  Team
} from "../models/constants";
import { Game } from "../models/game";
import { Join } from "../models/join";
import { ClientOptionsParser } from "./client-option-parser";
import { GameOptionsParser } from "./game-options-parser";
import { TeamSize } from "../models/team-size";
import { Client } from "pg";

const LOG_TIME_PATTERN = /^\s*(\d+):(\d+) (.*)/;

export class GameLogParser {
  private nextBotId = 0;

  private games: Game[] = [];

  private current: Game | undefined;

  private waiting: ((line: string, time: number) => void)[] = [];

  private clientOptionParser = new ClientOptionsParser();

  private ignoredCommands: string[] = [];

  private flagCarriers: boolean[] = [];

  public parse(...lines: string[]) {
    lines.forEach(
      line => line && line.split("\n").forEach(l => this.parseLine(l))
    );
  }

  public getCurrent(): Game | undefined {
    return this.current;
  }

  public getGames(): Game[] {
    return this.games;
  }

  public getIgnoredCommands(): string[] {
    return this.ignoredCommands;
  }

  private parseLine(line: string, time?: number) {
    try {
      if (line.startsWith("--")) {
        return;
      }

      if (time === undefined) {
        const match = LOG_TIME_PATTERN.exec(line);
        if (match) {
          time = +match[1] * 60 + +match[2];
          line = match[3];
        } else if (this.current) {
          time = Math.floor(
            (new Date().getTime() - this.current.startTime) / 1000
          );
        } else {
          time = 0;
        }
      }

      if (this.current && time) {
        this.current.duration = time;
      }

      if (this.waiting.length) {
        const fn = this.waiting.shift();
        fn && fn(line, time);
        return;
      }

      const pos = line.indexOf(":");
      if (pos === -1) {
        return;
      }

      const key = line.substr(0, pos);
      const data = line.substr(pos + 1).trim();
      if (/^\w+$/.test(key)) {
        switch (key.toLowerCase()) {
          case "initgame":
            this.initGame(data);
            break;
          case "shutdowngame":
            this.shutdownGame(time);
            break;
          case "clientuserinfochanged":
            this.updateClient(time, data);
            break;
          case "clientdisconnect":
            this.removeClient(time, +data);
            break;
          case "kill":
            this.parseKill(time, data);
            break;
          case "award":
            this.parseAward(time, data);
            break;
          case "challenge":
            this.parseChallenge(time, data);
            break;
          case "red":
            this.parseTeamScore(data);
            break;
          case "exit":
            this.parseResult(time, data);
            break;
          case "ctf":
            this.parseCtf(time, data);
            break;
          case "1fctf":
            this.parseOneCtf(time, data);
            break;
          case "playerscore":
            this.parsePlayerScore(data);
            break;
          case "info":
          case "clientconnect":
          case "clientbegin":
          case "playerstore":
          case "item": // player picked up an item
          case "dom": // events for gametype dominiation
          case "dd": // events for gametype double dominiation
          case "harvester": // events for gametype harvester
          case "obelisk": // events for gametype obelisk
          case "say": // chat message to all
          case "sayteam": // chat message to team
          case "tell": // chat message to other player
          case "score": // final player score
          case "teamscore": // when a team got a point
          case "warmup": // no further information
            break;
          default:
            if (!this.ignoredCommands.includes(key)) {
              this.ignoredCommands.push(key);
            }
        }
      }
    } catch (e) {
      throw new Error(`Error parsing line '${line}: ${e}`);
    }
  }

  private initGame(data: string) {
    if (this.current) {
      console.warn(
        `Last game not terminated correctly (time=${
          this.current.options.timestamp
        }, map=${this.current.options.mapName})`
      );
    }
    this.current = {
      options: new GameOptionsParser().parse(data),
      clients: [],
      awards: [],
      kills: [],
      joins: [],
      challenges: [],
      score: {},
      startTime: new Date().getTime(),
      duration: 0,
      finished: false
    };
    this.flagCarriers = [];
    this.games.push(this.current);
  }

  private updateClient(time: number, data: string) {
    if (this.current) {
      const match = data.match(/(\d+) (.*)/);
      if (!match) {
        throw new Error(`Invalid client data string '${data}' given!`);
      }
      const pos = +match[1];
      const oldClient: ClientOptions | undefined = this.current.clients[pos];
      const client: ClientOptions = (this.current.clients[pos] = Object.assign(
        {},
        oldClient || {},
        this.clientOptionParser.parse(match[2])
      ));
      // generate id for bots
      if (!client.id) {
        if (oldClient && oldClient.id) {
          client.id = oldClient.id;
        } else if (client.skill) {
          client.id = `BOT-SKILL-${client.skill}-NUM-${++this.nextBotId}`;
        } else {
          console.warn('Client without an ID and without a skill level found');
          client.id = 'UNKNOWN';
        }
      }

      let join: Join | undefined = this.current.joins.find(
        j => j.clientId === client.id && j.endTime === undefined
      );
      // existing join but important info changed -> new join
      if (join && (join.name !== client.name || join.team !== client.team)) {
        join.endTime = time;
        this.cleanJoins();
        join = undefined;
      }
      // add new join
      if (!join && client.team !== Team.SPECTATOR) {
        this.current.joins.push({
          clientId: client.id,
          name: client.name,
          team: client.team,
          startTime: time
        });
      }
    }
  }

  private cleanJoins() {
    if (this.current) {
      this.current.joins = this.current.joins.filter(
        j => j.startTime !== j.endTime
      );
    }
  }

  private parsePlayerScore(data: string) {
    if (this.current) {
      const match = data.match(/(\d+) (-?\d+)/);
      if (!match) {
        throw new Error(`Invalid player score '${data}' given!`);
      }
      const pos = +match[1];
      const score = +match[2];
      const client = this.current.clients[pos];
      if (client) {
        this.current.score[client.id] = score;
      }
    }
  }

  private parseTeamScore(data: string) {
    if (this.current && this.current.result) {
      const match = data.match(/(\d+)  blue:(\d+)/);
      if (!match) {
        throw new Error(`Invalid team score '${data}' given!`);
      }
      this.current.result.red = +match[1];
      this.current.result.blue = +match[2];
    }
  }

  private removeClient(time: number, clientPos: number) {
    if (this.current) {
      const client = this.current.clients[clientPos];
      if (client) {
        delete this.flagCarriers[clientPos];
        delete this.current.clients[clientPos];
        this.current.joins
          .filter(j => j.clientId === client.id && j.endTime === undefined)
          .forEach(j => (j.endTime = time));
        this.cleanJoins();
      }
    }
  }

  private parseKill(time: number, data: string) {
    if (this.current) {
      const match = data.match(/(\d+) (\d+) (\d+)/);
      if (!match) {
        throw new Error(`Invalid kill format given: ${data}`);
      }

      const fromPos = +match[1];
      const toPos = +match[2];
      const cause: MeanOfDeath = +match[3];

      let from: ClientOptions | undefined;
      let fromId: string | undefined;
      if (fromPos === 1022) {
        fromId = "<world>";
      } else {
        from = this.current.clients[fromPos];
        fromId = from && from.id;
      }

      const flagCarrier = !!this.flagCarriers[toPos];
      if (flagCarrier) {
        delete this.flagCarriers[toPos];
      }

      const to = this.current.clients[toPos];
      if (fromId && to) {
        const teamKill =
          fromId === to.id ||
          (to.team !== Team.FREE && !!from && from.team === to.team);

        const teamSize: TeamSize = from
          ? this.getTeamSize(from.team)
          : { own: 0, other: 0 };

        this.current.kills.push({
          time,
          fromId,
          toId: to.id,
          teamKill,
          cause,
          flagCarrier,
          teamSize
        });
      }
    }
  }

  private parseCtf(time: number, data: string) {
    if (this.current) {
      const match = data.match(/(\d+) (\d+) (\d+)/);
      if (!match) {
        throw new Error(`Invalid CTF format given: ${data}`);
      }

      const pos = +match[1];
      const type = this.toCtfAward(+match[3]);

      if (type !== undefined) {
        this.addAward(time, pos, type);
      }
    }
  }

  private toCtfAward(type: number): AwardType | undefined {
    switch (type) {
      case 0:
        return AwardType.GET_FLAG;
      case 1:
        return AwardType.CAPTURE_FLAG;
      case 2:
        return AwardType.RETURN_FLAG;
      case 3:
        return AwardType.FRAG_FLAG_CARRIER;
    }
  }

  private parseOneCtf(time: number, data: string) {
    if (this.current) {
      const match = data.match(/(\d+) ([\d-]+) (\d+)/);
      if (!match) {
        throw new Error(`Invalid CTF format given: ${data}`);
      }

      const pos = +match[1];
      const type = this.toCtfAward(+match[3]);

      if (type !== undefined) {
        this.addAward(time, pos, type);
      }
    }
  }

  private parseAward(time: number, data: string) {
    if (this.current) {
      const match = data.match(/(\d+) (\d+)/);
      if (!match) {
        throw new Error(`Invalid Award format given: ${data}`);
      }

      const pos = +match[1];
      const type = +match[2] as AwardType;

      const client = this.current.clients[pos];
      if (client) {
        this.addAward(time, pos, type);
      }
    }
  }

  private parseChallenge(time: number, data: string) {
    if (this.current) {
      const match = data.match(/(\d+) (\d+)/);
      if (!match) {
        throw new Error(`Invalid Award format given: ${data}`);
      }

      const pos = +match[1];
      const type = +match[2] as ChallengeType;

      const client = this.current.clients[pos];
      if (client) {
        const teamSize = this.getTeamSize(client.team);
        this.current.challenges.push({
          time,
          clientId: client.id,
          type,
          teamSize
        });
      }
    }
  }

  private parseResult(time: number, reason: string) {
    if (this.current) {
      const game: Game = this.current;
      game.result = {
        time,
        reason
      };
      game.finished = true;
    }
  }

  private shutdownGame(time: number) {
    if (this.current) {
      this.current.joins
        .filter(j => !j.endTime)
        .forEach(j => (j.endTime = time));
      this.cleanJoins();
      this.current = undefined;
    }
  }

  private addAward(time: number, clientPos: number, type: AwardType) {
    if (this.current) {
      if (type === AwardType.GET_FLAG) {
        this.flagCarriers[clientPos] = true;
      }

      const client = this.current.clients[clientPos];
      if (client) {
        const teamSize = this.getTeamSize(client.team);
        this.current.awards.push({ time, clientId: client.id, type, teamSize });
      }
    }
  }

  public getTeamSize(ownTeam: Team): TeamSize {
    const size: TeamSize = { own: 0, other: 0 };
    if (this.current) {
      if (ownTeam === Team.RED || ownTeam === Team.BLUE) {
        this.current.joins
          .filter(j => j.endTime === undefined)
          .forEach(j => {
            if (j.team === ownTeam) {
              size.own += 1;
            } else {
              size.other += 1;
            }
          });
      } else if (ownTeam === Team.FREE) {
        size.own = 1;
        size.other = 1;
      }
    }
    return size;
  }
}

// "1FCTF: %i %i %i: %s captured the flag!\n", cl->ps.clientNum, -1, 1, cl->pers.netname
// "1FCTF: %i %i %i: The flag was returned!\n", -1, -1, 2
// "1FCTF: %i %i %i: %s got the flag!\n", cl->ps.clientNum, team, 0, cl->pers.netname
// "1fCTF: %i %i %i: %s fragged %s's flag carrier!\n", attacker->client->ps.clientNum, team, 3, attacker->client->pers.netname, TeamName(team)
// "CTF: %i %i %i: %s captured the %s flag!\n", cl->ps.clientNum, OtherTeam(team), 1, cl->pers.netname, TeamName(OtherTeam(team))
// "CTF: %i %i %i: %s fragged %s's flag carrier!\n", attacker->client->ps.clientNum, team, 3, attacker->client->pers.netname, TeamName(team)
// "CTF: %i %i %i: %s got the %s flag!\n", cl->ps.clientNum, team, 0, cl->pers.netname, TeamName(team)
// "CTF: %i %i %i: %s returned the %s flag!\n", cl->ps.clientNum, team, 2, cl->pers.netname, TeamName(team)
// "CTF: %i %i %i: The %s flag was returned!\n", -1, team, 2, TeamName(team)
// "CTF_ELIMINATION: %i %i %i %i: %s captured the %s flag!\n", level.roundNumber, cl->ps.clientNum, OtherTeam(team), 1, cl->pers.netname, TeamName(OtherTeam(team))
// "CTF_ELIMINATION: %i %i %i %i: %s fragged %s's flag carrier!\n", level.roundNumber, attacker->client->ps.clientNum, team, 3, attacker->client->pers.netname, TeamName(team)
// "CTF_ELIMINATION: %i %i %i %i: %s got the %s flag!\n", level.roundNumber, cl->ps.clientNum, team, 0, cl->pers.netname, TeamName(team)
// "CTF_ELIMINATION: %i %i %i %i: %s returned the %s flag!\n", level.roundNumber, cl->ps.clientNum, team, 2, cl->pers.netname, TeamName(team)
// "CTF_ELIMINATION: %i %i %i %i: %s wins round %i by defending the flag!\n", level.roundNumber, -1, TEAM_BLUE, 5, TeamName(TEAM_BLUE), level.roundNumber
// "CTF_ELIMINATION: %i %i %i %i: %s wins round %i by eleminating the enemy team!\n", level.roundNumber, -1, TEAM_RED, 6, TeamName(TEAM_RED), level.roundNumber
// "CTF_ELIMINATION: %i %i %i %i: %s wins round %i due to more health left!\n", level.roundNumber, -1, TEAM_RED, 8, TeamName(TEAM_RED), level.roundNumber
// "CTF_ELIMINATION: %i %i %i %i: %s wins round %i due to more survivors!\n", level.roundNumber, -1, TEAM_RED, 7, TeamName(TEAM_RED), level.roundNumber
// "CTF_ELIMINATION: %i %i %i %i: Round %i ended in a draw!\n", level.roundNumber, -1, -1, 9, level.roundNumber
// "CTF_ELIMINATION: %i %i %i %i: Round %i has started!\n", level.roundNumber, -1, -1, 4, level.roundNumber
// "CTF_ELIMINATION: %i %i %i %i: The %s flag was returned!\n", level.roundNumber, -1, team, 2, TeamName(team)
// "DD: %i %i %i: %s scores!\n", -1, TEAM_RED, 2, TeamName(TEAM_RED)
// "DD: %i %i %i: %s took point A for %s!\n", cl->ps.clientNum, clientTeam, 0, cl->pers.netname, TeamName(clientTeam)
// "DOM: %i %i %i %i: %s holds point %s for 1 point!\n", -1, i, 1, level.pointStatusDom[i], TeamName(level.pointStatusDom[i]), level.domination_points_names[i]
// "DOM: %i %i %i %i: %s takes point %s!\n", clientnumber,i,0,team, TeamName(team),level.domination_points_names[i]
// "ELIMINATION: %i %i %i: %s wins round %i by eleminating the enemy team!\n", level.roundNumber, TEAM_RED, 1, TeamName(TEAM_RED), level.roundNumber
// "ELIMINATION: %i %i %i: %s wins round %i due to more health left!\n", level.roundNumber, TEAM_RED, 3, TeamName(TEAM_RED), level.roundNumber
// "ELIMINATION: %i %i %i: %s wins round %i due to more survivors!\n", level.roundNumber, TEAM_RED, 2, TeamName(TEAM_RED), level.roundNumber
// "ELIMINATION: %i %i %i: Round %i ended in a draw!\n", level.roundNumber, -1, 4, level.roundNumber
// "ELIMINATION: %i %i %i: Round %i has started!\n", level.roundNumber, -1, 0, level.roundNumber
// "HARVESTER: %i %i %i %i %i: %s brought in %i skull%s for %s\n",other->client->ps.clientNum,other->client->sess.sessionTeam,0,-1,tokens,other->client->pers.netname,tokens, tokens>1 ? "s" : "", TeamName(other->client->sess.sessionTeam)
// "HARVESTER: %i %i %i %i %i: %s destroyed a skull.\n,",cl->ps.clientNum,cl->sess.sessionTeam,2,-1,1,cl->pers.netname
// "HARVESTER: %i %i %i %i %i: %s fragged %s (%s) who had %i skulls.\n",
// "HARVESTER: %i %i %i %i %i: %s picked up a skull.\n",cl->pers.netname
// "LMS: %i %i %i: Player \"%s^7\" eliminated!\n", level.roundNumber, index, 1, client->pers.netname
// "LMS: %i %i %i: Round %i has started!\n", level.roundNumber, -1, 0, level.roundNumber
// "OBELISK: %i %i %i %i: %s dealt %i damage to the enemy obelisk.\n",attacker->client->ps.clientNum,attacker->client->sess.sessionTeam,1,actualDamage,attacker->client->pers.netname,actualDamage
// "OBELISK: %i %i %i %i: %s destroyed the enemy obelisk.\n",attacker->client->ps.clientNum,attacker->client->sess.sessionTeam,3,0,attacker->client->pers.netname
