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
				firstName: "Jane",
				lastName: "Doe",
				email: "jane.doe@example.com",
				department: "IT Department",
				position: "Developer"
			},
			"107121": {
				employeeId: "107121",
				badgeNo: "107121",
				firstName: "Mike",
				lastName: "Johnson",
				email: "mike.johnson@example.com",
				department: "IT Department",
				position: "Junior Developer"
			}
		},

		// Mock subordinates for manager (in the format expected by the controller)
		subordinates: {
			EmployeeHierarchySet: {
				EmployeeHierarchy: [
					{
						EmpPernr: "107120",
						EmpEnglishName: "Jane Doe",
						employeeId: "107120",
						badgeNo: "107120",
						firstName: "Jane",
						lastName: "Doe",
						fullName: "Jane Doe",
						name: "Jane Doe",
						email: "jane.doe@example.com"
					},
					{
						EmpPernr: "107121",
						EmpEnglishName: "Mike Johnson",
						employeeId: "107121",
						badgeNo: "107121",
						firstName: "Mike",
						lastName: "Johnson",
						fullName: "Mike Johnson",
						name: "Mike Johnson",
						email: "mike.johnson@example.com"
					},
					{
						EmpPernr: "107122",
						EmpEnglishName: "Sarah Williams",
						employeeId: "107122",
						badgeNo: "107122",
						firstName: "Sarah",
						lastName: "Williams",
						fullName: "Sarah Williams",
						name: "Sarah Williams",
						email: "sarah.williams@example.com"
					},
					{
						EmpPernr: "107123",
						EmpEnglishName: "Ahmed Hassan",
						employeeId: "107123",
						badgeNo: "107123",
						firstName: "Ahmed",
						lastName: "Hassan",
						fullName: "Ahmed Hassan",
						name: "Ahmed Hassan",
						email: "ahmed.hassan@example.com"
					}
				]
			}
		},

		// Mock classes for employees
		classes: {
			d: {
				results: [
					{
						CLASS_ID: "CL001",
						CLASS_TITLE: "SAP ABAP Programming Fundamentals",
						CLASS_START_DATE: "/Date(1735689600000)/", // Future date
						CLASS_END_DATE: "/Date(1735862400000)/",
						CLASS_TYPE: "1",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						WORKFLOW_STATUS: "Approved",
						DAYS_TO_START: 8
					},
					{
						CLASS_ID: "CL002",
						CLASS_TITLE: "SAP Fiori Development",
						CLASS_START_DATE: "/Date(1736294400000)/",
						CLASS_END_DATE: "/Date(1736467200000)/",
						CLASS_TYPE: "2",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						WORKFLOW_STATUS: "Approved",
						DAYS_TO_START: 15
					},
					{
						CLASS_ID: "CL003",
						CLASS_TITLE: "Cloud Platform Integration",
						CLASS_START_DATE: "/Date(1736899200000)/",
						CLASS_END_DATE: "/Date(1737072000000)/",
						CLASS_TYPE: "3",
						EMPLOYEE_ID: "107119",
						EMPLOYEE_NAME: "John Smith",
						WORKFLOW_STATUS: "Approved",
						DAYS_TO_START: 22
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

		// Mock cancel class response
		cancelClassResponse: {
			success: true,
			message: "Class cancelled successfully",
			workflowId: "WF" + Date.now(),
			status: "Cancelled_By_Auth_End_User"
		},

		// Mock business event response
		businessEventResponse: {
			success: true,
			eventId: "BE" + Date.now(),
			message: "Business event created successfully"
		}
	};
});
