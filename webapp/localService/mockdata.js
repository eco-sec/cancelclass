sap.ui.define([], function () {
	"use strict";

	return {
		// Mock current user data
		currentUser: {
			name: "107119",  // Badge number as name (used in controller)
			firstName: "John",
			lastName: "Smith",
			email: "john.smith@example.com",
			displayName: "John Smith"
		},

		// Mock employee data
		employees: {
			"107119": {
				employeeId: "107119",
				badgeNo: "107119",
				name: "John Smith",
				firstName: "John",
				lastName: "Smith",
				email: "john.smith@example.com",
				department: "IT Department",
				position: "Senior Developer",
				isManager: true
			},
			"107120": {
				employeeId: "107120",
				badgeNo: "107120",
				name: "Jane Doe",
				firstName: "Jane",
				lastName: "Doe",
				email: "jane.doe@example.com",
				department: "IT Department",
				position: "Developer"
			},
			"107121": {
				employeeId: "107121",
				badgeNo: "107121",
				name: "Mike Johnson",
				firstName: "Mike",
				lastName: "Johnson",
				email: "mike.johnson@example.com",
				department: "IT Department",
				position: "Junior Developer"
			}
		},

		// Mock subordinates for manager (in the format expected by the controller)
		// Simulating large dataset (100+ employees) to test Value Help search
		subordinates: {
			EmployeeHierarchySet: {
				EmployeeHierarchy: (function() {
					var employees = [];
					var firstNames = ["John", "Jane", "Mike", "Sarah", "Ahmed", "Maria", "David", "Emma", "Alex", "Lisa",
									  "Robert", "Emily", "James", "Anna", "Michael", "Sophia", "William", "Olivia", "Richard", "Isabella"];
					var lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
									 "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

					// Generate 100 mock subordinates
					for (var i = 0; i < 100; i++) {
						var empId = String(107120 + i);
						var firstName = firstNames[i % firstNames.length];
						var lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
						var fullName = firstName + " " + lastName;
						var email = firstName.toLowerCase() + "." + lastName.toLowerCase() + "@example.com";

						employees.push({
							EmpPernr: empId,
							EmpEnglishName: fullName,
							EmpEmailId: email,
							employeeId: empId,
							badgeNo: empId,
							firstName: firstName,
							lastName: lastName,
							fullName: fullName,
							name: fullName,
							email: email
						});
					}

					return employees;
				})()
			}
		},

		// Mock classes for employees
		classes: {
			d: {
				results: [
					{
						__metadata: {
							type: "LMS_PROJECT.xsodata.WorkflowReportService.WorkflowLogViewType",
							uri: "http://localhost/WorkflowLogView(CLASS_ID='102',EMPLOYEE_ID='107119')"
						},
						CITY: "",
						CLASS_CURRENCY: "SAR",
						CLASS_DESCRIPTION: "Comprehensive ABAP programming course covering fundamentals",
						CLASS_END_DATE: "/Date(" + (Date.now() + (20 * 24 * 60 * 60 * 1000) + (3 * 24 * 60 * 60 * 1000)) + ")/",
						CLASS_END_TIME: "150000",
						CLASS_ID: "102",
						CLASS_PRICE: "0.0",
						CLASS_START_DATE: "/Date(" + (Date.now() + (20 * 24 * 60 * 60 * 1000)) + ")/",
						CLASS_START_TIME: "090000",
						CLASS_TITLE: "SAP ABAP Programming Fundamentals",
						CLASS_TOTAL_DAYS: "3",
						COUNTRY: "",
						CURRENCY: "",
						EMPLOYEE_EMAIL: "john.smith@example.com",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						EMPLOYEE_ORGANIZATION_ID: "15012101",
						EMPLOYEE_POSITION: "Senior Developer",
						EXPECTED_TRAINING_DATE_IN_DAYS: "",
						FACILITY_DESC: "Training Center - Riyadh|Riyadh Training Center",
						FACILITY_ID: "Riyadh Training Center",
						FINANCIAL_COMMITMENT_NUMBER: "",
						ITEM_TITLE_AR: "أساسيات برمجة ABAP",
						ITEM_TITLE_EN: "SAP ABAP Programming Fundamentals",
						PENDING_SINCE_DATE: null,
						PENDING_SINCE_TIME: null,
						PENDING_WITH_POSITION: null,
						PRICE: "",
						REQUEST_ID: "107119-1-102",
						TRAINING_CENTER_NAME: "SAP Training Center",
						TRAINING_DURATION: "3",
						TRAINING_LANGUAGE: "English",
						TRAINING_TYPE_DESC: "In-Company Courses - Main Area",
						TRAINING_TYPE_ID: "1",
						WLR_CREATION_DATE: "/Date(" + (Date.now() - (30 * 24 * 60 * 60 * 1000)) + ")/",
						WLR_CREATION_TIME: "PT9H9M5S",
						WLR_UPDATE_DATE: "/Date(" + (Date.now() - (5 * 24 * 60 * 60 * 1000)) + ")/",
						WLR_UPDATE_TIME: "PT15H47M18S",
						WORKFLOW_INSTANCE_ID: "750abb62-6b92-11f0-8e60-fa163e209b8e",
						WORKFLOW_STATUS: "Approved"
					},
					{
						__metadata: {
							type: "LMS_PROJECT.xsodata.WorkflowReportService.WorkflowLogViewType",
							uri: "http://localhost/WorkflowLogView(CLASS_ID='205',EMPLOYEE_ID='107119')"
						},
						CITY: "Jeddah",
						CLASS_CURRENCY: "SAR",
						CLASS_DESCRIPTION: "Advanced Fiori development techniques",
						CLASS_END_DATE: "/Date(" + (Date.now() + (30 * 24 * 60 * 60 * 1000) + (2 * 24 * 60 * 60 * 1000)) + ")/",
						CLASS_END_TIME: "160000",
						CLASS_ID: "205",
						CLASS_PRICE: "5000.0",
						CLASS_START_DATE: "/Date(" + (Date.now() + (30 * 24 * 60 * 60 * 1000)) + ")/",
						CLASS_START_TIME: "090000",
						CLASS_TITLE: "SAP Fiori Development Advanced",
						CLASS_TOTAL_DAYS: "2",
						COUNTRY: "Saudi Arabia",
						CURRENCY: "SAR",
						EMPLOYEE_EMAIL: "john.smith@example.com",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						EMPLOYEE_ORGANIZATION_ID: "15012101",
						EMPLOYEE_POSITION: "Senior Developer",
						EXPECTED_TRAINING_DATE_IN_DAYS: "",
						FACILITY_DESC: "Training Center - Jeddah|Jeddah Training Center",
						FACILITY_ID: "Jeddah Training Center",
						FINANCIAL_COMMITMENT_NUMBER: "FC-2024-001",
						ITEM_TITLE_AR: "تطوير Fiori المتقدم",
						ITEM_TITLE_EN: "SAP Fiori Development Advanced",
						PENDING_SINCE_DATE: null,
						PENDING_SINCE_TIME: null,
						PENDING_WITH_POSITION: null,
						PRICE: "5000.0",
						REQUEST_ID: "107119-2-205",
						TRAINING_CENTER_NAME: "SAP Excellence Center",
						TRAINING_DURATION: "2",
						TRAINING_LANGUAGE: "English",
						TRAINING_TYPE_DESC: "External Courses - Outside Area",
						TRAINING_TYPE_ID: "2",
						WLR_CREATION_DATE: "/Date(" + (Date.now() - (25 * 24 * 60 * 60 * 1000)) + ")/",
						WLR_CREATION_TIME: "PT10H15M30S",
						WLR_UPDATE_DATE: "/Date(" + (Date.now() - (3 * 24 * 60 * 60 * 1000)) + ")/",
						WLR_UPDATE_TIME: "PT14H30M45S",
						WORKFLOW_INSTANCE_ID: "850bcc73-7c93-22f1-9f71-fb274f310c9f",
						WORKFLOW_STATUS: "Approved"
					},
					{
						__metadata: {
							type: "LMS_PROJECT.xsodata.WorkflowReportService.WorkflowLogViewType",
							uri: "http://localhost/WorkflowLogView(CLASS_ID='310',EMPLOYEE_ID='107119')"
						},
						CITY: "Dammam",
						CLASS_CURRENCY: "SAR",
						CLASS_DESCRIPTION: "Integration patterns for SAP Cloud Platform",
						CLASS_END_DATE: "/Date(" + (Date.now() + (45 * 24 * 60 * 60 * 1000) + (2 * 24 * 60 * 60 * 1000)) + ")/",
						CLASS_END_TIME: "150000",
						CLASS_ID: "310",
						CLASS_PRICE: "3500.0",
						CLASS_START_DATE: "/Date(" + (Date.now() + (45 * 24 * 60 * 60 * 1000)) + ")/",
						CLASS_START_TIME: "090000",
						CLASS_TITLE: "Cloud Platform Integration",
						CLASS_TOTAL_DAYS: "2",
						COUNTRY: "Saudi Arabia",
						CURRENCY: "SAR",
						EMPLOYEE_EMAIL: "john.smith@example.com",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						EMPLOYEE_ORGANIZATION_ID: "15012101",
						EMPLOYEE_POSITION: "Senior Developer",
						EXPECTED_TRAINING_DATE_IN_DAYS: "",
						FACILITY_DESC: "Training Center - Dammam|Dammam Training Center",
						FACILITY_ID: "Dammam Training Center",
						FINANCIAL_COMMITMENT_NUMBER: "FC-2024-002",
						ITEM_TITLE_AR: "تكامل منصة السحابة",
						ITEM_TITLE_EN: "Cloud Platform Integration",
						PENDING_SINCE_DATE: null,
						PENDING_SINCE_TIME: null,
						PENDING_WITH_POSITION: null,
						PRICE: "3500.0",
						REQUEST_ID: "107119-3-310",
						TRAINING_CENTER_NAME: "Cloud Excellence Center",
						TRAINING_DURATION: "2",
						TRAINING_LANGUAGE: "English/Arabic",
						TRAINING_TYPE_DESC: "Specialist Courses - Advanced",
						TRAINING_TYPE_ID: "3",
						WLR_CREATION_DATE: "/Date(" + (Date.now() - (20 * 24 * 60 * 60 * 1000)) + ")/",
						WLR_CREATION_TIME: "PT8H45M20S",
						WLR_UPDATE_DATE: "/Date(" + (Date.now() - (2 * 24 * 60 * 60 * 1000)) + ")/",
						WLR_UPDATE_TIME: "PT16H20M10S",
						WORKFLOW_INSTANCE_ID: "960ddd84-8d04-33g2-0g82-gc385g421d0g",
						WORKFLOW_STATUS: "Approved"
					}
				]
			}
		},

		// Mock workflow report data
		workflowReport: {
			d: {
				results: [
					{
						WORKFLOW_ID: "WF001",
						CLASS_ID: "CL001",
						CLASS_TITLE: "SAP ABAP Programming Fundamentals",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						WORKFLOW_STATUS: "Approved",
						CLASS_START_DATE: "/Date(1735689600000)/",
						CLASS_END_DATE: "/Date(1735862400000)/",
						CREATED_DATE: "/Date(1733097600000)/"
					}
				]
			}
		},

		// Mock cancellation reasons (from CLAUDE.md reference)
		cancellationReasons: [
			{ key: "1", text: "Work Commitments", textAr: "التزامات العمل" },
			{ key: "2", text: "Personal Emergency", textAr: "حالة طوارئ شخصية" },
			{ key: "3", text: "Health Issues", textAr: "مشاكل صحية" },
			{ key: "4", text: "Family Obligations", textAr: "التزامات عائلية" },
			{ key: "5", text: "Conflicting Schedule", textAr: "تضارب في الجدول الزمني" },
			{ key: "6", text: "Travel Restrictions", textAr: "قيود السفر" },
			{ key: "7", text: "Course Not Relevant", textAr: "الدورة غير ذات صلة" },
			{ key: "8", text: "Already Trained", textAr: "تم التدريب بالفعل" },
			{ key: "9", text: "Changed Role", textAr: "تغيير الدور الوظيفي" },
			{ key: "10", text: "Budget Constraints", textAr: "قيود الميزانية" },
			{ key: "11", text: "Technical Issues", textAr: "مشاكل تقنية" },
			{ key: "12", text: "Duplicate Registration", textAr: "تسجيل مكرر" },
			{ key: "13", text: "Management Decision", textAr: "قرار الإدارة" },
			{ key: "14", text: "Project Priority", textAr: "أولوية المشروع" },
			{ key: "15", text: "Location Change", textAr: "تغيير الموقع" },
			{ key: "16", text: "Other", textAr: "أخرى" }
		],

		// Mock picklist data
		picklists: {
			cancellationReasons: [
				{ key: "1", text: "Work Commitments", textAr: "التزامات العمل" },
				{ key: "2", text: "Personal Emergency", textAr: "حالة طوارئ شخصية" },
				{ key: "3", text: "Health Issues", textAr: "مشاكل صحية" },
				{ key: "4", text: "Family Obligations", textAr: "التزامات عائلية" },
				{ key: "5", text: "Conflicting Schedule", textAr: "تضارب في الجدول الزمني" },
				{ key: "6", text: "Travel Restrictions", textAr: "قيود السفر" },
				{ key: "7", text: "Course Not Relevant", textAr: "الدورة غير ذات صلة" },
				{ key: "8", text: "Already Trained", textAr: "تم التدريب بالفعل" },
				{ key: "9", text: "Changed Role", textAr: "تغيير الدور الوظيفي" },
				{ key: "10", text: "Budget Constraints", textAr: "قيود الميزانية" },
				{ key: "11", text: "Technical Issues", textAr: "مشاكل تقنية" },
				{ key: "12", text: "Duplicate Registration", textAr: "تسجيل مكرر" },
				{ key: "13", text: "Management Decision", textAr: "قرار الإدارة" },
				{ key: "14", text: "Project Priority", textAr: "أولوية المشروع" },
				{ key: "15", text: "Location Change", textAr: "تغيير الموقع" },
				{ key: "16", text: "Other", textAr: "أخرى" }
			]
		},

		// Mock cancel class response (old API)
		cancelClassResponse: {
			success: true,
			message: "Class cancelled successfully",
			workflowId: "WF" + Date.now(),
			status: "Cancelled_By_Auth_End_User"
		},

		// Mock create cancellation request response (new API)
		createCancellationResponse: {
			success: true,
			message: "Cancellation request submitted successfully",
			requestId: "CR" + Date.now(),
			workflowInstanceId: "WF" + Date.now(),
			status: "Pending Approval",
			approvalLevel: "Manager",
			expectedApprovalDate: "/Date(" + (Date.now() + 86400000) + ")/"  // +1 day
		},

		// Mock business event response
		businessEventResponse: {
			success: true,
			eventId: "BE" + Date.now(),
			message: "Business event created successfully"
		}
	};
});
