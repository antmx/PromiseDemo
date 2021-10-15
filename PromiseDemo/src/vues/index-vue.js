/// <reference path="../services/indexeddbsvc.js" />

/** Vue for index page  */
var indexVue = new Vue({
    el: '#root',

    data: {
        name: 'Vue.js',
        /** @type {indexedDbSvc} */
        idxDbSvc: new indexedDbSvc("DemoDb"),
        dbCreated: false,
        storeSchemas: [
            {
                storeName: "Customer",
                indexes: [
                    { name: "CustomerID", isUnique: true },
                    { name: "CustomerRef", isUnique: true },
                    { name: "Name", isUnique: false },
                    { name: "DOB", isUnique: false }
                ]
            },
            {
                storeName: "Policy",
                indexes: [
                    { name: "PolicyID", isUnique: true },
                    { name: "PolicyRef", isUnique: true },
                    { name: "CustomerID", isUnique: false },
                    { name: "StartDate", isUnique: false },
                    { name: "EndDate", isUnique: false }
                ]
            },
            {
                storeName: "Claim",
                indexes: [
                    { name: "ClaimID", isUnique: true },
                    { name: "ClaimRef", isUnique: true },
                    { name: "PolicyID", isUnique: false },
                    { name: "ClaimDate", isUnique: false }
                ]
            },
            {
                storeName: "Fulfilment",
                indexes: [
                    { name: "FulfilmentID", isUnique: true },
                    { name: "FulfilmentRef", isUnique: true },
                    { name: "ClaimID", isUnique: false },
                    { name: "SupplierID", isUnique: false }
                ]
            },
            {
                storeName: "ClaimStatus",
                indexes: [
                    { name: "ClaimStatusID", isUnique: true },
                    { name: "Name", isUnique: true }
                ]
            },
            {
                storeName: "Supplier",
                indexes: [
                    { name: "SupplierID", isUnique: true },
                    { name: "Name", isUnique: true }
                ]
            }
        ],
        storeNames: [],
        activeStoreName: null,
        storeData: [],
        dummyData: [
            ["Customer", [
                { CustomerID: 1, CustomerRef: "CUST001", Name: "A Test" },
                { CustomerID: 2, CustomerRef: "CUST002", Name: "B Test" },
                { CustomerID: 3, CustomerRef: "CUST003", Name: "C Test" },
                { CustomerID: 4, CustomerRef: "CUST004", Name: "D Test" },
                { CustomerID: 5, CustomerRef: "CUST005", Name: "E Test" }
            ]],
            ["Policy", [
                { PolicyID: 1, PolicyRef: "POL001", CustomerID: 1 },
                { PolicyID: 2, PolicyRef: "POL002", CustomerID: 2 },
                { PolicyID: 3, PolicyRef: "POL003", CustomerID: 3 },
                { PolicyID: 4, PolicyRef: "POL004", CustomerID: 4 },
                { PolicyID: 5, PolicyRef: "POL005", CustomerID: 5 },
                { PolicyID: 6, PolicyRef: "POL006", CustomerID: 1 }
            ]],
            ["Claim", [
                { ClaimID: 1, ClaimRef: "CL001", PolicyID: 1, ClaimStatusID: 3 },
                { ClaimID: 2, ClaimRef: "CL002", PolicyID: 2, ClaimStatusID: 1 },
                { ClaimID: 3, ClaimRef: "CL003", PolicyID: 3, ClaimStatusID: 2 },
                { ClaimID: 4, ClaimRef: "CL004", PolicyID: 1, ClaimStatusID: 2 }
            ]],
            ["Fulfilment", [
                { FulfilmentID: 1, FulfilmentRef: "FF001", ClaimID: 1 },
                { FulfilmentID: 2, FulfilmentRef: "FF002", ClaimID: 2 },
                { FulfilmentID: 3, FulfilmentRef: "FF003", ClaimID: 3 },
                { FulfilmentID: 6, FulfilmentRef: "FF006", ClaimID: 1 }
            ]],
            ["ClaimStatus", [
                { ClaimStatusID: 1, Name: "New" },
                { ClaimStatusID: 2, Name: "In Progress" },
                { ClaimStatusID: 3, Name: "Settled" }
            ]],
            ["Supplier", [
                { SupplierID: 1, Name: "SmartLabs" },
                { SupplierID: 2, Name: "Zalenza" },
                { SupplierID: 3, Name: "CTDI" }
            ]]
        ],
        selectedCustomer: {},
        selectedPolicy: {},
        policies: []
    },

    computed: {
        isStoreSelected: function () {
            return this.activeStoreName != null;
        }
    },

    // define methods under the `methods` object
    methods: {
        createDb: function () {
            const self = this;

            this.idxDbSvc.deleteDatabase()
                .then(function () {
                    self.dbCreated = true;
                    self.storeNames = [];
                    return self.idxDbSvc.createDatabase(1, self.storeSchemas);
                })
                .then(function () {
                    return self.idxDbSvc.storeMany(self.dummyData);
                });
        },

        deleteDb: function () {
            var self = this;

            this.idxDbSvc.deleteDatabase()
                .then(function (foo) {
                    self.dbCreated = false;
                    self.storeNames = [];
                    self.activeStoreName = null;
                    self.storeData = [];
                });
        },

        selectPolicyInfoWithCallbacks: function (policyId) {
            debugger;
            // Shed load of callback functions!
        },

        selectPolicyInfoWithNestedCallbacks: function (policyId) {
            debugger;
            // Pyramid of doom!
        },

        selectPolicyInfoWithPromises: function (policyId) {
            debugger;
        },

        ///**
        // * 
        // * @param {string} storeName
        // */
        //listStoreData: function (storeName) {

        //    var self = this;

        //    this.idxDbSvc.select(storeName || this.activeStoreName)
        //        .then(function (rows) {
        //            self.storeData = rows;
        //        });
        //},

        activateStoreListElem: function (storeName) {

            this.activeStoreName = storeName || this.activeStoreName;
        },

        clearSelectedItems: function () {

            this.selectedCustomer = {};
            this.selectedPolicy = {};
        },

        listPolicies: function () {

            const self = this;

            this.idxDbSvc.select("Policy")
                .then(function (policies) {
                    self.storeData = policies;
                });

        },

        //populateStore: function () {

        //    var dataToStore;

        //    for (var idx = 0; idx < this.dummyData.length; idx++) {
        //        if (this.dummyData[idx][0] == this.activeStoreName) {
        //            dataToStore = [this.dummyData[idx]];
        //            break;
        //        }
        //    }

        //    if (dataToStore == null) {
        //        console.error("Unexpected store name: " + this.activeStoreName);
        //        return;
        //    }

        //    this.idxDbSvc.storeMany(dataToStore);
        //}
    },

    mounted: function () {

        // Will be executed when the DOM is ready
    }
});
