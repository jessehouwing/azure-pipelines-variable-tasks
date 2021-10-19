"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tl = require("azure-pipelines-task-lib/task");
const variable = tl.getInput("VariableName", true);
const value = tl.getInput("Value");
const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;
if (variable.search(/^Build[._]BuildNumber$/i) >= 0) {
    if (useTaskLib) {
        tl.command("build.updatebuildnumber", null, value);
    }
    else {
        console.log(`##vso[build.updatebuildnumber]${value}`);
    }
    console.log(`Set buildnumber to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set buildnumber to: ${value}`);
}
else {
    if (useTaskLib) {
        tl.setVariable(variable, value, isSecret);
    }
    else {
        console.log(`##vso[task.setvariable variable=${variable};isSecret=${isSecret ? 'true' : 'false'};]${value}`);
    }
    console.log(`Set ${variable} to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
}
