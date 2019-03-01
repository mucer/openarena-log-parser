import { ClientOptions } from "../models/client-options";
import { AwardType, GameType, MeanOfDeath } from "../models/constants";
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
        let current: Game;

        beforeEach(() => {
            parser.parse('InitGame: \\g_gametype\\' + GameType.CTF);
            current = parser.getCurrent() as Game;
        });

        it('should start new game', () => {
            // then
            expect(current).toBeDefined();
            expect(current.options.gameType).toBe(GameType.CTF);
            expect(current.clients.length).toBe(0);
        });

        it('should shutdown game', () => {
            // when
            parser.parse('ShutdownGame:');

            // then
            expect(parser.getCurrent()).toBeUndefined();
        });

        describe('with client', () => {
            let client: ClientOptions;

            beforeEach(() => {
                parser.parse('ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1\\model\\X');
                client = current.clients[0]!;
            });

            it('should add client and join', () => {
                // then
                expect(current.clients.length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.id).toBe('A');
                expect(client.model).toBe('X');
                expect(current.joins.length).toBe(1);
                const join = current.joins[0];
                expect(join.clientId).toBe('A');
                expect(join.name).toBe('Name1');
                expect(join.team).toBe(1);
                expect(join.endTime).toBeUndefined();
            });

            it('should update client and add join when name changes', () => {
                // when
                parser.parse('ClientUserinfoChanged: 0 n\\Name2\\id\\A\\t\\1\\model\\X');

                // then
                expect(current.clients.length).toBe(1);
                expect(client.name).toBe('Name2');
                expect(client.team).toBe(1);
                expect(client.model).toBe('X');
                expect(current.joins.length).toBe(2);
                const join1 = current.joins[0];
                const join2 = current.joins[1];
                expect(join1.clientId).toBe('A');
                expect(join1.name).toBe('Name1');
                expect(join1.team).toBe(1);
                expect(join1.endTime).toBeDefined();
                expect(join2.clientId).toBe('A');
                expect(join2.name).toBe('Name2');
                expect(join2.team).toBe(1);
                expect(join2.endTime).toBeUndefined();
            });

            it('should update client and add join when team changes', () => {
                // when
                parser.parse('ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\2\\model\\X');

                // then
                expect(current.clients.length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.team).toBe(2);
                expect(client.model).toBe('X');
                expect(current.joins.length).toBe(2);
                const join1 = current.joins[0];
                const join2 = current.joins[1];
                expect(join1.clientId).toBe('A');
                expect(join1.name).toBe('Name1');
                expect(join1.team).toBe(1);
                expect(join1.endTime).toBeDefined();
                expect(join2.clientId).toBe('A');
                expect(join2.name).toBe('Name1');
                expect(join2.team).toBe(2);
                expect(join2.endTime).toBeUndefined();
            });

            it('should not add join when no relevant info changed', () => {
                // when
                parser.parse('ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1\\model\\Y');

                // then
                expect(current.clients.length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.team).toBe(1);
                expect(client.model).toBe('Y');
                expect(current.joins.length).toBe(1);
                const join = current.joins[0];
                expect(join.clientId).toBe('A');
                expect(join.name).toBe('Name1');
                expect(join.team).toBe(1);
                expect(join.endTime).toBeUndefined();
            });

            it('should add second client', () => {
                // when
                parser.parse('ClientUserinfoChanged: 1 n\\Name2');

                // then
                expect(current.clients.length).toBe(2);
                expect(client.name).toBe('Name1');
                expect(current.clients[1]!.name).toBe('Name2');
            });

            it('should remove client', () => {
                // when
                parser.parse('ClientDisconnect: 0');

                // then
                expect(current.clients.length).toBe(1);
                expect(current.clients[0]).toBeUndefined();
            });

            it('should add kill', () => {
                // when 
                parser.parse('Kill: 0 0 20: Name1 killed DL by MOD_SUICIDE');

                // then
                expect(current.kills.length).toBe(1);
                const kill: Kill = current.kills[0];
                expect(kill.fromId).toBe('A');
                expect(kill.toId).toBe('A');
                expect(kill.cause).toBe(MeanOfDeath.SUICIDE);
            });

            it('should add award', () => {
                // when
                parser.parse('Award: 0 4: Name1 gained the CAPTURE award!');

                // then
                expect(current.awards.length).toBe(1);
                const award: Award = current.awards[0];
                expect(award.clientId).toBe('A');
                expect(award.type).toBe(AwardType.CAPTURE);
            });

            it('should exit', () => {
                // when
                parser.parse('Exit: Capturelimit hit.',
                    'red:0  blue:3',
                    'score: 15  ping: 18  client: 0 Name1');

                // then
                const result = current.result as GameResult;
                expect(result).toBeDefined();
                expect(result.reason).toBe('Capturelimit hit.');
                expect(result.score).toEqual({ A: 15 });
                expect(result.red).toBe(0);
                expect(result.blue).toBe(3);
            });
        });
    });
});
