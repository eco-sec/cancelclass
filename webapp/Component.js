sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cancelclass/cancelclass/model/models",
	"sap/ui/model/odata/v2/ODataModel",
	"cancelclass/cancelclass/localService/mockserver"
], function (UIComponent, Device, models, ODataModel, mockserver) {
	"use strict";

	return UIComponent.extend("cancelclass.cancelclass.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// Initialize mock server for local testing BEFORE any other initialization
			var sRunMode = window.location.hostname === "localhost" ||
			               window.location.hostname === "127.0.0.1" ? "local" : "production";

			if (sRunMode === "local") {
				// Initialize mock server synchronously
				mockserver.init();
				console.log("🔧 Running in LOCAL mode with mock data enabled");
			}

			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// Create and set the OData model
			var oModel = new ODataModel("/lmsproject/hana/xsodata/BusinessEventService.xsodata/");
			this.setModel(oModel);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});