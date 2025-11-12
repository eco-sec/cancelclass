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
			console.log("🚀 onCancelMyClass called, username:", this.username);
			var that = this;
			if (!this._myClassDialog) {
				console.log("📝 Creating My Class Dialog fragment");
				this._myClassDialog = sap.ui.xmlfragment("cancelclass.cancelclass.fragment.CreateOnMyClassDialog", this);
				this.getView().addDependent(this._myClassDialog);
			}

			// Show busy indicator while loading data
			sap.ui.core.BusyIndicator.show(0);

			// Get current employee ID and load their information
			var sEmpId = String(this.username).replace(/^0+/, '');
			console.log("👤 Loading data for employee:", sEmpId);

			// Load employee information and classes
			EmployeeService.getEmployeeById(sEmpId)
				.then(function(oEmployeeData) {
					console.log("✅ Employee data loaded:", oEmployeeData);
					// Initialize the model with employee info
					var oMyClassModel = new JSONModel({
						EMPLOYEE_ID: sEmpId,
						EMPLOYEE_NAME: oEmployeeData.name || "Unknown",
						EMPLOYEE_EMAIL: oEmployeeData.email || "",
						ClassList: [],
						selectedClassDisplay: "",
						selectedClass: null
					});
					that._myClassDialog.setModel(oMyClassModel, "myClassModel");
					console.log("📊 My Class Model initialized");

					// Load approved classes for current user
					return BusinessEventService.getClassByEmployee(sEmpId);
				})
				.then(function (oData) {
					console.log("📚 Classes data received:", oData);
					var aClasses = (oData && oData.d && oData.d.results) ? oData.d.results : [];
					console.log("📋 Number of classes:", aClasses.length);

					// Format class dates
					aClasses.forEach(function(oClass) {
						if (oClass.CLASS_START_DATE) {
							oClass.FORMATTED_CLASS_START_DATE = that._formatDateString(oClass.CLASS_START_DATE);
						}
					});

					// Update the model with classes
					var oModel = that._myClassDialog.getModel("myClassModel");
					oModel.setProperty("/ClassList", aClasses);
					console.log("✅ ClassList updated in model, opening dialog");

					that._myClassDialog.open();
				})
				.catch(function (err) {
					console.error("❌ Error loading data for current user:", err);
					sap.m.MessageToast.show("Failed to load your information or classes.");
				})
				.finally(function () {
					sap.ui.core.BusyIndicator.hide();
				});
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

		onMyClassValueHelp: function () {
			console.log("🔍 onMyClassValueHelp called - Opening Value Help");
			var that = this;

			// Create Value Help dialog if not exists (reuse the class value help)
			if (!this._myClassValueHelpDialog) {
				console.log("📝 Creating new Value Help dialog for My Class");
				this._myClassValueHelpDialog = sap.ui.xmlfragment(
					"myClassVH",
					"cancelclass.cancelclass.fragment.ClassValueHelp",
					{
						onClassSearch: this.onMyClassSearch.bind(this),
						onClassConfirm: this.onMyClassConfirm.bind(this),
						onClassCancel: this.onMyClassCancel.bind(this)
					}
				);
				this.getView().addDependent(this._myClassValueHelpDialog);
			}

			// Get classes from the existing model
			var oModel = this._myClassDialog.getModel("myClassModel");
			var aClasses = oModel.getProperty("/ClassList");
			console.log("📚 Available classes:", aClasses ? aClasses.length : 0);

			this._myClassValueHelpDialog.setModel(oModel, "classModel");

			// Open the dialog
			this._myClassValueHelpDialog.open();
			console.log("✅ Value Help dialog opened");
		},

		onMyClassSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter({
				filters: [
					new Filter("CLASS_ID", FilterOperator.Contains, sValue),
					new Filter("CLASS_TITLE", FilterOperator.Contains, sValue)
				],
				and: false
			});
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		onMyClassConfirm: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("classModel");
				var oClass = oContext.getObject();

				// Set selected class in the model
				var oModel = this._myClassDialog.getModel("myClassModel");
				var sDisplayText = oClass.CLASS_ID + " - " + oClass.CLASS_TITLE;

				oModel.setProperty("/selectedClassDisplay", sDisplayText);
				oModel.setProperty("/selectedClass", oClass);
			}
		},

		onMyClassCancel: function () {
			// Dialog closes automatically
		},

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
					new Filter("EmpEmailId", FilterOperator.Contains, sValue)
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

		onClassValueHelp: function () {
			var that = this;

			// Create Value Help dialog if not exists
			if (!this._classValueHelpDialog) {
				this._classValueHelpDialog = sap.ui.xmlfragment(
					"cancelclass.cancelclass.fragment.ClassValueHelp",
					this
				);
				this.getView().addDependent(this._classValueHelpDialog);
			}

			// Get classes from the existing model
			var oModel = this._onBehalfSubordinateDialog.getModel("classModel");
			this._classValueHelpDialog.setModel(oModel, "classModel");

			// Open the dialog
			this._classValueHelpDialog.open();
		},

		onClassSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter({
				filters: [
					new Filter("CLASS_ID", FilterOperator.Contains, sValue),
					new Filter("CLASS_TITLE", FilterOperator.Contains, sValue)
				],
				and: false
			});
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		onClassConfirm: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var oContext = oSelectedItem.getBindingContext("classModel");
				var oClass = oContext.getObject();

				// Set selected class in input field
				var oInput = sap.ui.getCore().byId("classInput");
				var sDisplayText = oClass.CLASS_ID + " - " + oClass.CLASS_TITLE;

				// Create/Update model for selected class
				if (!this._onBehalfSubordinateDialog.getModel("selectedClass")) {
					this._onBehalfSubordinateDialog.setModel(new JSONModel(), "selectedClass");
				}
				this._onBehalfSubordinateDialog.getModel("selectedClass").setData({
					CLASS_ID: oClass.CLASS_ID,
					CLASS_TITLE: oClass.CLASS_TITLE,
					displayText: sDisplayText,
					fullClassData: oClass
				});
			}
		},

		onClassCancel: function () {
			// Dialog closes automatically
		},

		_loadClassesForSubordinate: function (sEmpId) {
			var that = this;
			if (!sEmpId) return;

			sEmpId = sEmpId.replace(/^0+/, '');

			BusinessEventService.getClassByEmployee(sEmpId).then(function (oData) {
				var aClasses = (oData && oData.d && oData.d.results) ? oData.d.results : [];
				// Set model on the dialog instead of the control
				that._onBehalfSubordinateDialog.setModel(new JSONModel({
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
			var oModel = this._myClassDialog.getModel("myClassModel");
			var oSelectedClass = oModel.getProperty("/selectedClass");

			if (!oSelectedClass) {
				sap.m.MessageToast.show("Please select a class.");
				return;
			}

			// Close the dialog and open workflow details
			this._myClassDialog.close();

			// Pass the full class data to the workflow details dialog
			this._openWorkflowDetailsDialogForMyClass(oSelectedClass);
		},

		onCancelMyClassDialog: function () {
			if (this._myClassDialog) {
				this._myClassDialog.close();
			}
		},

		onConfirmCancelOnBehalf: function () {
			// Get selected subordinate from Value Help
			var oSelectedSubModel = this._onBehalfSubordinateDialog.getModel("selectedSubordinate");
			var sEmployeeId = oSelectedSubModel ? oSelectedSubModel.getProperty("/EmpPernr") : null;

			// Get selected class from Value Help
			var oSelectedClassModel = this._onBehalfSubordinateDialog.getModel("selectedClass");
			var sClassId = oSelectedClassModel ? oSelectedClassModel.getProperty("/CLASS_ID") : null;

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

		_openWorkflowDetailsDialogForMyClass: function (oWorkflowData) {
			if (!this._workflowDialog) {
				this._workflowDialog = sap.ui.xmlfragment("cancelclass.cancelclass.fragment.WorkflowDetailsDialog", this);
				this.getView().addDependent(this._workflowDialog);
			}

			var oFormattedData = Object.assign({}, oWorkflowData);

			// Format dates
			if (oWorkflowData.CLASS_START_DATE) {
				oFormattedData.FORMATTED_CLASS_START_DATE = this._formatDateString(oWorkflowData.CLASS_START_DATE);
			}
			if (oWorkflowData.CLASS_END_DATE) {
				oFormattedData.FORMATTED_CLASS_END_DATE = this._formatDateString(oWorkflowData.CLASS_END_DATE);
			}

			// Calculate days left and eligibility
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

			// Mark this as "My Class" flow (not on behalf)
			oFormattedData.IS_ON_BEHALF = false;
			oFormattedData.IS_MY_CLASS = true;

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
			// Clear selected models
			if (this._onBehalfSubordinateDialog) {
				if (this._onBehalfSubordinateDialog.getModel("selectedSubordinate")) {
					this._onBehalfSubordinateDialog.getModel("selectedSubordinate").setData({});
				}
				if (this._onBehalfSubordinateDialog.getModel("selectedClass")) {
					this._onBehalfSubordinateDialog.getModel("selectedClass").setData({});
				}
				this._onBehalfSubordinateDialog.close();
			}
			if (this._onBehalfDialog) this._onBehalfDialog.close();
		},

		onCancelClassConfirm: function () {
			var oModel = this._workflowDialog.getModel("workflow");
			var oWorkflowData = oModel.getData();
			var bIsMyClass = oModel.getProperty("/IS_MY_CLASS");

			// ✅ Show Busy Indicator
			sap.ui.core.BusyIndicator.show(0);

			// Check if this is "My Class" flow or "On Behalf" flow
			if (bIsMyClass) {
				// Use new API for "My Class" flow - send full workflow data
				BusinessEventService.createCancellationRequest(oWorkflowData)
					.then(function (oResponse) {
						sap.m.MessageToast.show("Cancellation request submitted successfully.");
						this._workflowDialog.close();
						console.log("Cancellation request response:", oResponse);
					}.bind(this))
					.catch(function (oError) {
						console.error("Failed to submit cancellation request:", oError.message);
						sap.m.MessageToast.show("Failed to submit cancellation request.");
					})
					.finally(function () {
						sap.ui.core.BusyIndicator.hide();
					});
			} else {
				// Use old API for "On Behalf" flow
				var sClassId = oModel.getProperty("/CLASS_ID");
				var sEmployeeId = oModel.getProperty("/EMPLOYEE_ID");
				var sCancellationReason = sap.ui.getCore().byId("cancelReasonComboBox").getSelectedKey();
				var sUserType = (this._onBehalfSubordinateDialog && this._onBehalfSubordinateDialog.isOpen()) ? "admin" : "user";
				var sAdminId = this.username;

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
						sap.ui.core.BusyIndicator.hide();
					});
			}
		}

		,

		onCloseWorkflowDialog: function () {
			this._workflowDialog.close();
		}
	});
});