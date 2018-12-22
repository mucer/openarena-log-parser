import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { pathExists, writeFile } from 'fs-extra';
import { join } from 'path';
import { OpenArenaSettings } from './open-arena-settings';


let i = 0;
setInterval(() => console.log(++i), 5000);

export class OpenArenaProcess {
    gameMode = 'baseoa';
    settingsCfgName = 'settings.cfg';
    initCfgName = 'server1.cfg';

    settings: OpenArenaSettings = {
        dedicated: 1
    }

    private child: ChildProcess | undefined;

    constructor(private gameDir: string, private homeDir?: string) {
    }

    async start() {
        const binFile = join(this.gameDir, this.getBinName());
        const initCfgFile = join(this.gameDir, this.gameMode, this.initCfgName);
        const settingsCfgFile = join(this.gameDir, this.gameMode, this.settingsCfgName);

        if (!await pathExists(binFile)) {
            throw new Error(`OpenArena binary '${initCfgFile}' does not exist!`);
        }
        if (!await pathExists(initCfgFile)) {
            throw new Error(`initial configuration file '${initCfgFile}' not found`);
        }

        // write settings file
        const settingsStr = this.getSettingsString();
        await writeFile(settingsCfgFile, settingsStr, { encoding: 'utf8' });

        // build options
        const opts: SpawnOptions = {
            cwd: this.gameDir,
            shell: true
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

    send(command: string) {
        this.child && this.child.stdin.write(command);
    }

    private spawn(binFile: string, args: string[], opts: SpawnOptions): ChildProcess {
        const p = spawn(binFile, args, opts);

        // p.stderr.setEncoding('utf8');

        // p.stdout.on('data', data => console.log(`stdout: ${data.length}`));
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
            .filter(n => this.settings[n])
            .map(n => `set ${n} "${this.settings[n]}"`)
            .join('\n');
    }
}
