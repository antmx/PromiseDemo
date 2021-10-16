/// <reference path="../../lib/indexedDbSvc/indexedDbSvc.js" />
/// <reference path="../../lib/linqjs/linqcore.js" />

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
                { CustomerID: 3, CustomerRef: "CUST003", CustomerName: "C Test" },
                { CustomerID: 4, CustomerRef: "CUST004", CustomerName: "D Test" },
                { CustomerID: 5, CustomerRef: "CUST005", CustomerName: "E Test" }
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

        selectCustomerInfoWithCallbacks: function (customerId) {
            
            // Gather Customer, Policy, Claim, ClaimStatus and Fulfilment data using shed load of convoluted callback functions - callback hell!

            var customerSummary = {
                customer: {},
                policies: [],
                claims: [],
                fulfilments: []
            };

            const self = this;

            this.idxDbSvc.selectWithCallback(
                "Customer",
                { filterFn: (c) => c.CustomerID == customerId, returnFirstItemOnly: true },
                customerCallback);

            function customerCallback(customer) {

                customerSummary.customer = customer;

                try {
                    self.idxDbSvc.selectWithCallback(
                        "Policy",
                        { filterFn: (p) => p.CustomerID == customer.CustomerID },
                        policyCallback
                    )
                } catch (e) {
                    console.error(e);
                }

            }

            function policyCallback(policies) {

                customerSummary.policies = policies;

                var policyIDs = policies.map(p => p.PolicyID);

                self.idxDbSvc.selectWithCallback(
                    "Claim",
                    { filterFn: (c) => policyIDs.indexOf(c.PolicyID) > -1 },
                    claimCallback
                )
            }

            function claimCallback(claims) {

                customerSummary.claims = claims;

                /** @type {selectInnerJoinOnArrayOptions} */
                var options = {
                    dbField: "ClaimStatusID",
                    joinArray: customerSummary.claims,
                    arrayField: "ClaimStatusID"
                };

                self.idxDbSvc.selectInnerJoinOnArrayWithCallback("ClaimStatus", options, claimStatusCallback);
            }

            function claimStatusCallback(claimsWithClaimStatuses) {
                                
                customerSummary.claims = claimsWithClaimStatuses;

                var claimIds = customerSummary.claims.map(c => c.ClaimID);

                self.idxDbSvc.selectWithCallback(
                    "Fulfilment",
                    { filterFn: f => claimIds.indexOf(f.ClaimID) > -1 },
                    fulfilmentCallback
                );
            }

            function fulfilmentCallback(fulfilments) {

                customerSummary.fulfilments = fulfilments;

                /** @type {selectInnerJoinOnArrayOptions} */
                var options = {
                    dbField: "SupplierID",
                    joinArray: customerSummary.fulfilments,
                    arrayField: "SupplierID"
                };

                self.idxDbSvc.selectInnerJoinOnArrayWithCallback("Supplier", options, supplierCallback);

            }

            function supplierCallback(fulfilmentsWithSuppliers) {

                customerSummary.fulfilments = fulfilmentsWithSuppliers;

                var customerDataJsonString = JSON.stringify(customerSummary, null, 3);

                console.log(customerDataJsonString);
            }

        },

        selectCustomerInfoWithNestedCallbacks: function (customerId) {
            debugger;

            // Gather Customer, Policy, Claim, ClaimStatus and Fulfilment data using shed load of nested callback functions - Pyramid of doom!

            var customerSummary = {
                customer: {},
                policies: [],
                claims: [],
                fulfilments: []
            };

            const self = this;

            //this.idxDbSvc.selectWithCallback(
            //    "Customer",
            //    { filterFn: (c) => c.CustomerID == customerId, returnFirstItemOnly: true },
            //    customerCallback);

            this.idxDbSvc.selectWithCallback(
                "Customer",
                { filterFn: (c) => c.CustomerID == customerId, returnFirstItemOnly: true },
                function customerCallback (customer) {

                    customerSummary.customer = customer;

                    self.idxDbSvc.selectWithCallback(
                        "Policy",
                        { filterFn: (p) => p.CustomerID == customer.CustomerID },
                        function policyCallback (policies) {

                            customerSummary.policies = policies;

                            var policyIDs = policies.map(p => p.PolicyID);

                            self.idxDbSvc.selectWithCallback(
                                "Claim",
                                { filterFn: (c) => policyIDs.indexOf(c.PolicyID) > -1 },
                                function claimCallback(claims) {

                                    customerSummary.claims = claims;

                                    /** @type {selectInnerJoinOnArrayOptions} */
                                    var options = {
                                        dbField: "ClaimStatusID",
                                        joinArray: customerSummary.claims,
                                        arrayField: "ClaimStatusID"
                                    };

                                    self.idxDbSvc.selectInnerJoinOnArrayWithCallback("ClaimStatus", options, function claimStatusCallback(claimsWithClaimStatuses) {

                                        customerSummary.claims = claimsWithClaimStatuses;

                                        var claimIds = customerSummary.claims.map(c => c.ClaimID);

                                        self.idxDbSvc.selectWithCallback(
                                            "Fulfilment",
                                            { filterFn: f => claimIds.indexOf(f.ClaimID) > -1 },
                                            function fulfilmentCallback(fulfilments) {

                                                customerSummary.fulfilments = fulfilments;

                                                /** @type {selectInnerJoinOnArrayOptions} */
                                                var options = {
                                                    dbField: "SupplierID",
                                                    joinArray: customerSummary.fulfilments,
                                                    arrayField: "SupplierID"
                                                };

                                                self.idxDbSvc.selectInnerJoinOnArrayWithCallback("Supplier", options, function supplierCallback(fulfilmentsWithSuppliers) {

                                                    customerSummary.fulfilments = fulfilmentsWithSuppliers;

                                                    var customerDataJsonString = JSON.stringify(customerSummary, null, 3);

                                                    console.log(customerDataJsonString);
                                                });

                                            }
                                        );
                                    });
                                }
                            )

                        }
                    )

                });

        },

        selectCustomerInfoWithPromises: function (policyId) {
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
