import tl = require("vsts-task-lib/task");

const variable = tl.getInput("VariableName", true);
const value = tl.getInput("Value");

const ifVariable = tl.getInput("IfVariable");
const ifValueRegex = tl.getInput("IfValueRegex");

if (validateIfStatement(ifVariable, ifValueRegex)) {

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

function validateIfStatement(ifVar, valueRegex) {

    if (ifVar === "") {
        return true;
    }

    var expr = new RegExp(valueRegex);
    return expr.test(ifVar);
}
