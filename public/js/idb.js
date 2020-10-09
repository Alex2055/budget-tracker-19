let db;
const request = indexedDB.open('budget', 1);
request.onupgradeneeded = function (event) {
    // save a reference to the database 
    const db = event.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// upon a successful 
request.onsuccess = function (event) {
   
    db = event.target.result;

    if (navigator.onLine) {
       saveBalance();
    }
};

request.onerror = function (event) {
    // log error here
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_budget'], 'readwrite');

   
    const moneyObjectStore = transaction.objectStore('new_budget');

    // add record to store with add method
    moneyObjectStore.add(record);
}

function saveBalance() {
    // open a transaction on pending db
    const transaction = db.transaction(['new_budget'], 'readwrite');
  
    // access pending object store
    const moneyObjectStore = transaction.objectStore('new_budget');
  
    // get all records from store and set to a variable
    const getAll = moneyObjectStore.getAll();
  
    getAll.onsuccess = function() {
      // if there was data in indexedDb's store, let's send it to the api server
      if (getAll.result.length > 0) {
        fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['new_budget'], 'readwrite');
            const moneyObjectStore = transaction.objectStore('new_budget');
            // clear all items in your store
            moneyObjectStore.clear();
            alert('All saved money submitted!');
          })
          .catch(err => {
            // set reference to redirect back here
            console.log(err);
          });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener('online', saveBalance);