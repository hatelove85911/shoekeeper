const PouchDB = require('pouchdb').default;
PouchDB.plugin(require('pouchdb-authentication'));

const localDB = new PouchDB()
const remoteDB = new PouchDB();
// remoteDb.login(username, password).then(function () {
//     localDb.sync(remoteDb, {live: true, retry: true, /* other sync options */});
//   });
localDB.sync(remoteDB);

export {localDB, remoteDB}