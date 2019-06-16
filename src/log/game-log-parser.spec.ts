import { ClientOptions } from "../models/client-options";
import { AwardType, GameType, MeanOfDeath, ChallengeType } from "../models/constants";
import { GameLogParser } from "./game-log-parser";
import expect = require("expect");
import { Game } from "../models/game";
import { Award } from "../models/award";
import { GameResult } from "../models/game-result";
import { Kill } from "../models/kill";

describe('GameLogParser', () => {
    let parser: GameLogParser;

    beforeEach(() => {
        parser = new GameLogParser();
    });

    it('should start without current game', () => {
        // given

        // when

        // then
        expect(parser.getCurrent()).not.toBeDefined();
        expect(parser.getIgnoredCommands()).toEqual([]);
    });

    it('should ignore empty lines and comments', () => {
        // given

        // when
        parser.parse('', undefined as any, null as any, '-- comment');

        // then
        expect(parser.getCurrent()).toBeUndefined();
        expect(parser.getIgnoredCommands()).toEqual([]);
    });

    it('should log ignored commands (once)', () => {
        // given

        // when
        parser.parse('MYCMD: asdf', 'MYCMD2: asdf', 'MYCMD: asdf');

        // then
        expect(parser.getCurrent()).toBeUndefined();
        expect(parser.getIgnoredCommands()).toEqual(['MYCMD', 'MYCMD2']);
    });

    it('should ignored invalid lines', () => {
        // given

        // when
        parser.parse('a', 'b');

        // then
        expect(parser.getCurrent()).toBeUndefined();
        expect(parser.getIgnoredCommands()).toEqual([]);
    });

    describe('with running game', () => {
        let game: Game;

        beforeEach(() => {
            parser.parse('InitGame: \\g_gametype\\' + GameType.CTF);
            game = parser.getCurrent() as Game;
        });

        it('should start new game', () => {
            // then
            expect(game).toBeDefined();
            expect(game.options.gameType).toBe(GameType.CTF);
            expect(game.clients.length).toBe(0);
            expect(game.startTime).toBeDefined();
            expect(parser.getGames().length).toBe(1);
        });

        it('should shutdown game', () => {
            // when
            parser.parse('ShutdownGame:');

            // then
            expect(parser.getCurrent()).toBeUndefined();
            expect(parser.getGames().length).toBe(1);
        });

        it('should read time from line and write duration', () => {
            // when
            parser.parse(' 01:15 ShutdownGame:');

            // then
            expect(game.duration).toBe(75);
        });

        describe('with client', () => {
            let client: ClientOptions;

            beforeEach(() => {
                parser.parse(' 0:15 ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1\\model\\X');
                client = game.clients[0]!;
            });

            it('should add client and join', () => {
                // then
                expect(game.duration).toBe(15);
                expect(game.clients.length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.id).toBe('A');
                expect(client.model).toBe('X');
                expect(game.joins.length).toBe(1);
                const join = game.joins[0];
                expect(join.clientId).toBe('A');
                expect(join.name).toBe('Name1');
                expect(join.team).toBe(1);
                expect(join.startTime).toBe(15);
                expect(join.endTime).toBeUndefined();
            });

            it('should update client and add join when name changes', () => {
                // when
                parser.parse(' 0:20 ClientUserinfoChanged: 0 n\\Name2\\id\\A\\t\\1\\model\\X');

                // then
                expect(game.duration).toBe(20);
                expect(game.clients.length).toBe(1);
                expect(client.name).toBe('Name2');
                expect(client.team).toBe(1);
                expect(client.model).toBe('X');
                expect(game.joins.length).toBe(2);
                const join1 = game.joins[0];
                const join2 = game.joins[1];
                expect(join1.clientId).toBe('A');
                expect(join1.name).toBe('Name1');
                expect(join1.team).toBe(1);
                expect(join1.startTime).toBe(15);
                expect(join1.endTime).toBe(20);
                expect(join2.clientId).toBe('A');
                expect(join2.name).toBe('Name2');
                expect(join2.team).toBe(1);
                expect(join2.startTime).toBe(20);
                expect(join2.endTime).toBeUndefined();
            });

            it('should update client and add join when team changes', () => {
                // when
                parser.parse(' 0:30 ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\2\\model\\X');

                // then
                expect(game.duration).toBe(30);
                expect(game.clients.length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.team).toBe(2);
                expect(client.model).toBe('X');
                expect(game.joins.length).toBe(2);
                const join1 = game.joins[0];
                const join2 = game.joins[1];
                expect(join1.clientId).toBe('A');
                expect(join1.name).toBe('Name1');
                expect(join1.team).toBe(1);
                expect(join1.startTime).toBe(15);
                expect(join1.endTime).toBe(30);
                expect(join2.clientId).toBe('A');
                expect(join2.name).toBe('Name1');
                expect(join2.team).toBe(2);
                expect(join2.startTime).toBe(30);
                expect(join2.endTime).toBeUndefined();
            });

            it('should not add join when no relevant info changed', () => {
                // when
                parser.parse(' 0:40 ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1\\model\\Y');

                // then
                expect(game.duration).toBe(40);
                expect(game.clients.length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.team).toBe(1);
                expect(client.model).toBe('Y');
                expect(game.joins.length).toBe(1);
                const join = game.joins[0];
                expect(join.clientId).toBe('A');
                expect(join.name).toBe('Name1');
                expect(join.team).toBe(1);
                expect(join.startTime).toBe(15);
                expect(join.endTime).toBeUndefined();
            });

            it('should add second client', () => {
                // when
                parser.parse('ClientUserinfoChanged: 1 n\\Name2');

                // then
                expect(game.clients.length).toBe(2);
                expect(client.name).toBe('Name1');
                expect(game.clients[1]!.name).toBe('Name2');
            });

            it('should remove client', () => {
                // when
                parser.parse('ClientDisconnect: 0');

                // then
                expect(game.clients.length).toBe(1);
                expect(game.clients[0]).toBeUndefined();
            });

            it('should add kill', () => {
                // when 
                parser.parse(' 0:50 Kill: 0 0 20: Name1 killed DL by MOD_SUICIDE');

                // then
                expect(game.duration).toBe(50);
                expect(game.kills.length).toBe(1);
                const kill: Kill = game.kills[0];
                expect(kill.fromId).toBe('A');
                expect(kill.toId).toBe('A');
                expect(kill.cause).toBe(MeanOfDeath.SUICIDE);
                expect(kill.time).toBe(50);
            });

            it('should add award', () => {
                // when
                parser.parse(' 0:51 Award: 0 4: Name1 gained the CAPTURE award!');

                // then
                expect(game.awards.length).toBe(1);
                const award: Award = game.awards[0];
                expect(award.clientId).toBe('A');
                expect(award.type).toBe(AwardType.CAPTURE);
                expect(award.time).toBe(51);
            });

            it('should add CTF award', () => {
                // when
                parser.parse(' 8:59 CTF: 0 1 1: Name1 captured the RED flag!');

                // then
                expect(game.awards.length).toBe(1);
            });

            it('should add challenge', () => {
                // when
                parser.parse(' 0:52 Challenge: 0 205 1: Name1 got award 205');

                // then
                expect(game.challenges.length).toBe(1);
                const challenge = game.challenges[0];
                expect(challenge.clientId).toBe('A');
                expect(challenge.type).toBe(ChallengeType.WEAPON_ROCKET_KILLS);
                expect(challenge.time).toBe(52);
            });

            it('should set player score', () => {
                // when
                parser.parse('PlayerScore: 0 1: Name1 now has 1 points');

                // then
                expect(game.score['A']).toBe(1);
            });

            it('should set negative player score', () => {
                // when
                parser.parse('PlayerScore: 0 -1: Name1 now has -1 points');

                // then
                expect(game.score['A']).toBe(-1);
            });

            it('should exit', () => {
                // when
                parser.parse('Exit: Capturelimit hit.',
                    'red:0  blue:3');

                // then
                const result = game.result as GameResult;
                expect(result).toBeDefined();
                expect(result.reason).toBe('Capturelimit hit.');
                expect(result.red).toBe(0);
                expect(result.blue).toBe(3);
            });
        });

        describe('points', () => {
            beforeEach(() => {
                // total 5 players
                // 0,1,2 in team 1
                // 3,4 in team 2
                parser.parse('ClientUserinfoChanged: 0 n\\Name 0\\id\\0\\t\\1');
                parser.parse('ClientUserinfoChanged: 1 n\\Name 1\\id\\1\\t\\1');
                parser.parse('ClientUserinfoChanged: 2 n\\Name 2\\id\\2\\t\\1');
                parser.parse('ClientUserinfoChanged: 3 n\\Name 3\\id\\3\\t\\2');
                parser.parse('ClientUserinfoChanged: 4 n\\Name 4\\id\\4\\t\\2');
            });

            it('should add points for a kill', () => {
                // when
                parser.parse(`Kill: 0 3 ${MeanOfDeath.ROCKET}`);

                // then
                expect(game.points['0']).toEqual(1);
            });

            it('should remove point for suicide', () => {
                // given
                game.points['0'] = 10;

                // when
                parser.parse(`Kill: 0 0 ${MeanOfDeath.SUICIDE}`);

                // then
                expect(game.points['0']).toEqual(9);
            });

            it('should remove point for team kill', () => {
                // given
                game.points['0'] = 10;

                // when
                parser.parse(`Kill: 0 1 ${MeanOfDeath.ROCKET}`);

                // then
                expect(game.points['0']).toEqual(9);
            });

            it('should add point for CTF_GET_FLAG', () => {
                // given

                // when
                parser.parse(`CTF: 0 1 ${AwardType.CTF_GET_FLAG - 100}`);
                parser.parse(`CTF: 3 2 ${AwardType.CTF_GET_FLAG - 100}`);

                // then
                expect(game.points['0'] + game.points['3']).toEqual(2);
                expect(game.points['0']).toEqual(4 / 5);
                expect(game.points['3']).toEqual(6 / 5);
            });

            it('should add point for CTF_FLAG_RETURNED', () => {
                // given

                // when
                parser.parse(`CTF: 0 1 ${AwardType.CTF_FLAG_RETURNED - 100}`);
                parser.parse(`CTF: 3 2 ${AwardType.CTF_FLAG_RETURNED - 100}`);

                // then
                expect(game.points['0'] + game.points['3']).toEqual(4);
                expect(game.points['0']).toEqual(2 * 4 / 5);
                expect(game.points['3']).toEqual(2 * 6 / 5);
            });

            it('should add point for CTF_CAPTURE_FLAG', () => {
                // given

                // when
                parser.parse(`CTF: 0 1 ${AwardType.CTF_CAPTURE_FLAG - 100}`);
                parser.parse(`CTF: 3 2 ${AwardType.CTF_CAPTURE_FLAG - 100}`);

                // then
                expect(game.points['0'] + game.points['3']).toEqual(10);
                expect(game.points['0']).toEqual(5 * (4 / 5));
                expect(game.points['3']).toEqual(5 * (6 / 5));
            });
        });
    });
});
