import tl = require("vsts-task-lib/task");

const variable = tl.getInput("VariableName", true);
const value = tl.getInput("Value");

const ifVariable = tl.getInput("IfVariable");
const ifValueRegex = tl.getInput("IfValueRegex");
const alternativeValue = tl.getInput("AlternativeValue");

const applyConstraint = tl.getInput("applyConstraint");
const applyAlternativeValue = tl.getInput("applyAlternativeValue");

if (validateIfStatement(applyConstraint, ifVariable, ifValueRegex)) {
    applyValue(variable, value);
}
else {

    if (applyAlternativeValue.toUpperCase() === "TRUE")
        applyValue(variable, alternativeValue);
}

function validateIfStatement(applyConstraint, ifVar, valueRegex) {

    if (applyConstraint.toUpperCase() === "FALSE") {
        return true;
    }

    var expr = new RegExp(valueRegex);
    return expr.test(ifVar);
}

function applyValue(variable, value) {

    if (variable.search(/^Build[._]BuildNumber$/i) >= 0) {
        tl.command("build.updatebuildnumber", null, value);
        tl._writeLine(`Set buildnumber to: ${value}`);
        tl.setResult(tl.TaskResult.Succeeded, `Set buildnumber to: ${value}`);
    } else {
        tl.setVariable(variable, value);
        tl._writeLine(`Set ${variable} to: ${value}`);
        tl.setResult(tl.TaskResult.Succeeded, `Set ${variable} to: ${value}`);
    }
}
