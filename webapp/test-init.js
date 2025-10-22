sap.ui.define([
	"cancelclass/cancelclass/localService/mockserver"
], function(mockserver) {
	"use strict";

	console.log("Test init module loaded");

	// Initialize mock server
	mockserver.init();
	console.log("Mock server initialized");

	// Wait a bit then test the endpoints
	setTimeout(function() {
		console.log("Testing mock endpoints...");

		// Test 1: Current user
		jQuery.ajax({
			url: "/services/userapi/currentUser",
			success: function(data) {
				console.log("✅ User API works:", data);
				document.getElementById("result1").innerHTML = "✅ User API: " + JSON.stringify(data, null, 2);
			},
			error: function(err) {
				console.error("❌ User API failed:", err);
				document.getElementById("result1").innerHTML = "❌ User API failed - Check console";
			}
		});

		// Test 2: Employee data
		jQuery.ajax({
			url: "/cpi/employee/details?employeeId=107119",
			success: function(data) {
				console.log("✅ Employee API works:", data);
				document.getElementById("result2").innerHTML = "✅ Employee API: " + JSON.stringify(data, null, 2);
			},
			error: function(err) {
				console.error("❌ Employee API failed:", err);
				document.getElementById("result2").innerHTML = "❌ Employee API failed - Check console";
			}
		});

		// Test 3: Picklist
		jQuery.ajax({
			url: "/lmsproject/hana/xsjs/PicklistService.xsjs",
			success: function(data) {
				console.log("✅ Picklist API works:", data);
				document.getElementById("result3").innerHTML = "✅ Picklist API: " + data.cancellationReasons.length + " reasons loaded";
			},
			error: function(err) {
				console.error("❌ Picklist API failed:", err);
				document.getElementById("result3").innerHTML = "❌ Picklist API failed - Check console";
			}
		});
	}, 1000);
});
