import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { pathExists, writeFile } from 'fs-extra';
import { join } from 'path';
import { OpenArenaOptions } from './models/open-arena-options';
import { GameType } from './models/constants';


// let i = 0;
// setInterval(() => console.log(++i), 5000);

export class OpenArenaProcess {
    public gameMode = 'baseoa';
    public settingsCfgName = 'settings.cfg';
    public initCfgName = 'server1.cfg';

    public settings: OpenArenaOptions = {
        dedicated: 1
    };

    private child: ChildProcess | undefined;

    constructor(private gameDir: string, private homeDir?: string) {
    }

    public async start() {
        const binFile = join(this.gameDir, this.getBinName());
        const initCfgFile = join(this.gameDir, this.gameMode, this.initCfgName);
        const settingsCfgFile = join(this.gameDir, this.gameMode, this.settingsCfgName);

        if (!await pathExists(binFile)) {
            throw new Error(`OpenArena binary '${binFile}' does not exist!`);
        }
        if (!await pathExists(initCfgFile)) {
            throw new Error(`initial configuration file '${initCfgFile}' not found`);
        }

        // write settings file
        const settingsStr = this.getSettingsString();
        await writeFile(settingsCfgFile, settingsStr, { encoding: 'utf8' });

        // build options
        const opts: SpawnOptions = {
            cwd: this.gameDir
        };
        // build args
        const args: string[] = [];

        if (this.homeDir) {
            if (await pathExists(this.homeDir)) {
                args.push('+set', 'fs_homepath', this.homeDir);
            } else {
                console.warn(`Home directory '${this.homeDir}' does not exist!`);
            }
        }

        args.push(
            '+exec', this.settingsCfgName,
            '+exec', this.initCfgName
        );

        console.log(binFile + ' ' + args.join(' '));

        let tries = 0;
        const next = () => {
            tries += 1;
            if (tries < 10) {
                console.log(`Trying to start OpenArena (try ${tries})`);
                this.child = this.spawn(binFile, args, opts);
                this.child.on('close', () => {
                    this.child = undefined;
                    next();
                });
            }
        };
        next();
    }

    public send(command: string) {
        this.child && this.child.stdin.write(command);
    }

    private spawn(binFile: string, args: string[], opts: SpawnOptions): ChildProcess {
        const p = spawn(binFile, args, opts);

        p.stderr.setEncoding('utf8');
        p.stdout.on('data', data => console.log(`stdout: ${data.length}`));
        p.stderr.on('data', data => console.log(data.toString()));
        p.on('close', (code) => console.log(`OpenArena exited with code ${code}`));

        return p;
    }

    private getBinName() {
        const os = `${process.platform}-${process.arch}`;
        switch (os) {
            case 'linux-x32':
                return 'oa_ded.i386';
            case 'linux-x64':
                return 'oa_ded.x86_64';
            case 'win32-x32':
            case 'win32-x64':
                return 'oa_ded.exe';
            default:
                throw new Error(`Unsupported operation system '${os}'`);
        }
    }

    private getSettingsString(): string {
        return Object.keys(this.settings)
            .filter(n => (this.settings as any)[n])
            .map(n => `set ${n} "${(this.settings as any)[n]}"`)
            .join('\n');
    }
}
