/// <reference path="../../lib/indexedDbSvc/indexedDbSvc.js" />
/// <reference path="../../lib/linqjs/linqcore.js" />
/// <reference path="../../lib/vuejs/vue.js" />

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
                    { name: "CustomerName", isUnique: false },
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
                    { name: "ClaimStatusName", isUnique: true }
                ]
            },
            {
                storeName: "Supplier",
                indexes: [
                    { name: "SupplierID", isUnique: true },
                    { name: "SupplierName", isUnique: true }
                ]
            }
        ],
        storeNames: [],
        activeStoreName: null,
        storeData: [],
        dummyData: [
            ["Customer", [
                { CustomerID: 1, CustomerRef: "CUST001", CustomerName: "A Test" },
                { CustomerID: 2, CustomerRef: "CUST002", CustomerName: "B Test" },
                //{ CustomerID: 3, CustomerRef: "CUST003", CustomerName: "C Test" },
                //{ CustomerID: 4, CustomerRef: "CUST004", CustomerName: "D Test" },
                //{ CustomerID: 5, CustomerRef: "CUST005", CustomerName: "E Test" }
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
                { FulfilmentID: 1, FulfilmentRef: "FF001", ClaimID: 1, SupplierID: 1 },
                { FulfilmentID: 2, FulfilmentRef: "FF002", ClaimID: 2, SupplierID: 2 },
                { FulfilmentID: 3, FulfilmentRef: "FF003", ClaimID: 3, SupplierID: 3 },
                { FulfilmentID: 6, FulfilmentRef: "FF006", ClaimID: 1, SupplierID: 2 }
            ]],
            ["ClaimStatus", [
                { ClaimStatusID: 1, ClaimStatusName: "New" },
                { ClaimStatusID: 2, ClaimStatusName: "In Progress" },
                { ClaimStatusID: 3, ClaimStatusName: "Settled" }
            ]],
            ["Supplier", [
                { SupplierID: 1, SupplierName: "SmartLabs" },
                { SupplierID: 2, SupplierName: "Zalenza" },
                { SupplierID: 3, SupplierName: "CTDI" }
            ]]
        ],
        selectedCustomer: {},
        selectedPolicy: {},
        policies: [],
        errorMsg: null,
        customerSummaryFormatted: null
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

            const self = this;

            this.idxDbSvc.deleteDatabase()
                .then(function (foo) {
                    self.dbCreated = false;
                    self.storeNames = [];
                    self.activeStoreName = null;
                    self.storeData = [];
                });
        },

        /**
         * Callback hell! 🙁
         */
        selectCustomerInfoWithNamedCallbacks: function (customerId) {

            // Gather Customer, Policy, Claim, ClaimStatus, Fulfilment and Supplier data using callback functions.

            var customerSummary = {
                customer: {},
                policies: [],
                claims: [],
                fulfilments: []
            };

            const self = this;

            /** @type {indexedDbSvc} */
            const idxDbSvc = this.idxDbSvc;

            function errorCallback(error) {
                debugger;
                self.errorMsg = error.message || error;
                console.error(error.message || error);
            }

            idxDbSvc.selectWithCallback(
                "Customer",
                {
                    filterFn: (c) => c.CustomerID == customerId,
                    returnFirstItemOnly: true
                },
                customerCallback,
                errorCallback
            );

            function customerCallback(customer) {

                customerSummary.customer = customer;

                idxDbSvc.selectWithCallback(
                    "Policy",
                    //"MissingTable",
                    { filterFn: (p) => p.CustomerID == customer.CustomerID },
                    policyCallback,
                    errorCallback
                );
            }

            function policyCallback(policies) {

                customerSummary.policies = policies;

                var policyIDs = policies.map(p => p.PolicyID);

                idxDbSvc.selectWithCallback(
                    "Claim",
                    { filterFn: (c) => policyIDs.indexOf(c.PolicyID) > -1 },
                    claimCallback,
                    errorCallback
                );
            }

            function claimCallback(claims) {

                customerSummary.claims = claims;

                /** @type {selectInnerJoinOnArrayOptions} */
                var options = {
                    dbField: "ClaimStatusID",
                    joinArray: claims,
                    arrayField: "ClaimStatusID"
                };

                idxDbSvc.selectInnerJoinOnArrayWithCallback(
                    "ClaimStatus",
                    options,
                    claimStatusCallback,
                    errorCallback
                );
            }

            function claimStatusCallback(claimsWithClaimStatuses) {

                customerSummary.claims = claimsWithClaimStatuses;

                var claimIds = claimsWithClaimStatuses.map(c => c.ClaimID);

                idxDbSvc.selectWithCallback(
                    "Fulfilment",
                    { filterFn: f => claimIds.indexOf(f.ClaimID) > -1 },
                    fulfilmentCallback,
                    errorCallback
                );
            }

            function fulfilmentCallback(fulfilments) {

                customerSummary.fulfilments = fulfilments;

                /** @type {selectInnerJoinOnArrayOptions} */
                var options = {
                    dbField: "SupplierID",
                    joinArray: fulfilments,
                    arrayField: "SupplierID"
                };

                idxDbSvc.selectInnerJoinOnArrayWithCallback(
                    "Supplier",
                    options,
                    supplierCallback,
                    errorCallback);
            }

            function supplierCallback(fulfilmentsWithSuppliers) {

                customerSummary.fulfilments = fulfilmentsWithSuppliers;

                self.customerSummaryFormatted = JSON.stringify(customerSummary, null, 3);
            }

        },

        /**
         * Pyramid of doom! 🙁

         */
        selectCustomerInfoWithNestedCallbacks: function (customerId) {

            //Gather Customer, Policy, Claim, ClaimStatus, Fulfilment and Supplier data using nested callback functions.

            var customerSummary = {
                customer: {},
                policies: [],
                claims: [],
                fulfilments: []
            };

            const self = this;

            /** @type {indexedDbSvc} */
            const idxDbSvc = this.idxDbSvc;

            function errorCallback(error) {

                self.errorMsg = error.message || error;
                console.error(error.message || error);
            }

            idxDbSvc.selectWithCallback(
                "Customer",
                { filterFn: (c) => c.CustomerID == customerId, returnFirstItemOnly: true },
                function (customer) {

                    customerSummary.customer = customer;

                    idxDbSvc.selectWithCallback(
                        "Policy",
                        //"MissingTable",
                        { filterFn: (p) => p.CustomerID == customer.CustomerID },
                        function (policies) {

                            customerSummary.policies = policies;

                            var policyIDs = policies.map(p => p.PolicyID);

                            idxDbSvc.selectWithCallback(
                                "Claim",
                                { filterFn: (c) => policyIDs.indexOf(c.PolicyID) > -1 },
                                function (claims) {

                                    customerSummary.claims = claims;

                                    var options = {
                                        dbField: "ClaimStatusID",
                                        joinArray: customerSummary.claims,
                                        arrayField: "ClaimStatusID"
                                    };

                                    idxDbSvc.selectInnerJoinOnArrayWithCallback(
                                        "ClaimStatus",
                                        options,
                                        function (claimsWithClaimStatuses) {

                                            customerSummary.claims = claimsWithClaimStatuses;

                                            var claimIds = customerSummary.claims.map(c => c.ClaimID);

                                            idxDbSvc.selectWithCallback(
                                                "Fulfilment",
                                                { filterFn: f => claimIds.indexOf(f.ClaimID) > -1 },
                                                function (fulfilments) {

                                                    customerSummary.fulfilments = fulfilments;

                                                    var options = {
                                                        dbField: "SupplierID",
                                                        joinArray: customerSummary.fulfilments,
                                                        arrayField: "SupplierID"
                                                    };

                                                    idxDbSvc.selectInnerJoinOnArrayWithCallback(
                                                        "Supplier",
                                                        options,
                                                        function (fulfilmentsWithSuppliers) {

                                                            customerSummary.fulfilments = fulfilmentsWithSuppliers;

                                                            self.customerSummaryFormatted = JSON.stringify(customerSummary, null, 3);
                                                        },
                                                        errorCallback);
                                                },
                                                errorCallback);
                                        },
                                        errorCallback);
                                },
                                errorCallback)
                        },
                        errorCallback)
                },
                errorCallback);
        },

        /**
         * Chained .then / .catch 🙂
         */
        selectCustomerInfoWithPromises: function (customerId) {

            var customerSummary = {
                customer: {},
                policies: [],
                claims: [],
                fulfilments: []
            };

            const self = this;

            /** @type {indexedDbSvc} */
            const idxDbSvc = this.idxDbSvc;

            idxDbSvc.select("Customer", { filterFn: (c) => c.CustomerID == customerId, returnFirstItemOnly: true })
                .then(function (customer) {

                    customerSummary.customer = customer;

                    return idxDbSvc.select(
                        "Policy",
                        //"MissingTable",
                        { filterFn: (p) => p.CustomerID == customer.CustomerID }
                    );
                })
                .then(function (policies) {
                    debugger;
                    customerSummary.policies = policies;

                    var policyIDs = policies.map(p => p.PolicyID);

                    return idxDbSvc.select(
                        "Claim",
                        { filterFn: (c) => policyIDs.indexOf(c.PolicyID) > -1 },
                    );
                })
                .then(function (claims) {

                    customerSummary.claims = claims;

                    return idxDbSvc.selectInnerJoinOnArray(
                        "ClaimStatus",
                        { dbField: "ClaimStatusID", joinArray: customerSummary.claims, arrayField: "ClaimStatusID" }
                    );
                })
                .then(function (claimsWithClaimStatuses) {

                    customerSummary.claims = claimsWithClaimStatuses;

                    var claimIds = customerSummary.claims.map(c => c.ClaimID);

                    return idxDbSvc.select(
                        "Fulfilment",
                        { filterFn: f => claimIds.indexOf(f.ClaimID) > -1 }
                    );
                })
                .then(function (fulfilments) {

                    customerSummary.fulfilments = fulfilments;

                    return idxDbSvc.selectInnerJoinOnArray(
                        "Supplier",
                        { dbField: "SupplierID", joinArray: customerSummary.fulfilments, arrayField: "SupplierID" }
                    );
                })
                .then(function (fulfilmentsWithSuppliers) {

                    customerSummary.fulfilments = fulfilmentsWithSuppliers;

                    self.customerSummaryFormatted = JSON.stringify(customerSummary, null, 3);
                })
                .catch(function (errorMsg) {
                    debugger;
                    self.errorMsg = errorMsg;
                });
        },

        /**
         * async / await 🙂
         */
        selectCustomerInfoWithPromisesAsync: async function (customerId) {

            var customerSummary = {
                customer: {},
                policies: [],
                claims: [],
                fulfilments: []
            };

            //const self = this;

            /** @type {indexedDbSvc} */
            const idxDbSvc = this.idxDbSvc;

            try {

                customerSummary.customer = await idxDbSvc.select("Customer", { filterFn: (c) => c.CustomerID == customerId, returnFirstItemOnly: true });

                customerSummary.policies = await idxDbSvc.select("Policy", { filterFn: (p) => p.CustomerID == customerSummary.customer.CustomerID });
                //customerSummary.policies = await idxDbSvc.select("MissingTable", { filterFn: (p) => p.CustomerID == customerSummary.customer.CustomerID });

                //debugger;

                var policyIDs = customerSummary.policies.map(p => p.PolicyID);

                customerSummary.claims = await idxDbSvc.select("Claim", { filterFn: (c) => policyIDs.indexOf(c.PolicyID) > -1 });

                customerSummary.claims = await idxDbSvc.selectInnerJoinOnArray("ClaimStatus", { dbField: "ClaimStatusID", joinArray: customerSummary.claims, arrayField: "ClaimStatusID" });

                var claimIds = customerSummary.claims.map(c => c.ClaimID);

                customerSummary.fulfilments = await idxDbSvc.select("Fulfilment", { filterFn: f => claimIds.indexOf(f.ClaimID) > -1 });

                customerSummary.fulfilments = await idxDbSvc.selectInnerJoinOnArray("Supplier", { dbField: "SupplierID", joinArray: customerSummary.fulfilments, arrayField: "SupplierID" });

                this.customerSummaryFormatted = JSON.stringify(customerSummary, null, 3);

            } catch (e) {
                debugger;
                this.errorMsg = e.message || e;
            }
        },

        activateStoreListElem: function (storeName) {

            this.activeStoreName = storeName || this.activeStoreName;
        },

        clearSelectedItems: function () {

            this.selectedCustomer = {};
            this.selectedPolicy = {};
        },

        clearCustomerSummary: function () {

            this.customerSummaryFormatted = null;
        },

        listCustomers: function () {

            const self = this;

            this.idxDbSvc.select("Customer")
                .then(function (customers) {
                    self.storeData = customers;
                });

        }
    },

    mounted: function () {

        // Will be executed when the DOM is ready
    }
});
