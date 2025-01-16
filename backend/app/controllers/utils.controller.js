function normalizePath(pathString) {
    // mostly to normalize windows paths to the ones in unix
    return pathString.replace(/\\/g, "/");
}

module.exports = normalizePath;