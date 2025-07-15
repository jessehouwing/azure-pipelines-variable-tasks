import * as tl from "azure-pipelines-task-lib/task";

const variable = tl.getInput("VariableName", true);

function formatDateTime(format: string): string {
    const now = new Date();
    
    // Simple format string replacement
    // Use more specific patterns to avoid conflicts
    let formatted = format;
    
    // Year (4-digit and 2-digit)
    formatted = formatted.replace(/yyyy/g, now.getFullYear().toString());
    formatted = formatted.replace(/yy/g, now.getFullYear().toString().slice(-2));
    
    // Month (2-digit and 1-digit)
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    formatted = formatted.replace(/MM/g, month);
    formatted = formatted.replace(/\bM\b/g, (now.getMonth() + 1).toString());
    
    // Day (2-digit and 1-digit)  
    const day = now.getDate().toString().padStart(2, '0');
    formatted = formatted.replace(/dd/g, day);
    formatted = formatted.replace(/\bd\b/g, now.getDate().toString());
    
    // Hour 24-hour format (2-digit and 1-digit)
    const hour = now.getHours().toString().padStart(2, '0');
    formatted = formatted.replace(/HH/g, hour);
    formatted = formatted.replace(/\bH\b/g, now.getHours().toString());
    
    // Hour 12-hour format (2-digit and 1-digit)
    const hour12 = (now.getHours() % 12 || 12).toString().padStart(2, '0');
    formatted = formatted.replace(/hh/g, hour12);
    formatted = formatted.replace(/\bh\b/g, (now.getHours() % 12 || 12).toString());
    
    // AM/PM
    formatted = formatted.replace(/tt/g, now.getHours() >= 12 ? 'PM' : 'AM');
    formatted = formatted.replace(/\bt\b/g, now.getHours() >= 12 ? 'P' : 'A');
    
    // Minute (2-digit) - handle after hours to avoid conflicts
    const minute = now.getMinutes().toString().padStart(2, '0');
    formatted = formatted.replace(/mm/g, minute);
    
    // Second (2-digit and 1-digit)
    const second = now.getSeconds().toString().padStart(2, '0');
    formatted = formatted.replace(/ss/g, second);
    formatted = formatted.replace(/\bs\b/g, now.getSeconds().toString());
    
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
