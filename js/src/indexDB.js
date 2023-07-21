/**
 * indexDB comfig tools
 */
(function () {
    // db config
    dbInfo = {
        dbName: "localDataBase",
        version: 1,
        tableName: 'userOperaData',
    };
    // db operation parameter
    indexDbTools = {
        db: null,
    };

    /**
     * open db
     */
    indexDbTools.openDB = function () {
        var request = window.indexedDB.open(dbInfo.dbName, dbInfo.version);
        request.onsuccess = function (event) {
            indexDbTools.db = event.target.result;
        };
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            indexDbTools.db = db;
            // If not exist, create db
            if (db && !db.objectStoreNames.contains(dbInfo.tableName)) {
                const objectStore = db.createObjectStore(dbInfo.tableName, {
                    autoIncrement: true
                });
                objectStore.createIndex('timeString', 'timeString');
            }
        }
        request.onerror = function () {
            console.log("浏览器不支持indexedDB");
        };
    }

    /**
     * db operation tools
     * @param item content to be recorded
     */
    indexDbTools.addItem = function (item) {
        return new Promise((resolve, reject) => {
            const transaction = indexDbTools.createTransaction(dbInfo.tableName, "readwrite", null, null, null);
            const objectStore = transaction.objectStore(dbInfo.tableName);
            const request = objectStore.add(item);
            request.onerror = function () {
                reject(`indexDB数据库打开失败: ${event.target.error}`);
            };

            request.onsuccess = function () {
                resolve(true);
            };
        });
    }

    /**
     * @public
     * @param {{
     *         storeName,
     *         dbMode,
     *         error,
     *         complete,
     *         abort
     *     }} options
     * @return transaction object
     */
    indexDbTools.createTransaction = function (
        storeName,
        dbMode,
        error,
        complete,
        abort
    ) {
        const trans = indexDbTools.db.transaction(storeName, dbMode);
        // exception handeler
        trans.onerror = error;
        trans.oncomplete = complete;
        trans.onabort = abort;
        return trans;
    }

    /**
     * read db
     */
    indexDbTools.getAllItems = function () {
        return new Promise((resolve, reject) => {
            const transaction = indexDbTools.createTransaction(dbInfo.tableName, "readonly", null, null, null);
            const objectStore = transaction.objectStore(dbInfo.tableName);
            const request = objectStore.getAll();

            request.onerror = function (event) {
                reject(`Error getting items from database: ${event.target.error}`);
            };

            request.onsuccess = function (event) {
                resolve(event.target.result);
            };
        });
    }

    /**
     * export txt
     */
    indexDbTools.exportToFile = function () {
        indexDbTools.getAllItems().then(items => {
            const content = JSON.stringify(items, null, 2);
            const blob = new Blob([content], {
                type: 'text/plain'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'user-opera.txt';
            a.click();
        });
    }
    indexDbTools.openDB();
})();