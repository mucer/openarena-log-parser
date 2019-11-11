import { ClientOptions } from "../models/client-options";
import { AwardType, GameType, MeanOfDeath, ChallengeType, Team } from "../models/constants";
import { GameLogParser } from "./game-log-parser";
import expect = require("expect");
import { Game } from "../models/game";
import { Award } from "../models/award";
import { GameResult } from "../models/game-result";
import { Kill } from "../models/kill";
import { Join } from "../models/join";
import { Client } from "pg";
import { Challenge } from "../models/challenge";

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



        it('should keep bot id', () => {
            // when
            parser.parse(' 0:30 ClientUserinfoChanged: 0 n\\Name1\\t\\1\\skill\\1');
            parser.parse(' 0:31 ClientUserinfoChanged: 0 n\\Name1\\t\\1\\skill\\1');

            // then
            expect(game.clients).toEqual([{
                name: 'Name1',
                id: 'BOT-SKILL-1-NUM-1',
                skill: 1,
                team: Team.RED
            }] as ClientOptions[]);

            expect(game.joins).toEqual([{
                clientId: 'BOT-SKILL-1-NUM-1',
                name: 'Name1',
                team: Team.RED,
                startTime: 30
            }] as Join[]);
        });

        describe('with client', () => {

            beforeEach(() => {
                parser.parse(' 0:15 ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1\\hc\\100');
            });

            it('should add client and join', () => {
                // then
                expect(game.duration).toBe(15);
                expect(game.clients.length).toBe(1);
                expect(game.clients[0]).toEqual({
                    name: 'Name1',
                    id: 'A',
                    handicap: 100,
                    team: Team.RED
                } as ClientOptions);

                expect(game.joins.length).toBe(1);
                expect(game.joins[0]).toEqual({
                    clientId: 'A',
                    name: 'Name1',
                    team: Team.RED,
                    startTime: 15
                } as Join);

                expect(parser.getTeamSize(Team.RED)).toEqual({
                    own: 1,
                    other: 0
                });

                expect(parser.getTeamSize(Team.BLUE)).toEqual({
                    own: 0,
                    other: 1
                });
            });

            it('should update client and add join when name changes', () => {
                // when
                parser.parse(' 0:20 ClientUserinfoChanged: 0 n\\Name2\\id\\A\\t\\1\\hc\\100');

                // then
                expect(game.duration).toBe(20);
                expect(game.clients.length).toBe(1);
                expect(game.clients[0]).toEqual({
                    name: 'Name2',
                    id: 'A',
                    handicap: 100,
                    team: Team.RED
                } as ClientOptions);

                expect(game.joins.length).toBe(2);

                expect(game.joins[0]).toEqual({
                    clientId: 'A',
                    name: 'Name1',
                    team: Team.RED,
                    startTime: 15,
                    endTime: 20
                } as Join);

                expect(game.joins[1]).toEqual({
                    clientId: 'A',
                    name: 'Name2',
                    team: Team.RED,
                    startTime: 20
                } as Join);

                expect(parser.getTeamSize(Team.RED)).toEqual({
                    own: 1,
                    other: 0
                });

                expect(parser.getTeamSize(Team.BLUE)).toEqual({
                    own: 0,
                    other: 1
                });
            });

            it('should update client and add join when team changes', () => {
                // when
                parser.parse(' 0:30 ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\2\\hc\\100');

                // then
                expect(game.duration).toBe(30);
                expect(game.clients.length).toBe(1);
                expect(game.clients[0]).toEqual({
                    name: 'Name1',
                    id: 'A',
                    handicap: 100,
                    team: Team.BLUE
                } as ClientOptions);

                expect(game.joins.length).toBe(2);

                expect(game.joins).toEqual([
                    {
                        clientId: 'A',
                        name: 'Name1',
                        team: Team.RED,
                        startTime: 15,
                        endTime: 30
                    },
                    {
                        clientId: 'A',
                        name: 'Name1',
                        team: Team.BLUE,
                        startTime: 30
                    }
                ] as Join[]);

                expect(parser.getTeamSize(Team.RED)).toEqual({
                    own: 0,
                    other: 1
                });

                expect(parser.getTeamSize(Team.BLUE)).toEqual({
                    own: 1,
                    other: 0
                });
            });

            it('should not add join when no relevant info changed', () => {
                // when
                parser.parse(' 0:40 ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1\\hc\\50');

                // then
                expect(game.duration).toBe(40);
                expect(game.clients.length).toBe(1);
                expect(game.clients[0]).toEqual({
                    name: 'Name1',
                    id: 'A',
                    handicap: 50,
                    team: Team.RED
                } as ClientOptions);

                expect(game.joins.length).toBe(1);

                expect(game.joins[0]).toEqual({
                    clientId: 'A',
                    name: 'Name1',
                    team: Team.RED,
                    startTime: 15
                } as Join);
            });

            it('should add other clients', () => {
                // when
                parser.parse('ClientUserinfoChanged: 1 n\\Name2\\t\\1\\id\\B');
                parser.parse('ClientUserinfoChanged: 2 n\\Name3\\t\\1\\id\\C');
                parser.parse('ClientUserinfoChanged: 3 n\\Name4\\id\\D');
                parser.parse('ClientUserinfoChanged: 4 n\\Name5\\t\\2\\id\\E');

                // then
                expect(game.clients.length).toBe(5);
                expect(game.clients).toEqual([
                    {
                        name: 'Name1',
                        id: 'A',
                        handicap: 100,
                        team: Team.RED
                    },
                    {
                        name: 'Name2',
                        id: 'B',
                        team: Team.RED
                    },
                    {
                        name: 'Name3',
                        id: 'C',
                        team: Team.RED
                    },
                    {
                        name: 'Name4',
                        id: 'D',
                        team: Team.SPECTATOR
                    },
                    {
                        name: 'Name5',
                        id: 'E',
                        team: Team.BLUE
                    }
                ] as ClientOptions[]);

                expect(parser.getTeamSize(Team.RED)).toEqual({
                    own: 3,
                    other: 1
                });

                expect(parser.getTeamSize(Team.BLUE)).toEqual({
                    own: 1,
                    other: 3
                });
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
                expect(kill).toEqual({
                    fromId: 'A',
                    toId: 'A',
                    cause: MeanOfDeath.SUICIDE,
                    teamKill: true,
                    flagCarrier: false,
                    time: 50,
                    teamSize: { own: 1, other: 0 }
                } as Kill);
            });

            it('should add award', () => {
                // when
                parser.parse(' 0:51 Award: 0 4: Name1 gained the CAPTURE award!');

                // then
                expect(game.awards.length).toBe(1);
                expect(game.awards[0]).toEqual({
                    clientId: 'A',
                    type: AwardType.CAPTURE,
                    time: 51,
                    teamSize: {
                        own: 1,
                        other: 0
                    }
                } as Award);
            });

            it('should add CTF award', () => {
                // when
                parser.parse(' 8:59 CTF: 0 1 1: Name1 captured the RED flag!');

                // then
                expect(game.awards.length).toBe(1);
                expect(game.awards[0]).toEqual({
                    clientId: 'A',
                    type: AwardType.CAPTURE_FLAG,
                    time: 539,
                    teamSize: {
                        own: 1,
                        other: 0
                    }
                } as Award);
            });

            it('should add challenge', () => {
                // when
                parser.parse(' 0:52 Challenge: 0 205 1: Name1 got award 205');

                // then
                expect(game.challenges.length).toBe(1);
                expect(game.challenges[0]).toEqual({
                    clientId: 'A',
                    type: ChallengeType.WEAPON_ROCKET_KILLS,
                    time: 52,
                    teamSize: {
                        own: 1,
                        other: 0
                    }
                } as Challenge);
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
    });
});
