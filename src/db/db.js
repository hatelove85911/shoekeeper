const PouchDB = require('pouchdb').default;
PouchDB.plugin(require('pouchdb-authentication').default);

const dbname = process.env.DBNAME || 'shoekeeper'
// const remotedbname = process.env.REMOTEDBNAME || 'https://junshen:sj198511@shoekeeper.fly.dev/shoekeeper'
const remotedbname = process.env.REMOTEDBNAME || 'https://shoekeeper.fly.dev/shoekeeper'

const localDB = new PouchDB(dbname)
const remoteDB = new PouchDB(remotedbname, {skip_setup: true});
remoteDB.login('shoekeeper2', 'shoekeeper2').then(() => {
    console.log('*** remote db login successfully')
    localDB.sync(remoteDB, {live: true, retry: true, /* other sync options */})
    .on('change', function (change) {
        console.log('*** db sync change', change)
    }).on('paused', function (info) {
        console.log('*** db sync paused', info)
    }).on('active', function (info) {
        console.log('*** db sync active', info)
    }).on('complete', function (info) {
        console.log('*** db sync complete', info)
    }).on('error', function (err) {
        console.error('*** db sync error', err)
    });
})
// remoteDB.signup("xx", "yy").then(function () {
    // localDB.sync(remoteDB, {live: true, retry: true, /* other sync options */});
// });

const enterInventory = (doc) => {
  const docCopy = {
    ...doc,
    status: 'normal'
  }
  console.log('*** enter inventory', doc, docCopy)
  localDB.put(docCopy)
}
const bolt = (doc) => {
  const docCopy = {
    ...doc,
    status: 'bolt'
  }
  console.log('*** bolt item', doc, docCopy)
  localDB.put(docCopy)

}
const sold = (doc, soldPrice) => {
  const docCopy = {
    ...doc,
    status: 'sold',
    soldPrice
  }
  console.log('*** sold item', doc, docCopy)
  localDB.put(docCopy)
}

const deleteItem = (doc) => {
  return localDB.remove(doc)
}

const getAllItems = async () => {
  const result = await localDB.allDocs({
    include_docs: true
  })
  return result.rows.map(row => row.doc)
}

export {localDB, remoteDB, enterInventory, bolt, sold, deleteItem, getAllItems}