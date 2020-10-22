﻿import * as tl from "azure-pipelines-task-lib/task";

const variable = tl.getInput("VariableName", true);
const value = tl.getInput("Value");
const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;

if (variable.search(/^Build[._]BuildNumber$/i) >= 0) {
    if (useTaskLib) {
        tl.updateBuildNumber(value);
    } else {
        console.log(`##vso[build.updatebuildnumber]${value}`);
    }
    
    console.log(`Set buildnumber to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set buildnumber to: ${value}`);
} else if (variable.search(/^release[._]releasename$/i) >= 0) {
    if (useTaskLib) {
        
        tl.updateReleaseName(value);
    } else {
        console.log(`##vso[release.updatereleasename]${value}`);
    }
    
    console.log(`Set release name to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set release name to: ${value}`);
} else {
    if (useTaskLib) {
        tl.setVariable(variable, value, isSecret);
    } else {
        console.log(`##vso[task.setvariable variable=${variable};isSecret=${ isSecret ? 'true' : 'false' };]${value}`);
    }
    
    console.log(`Set ${variable} to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
}
