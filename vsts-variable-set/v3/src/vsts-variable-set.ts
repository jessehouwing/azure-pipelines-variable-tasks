import * as tl from "azure-pipelines-task-lib/task";
import { determineAction, formatVsoCommand } from "./set-variable";

const variable = tl.getInput("VariableName", true);

function getValue(): string | undefined {
    const from = tl.getInput("From") || "value";
    switch (from) {
        case "value":
            return tl.getInput("Value");
        case "env":
        {
            const envName = tl.getInput("Env", true);
            return process.env[envName];
        }
        default:
            return "";
    }
}

const value = getValue();
const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;
const useSetVariableForReleaseName = tl.getBoolInput("useSetVariableForReleaseName") || false;
const isOutput = tl.getBoolInput("isOutput") || false;

const action = determineAction(variable, useSetVariableForReleaseName);

switch (action) {
    case 'setBuildNumber':
        if (useTaskLib) {
            tl.updateBuildNumber(value);
        } else {
            console.log(formatVsoCommand({ action, variable, value, isSecret, isOutput, useTaskLib }));
        }
        console.log(`Set buildnumber to: ${value}`);
        tl.setResult(tl.TaskResult.Succeeded, `Set buildnumber to: ${value}`);
        break;

    case 'setReleaseName':
        if (useTaskLib) {
            tl.updateReleaseName(value);
        } else {
            console.log(formatVsoCommand({ action, variable, value, isSecret, isOutput, useTaskLib }));
        }
        console.log(`Set release name to: ${value}`);
        tl.setResult(tl.TaskResult.Succeeded, `Set release name to: ${value}`);
        break;

    case 'setVariable':
        if (useTaskLib) {
            tl.setVariable(variable, value, isSecret, isOutput);
            const newValue = tl.getVariable(variable);
            console.log(`Set ${variable} to: ${newValue}`);
        } else {
            console.log(formatVsoCommand({ action, variable, value, isSecret, isOutput, useTaskLib }));
        }
        tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
        break;
}
