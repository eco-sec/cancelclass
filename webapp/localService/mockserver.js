sap.ui.define([
	"sap/ui/core/util/MockServer",
	"./mockdata",
	"sap/ui/thirdparty/jquery"
], function (MockServer, MockData, jQuery) {
	"use strict";

	var _mockServer = null;

	return {
		/**
		 * Initializes the mock server
		 * @public
		 */
		init: function () {
			var oMockData = MockData;

			console.log("🔧 Initializing Mock Server with jQuery AJAX interception...");

			// ✅ Store original jQuery.ajax
			var originalAjax = jQuery.ajax;

			// ✅ Override jQuery.ajax to intercept ALL calls
			jQuery.ajax = function(url, options) {
				// Handle both jQuery.ajax(url, options) and jQuery.ajax(options)
				if (typeof url === "object") {
					options = url;
					url = options.url;
				}
				options = options || {};
				url = url || options.url;

				console.log("🌐 AJAX Request intercepted:", url);

				var mockData = null;
				var shouldMock = false;

				// Mock User API
				if (url.indexOf("/services/userapi/currentUser") > -1 || url.indexOf("/scpServices/userAPI/currentUser") > -1) {
					console.log("✅ Mocking: User API");
					mockData = oMockData.currentUser;
					shouldMock = true;
				}

				// Mock Employee Details API
				else if (url.indexOf("/cpi/employee/details") > -1) {
					console.log("✅ Mocking: Employee Details API");
					var employeeIdMatch = url.match(/employeeId=(\d+)/);
					var employeeId = employeeIdMatch ? employeeIdMatch[1] : "107119";
					mockData = oMockData.employees[employeeId] || {
						employeeId: employeeId,
						name: "Employee " + employeeId,
						email: "employee" + employeeId + "@example.com"
					};
					shouldMock = true;
				}

				// Mock Subordinates API
				else if (url.indexOf("/cpi/employee/getSubordinate") > -1 || url.indexOf("/cpi/tc/getSubordinate") > -1) {
					console.log("✅ Mocking: Subordinates API");
					mockData = oMockData.subordinates;
					shouldMock = true;
				}

				// Mock Classes API (WorkflowLogView)
				else if (url.indexOf("/lmsproject/hana/xsodata/WorkflowReportService.xsodata/WorkflowLogView") > -1) {
					console.log("✅ Mocking: Classes API");

					// Extract employee ID from URL
					var employeeIdMatch = url.match(/EMPLOYEE_ID eq '(\d+)'/);
					var employeeId = employeeIdMatch ? employeeIdMatch[1] : "107119";

					// Clone and customize class data
					var classesData = JSON.parse(JSON.stringify(oMockData.classes));
					classesData.d.results.forEach(function(classItem) {
						classItem.EMPLOYEE_ID = employeeId;
						var empNames = {
							"107119": "John Smith",
							"107120": "Jane Doe",
							"107121": "Mike Johnson",
							"107122": "Sarah Williams",
							"107123": "Ahmed Hassan"
						};
						classItem.EMPLOYEE_NAME = empNames[employeeId] || "Employee " + employeeId;
					});

					mockData = classesData;
					shouldMock = true;
				}

				// Mock Picklist Service
				else if (url.indexOf("/lmsproject/hana/xsjs/PicklistService.xsjs") > -1) {
					console.log("✅ Mocking: Picklist Service");
					mockData = oMockData.picklists;
					shouldMock = true;
				}

				// Mock Cancel Class (old API)
				else if (url.indexOf("/cpi/LMS/cancelComplete") > -1) {
					console.log("✅ Mocking: Cancel Class API");
					mockData = oMockData.cancelClassResponse;
					shouldMock = true;
				}

				// Mock Create Cancellation Request (new API)
				else if (url.indexOf("/cpi/cancellation/createApprovalRequest") > -1) {
					console.log("✅ Mocking: Create Cancellation Request API");
					mockData = oMockData.createCancellationResponse;
					shouldMock = true;
				}

				// If should mock, create a fake jqXHR
				if (shouldMock) {
					var dfd = jQuery.Deferred();
					var mockXhr = {
						readyState: 4,
						status: 200,
						statusText: "OK",
						responseText: JSON.stringify(mockData),
						responseJSON: mockData,
						getResponseHeader: function() { return "application/json"; },
						getAllResponseHeaders: function() { return ""; }
					};

					setTimeout(function() {
						// Call success callback if provided
						if (options.success) {
							options.success(mockData, "success", mockXhr);
						}
						// Call complete callback if provided
						if (options.complete) {
							options.complete(mockXhr, "success");
						}
						// Resolve the deferred
						dfd.resolve(mockData, "success", mockXhr);
					}, 500);

					// Return a promise-like object
					var promise = dfd.promise(mockXhr);
					promise.success = promise.done;
					promise.error = promise.fail;
					return promise;
				}

				// If not mocked, call original ajax
				return originalAjax.apply(this, arguments);
			};

			// Create mock server with root URI
			_mockServer = new MockServer({
				rootUri: "/"
			});

			// Configure mock server
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: 500
			});

			// Define custom responses
			var aRequests = _mockServer.getRequests();

			// Mock user API - must match EXACT paths
			aRequests.push({
				method: "GET",
				path: /.*\/services\/userapi\/currentUser.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: User API (/services/userapi/currentUser)");
					oXhr.respondJSON(200, {}, oMockData.currentUser);
				}
			});

			aRequests.push({
				method: "GET",
				path: /.*\/scpServices\/userAPI\/currentUser.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: User API (/scpServices/userAPI/currentUser)");
					oXhr.respondJSON(200, {}, oMockData.currentUser);
				}
			});

			// Mock Employee Service - get subordinates
			aRequests.push({
				method: "GET",
				path: /.*\/cpi\/(employee|tc)\/getSubordinate.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: Get Subordinates API");
					oXhr.respondJSON(200, {}, oMockData.subordinates);
				}
			});

			// Mock Business Event Service - get classes by employee
			aRequests.push({
				method: "GET",
				path: /.*\/lmsproject\/hana\/xsodata\/WorkflowReportService\.xsodata\/WorkflowLogView.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: Workflow Log View API");

					// Extract employee ID from URL
					var url = oXhr.url;
					var employeeIdMatch = url.match(/EMPLOYEE_ID eq '(\d+)'/);
					var employeeId = employeeIdMatch ? employeeIdMatch[1] : "107119";

					// Clone and customize class data
					var classesData = JSON.parse(JSON.stringify(oMockData.classes));
					classesData.d.results.forEach(function(classItem) {
						classItem.EMPLOYEE_ID = employeeId;
						var empNames = {
							"107119": "John Smith",
							"107120": "Jane Doe",
							"107121": "Mike Johnson",
							"107122": "Sarah Williams",
							"107123": "Ahmed Hassan"
						};
						classItem.EMPLOYEE_NAME = empNames[employeeId] || "Employee " + employeeId;
					});

					oXhr.respondJSON(200, {}, classesData);
				}
			});

			// Mock Picklist Service
			aRequests.push({
				method: "GET",
				path: /.*\/lmsproject\/hana\/xsjs\/PicklistService\.xsjs.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: Picklist Service API");
					oXhr.respondJSON(200, {}, oMockData.picklists);
				}
			});

			// Mock Cancel Class
			aRequests.push({
				method: "POST",
				path: /.*\/cpi\/LMS\/cancelComplete.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: Cancel Class API");
					oXhr.respondJSON(200, {}, oMockData.cancelClassResponse);
				}
			});

			// Mock OData metadata
			aRequests.push({
				method: "GET",
				path: /.*\$metadata.*/,
				response: function(oXhr) {
					console.log("✅ Mocking: OData Metadata");
					oXhr.respond(200, { "Content-Type": "application/xml" },
						'<?xml version="1.0" encoding="utf-8"?><edmx:Edmx Version="1.0" xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx"></edmx:Edmx>');
				}
			});

			_mockServer.setRequests(aRequests);
			_mockServer.start();

			console.log("✅ Mock server started successfully!");
			console.log("All backend API calls will be intercepted and mocked");
		},

		getMockServer: function() {
			return _mockServer;
		}
	};
});
