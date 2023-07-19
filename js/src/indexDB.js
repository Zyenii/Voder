/**
 * 前端操作indexDB数据库工具集
 */
(function () {
    // 配置数据库名称，版本号，表名
    dbInfo = {
        dbName: "localDataBase",
        version: 1,
        tableName: 'userOperaData',
    };
    // 维护数据库操作变量
    indexDbTools = {
        db: null,
    };

    /**
     * 打开数据库
     */
    indexDbTools.openDB = function () {
        var request = window.indexedDB.open(dbInfo.dbName, dbInfo.version);
        request.onsuccess = function (event) {
            indexDbTools.db = event.target.result;
        };
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            indexDbTools.db = db;
            // 判断是否已存在数据库，如果不存在，则创建
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
     * 前端操作indexDB数据库工具集
     * @param item 需要记录的数据
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
     * 创建数据库事务
     * @public
     * @param {{
     *         storeName,
     *         dbMode,
     *         error,
     *         complete,
     *         abort
     *     }} options
     * @return 数据库事务对象
     */
    indexDbTools.createTransaction = function (
        storeName,
        dbMode,
        error,
        complete,
        abort
    ) {
        const trans = indexDbTools.db.transaction(storeName, dbMode);
        // 添加异常处理
        trans.onerror = error;
        trans.oncomplete = complete;
        trans.onabort = abort;
        return trans;
    }

    /**
     * 读取前端数据库内容
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
     * 导出为txt文件
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
    // 打开数据库
    indexDbTools.openDB();
})();