sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"cancelclass/cancelclass/service/BusinessEventService",
	"sap/ui/model/Sorter",
	"sap/ui/core/format/DateFormat",
	"cancelclass/cancelclass/service/EmployeeService",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, BusinessEventService, Sorter, DateFormat, EmployeeService, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("cancelclass.cancelclass.controller.cancelClass", {
		onInit: function () {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("cancelClass").attachPatternMatched(this._onRouteMatched, this);
			this.fetchCurrentUser();
		},

		_onRouteMatched: function () {
			this.fetchCurrentUser();
		},

		fetchCurrentUser: function () {
			var oUserModel = new JSONModel();
			var that = this;

			// Set default username for local testing (in case API fails)
			that.username = "107119";

			oUserModel.loadData("/services/userapi/currentUser");
			oUserModel.attachRequestCompleted(function (oEvent) {
				if (oEvent.getParameter("success")) {
					var oData = oUserModel.getData();
					var sCurrentUserId = oData.name || "107119";
					that.username = sCurrentUserId;
					console.log("✅ User loaded:", sCurrentUserId);
					this.fetchEmployeeData(sCurrentUserId);
				} else {
					console.error("Error retrieving user info - using default username:", that.username);
				}
			}.bind(this));
			oUserModel.attachRequestFailed(function () {
				console.error("Failed to load current user data - using default username:", that.username);
			}.bind(this));
		},

		fetchEmployeeData: function (sEmployeeId) {},

		onCancelMyClass: function () {
			var that = this;
			if (!this._onBehalfDialog) {
				this._onBehalfDialog = sap.ui.xmlfragment("cancelclass.cancelclass.fragment.CreateOnMyClassDialog", this);
				this.getView().addDependent(this._onBehalfDialog);
			}

			// Set current user in the input field
			// var oUserInput = sap.ui.getCore().byId("currentUserInput");
			// if (oUserInput && this.username) {
			// 	oUserInput.setValue(this.username);
			// }

			// // Load class list for current user
			// var sEmpId = String(this.username).replace(/^0+/, '');
			// BusinessEventService.getClassByEmployee(sEmpId).then(function (oData) {
			// 	var aClasses = (oData && oData.d && oData.d.results) ? oData.d.results : [];
			// 	var oClassModel = new JSONModel({
			// 		ClassList: aClasses
			// 	});
			// 	sap.ui.getCore().byId("myClassSelect").setModel(oClassModel, "myClassModel");
			// }).catch(function (err) {
			// 	console.error("Error loading classes for current user", err);
			// 	sap.m.MessageToast.show("Failed to load classes.");
			// });

			this._onBehalfDialog.open();
		}

		,

		onCreateOnBehalf: function () {
			var that = this;
			if (!this._onBehalfSubordinateDialog) {
				this._onBehalfSubordinateDialog = sap.ui.xmlfragment("cancelclass.cancelclass.fragment.CreateOnBehalfDialog", this);
				this.getView().addDependent(this._onBehalfSubordinateDialog);
			}

			sap.ui.core.BusyIndicator.show(0); // ✅ Show busy
			EmployeeService.getSubordinates(this.username).then(function (oData) {
				var aSubordinates = (oData && oData.EmployeeHierarchySet && oData.EmployeeHierarchySet.EmployeeHierarchy) ? oData.EmployeeHierarchySet
					.EmployeeHierarchy : [];

				// Set subordinates model
				that._onBehalfSubordinateDialog.setModel(new JSONModel({
					EmployeeList: aSubordinates
				}), "subordinateModel");

				// Initialize empty selected subordinate model
				that._onBehalfSubordinateDialog.setModel(new JSONModel({
					EmpPernr: "",
					EmpEnglishName: "",
					displayText: ""
				}), "selectedSubordinate");

				that._onBehalfSubordinateDialog.open();
			}).catch(function (oError) {
				console.error("Error fetching subordinates", oError);
				sap.m.MessageToast.show("Failed to load subordinates.");
			}).finally(function () {
				sap.ui.core.BusyIndicator.hide(); // ✅ Always hide
			});
		},
		// onCreateOnBehalf: function () {
		// 	var that = this;
		// 	if (!this._onBehalfSubordinateDialog) {
		// 		this._onBehalfSubordinateDialog = sap.ui.xmlfragment("cancelclass.cancelclass.fragment.CreateOnBehalfDialog", this);
		// 		this.getView().addDependent(this._onBehalfSubordinateDialog);
		// 	}

		// 	EmployeeService.getSubordinates(this.username).then(function (oData) {
		// 		var aSubordinates = (oData && oData.EmployeeHierarchySet && oData.EmployeeHierarchySet.EmployeeHierarchy) ? oData.EmployeeHierarchySet
		// 			.EmployeeHierarchy : [];
		// 		that._onBehalfSubordinateDialog.setModel(new JSONModel({
		// 			EmployeeList: aSubordinates
		// 		}), "subordinateModel");
		// 		that._onBehalfSubordinateDialog.open();
		// 	}).catch(function (oError) {
		// 		console.error("Error fetching subordinates", oError);
		// 		sap.m.MessageToast.show("Failed to load subordinates.");
		// 	});
		// },

		// ========== Value Help Handlers ==========

		onSubordinateValueHelp: function () {
			var that = this;

			// Create Value Help dialog if not exists
			if (!this._subordinateValueHelpDialog) {
				this._subordinateValueHelpDialog = sap.ui.xmlfragment(
					"cancelclass.cancelclass.fragment.SubordinateValueHelp",
					this
				);
				this.getView().addDependent(this._subordinateValueHelpDialog);
			}

			// Get subordinates from the existing model
			var oModel = this._onBehalfSubordinateDialog.getModel("subordinateModel");
			this._subordinateValueHelpDialog.setModel(oModel, "subordinateModel");

			// Open the dialog
			this._subordinateValueHelpDialog.open();
		},

		onSubordinateSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter({
				filters: [
					new Filter("EmpPernr", FilterOperator.Contains, sValue),
					new Filter("EmpEnglishName", FilterOperator.Contains, sValue),
					new Filter("email", FilterOperator.Contains, sValue)
				],
				and: false
			});
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		onSubordinateConfirm: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("subordinateModel");
				var oEmployee = oContext.getObject();

				// Set selected subordinate in input field
				var oInput = sap.ui.getCore().byId("subordinateInput");
				var sDisplayText = oEmployee.EmpPernr + " - " + oEmployee.EmpEnglishName;

				// Create/Update model for selected subordinate
				if (!this._onBehalfSubordinateDialog.getModel("selectedSubordinate")) {
					this._onBehalfSubordinateDialog.setModel(new JSONModel(), "selectedSubordinate");
				}
				this._onBehalfSubordinateDialog.getModel("selectedSubordinate").setData({
					EmpPernr: oEmployee.EmpPernr,
					EmpEnglishName: oEmployee.EmpEnglishName,
					displayText: sDisplayText
				});

				// Load classes for selected subordinate
				this._loadClassesForSubordinate(oEmployee.EmpPernr);
			}
		},

		onSubordinateCancel: function () {
			// Dialog closes automatically
		},

		_loadClassesForSubordinate: function (sEmpId) {
			if (!sEmpId) return;

			sEmpId = sEmpId.replace(/^0+/, '');

			BusinessEventService.getClassByEmployee(sEmpId).then(function (oData) {
				var aClasses = (oData && oData.d && oData.d.results) ? oData.d.results : [];
				sap.ui.getCore().byId("classSelect").setModel(new JSONModel({
					ClassList: aClasses
				}), "classModel");
			}).catch(function (err) {
				console.error("Error loading classes", err);
				sap.m.MessageToast.show("Failed to load classes for subordinate.");
			});
		},

		// ========== Legacy Handlers (Deprecated) ==========

		onSubordinateChange: function (oEvent) {
			// This is now deprecated - replaced by Value Help
			var sEmpId = oEvent.getSource().getSelectedKey();
			if (!sEmpId) return;

			sEmpId = sEmpId.replace(/^0+/, '');

			BusinessEventService.getClassByEmployee(sEmpId).then(function (oData) {
				var aClasses = (oData && oData.d && oData.d.results) ? oData.d.results : [];
				sap.ui.getCore().byId("classSelect").setModel(new JSONModel({
					ClassList: aClasses
				}), "classModel");
			}).catch(function (err) {
				console.error("Error loading classes", err);
			});
		},

		onConfirmOnMyClass: function () {
			var sClassId = sap.ui.getCore().byId("myClassSelect").getSelectedKey();
			var sEmployeeId = this.username;

			if (sClassId && sEmployeeId) {
				BusinessEventService.getWorkflowReportByClassAndEmployee(sClassId, sEmployeeId)
					.then(this._handleWorkflowResult.bind(this, this._onBehalfDialog))
					.catch(this._handleWorkflowError);
			} else {
				sap.m.MessageToast.show("Please select a Class.");
			}
		},

		onConfirmCancelOnBehalf: function () {
			// Get selected subordinate from Value Help
			var oSelectedSubModel = this._onBehalfSubordinateDialog.getModel("selectedSubordinate");
			var sEmployeeId = oSelectedSubModel ? oSelectedSubModel.getProperty("/EmpPernr") : null;

			// Get selected class
			var sClassId = sap.ui.getCore().byId("classSelect").getSelectedKey();

			if (sEmployeeId && sClassId) {
				sEmployeeId = sEmployeeId.replace(/^0+/, '');

				BusinessEventService.getWorkflowReportByClassAndEmployee(sClassId, sEmployeeId)
					.then(this._handleWorkflowResult.bind(this, this._onBehalfSubordinateDialog))
					.catch(this._handleWorkflowError);
			} else {
				sap.m.MessageToast.show("Please select both subordinate and class.");
			}
		},

		onConfirmOnBehalf: function () {
			var sClassId = sap.ui.getCore().byId("classIdInput").getValue();
			var sEmployeeId = this.username; // current logged in user badge

			if (sClassId && sEmployeeId) {
				BusinessEventService.getWorkflowReportByClassAndEmployee(sClassId, sEmployeeId)
					.then(function (oData) {
						this._onBehalfDialog.close(); // Close first dialog

						if (oData.d && oData.d.results && oData.d.results.length > 0) {
							var oWorkflowData = oData.d.results[0]; // Take first result (assuming only one match)

							// Open the second fragment to show details
							this._openWorkflowDetailsDialog(oWorkflowData);
						} else {
							sap.m.MessageToast.show("No matching class found.");
						}
					}.bind(this))
					.catch(function (oError) {
						console.error(oError.message);
						sap.m.MessageToast.show("Failed to retrieve class.");
					});
			} else {
				sap.m.MessageToast.show("Please enter a Class ID.");
			}
		},

		_handleWorkflowResult: function (oDialog, oData) {
			oDialog.close();
			if (oData.d && oData.d.results && oData.d.results.length > 0) {
				this._openWorkflowDetailsDialog(oData.d.results[0], oDialog === this._onBehalfSubordinateDialog);
			} else {
				sap.m.MessageToast.show("No matching class found.");
			}
		},

		_handleWorkflowError: function (oError) {
			console.error(oError.message);
			sap.m.MessageToast.show("Failed to retrieve class.");
		},

		_openWorkflowDetailsDialog: function (oWorkflowData, bIsOnBehalf = false) {
			if (!this._workflowDialog) {
				this._workflowDialog = sap.ui.xmlfragment("cancelclass.cancelclass.fragment.WorkflowDetailsDialog", this);
				this.getView().addDependent(this._workflowDialog);
			}
			var oFormattedData = Object.assign({}, oWorkflowData);

			if (oWorkflowData.CLASS_START_DATE) {
				oFormattedData.FORMATTED_CLASS_START_DATE = this._formatDateString(oWorkflowData.CLASS_START_DATE);
			}
			if (oWorkflowData.CLASS_END_DATE) {
				oFormattedData.FORMATTED_CLASS_END_DATE = this._formatDateString(oWorkflowData.CLASS_END_DATE);
			}
			if (oWorkflowData.CLASS_START_DATE) {
				var iDaysLeft = this._calculateDaysLeft(oWorkflowData.CLASS_START_DATE);
				oFormattedData.DAYS_LEFT = iDaysLeft;
				var iCutoffDays = (oWorkflowData.TRAINING_TYPE_ID === "1" || oWorkflowData.TRAINING_TYPE_ID === "2") ? 5 : 10;
				if (iDaysLeft < 0) {
					oFormattedData.CANCEL_REASON = "Class Already Started";
					oFormattedData.ENABLE_CANCEL_BUTTON = false;
				} else if (iDaysLeft <= iCutoffDays) {
					oFormattedData.CANCEL_REASON = "Cancellation Period Expired";
					oFormattedData.ENABLE_CANCEL_BUTTON = false;
				} else {
					oFormattedData.CANCEL_REASON = "Eligible for Cancellation";
					oFormattedData.ENABLE_CANCEL_BUTTON = true;
				}
			}

			// ✅ Flag to control visibility logic
			oFormattedData.IS_ON_BEHALF = true; //bIsOnBehalf;

			var oModel = new JSONModel(oFormattedData);
			this._workflowDialog.setModel(oModel, "workflow");
			this._workflowDialog.bindElement({
				path: "/",
				model: "workflow"
			});
			this._workflowDialog.open();
		}

		,

		_formatDateString: function (sRawDate) {
			if (!sRawDate) return "";

			// Handle format: /Date(1748736000000)/
			var match = sRawDate.match(/\/Date\((\d+)\)\//);
			if (match && match[1]) {
				var oDate = new Date(parseInt(match[1], 10));
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy"
				});
				return oDateFormat.format(oDate);
			}
			return sRawDate; // fallback
		},

		_calculateDaysLeft: function (sRawDate) {
			if (!sRawDate) return 0;

			var match = sRawDate.match(/\/Date\((\d+)\)\//);
			if (!match || !match[1]) return 0;

			var oClassDate = new Date(parseInt(match[1], 10));
			var oToday = new Date();
			oToday.setHours(0, 0, 0, 0);

			var iDiffInMs = oClassDate - oToday;
			return Math.floor(iDiffInMs / (1000 * 60 * 60 * 24));
		},

		onCancelOnBehalf: function () {
			if (this._onBehalfDialog) this._onBehalfDialog.close();
			if (this._onBehalfSubordinateDialog) this._onBehalfSubordinateDialog.close();
		},

		onCancelClassConfirm: function () {
			var oModel = this._workflowDialog.getModel("workflow");
			var sClassId = oModel.getProperty("/CLASS_ID");
			var sEmployeeId = oModel.getProperty("/EMPLOYEE_ID");

			// Get cancellation reason from ComboBox
			var sCancellationReason = sap.ui.getCore().byId("cancelReasonComboBox").getSelectedKey();

			// Determine user type based on which dialog is open
			var sUserType = (this._onBehalfSubordinateDialog && this._onBehalfSubordinateDialog.isOpen()) ? "admin" : "user";
			var sAdminId = this.username; // assuming logged-in user is the acting admin

			// ✅ Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);

			BusinessEventService.cancelClass(sClassId, sEmployeeId, sAdminId, sUserType, sCancellationReason)
				.then(function () {
					sap.m.MessageToast.show("Class cancelled successfully.");
					this._workflowDialog.close();
				}.bind(this))
				.catch(function (oError) {
					console.error(oError.message);
					sap.m.MessageToast.show("Failed to cancel class.");
				})
				.finally(function () {
					// ✅ Hide Busy Indicator
					sap.ui.core.BusyIndicator.hide();
				});
		}

		,

		onCloseWorkflowDialog: function () {
			this._workflowDialog.close();
		}
	});
});