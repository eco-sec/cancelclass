sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"cancelclass/cancelclass/model/models",
	"sap/ui/model/odata/v2/ODataModel"
], function (UIComponent, Device, models,ODataModel) {
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
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

   // Create and set the OData model
            var oModel = new ODataModel("/lmsproject/hana/xsodata/BusinessEventService.xsodata/");
            this.setModel(oModel);

			// enable routing
			this.getRouter().initialize();

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});