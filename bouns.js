var longestCommonPrefix = function(strs) {
    if (strs.length === 0) {
        return "";
    }

    let prefix = strs[0];

    for (let i = 1; i < strs.length; i++) {
        while (!strs[i].startsWith(prefix)) {
            prefix = prefix.slice(0, prefix.length - 1);

            if (prefix === "") {
                return "";
            }
        }
    }

    return prefix;
};

// Example
console.log(longestCommonPrefix(["flower", "flow", "flight"]));