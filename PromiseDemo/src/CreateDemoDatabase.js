/// <reference path="services/indexeddbsvc.js" />

function createDemoDatabase(dbName) {

    return new Promise(function (resolve, reject) {

        const idxDbSvc = new indexedDbSvc(dbName);

        const storeSpecs = [
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
                    { name: "SupplierID", isUnique: false },
                    { name: "SupplierID", isUnique: false }
                ]
            },
            {
                storeName: "FulfilmentStatus",
                indexes: [
                    { name: "FulfilmentStatusID", isUnique: true },
                    { name: "Name", isUnique: true }
                ]
            },
            {
                storeName: "Supplier",
                indexes: [
                    { name: "SupplierID", isUnique: true },
                    { name: "Name", isUnique: true },
                    { name: "ShortCode", isUnique: true }
                ]
            }
        ];

        const data = [
            ["Customer",
                { CustomerID: 1, CustomerRef: "CUST001", CustomerName: "A Test" },
                { CustomerID: 2, CustomerRef: "CUST002", CustomerName: "B Test" },
                { CustomerID: 3, CustomerRef: "CUST003", CustomerName: "C Test" },
                { CustomerID: 4, CustomerRef: "CUST004", CustomerName: "D Test" },
                { CustomerID: 5, CustomerRef: "CUST005", CustomerName: "E Test" }
            ],
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
                { ClaimID: 6, ClaimRef: "CL006", PolicyID: 1, ClaimStatusID: 2 }
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
            ]]
        ];

        return idxDbSvc.createDatabase(1, storeSpecs)
            .then(function () {
                return idxDbSvc.storeMany(data);
            });
    });
}
