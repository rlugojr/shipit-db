/* jshint unused:false */
var registerTask = require('../../lib/register-task');
var getShipit = require('../../lib/get-shipit');
var path = require('path');
var Promise = require('bluebird');
var mkdirp = require('mkdirp');
var db = require('../../lib/db');

module.exports = function (gruntOrShipit) {
  registerTask(gruntOrShipit, 'db-pull', task);

  function task() {
    // dbConfig[from].username = dbConfig[from].username || dbConfig[from].user;
    // dbConfig[to].username = dbConfig[to].username || dbConfig[to].user;

    var shipit = getShipit(gruntOrShipit);
    var helper = db(shipit);
    shipit = helper.init();
    var remoteDumpFilePath = path.join(shipit.sharedPath || shipit.currentPath, helper.dumpFile('remote'));
    var localDumpFilePath = path.join(shipit.config.workspace, helper.dumpFile('remote'));

    var download = function download() {
      return Promise.promisify(mkdirp)(path.dirname(localDumpFilePath)).then(function() {
        return shipit.remoteCopy(remoteDumpFilePath, localDumpFilePath, {
          direction: 'remoteToLocal'
        });
      });
    };

    return helper.dump('remote', remoteDumpFilePath)
    .then(download)
    .then(helper.clean(remoteDumpFilePath, 'remote'))
    .then(helper.load(localDumpFilePath, 'local'))
    .then(helper.clean(localDumpFilePath, 'local'));
  }
};
