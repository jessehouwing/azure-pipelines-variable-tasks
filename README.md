# Release Notes
> **23-01-2018**
> - Changed: Re-implemented Variable-Set in v3 PowerShell handler for better performance.
> - Fixed: Pad-left and Pad-right now uses core-js library.
> - Updated: moved to latest Task SDK and dependencies.
 
> **17-11-2017**
> - Fixed: Set Build.BuldNumber doesn't work on most recent Windows Build agents. Updated to VSTS-Task-Lib 2.1.0 to fix.

> **1-9-2016**
> - Fixed: Expand Variable Task throws an error on Agent 2.x, you can now remove this task, it is no longer needed.
The new agent will automatically expand all variables.

> **20-5-2016**
> - Removed: Preview flag

> **19-5-2016**
> - Fixed: Replace with "" would result in "nullOriginalValue"


# Description

This Extension contains a slowly growing collection of tasks that help you manipulate and (soon) validate the values of build variables.

# Set Variable
Have you ever wanted to change the value of a variable between multiple build steps? Simply add the **Set Variable** task to your workflow and tell it which value you want to assign to which variable.

You can use the value of other build variables to setup the value.

> **Set: 'Build.DropLocation' to '\\\\share\drops\$(Build.DefinitionName)\$(Build.BuildNumber)'** 
> 
> * *Variablename*: `Build.DropLocation`
> * *Value*: `\\share\drops\$(Build.DefinitionName)\$(Build.BuildNumber)`

By assigning to the `Build.BuildNumber` variable, the build number of the Build will be updated/overwritten.

# Transform value and assign to Variable
If you need to do more advanced transformations of your values, use the transform task. You can use it to encode/decode the value and apply a number of simpe string manipulations, including Search & Replace, Change Case, Trim, Pad etc.

You can use the value of other build variables to setup the value.

> **Transform: 'your value here' and assign to Variable: VariableName'** 
> 
> * *Input Value*: `\\share\drops\$(Build.DefinitionName)\$(Build.BuildNumber)`
> * *Variablename*: `Build.DropLocation`

By assigning to the `Build.BuildNumber` variable, the build number of the Build will be updated/overwritten.

You can apply the following manipulations (they'll be exectuted in the specified order):

> **Manipulation** 
> 
> * [x] *Search & Replace*
>  * Use: `Basic`
>  * Search: `$Build.DefinitionName`
>  * Replacement: `%%Placeholder%%`
> * [x] Trim
> * [ ] Slice
> * [ ] Substring
> * [ ] Change Case
> * [ ] Pad

And finally you can transform (encode/decode) the string using:

> * Base64
> * Uri
> * UriComponent
> * AddSlashes / StripSlashes

# Expand Variables [DEPRECATED]
Have you ever wanted to use the value from one variable in another variable? Unfortunately, that's not possible with the standard Variables screen.

| Variable             | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| Build.DropLocation   | \\\\share\drops\$(Build.DefinitionName)\$(Build.BuildNumber) |

Will simply send the literal text to the tasks in your workflow.

Add the Expand Variable(s) task to the top of your build steps and it will take care of the expansion for you. It even supportes multiple levels of nested variables!

> **Expand variable: 'Build.DropLocation'**
>
> * *Variablename(s)*: `Build.DropLocation`

Will expand your drop location variable to:

| Variable             | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| Build.DropLocation   | \\\\share\drops\My Definition\My Definition_1.2.123          |

And to make your life easier it now supports simply expanding all your variables!

> **Expand variable: '*'**
>
> * *Variablename(s)*: `*`


# Documentation

Please check the [Wiki](https://github.com/jessehouwing/vsts-variable-tasks/wiki).

If you like this extension, please leave a review and feedback. If you'd have suggestions or an issue, please [file an issue to give me a chance to fix it](https://github.com/jessehouwing/vsts-variable-tasks/issues).
