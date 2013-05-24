Grundschrift.Models.Session = persistence.define('Session', {
    paths:'JSONC',
    success:'BOOL'
});

Grundschrift.Models.Session.enableSync(Grundschrift.Models.syncServer + '/sessionChanges');

/**
 * Get the paths of a session.
 * Automatically decompresses the json
 * @param paths
 * @return {*}
 */
Grundschrift.Models.Session.prototype.getPaths = function () {
    var paths = [];
    enyo.forEach(this.paths, function (path) {
        paths.push(Grundschrift.Models.deCompressJson(
            path, Grundschrift.Models.Session.pathColumns
        ));
    });
    return paths;
};

Grundschrift.Models.Session.pathColumns = ['x', 'y', 'timestamp'];

/**
 * Set the paths of a session.
 * Automatically compresses the json
 * @param paths
 * @return {*}
 */
Grundschrift.Models.Session.prototype.setPaths = function (paths) {
    this.paths = [];
    enyo.forEach(paths, function (path) {
        this.paths.push(Grundschrift.Models.compressJson(
            path, Grundschrift.Models.Session.pathColumns
        ));
    }, this);

    this.markDirty('paths');
    return this;
};