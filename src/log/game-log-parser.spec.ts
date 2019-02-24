import { ClientOptions } from "../models/client-options";
import { AwardType, GameType, MeanOfDeath } from "../models/constants";
import { GameLogParser } from "./game-log-parser";
import { Award, GameStats, Kill, Result } from "./game-stats";
import * as fs from 'fs';
import * as path from 'path';
import expect = require("expect");

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
        expect(parser.getIgnoredLines().length).toBe(0);
    });

    it('should ignore empty lines and comments', () => {
        // given

        // when
        parser.parse('', undefined as any, null as any, '-- comment');

        // then
        expect(parser.getCurrent()).toBeUndefined();
        expect(parser.getIgnoredLines().length).toBe(0);
    });

    it('should log ignored lines', () => {
        // given

        // when
        parser.parse('a', 'b');

        // then
        expect(parser.getCurrent()).toBeUndefined();
        expect(parser.getIgnoredLines()).toEqual(['a', 'b']);
    });

    describe('with running game', () => {
        let current: GameStats;

        beforeEach(() => {
            parser.parse('InitGame: \\g_gametype\\' + GameType.CTF);
            current = parser.getCurrent() as GameStats;
        });

        it('should start new game', () => {
            // then
            expect(current).toBeDefined();
            expect(current.options.gameType).toBe(GameType.CTF);
            expect(current.getClients().length).toBe(0);
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
                parser.parse('ClientUserinfoChanged: 0 n\\Name1\\id\\A\\t\\1');
                client = current.getClients()[0];
            });

            it('should add client', () => {
                // then
                expect(current.getClients().length).toBe(1);
                expect(client.name).toBe('Name1');
                expect(client.id).toBe('A');
            });

            it('should update client', () => {
                // when
                parser.parse('ClientUserinfoChanged: 0 n\\Name2');

                // then
                expect(current.getClients().length).toBe(1);
                expect(client.name).toBe('Name2');
            });

            it('should add second client', () => {
                // when
                parser.parse('ClientUserinfoChanged: 1 n\\Name2');

                // then
                expect(current.getClients().length).toBe(2);
                expect(client.name).toBe('Name1');
                expect(current.getClients()[1].name).toBe('Name2');
            });

            it('should remove client', () => {
                // when
                parser.parse('ClientDisconnect: 0');

                // then
                expect(current.getClients().length).toBe(0);
            });

            it('should add kill', () => {
                // when 
                parser.parse('Kill: 0 0 20: Name1 killed DL by MOD_SUICIDE');

                // then
                expect(current.getKills().length).toBe(1);
                const kill: Kill = current.getKills()[0];
                expect(kill.fromId).toBe('A');
                expect(kill.toId).toBe('A');
                expect(kill.cause).toBe(MeanOfDeath.SUICIDE);
            });

            it('should add award', () => {
                // when
                parser.parse('Award: 0 4: Name1 gained the CAPTURE award!');

                // then
                expect(current.getAwards().length).toBe(1);
                const award: Award = current.getAwards()[0];
                expect(award.id).toBe('A');
                expect(award.type).toBe(AwardType.CAPTURE);
            });

            it('should set player score', () => {
                // when
                parser.parse('PlayerScore: 0 5: Name1 now has 5 points');

                // then
                expect(current.getScore('A')).toBe(5);
            });

            it('should exit', () => {
                // when
                parser.parse('Exit: Capturelimit hit.',
                    'red:0  blue:3',
                    'score: 15  ping: 18  client: 0 Name1');

                // then
                const result = current.getResult() as Result;
                expect(result).toBeDefined();
                expect(result.reason).toBe('Capturelimit hit.');
                expect(result.clients).toEqual([{ id: 'A', name: 'Name1', score: 15 }]);
                expect(result.red).toBe(0);
                expect(result.blue).toBe(3);
            });
        });
    });
});
