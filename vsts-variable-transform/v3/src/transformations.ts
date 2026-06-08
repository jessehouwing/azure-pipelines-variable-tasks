/**
 * Pure transformation functions for the Variable Transform task.
 * These are extracted for testability — no dependency on azure-pipelines-task-lib.
 */

export function encodeStringValue(value: string, method: string): string {
    switch (method) {
        case "uri":
            return encodeURI(value);
        case "uriComponent":
            return encodeURIComponent(value);
        case "base64":
        {
            const buffer = Buffer.from(value);
            return buffer.toString("base64");
        }
        case "slashes":
            return addSlashes(value);
    }

    return "NOT IMPLEMENTED";
}

export function decodeStringValue(value: string, method: string): string {
    switch (method) {
        case "uri":
            return decodeURI(value);
        case "uriComponent":
            return decodeURIComponent(value);
        case "base64":
        {
            const buffer = Buffer.from(value, "base64");
            return buffer.toString();
        }
        case "slashes":
            return stripSlashes(value);
    }

    return "NOT IMPLEMENTED";
}

export function stripSlashes(str: string): string {
    return str.replace(/\\(.?)/g, (_s: string, n1: string) => {
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

export function addSlashes(str: string): string {
    return str.replace(/[\\"']/g, "\\$&")
              .replace(/\u0000/g, "\\0");
}

export interface SearchReplaceOptions {
    method: string;
    search: string;
    replacement: string;
    regexOptions?: string;
}

export function searchAndReplace(value: string, options: SearchReplaceOptions): { value: string; warning?: string } {
    const { method, search, replacement, regexOptions } = options;

    if (method === "basic") {
        return { value: value.split(search).join(replacement) };
    } else {
        let searchExpression: RegExp;

        if (regexOptions) {
            searchExpression = new RegExp(search, regexOptions);
        } else {
            searchExpression = new RegExp(search);
        }

        if (method === "match") {
            const result = value.match(searchExpression);
            if (!result || result.length === 0) {
                return { value: "", warning: "Found no matches" };
            } else {
                return { value: result[0] };
            }
        }
        if (method === "regex") {
            return { value: value.replace(searchExpression, replacement) };
        }
    }
    return { value };
}

export interface ManipulationOptions {
    searchReplace?: boolean;
    searchReplaceOptions?: SearchReplaceOptions;
    trim?: boolean;
    slice?: boolean;
    sliceLeft?: string;
    sliceRight?: string;
    substring?: boolean;
    substringType?: string;
    substringStart?: string;
    substringLength?: string;
    casing?: boolean;
    casingType?: string;
    pad?: boolean;
    padType?: string;
    padChar?: string;
    padLength?: string;
}

export function applyManipulations(value: string, options: ManipulationOptions): { value: string; warning?: string } {
    let warning: string | undefined;

    if (options.searchReplace && options.searchReplaceOptions) {
        const result = searchAndReplace(value, options.searchReplaceOptions);
        value = result.value;
        if (result.warning) {
            warning = result.warning;
        }
    }

    if (options.trim) {
        value = value.trim();
    }

    if (options.slice) {
        const left = options.sliceLeft;
        const right = options.sliceRight;

        if (right) {
            value = value.slice(+left, +right);
        } else {
            value = value.slice(+left);
        }
    }

    if (options.substring) {
        const substringType = options.substringType;
        let length: number;

        switch (substringType) {
            case "substring":
            {
                const start = +options.substringStart;
                length = +options.substringLength;

                if (length) {
                    value = value.substring(start, length);
                } else {
                    value = value.substring(start);
                }
                break;
            }
            case "left":
                length = +options.substringLength;
                if (value.length > length) {
                    value = value.substring(0, length);
                }
                break;
            case "right":
                length = +options.substringLength;
                if (value.length > length) {
                    value = value.substring(value.length - length);
                }
                break;
        }
    }

    if (options.casing) {
        const casingType = options.casingType;

        switch (casingType) {
            case "toUpper":
                value = value.toUpperCase();
                break;
            case "toLower":
                value = value.toLowerCase();
                break;
        }
    }

    if (options.pad) {
        const padType = options.padType;
        let padCharacter = options.padChar;
        if (!padCharacter) {
            padCharacter = " ";
        }

        const padLength = +options.padLength;
        switch (padType) {
            case "left":
                value = value.padStart(padLength, padCharacter);
                break;
            case "right":
                value = value.padEnd(padLength, padCharacter);
                break;
        }
    }

    return { value, warning };
}
