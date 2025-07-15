import * as tl from "azure-pipelines-task-lib/task";

const variable = tl.getInput("VariableName", true);

function formatDateTime(format: string): string {
    const now = new Date();
    
    // Simple and robust approach - only support explicit multi-character patterns
    // This avoids conflicts with single characters in normal text
    let formatted = format;
    
    // Year patterns
    formatted = formatted.replace(/yyyy/g, now.getFullYear().toString());
    formatted = formatted.replace(/yy/g, now.getFullYear().toString().slice(-2));
    
    // Month patterns (2-digit and single digit with leading zero requirement)
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    formatted = formatted.replace(/MM/g, month);
    
    // Day patterns
    const day = now.getDate().toString().padStart(2, '0');
    formatted = formatted.replace(/dd/g, day);
    
    // Hour 24-hour patterns
    const hour = now.getHours().toString().padStart(2, '0');
    formatted = formatted.replace(/HH/g, hour);
    
    // Hour 12-hour patterns  
    const hour12 = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    formatted = formatted.replace(/hh/g, hour12);
    
    // Minute patterns
    const minute = now.getMinutes().toString().padStart(2, '0');
    formatted = formatted.replace(/mm/g, minute);
    
    // Second patterns
    const second = now.getSeconds().toString().padStart(2, '0');
    formatted = formatted.replace(/ss/g, second);
    
    // AM/PM patterns
    formatted = formatted.replace(/tt/g, now.getHours() >= 12 ? 'PM' : 'AM');
    
    return formatted;
}

function getValue()
{
    const from = tl.getInput("From") || "value";
    switch (from)
    {
        case "value":
        {
            return tl.getInput("Value");
        }
        case "env":
        {
            return process.env[tl.getInput("Env", true)];
        }
        case "datetime":
        {
            const format = tl.getInput("DateTimeFormat", true) || "yyyy-MM-dd HH:mm:ss";
            return formatDateTime(format);
        }
        default:
        {
            return "";
        }
    }
}

const value = getValue()
const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;
const useSetVariableForReleaseName = tl.getBoolInput("useSetVariableForReleaseName") || false;
const isOutput = tl.getBoolInput("isOutput") || false;

if (variable.search(/^Build[._]BuildNumber$/i) >= 0) {
    if (useTaskLib) {
        tl.updateBuildNumber(value);
    } else {
        console.log(`##vso[build.updatebuildnumber]${value}`);
    }
    
    console.log(`Set buildnumber to: ${value}`);
    tl.setResult(tl.TaskResult.Succeeded, `Set buildnumber to: ${value}`);
} else if (!useSetVariableForReleaseName && variable.search(/^release[._]releasename$/i) >= 0) {
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
        const newValue=tl.getVariable(variable);
        console.log(`Set ${variable} to: ${newValue}`);
    } else {
        console.log(`##vso[task.setvariable variable=${variable};isSecret=${ isSecret ? 'true' : 'false' };isOutput=${ isOutput ? 'true' : 'false' };]${value}`);
    }
    
    tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
}
