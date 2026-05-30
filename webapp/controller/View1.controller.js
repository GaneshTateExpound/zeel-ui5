sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("zsetpack.controller.View1", {

        onInit: function () {
            var oModel = new JSONModel({
                selection: {
                    plant: "",
                    date: new Date().toLocaleDateString("en-US"),
                    salesOrder: "",
                    lineItem: "",
                    productionOrder: "",
                    lotNumber: "",
                    packingRatio: "4"
                },
                items: [],
                packingItems: []
            });

            this.getView().setModel(oModel);
        },

        onSubmit: function () {
            var oInput = this.byId("valueInput");
            var sValue = oInput.getValue().trim();

            if (!sValue) {
                MessageToast.show("Please enter/scan a barcode first!");
                return;
            }

            var oModel = this.getView().getModel();
            var oSelection = oModel.getProperty("/selection");
            var aItems = oModel.getProperty("/items") || [];

            aItems.push({
                id: aItems.length + 1,
                barcode: sValue,
                plant: oSelection.plant,
                date: oSelection.date,
                salesOrder: oSelection.salesOrder,
                lineItem: oSelection.lineItem,
                productionOrder: oSelection.productionOrder,
                lotNumber: oSelection.lotNumber,
                packingRatio: oSelection.packingRatio,
                timestamp: new Date().toLocaleTimeString(),
                batch: "",
                styleName: "",
                quantity: 1,
                sizeColor: ""
            });

            oModel.setProperty("/items", aItems);

            oInput.setValue("");
            MessageToast.show("Barcode successfully added.");
        },

        onLiveChange: function (oEvent) {
            var sValue = oEvent.getParameter("newValue") || oEvent.getParameter("value") || "";

            if (sValue.length === "1T7VjlOgSdW8nRN2wp5KCQ".length) {
                this.onSubmit();
            }
        },

        onAddPackingItem: function () {
            var oMatInput = this.byId("matInput");
            var oQtyInput = this.byId("qtyInput");
            var oUomInput = this.byId("uomInput");

            var sMaterial = oMatInput.getValue().trim();
            var sQty = oQtyInput.getValue().trim();
            var sUom = oUomInput.getValue().trim();

            if (!sMaterial || !sQty || !sUom) {
                MessageToast.show("Please enter Material, Qty, and UoM first!");
                return;
            }

            var iQty = parseInt(sQty, 10);

            if (isNaN(iQty) || iQty <= 0) {
                MessageToast.show("Please enter a valid quantity!");
                return;
            }

            var oModel = this.getView().getModel();
            var aPackingItems = oModel.getProperty("/packingItems") || [];

            aPackingItems.push({
                material: sMaterial,
                qty: iQty,
                uom: sUom.toUpperCase()
            });

            oModel.setProperty("/packingItems", aPackingItems);

            oMatInput.setValue("");
            oQtyInput.setValue("");
            oUomInput.setValue("");

            MessageToast.show("Packing item added.");
        },

        onDeleteSetDetails: function () {
            var oTable = this.byId("valuesTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (!aSelectedItems.length) {
                MessageToast.show("Please select at least one Set Details row to delete.");
                return;
            }

            var oModel = this.getView().getModel();
            var aItems = oModel.getProperty("/items") || [];

            var aSelectedIndexes = aSelectedItems.map(function (oItem) {
                var sPath = oItem.getBindingContext().getPath();
                return parseInt(sPath.split("/").pop(), 10);
            }).sort(function (a, b) {
                return b - a;
            });

            aSelectedIndexes.forEach(function (iIndex) {
                aItems.splice(iIndex, 1);
            });

            oModel.setProperty("/items", aItems);
            oTable.removeSelections(true);

            MessageToast.show("Selected Set Details row(s) deleted.");
        },

        onDeletePackingDetails: function () {
            var oTable = this.byId("packingTable");
            var aSelectedItems = oTable.getSelectedItems();

            if (!aSelectedItems.length) {
                MessageToast.show("Please select at least one Packing Details row to delete.");
                return;
            }

            var oModel = this.getView().getModel();
            var aPackingItems = oModel.getProperty("/packingItems") || [];

            var aSelectedIndexes = aSelectedItems.map(function (oItem) {
                var sPath = oItem.getBindingContext().getPath();
                return parseInt(sPath.split("/").pop(), 10);
            }).sort(function (a, b) {
                return b - a;
            });

            aSelectedIndexes.forEach(function (iIndex) {
                aPackingItems.splice(iIndex, 1);
            });

            oModel.setProperty("/packingItems", aPackingItems);
            oTable.removeSelections(true);

            MessageToast.show("Selected Packing Details row(s) deleted.");
        },

        onFinalSubmit: function () {
            var oModel = this.getView().getModel();

            var aItems = oModel.getProperty("/items") || [];
            var aPackingItems = oModel.getProperty("/packingItems") || [];

            if (aItems.length === 0 && aPackingItems.length === 0) {
                MessageToast.show("No items to submit!");
                return;
            }

            MessageToast.show(
                "Successfully submitted " +
                aItems.length +
                " barcodes and " +
                aPackingItems.length +
                " packing items to SAP!"
            );

            oModel.setProperty("/items", []);
            oModel.setProperty("/packingItems", []);

            var oValuesTable = this.byId("valuesTable");
            var oPackingTable = this.byId("packingTable");

            if (oValuesTable) {
                oValuesTable.removeSelections(true);
            }

            if (oPackingTable) {
                oPackingTable.removeSelections(true);
            }
        }

    });
});