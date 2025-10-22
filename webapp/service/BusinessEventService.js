sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	var BusinessEventService = {

		// Service URL
		_sServiceUrl: "/lmsproject/hana/xsjs",
		_sServiceUrlOdata: "/lmsproject/hana/xsodata/WorkflowReportService.xsodata",

		_sCPIUrl: "/cpi",
		// Specific service URL for fetching an event by ID

		// Username and password

		/**
		 * Encodes the username and password in base64 format for basic authentication.
		 * @returns {string} Base64 encoded authorization header value.
		 */
		// _getAuthorizationHeader: function() {
		//     var sToken = btoa(this._username + ":" + this._password);
		//     return "Basic " + sToken;
		// },

		/**
		 * Fetches the business events data from the backend with basic authentication.
		 * @returns {Promise} A promise that resolves with the model data.
		 */

		getWorkflowReportByClassAndEmployee: function (sClassId, sEmployeeId) {
			return new Promise((resolve, reject) => {
				var oModel = new JSONModel();
				var sFilter = "?$filter=CLASS_ID eq '" + sClassId + "' and EMPLOYEE_ID eq '" + sEmployeeId + "'";
				var sUrl = this._sServiceUrlOdata + "/WorkflowLogView" + sFilter;

				oModel.loadData(sUrl, "", true, "GET", false, false, {
					"Content-Type": "application/json"
				});

				oModel.attachRequestCompleted(function (oEvent) {
					if (oModel.getData()) {
						resolve(oModel.getData());
					} else {
						reject(new Error("Failed to load workflow report data."));
					}
				});

				oModel.attachRequestFailed(function () {
					reject(new Error("Workflow report request failed."));
				});
			});
		},
		fetchEvents: function () {
			return new Promise((resolve, reject) => {
				var oModel = new JSONModel();
				oModel.loadData(this._sServiceUrlOdata + "/BusinessEvent", "", true, "GET", false, false, {
					// "Authorization": this._getAuthorizationHeader(),
					"Content-Type": "application/json"
				});
				oModel.attachRequestCompleted((oEvent) => {
					if (oModel.getData()) {
						resolve(oModel.getData());
					} else {
						reject(new Error("Failed to load data from the service."));
					}
				});
				oModel.attachRequestFailed(() => {
					reject(new Error("Data request to the service failed."));
				});
			});
		},

		fetchEvents: function (sBadgeNo) {
			return new Promise((resolve, reject) => {
				var oModel = new JSONModel();
				oModel.loadData(this._sServiceUrlOdata + "/BusinessEvent" + "?$filter=CREATED_BY eq '" + sBadgeNo + "'", "", true, "GET", false,
					false, {
						// "Authorization": this._getAuthorizationHeader(),
						"Content-Type": "application/json"
					});
				oModel.attachRequestCompleted((oEvent) => {
					if (oModel.getData()) {
						resolve(oModel.getData());
					} else {
						reject(new Error("Failed to load data from the service."));
					}
				});
				oModel.attachRequestFailed(() => {
					reject(new Error("Data request to the service failed."));
				});
			});
		},

		/**
		 * Fetches a single event by its ID.
		 * @param {string} sEventId - The ID of the event to retrieve.
		 * @returns {Promise} A promise that resolves with the event data.
		 */
		getEventById: function (sEventId) {
			return new Promise((resolve, reject) => {
				var sUrl = this._sServiceUrl + "/GetEventById.xsjs" + "?id=" + encodeURIComponent(sEventId);

				var oModel = new JSONModel();
				oModel.loadData(sUrl, "", true, "GET", false, false, {
					// "Authorization": this._getAuthorizationHeader(),
					"Content-Type": "application/json"
				});
				oModel.attachRequestCompleted(function () {
					if (oModel.getData()) {
						resolve(oModel.getData());
					} else {
						reject(new Error("Failed to load event data."));
					}
				});
				oModel.attachRequestFailed(function () {
					reject(new Error("Request failed to load event data."));
				});
			});
		},

		_fetchXcsrfToken: function () {
			var token = "";;
			$.ajax({
				type: 'GET',
				url: this._sServiceUrl + "/BusinessEventsService.xsjs",
				async: false,
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"X-Content-Type-Options": "nosniff",
					"X-Frame-Options": "SAMEORIGIN",
					"X-XSS-Protection": "0; mode=block"
				},
				beforeSend: function (requestGET) {
					requestGET.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				success: function (data, textStatus, requestGET) {
					token = requestGET.getResponseHeader("X-CSRF-Token");
					callBackFx(token, data);
				},
				error: function (requestGET) {
					token = requestGET.getResponseHeader("X-CSRF-Token");
				}
			});

		},
		cancelClass: function (sClassId, sEmployeeId, sAdminId, sUserType, sCancellationReason) {
			return new Promise(function (resolve, reject) {

				// Determine class status based on user type
				var sClassStatus = sUserType === "user" ? "Cancelled_By_Auth_End_User" : "Cancelled_By_Auth_End_User";

				var oPayload = {
					Emp_ID: sEmployeeId,
					Class_ID: sClassId,
					Cancel_Reason: sCancellationReason || "Work Commitments",
					New_Class_Status: sClassStatus
				};

				var oModel = new sap.ui.model.json.JSONModel();
				oModel.loadData("/cpi/LMS/cancelComplete", JSON.stringify(oPayload), true, "POST", false, false, {
					"Content-Type": "application/json",
					"adminID": sAdminId,
					"UserType": sUserType
				});

				oModel.attachRequestCompleted(function () {
					if (oModel.getData()) {
						resolve(oModel.getData());
					} else {
						reject(new Error("Failed to cancel class."));
					}
				});

				oModel.attachRequestFailed(function () {
					reject(new Error("Request to cancel class failed."));
				});
			});
		}

		,

		getClassByEmployee: function (sEmployeeId) {
			return new Promise(function (resolve, reject) {
				var oToday = new Date();
				oToday.setHours(0, 0, 0, 0); // Set to midnight
				var sTodayISO = oToday.toISOString().split("T")[0]; // YYYY-MM-DD

				var sUrl = "/lmsproject/hana/xsodata/WorkflowReportService.xsodata/WorkflowLogView" +
					"?$format=json" +
					"&$filter=EMPLOYEE_ID eq '" + encodeURIComponent(sEmployeeId) + "'" +
					" and WORKFLOW_STATUS eq 'Approved' " + "and CLASS_START_DATE gt datetime'" + sTodayISO + "T00:00:00'";

				var oModel = new JSONModel();
				oModel.loadData(sUrl, null, true, "GET", false, false, {
					"Content-Type": "application/json"
				});

				oModel.attachRequestCompleted(function () {
					var oData = oModel.getData();
					if (oData && oData.d && Array.isArray(oData.d.results)) {
						// Extract unique CLASS_ID and CLASS_TITLE
						var oSeen = {};
						var aUniqueClasses = oData.d.results.filter(function (item) {
							var key = item.CLASS_ID + "|" + item.CLASS_TITLE;
							if (!oSeen[key]) {
								oSeen[key] = true;
								return true;
							}
							return false;
						});
						resolve({
							d: {
								results: aUniqueClasses
							}
						});
					} else {
						reject(new Error("No class data found for EMPLOYEE_ID: " + sEmployeeId));
					}
				});

				oModel.attachRequestFailed(function () {
					reject(new Error("Failed to fetch class list for EMPLOYEE_ID: " + sEmployeeId));
				});
			});
		}

		,

		createBusinessEvent: function (oEventData) {
			return new Promise((resolve, reject) => {
				var oModel = new JSONModel();
				oModel.loadData(this._sCPIUrl + "/businessEvent/create", JSON.stringify(oEventData), true, "POST", false, false, {
					"Content-Type": "application/json"
				});
				oModel.attachRequestCompleted((oEvent) => {
					if (oModel.getData()) {;
						resolve(oModel.getData());
					} else {

						reject(new Error("Failed to create business event."));
					}
				});
				oModel.attachRequestFailed(() => {

					reject(new Error("Business event creation failed."));
				});
			});
		}

	};

	return BusinessEventService;
});