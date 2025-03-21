import * as tl from "azure-pipelines-task-lib/task";

const variable = tl.getInput("VariableName", true);

function getCurrentDate(format: string): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    return new Intl.DateTimeFormat('default', options).format(date).replace(/\//g, '-').replace(/, /g, ' ').replace(/:/g, '-');
}

function getValue() {
    const from = tl.getInput("From") || "value";
    switch (from) {
        case "value":
            return tl.getInput("Value");
        case "env":
            return process.env[tl.getInput("Env", true)];
        case "currentDate":
            return getCurrentDate(tl.getInput("DateFormat", true));
        default:
            return "";
    }
}

const value = getValue();
const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;

if (variable.search(/^Build[._]BuildNumber$/i) >= 0) {
    if (useTaskLib) {
        tl.command("build.updatebuildnumber", null, value);
    } else {
        console.log(`##vso[build.updatebuildnumber]${value}`);
    }
    
    console.log(`Set buildnumber to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set buildnumber to: ${value}`);
} else {
    if (useTaskLib) {
        tl.setVariable(variable, value, isSecret);
    } else {
        console.log(`##vso[task.setvariable variable=${variable};isSecret=${ isSecret ? 'true' : 'false' };]${value}`);
    }
    
    console.log(`Set ${variable} to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
}
