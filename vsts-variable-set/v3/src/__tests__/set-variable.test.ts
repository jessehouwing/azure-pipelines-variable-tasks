import { determineAction, formatVsoCommand } from '../set-variable';

describe('determineAction', () => {
    it('should detect Build.BuildNumber', () => {
        expect(determineAction('Build.BuildNumber', false)).toBe('setBuildNumber');
    });

    it('should detect Build_BuildNumber', () => {
        expect(determineAction('Build_BuildNumber', false)).toBe('setBuildNumber');
    });

    it('should detect build.buildnumber case-insensitive', () => {
        expect(determineAction('build.buildnumber', false)).toBe('setBuildNumber');
    });

    it('should detect Release.ReleaseName', () => {
        expect(determineAction('Release.ReleaseName', false)).toBe('setReleaseName');
    });

    it('should detect release_releasename case-insensitive', () => {
        expect(determineAction('release_releasename', false)).toBe('setReleaseName');
    });

    it('should use setVariable when useSetVariableForReleaseName is true', () => {
        expect(determineAction('Release.ReleaseName', true)).toBe('setVariable');
    });

    it('should return setVariable for regular variables', () => {
        expect(determineAction('MyVariable', false)).toBe('setVariable');
    });

    it('should return setVariable for empty-ish variable names', () => {
        expect(determineAction('somevar', false)).toBe('setVariable');
    });
});

describe('formatVsoCommand', () => {
    it('should format build number command', () => {
        const result = formatVsoCommand({
            action: 'setBuildNumber',
            variable: 'Build.BuildNumber',
            value: '1.2.3',
            isSecret: false,
            isOutput: false,
            useTaskLib: false,
        });
        expect(result).toBe('##vso[build.updatebuildnumber]1.2.3');
    });

    it('should format release name command', () => {
        const result = formatVsoCommand({
            action: 'setReleaseName',
            variable: 'Release.ReleaseName',
            value: 'MyRelease',
            isSecret: false,
            isOutput: false,
            useTaskLib: false,
        });
        expect(result).toBe('##vso[release.updatereleasename]MyRelease');
    });

    it('should format set variable command', () => {
        const result = formatVsoCommand({
            action: 'setVariable',
            variable: 'MyVar',
            value: 'hello',
            isSecret: false,
            isOutput: false,
            useTaskLib: false,
        });
        expect(result).toBe('##vso[task.setvariable variable=MyVar;isSecret=false;isOutput=false;]hello');
    });

    it('should format set variable with secret flag', () => {
        const result = formatVsoCommand({
            action: 'setVariable',
            variable: 'SecretVar',
            value: 'secret-value',
            isSecret: true,
            isOutput: false,
            useTaskLib: false,
        });
        expect(result).toBe('##vso[task.setvariable variable=SecretVar;isSecret=true;isOutput=false;]secret-value');
    });

    it('should format set variable with output flag', () => {
        const result = formatVsoCommand({
            action: 'setVariable',
            variable: 'OutputVar',
            value: 'output-value',
            isSecret: false,
            isOutput: true,
            useTaskLib: false,
        });
        expect(result).toBe('##vso[task.setvariable variable=OutputVar;isSecret=false;isOutput=true;]output-value');
    });

    it('should format set variable with both flags', () => {
        const result = formatVsoCommand({
            action: 'setVariable',
            variable: 'BothVar',
            value: 'both',
            isSecret: true,
            isOutput: true,
            useTaskLib: false,
        });
        expect(result).toBe('##vso[task.setvariable variable=BothVar;isSecret=true;isOutput=true;]both');
    });
});
