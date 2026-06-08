import * as tl from "azure-pipelines-task-lib/task";
import { encodeStringValue, decodeStringValue, applyManipulations } from "./transformations";

const transformAction = tl.getInput("transformAction", false) || "none";

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

let value = getValue() || "";

const isSecret = tl.getBoolInput("isSecret") || false;
const useTaskLib = tl.getBoolInput("useTasklib") || false;
const variable = tl.getInput("variableName", true);
const useSetVariableForReleaseName = tl.getBoolInput("useSetVariableForReleaseName") || false;
const isOutput = tl.getBoolInput("isOutput") || false;

function getManipulationOptions() {
    const searchReplaceEnabled = tl.getBoolInput("searchReplace", false);
    return {
        searchReplace: searchReplaceEnabled,
        searchReplaceOptions: searchReplaceEnabled ? {
            method: tl.getInput("searchReplaceMethod", true),
            search: tl.getInput("searchValue") || "",
            replacement: tl.getInput("replacementValue") || "",
            regexOptions: tl.getInput("regexOptions", false),
        } : undefined,
        trim: tl.getBoolInput("trim", false),
        slice: tl.getBoolInput("slice", false),
        sliceLeft: tl.getInput("sliceLeft", false),
        sliceRight: tl.getInput("sliceRight", false),
        substring: tl.getBoolInput("substring", false),
        substringType: tl.getInput("substringType", false),
        substringStart: tl.getInput("substringStart", false),
        substringLength: tl.getInput("substringLength", false),
        casing: tl.getBoolInput("casing", false),
        casingType: tl.getInput("casingType", false),
        pad: tl.getBoolInput("pad", false),
        padType: tl.getInput("padType", false),
        padChar: tl.getInput("padChar", false),
        padLength: tl.getInput("padLength", false),
    };
}

if (transformAction !== "none") {
    tl.debug("Transformation selected.");
    const pointInTime = tl.getInput("pointInTime", true);
    if (pointInTime === "beforeManipulation") {
        tl.debug("Applying selected manipulations.");
        const result = applyManipulations(value, getManipulationOptions());
        value = result.value;
        if (result.warning) tl.warning(result.warning);
    }

    tl.debug("Applying selected transformation.");
    const option = tl.getInput("encodeOrDecode", false);
    switch (option) {
        case "encodeString":
            value = encodeStringValue(value, transformAction);
            break;

        case "decodeString":
            value = decodeStringValue(value, transformAction);
            break;
    }

    if (pointInTime === "afterManipulation") {
        tl.debug("Applying selected manipulations.");
        const result = applyManipulations(value, getManipulationOptions());
        value = result.value;
        if (result.warning) tl.warning(result.warning);
    }
} else {
    tl.debug("Applying selected manipulations.");
    const result = applyManipulations(value, getManipulationOptions());
    value = result.value;
    if (result.warning) tl.warning(result.warning);
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
        const newValue = tl.getVariable(variable);
        console.log(`Set ${variable} to: ${newValue}`);
    } else {
        console.log(`##vso[task.setvariable variable=${variable};isSecret=${isSecret ? 'true' : 'false'};isOutput=${isOutput ? 'true' : 'false'};]${value}`);
    }

    tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
}
