[![Build Status](https://jessehouwing.visualstudio.com/DefaultCollection/_apis/public/build/definitions/4fb9b911-ce2e-4020-a507-3ca9adb2c8ac/32/badge)](https://jessehouwing.visualstudio.com/DefaultCollection/vsts-variable-tasks/_build?definitionId=32&_a=completed) [![Join the chat at https://gitter.im/jessehouwing/vsts-variable-tasks](https://badges.gitter.im/jessehouwing/vsts-variable-tasks.svg)](https://gitter.im/jessehouwing/vsts-variable-tasks?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Description

[![Join the chat at https://gitter.im/jessehouwing/vsts-variable-tasks](https://badges.gitter.im/jessehouwing/vsts-variable-tasks.svg)](https://gitter.im/jessehouwing/vsts-variable-tasks?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This Extension contains a slowly growing collection of tasks that help you manipulate and (soon) validate the values of build variables.

# Expand Variables
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

# Preview Notice

These tasks are currently in preview.

# Documentation

Please check the [Wiki](https://github.com/jessehouwing/vsts-variable-tasks/wiki).

If you like this extension, please leave a review and feedback. If you'd have suggestions or an issue, please [file an issue to give me a chance to fix it](https://github.com/jessehouwing/vsts-variable-tasks/issues).
