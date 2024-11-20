import * as tl from "azure-pipelines-task-lib/task";
import "core-js";

const transformAction = tl.getInput("transformAction", false) || "none";
let value = tl.getInput("value") || "";
const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;
const variable = tl.getInput("variableName", true);
const useSetVariableForReleaseName = tl.getBoolInput("useSetVariableForReleaseName") || false;
const isOutput = tl.getBoolInput("isOutput") || false;

if (transformAction !== "none") {
    tl.debug("Transformation selected.");
    const pointInTime = tl.getInput("pointInTime", true);
    if (pointInTime === "beforeManipulation") {
        tl.debug("Applying selected manipulations.");
        value = applyManipulations(value);
    }

    tl.debug("Applying selected transformation.");
    const option = tl.getInput("encodeOrDecode", false);
    switch (option) {
        case "encodeString":
            value = encodeString(value);
            break;

        case "decodeString":
            value = decodeString(value);
            break;
    }

    if (pointInTime === "afterManipulation") {
        tl.debug("Applying selected manipulations.");
        value = applyManipulations(value);
    }
} else {
    tl.debug("Applying selected manipulations.");
    value = applyManipulations(value);
}

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
        tl.setVariable(variable, value, isSecret, isOutput);
        const newValue=tl.getVariable(variable);
        console.log(`Set ${variable} to: ${newValue}`);
    } else {
        console.log(`##vso[task.setvariable variable=${variable};isSecret=${ isSecret ? 'true' : 'false' };isOutput=${ isOutput ? 'true' : 'false' };]${value}`);
    }

    tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
}

function applyManipulations(value: string): string {
    if (tl.getBoolInput("searchReplace", false)) {
        tl.debug("Applying selected Search & Replace.");
        value = searchAndReplace(value);
    }

    if (tl.getBoolInput("trim", false)) {
        tl.debug("Applying selected Trim.");
        value = value.trim();
    }

    if (tl.getBoolInput("slice", false)) {
        tl.debug("Applying selected Slice.");
        const left = tl.getInput("sliceLeft", true);
        const right = tl.getInput("sliceRight", true);

        if (right) {
            value = value.slice(+left, +right);
        } else {
            value = value.slice(+left);
        }
    }

    if (tl.getBoolInput("substring", false)) {
        tl.debug("Applying selected Substring.");
        const substringType = tl.getInput("substringType", true);
        let length = 0;

        switch (substringType) {
            case "substring":
            {
                const start = +tl.getInput("substringStart", true);
                length = +tl.getInput("substringLength", false);

                if (length) {
                    value = value.substring(start, length);
                } else {
                    value = value.substring(start);
                }
                break;
            }
            case "left":
                length = +tl.getInput("substringLength", true);
                if (value.length > length) {
                    value = value.substring(0, length);
                }
                break;
            case "right":
                length = +tl.getInput("substringLength", true);
                if (value.length > length) {
                    value = value.substring(value.length - length);
                }
                break;
       }
    }

    if (tl.getBoolInput("casing", false)) {
        tl.debug("Applying selected Change Case.");
        const casingType = tl.getInput("casingType", true);

        switch (casingType) {
            case "toUpper":
                value = value.toUpperCase();
                break;
            case "toLower":
                value = value.toLowerCase();
                break;
        }
    }

    if (tl.getBoolInput("pad", false)) {
        tl.debug("Applying selected Pad.");
        const padType = tl.getInput("padType", true);
        let padCharacter = tl.getInput("padChar", false);
        if (!padCharacter) {
            padCharacter = " ";
        }

        const padLength = +tl.getInput("padLength", true);
        switch (padType) {
            case "left":
                value = value.padStart(padLength, padCharacter);
                break;
            case "right":
                value = value.padEnd(padLength, padCharacter);
                break;
        }
    }

    return value;
}

function searchAndReplace(value: string): string {
    const method = tl.getInput("searchReplaceMethod", true);
    const search = tl.getInput("searchValue") || "";
    const replacement = tl.getInput("replacementValue") || "";

    if (method === "basic") {
        return value.split(search).join(replacement);
    } else {
        const regexOptions = tl.getInput("regexOptions", false);
        let searchExpression: RegExp;

        if (regexOptions) {
            searchExpression = new RegExp(search, regexOptions);
        } else {
            searchExpression = new RegExp(search);
        }

        if (method === "match") {
            const result = value.match(searchExpression);
            if (!result || result.length === 0) {
                tl.warning("Found no matches");
                return "";
            } else {
                return result[0];
            }
        }
        if (method === "regex") {
            return value.replace(searchExpression, replacement);
        }
    }
    return value;
}

function encodeString(value: string): string {
    const method = tl.getInput("transformAction", true);

    switch (method) {
        case "uri":
            return encodeURI(value);
        case "uriComponent":
            return encodeURIComponent(value);
        case "base64":
        {
            const buffer = new Buffer(value);
            return buffer.toString("base64");
        }
        case "slashes":
            return addSlashes(value);
    }

    return "NOT IMPLEMENTED";
}

function decodeString(value: string): string {
    const method = tl.getInput("transformAction", true);

    switch (method) {
        case "uri":
            return decodeURI(value);
        case "uriComponent":
            return decodeURIComponent(value);
        case "base64":
        {
            const buffer = new Buffer(value, "base64");
            return buffer.toString();
        }
        case "slashes":
            return stripSlashes(value);
    }

    return "NOT IMPLEMENTED";
}

function stripSlashes(str: string): string {
    return str.replace(/\\(.?)/g, (s:string, n1:string) => {
        switch (n1) {
            case "\\":
                return "\\";
            case "0":
                return "\u0000";
            case "":
                return "";
            default:
                return n1;
        }
    });
}

function addSlashes(str: string): string {
    return str.replace(/[\\"']/g, "\\$&")
              .replace(/\u0000/g, "\\0");
}
