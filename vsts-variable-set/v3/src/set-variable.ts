/**
 * Pure utility functions for the Variable Set task.
 * These are extracted for testability — no dependency on azure-pipelines-task-lib.
 */

export interface SetVariableResult {
    action: 'setBuildNumber' | 'setReleaseName' | 'setVariable';
    variable: string;
    value: string;
    isSecret: boolean;
    isOutput: boolean;
    useTaskLib: boolean;
}

export function determineAction(
    variable: string,
    useSetVariableForReleaseName: boolean,
): 'setBuildNumber' | 'setReleaseName' | 'setVariable' {
    if (variable.search(/^Build[._]BuildNumber$/i) >= 0) {
        return 'setBuildNumber';
    }
    if (!useSetVariableForReleaseName && variable.search(/^release[._]releasename$/i) >= 0) {
        return 'setReleaseName';
    }
    return 'setVariable';
}

export function formatVsoCommand(result: SetVariableResult): string {
    switch (result.action) {
        case 'setBuildNumber':
            return `##vso[build.updatebuildnumber]${result.value}`;
        case 'setReleaseName':
            return `##vso[release.updatereleasename]${result.value}`;
        case 'setVariable':
            return `##vso[task.setvariable variable=${result.variable};isSecret=${result.isSecret ? 'true' : 'false'};isOutput=${result.isOutput ? 'true' : 'false'};]${result.value}`;
    }
}
