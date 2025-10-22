# Mock Server Implementation Guide for SAP UI5 Applications

## Overview

This guide shows how to implement a complete local testing solution for SAP UI5/WebIDE applications using jQuery AJAX interception. This approach allows you to:

- Test applications locally without backend dependencies
- Develop UI features independently of backend availability
- Create comprehensive test scenarios with controlled data
- Enable offline development capabilities

## Architecture

### File Structure

```
webapp/
├── localService/
│   ├── mockdata.js          # Mock data definitions
│   └── mockserver.js        # jQuery AJAX interceptor
├── Component.js             # Initialize mock server
├── service/
│   ├── BusinessEventService.js
│   └── EmployeeService.js
└── controller/
    └── YourController.js
```

## Step-by-Step Implementation

### Step 1: Create Mock Data Definition

Create `/webapp/localService/mockdata.js`:

```javascript
sap.ui.define([], function () {
    "use strict";

    return {
        // Define your mock data matching expected API responses

        // Example: User Authentication
        currentUser: {
            name: "107119",
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@example.com"
        },

        // Example: OData v2 Response Format
        entitySet: {
            d: {
                results: [
                    {
                        ID: "1",
                        NAME: "Item 1",
                        VALUE: "100"
                    },
                    {
                        ID: "2",
                        NAME: "Item 2",
                        VALUE: "200"
                    }
                ]
            }
        },

        // Example: Picklist/Dropdown Options
        picklists: {
            categories: [
                { key: "1", text: "Category 1" },
                { key: "2", text: "Category 2" }
            ]
        },

        // Example: POST Response
        createResponse: {
            success: true,
            message: "Record created successfully",
            id: "NEW123"
        }
    };
});
```

### Step 2: Create Mock Server with jQuery AJAX Interception

Create `/webapp/localService/mockserver.js`:

```javascript
sap.ui.define([
    "sap/ui/core/util/MockServer",
    "./mockdata",
    "sap/ui/thirdparty/jquery"
], function (MockServer, MockData, jQuery) {
    "use strict";

    var _mockServer = null;

    return {
        init: function () {
            var oMockData = MockData;

            console.log("🔧 Initializing Mock Server with jQuery AJAX interception...");

            // Store original jQuery.ajax
            var originalAjax = jQuery.ajax;

            // Override jQuery.ajax to intercept ALL calls
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

                // ====== CUSTOMIZE THIS SECTION FOR YOUR APIS ======

                // Example 1: Simple GET endpoint
                if (url.indexOf("/api/user/current") > -1) {
                    console.log("✅ Mocking: User API");
                    mockData = oMockData.currentUser;
                    shouldMock = true;
                }

                // Example 2: OData endpoint with URL parameter extraction
                else if (url.indexOf("/odata/EntitySet") > -1) {
                    console.log("✅ Mocking: OData Service");

                    // Extract filter parameters from OData URL
                    var idMatch = url.match(/ID eq '(\\w+)'/);
                    var filterId = idMatch ? idMatch[1] : null;

                    // Clone and filter data based on parameters
                    var responseData = JSON.parse(JSON.stringify(oMockData.entitySet));
                    if (filterId) {
                        responseData.d.results = responseData.d.results.filter(function(item) {
                            return item.ID === filterId;
                        });
                    }

                    mockData = responseData;
                    shouldMock = true;
                }

                // Example 3: POST endpoint
                else if (url.indexOf("/api/create") > -1 && options.type === "POST") {
                    console.log("✅ Mocking: Create API");
                    mockData = oMockData.createResponse;
                    shouldMock = true;
                }

                // ====== END CUSTOMIZATION SECTION ======

                // If should mock, create a fake jqXHR response
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
                    }, 500); // Simulate network delay

                    // Return a promise-like object
                    var promise = dfd.promise(mockXhr);
                    promise.success = promise.done;
                    promise.error = promise.fail;
                    return promise;
                }

                // If not mocked, call original ajax
                return originalAjax.apply(this, arguments);
            };

            // Initialize SAP MockServer for OData metadata (optional)
            _mockServer = new MockServer({
                rootUri: "/"
            });

            MockServer.config({
                autoRespond: true,
                autoRespondAfter: 500
            });

            var aRequests = _mockServer.getRequests();

            // Add OData metadata mock (optional)
            aRequests.push({
                method: "GET",
                path: /.*\\$metadata.*/,
                response: function(oXhr) {
                    console.log("✅ Mocking: OData Metadata");
                    oXhr.respond(200, { "Content-Type": "application/xml" },
                        '<?xml version="1.0" encoding="utf-8"?><edmx:Edmx Version="1.0"></edmx:Edmx>');
                }
            });

            _mockServer.setRequests(aRequests);
            _mockServer.start();

            console.log("✅ Mock server started successfully!");
        },

        getMockServer: function() {
            return _mockServer;
        }
    };
});
```

### Step 3: Initialize Mock Server in Component.js

Modify your `/webapp/Component.js`:

```javascript
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "your/app/model/models",
    "your/app/localService/mockserver"  // ✅ Add this import
], function (UIComponent, Device, models, mockserver) {
    "use strict";

    return UIComponent.extend("your.app.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            // ✅ Detect runtime environment
            var sRunMode = window.location.hostname === "localhost" ||
                           window.location.hostname === "127.0.0.1" ? "local" : "production";

            // ✅ Initialize mock server for local development
            if (sRunMode === "local") {
                mockserver.init();
                console.log("🔧 Running in LOCAL mode with mock data enabled");
            } else {
                console.log("🌐 Running in PRODUCTION mode");
            }

            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize models, router, etc.
            this.setModel(models.createDeviceModel(), "device");
            this.getRouter().initialize();
        }
    });
});
```

### Step 4: Add Fallback Data in Controllers (Optional but Recommended)

In your controllers, add default values as fallback:

```javascript
fetchCurrentUser: function () {
    var oUserModel = new JSONModel();
    var that = this;

    // ✅ Set default value BEFORE API call (fallback if API fails)
    that.username = "107119";

    oUserModel.loadData("/services/userapi/currentUser");
    oUserModel.attachRequestCompleted(function (oEvent) {
        if (oEvent.getParameter("success")) {
            var oData = oUserModel.getData();
            that.username = oData.name || "107119";
            console.log("✅ User loaded:", that.username);
        } else {
            console.error("Using default username:", that.username);
        }
    }.bind(this));

    oUserModel.attachRequestFailed(function () {
        console.error("Failed to load user - using default:", that.username);
    }.bind(this));
}
```

## How It Works

### jQuery AJAX Override Mechanism

1. **Store Original**: `var originalAjax = jQuery.ajax;`
2. **Override Function**: Replace `jQuery.ajax` with custom function
3. **Inspect URL**: Check if URL matches mock patterns
4. **Return Mock Response**: If matched, return fake jqXHR object
5. **Fallback**: If not matched, call original AJAX

### jqXHR Mock Object Structure

The mock object must implement:

```javascript
{
    readyState: 4,              // XMLHttpRequest.DONE
    status: 200,                // HTTP status code
    statusText: "OK",           // HTTP status text
    responseText: "...",        // JSON stringified data
    responseJSON: {...},        // Actual data object
    getResponseHeader: function() {},
    getAllResponseHeaders: function() {}
}
```

### Callback Execution Order

1. `options.success(data, "success", xhr)` - Success callback
2. `options.complete(xhr, "success")` - Completion callback
3. `deferred.resolve(data, "success", xhr)` - Promise resolution

## Common Patterns

### Pattern 1: Dynamic Data Based on URL Parameters

```javascript
// Extract employee ID from URL
var employeeIdMatch = url.match(/employeeId=(\\d+)/);
var employeeId = employeeIdMatch ? employeeIdMatch[1] : "default";

// Clone mock data
var responseData = JSON.parse(JSON.stringify(oMockData.employees));

// Filter/customize based on parameter
responseData.results = responseData.results.filter(function(emp) {
    return emp.manager === employeeId;
});

mockData = responseData;
```

### Pattern 2: OData $filter Query Parsing

```javascript
// OData filter: $filter=STATUS eq 'Active' and DATE gt datetime'2025-01-01'
var statusMatch = url.match(/STATUS eq '(\\w+)'/);
var dateMatch = url.match(/DATE gt datetime'([^']+)'/);

var status = statusMatch ? statusMatch[1] : null;
var date = dateMatch ? new Date(dateMatch[1]) : null;

var filtered = oMockData.items.d.results.filter(function(item) {
    var matchStatus = !status || item.STATUS === status;
    var matchDate = !date || new Date(item.DATE) > date;
    return matchStatus && matchDate;
});

mockData = { d: { results: filtered } };
```

### Pattern 3: Different Responses for POST/PUT/DELETE

```javascript
if (url.indexOf("/api/item") > -1) {
    if (options.type === "POST") {
        mockData = { success: true, id: "NEW_" + Date.now() };
    } else if (options.type === "PUT") {
        mockData = { success: true, updated: true };
    } else if (options.type === "DELETE") {
        mockData = { success: true, deleted: true };
    } else {
        // GET
        mockData = oMockData.items;
    }
    shouldMock = true;
}
```

### Pattern 4: Error Simulation

```javascript
// Simulate error for testing error handling
if (url.indexOf("/api/failing-endpoint") > -1) {
    var dfd = jQuery.Deferred();
    var errorXhr = {
        readyState: 4,
        status: 500,
        statusText: "Internal Server Error",
        responseText: JSON.stringify({ error: "Something went wrong" })
    };

    setTimeout(function() {
        if (options.error) {
            options.error(errorXhr, "error", "Internal Server Error");
        }
        if (options.complete) {
            options.complete(errorXhr, "error");
        }
        dfd.reject(errorXhr, "error", "Internal Server Error");
    }, 500);

    return dfd.promise(errorXhr);
}
```

## OData v2 Response Format

When mocking OData services, always use the correct structure:

```javascript
{
    d: {
        results: [
            { ID: "1", NAME: "Item 1" },
            { ID: "2", NAME: "Item 2" }
        ]
    }
}
```

For single entity:
```javascript
{
    d: {
        ID: "1",
        NAME: "Item 1"
    }
}
```

## SAP Date Format

Use SAP's JSON date format:

```javascript
{
    START_DATE: "/Date(1735689600000)/",  // milliseconds since epoch
    END_DATE: "/Date(1735862400000)/"
}
```

Convert to readable date:
```javascript
var match = dateString.match(/\\/Date\\((\\d+)\\)\\//);
if (match && match[1]) {
    var oDate = new Date(parseInt(match[1], 10));
    // Format as needed
}
```

## Testing Checklist

- [ ] Mock server initializes on localhost
- [ ] Console shows "Running in LOCAL mode"
- [ ] All API endpoints are intercepted
- [ ] Mock data matches expected response format
- [ ] Success callbacks are triggered
- [ ] Error scenarios work (if implemented)
- [ ] OData $filter queries work correctly
- [ ] UI components bind to mock data successfully
- [ ] No actual network requests are made (check Network tab)

## Advantages of This Approach

1. **No Backend Required**: Develop and test UI independently
2. **Fast Development**: No waiting for backend APIs
3. **Offline Capable**: Works without internet connection
4. **Comprehensive Testing**: Test all scenarios including edge cases
5. **Easy Debugging**: Controlled, predictable data
6. **Portable**: Works in any environment (local, WebIDE, BAS)
7. **Non-Invasive**: Zero changes to service layer code
8. **Production Ready**: Automatically disabled in production

## Migrating to Real Backend

When deploying to production:

1. Mock server automatically detects non-localhost environment
2. All AJAX calls pass through to real backend
3. No code changes required
4. Remove mock files from production build (optional)

## Troubleshooting

### Issue: Mock server not intercepting calls

**Solution**: Check console for "🌐 AJAX Request intercepted" logs. If missing:
- Ensure `mockserver.init()` is called in `Component.js`
- Verify URL pattern matching in mock server
- Check that mock server loads BEFORE services are called

### Issue: JSONModel shows "parsererror"

**Solution**: Ensure mock returns proper jqXHR object with:
- `responseText`: JSON stringified
- `responseJSON`: Actual object
- Callbacks called in correct order

### Issue: Data structure mismatch

**Solution**: Inspect actual API response format:
- Use browser Network tab to see real response
- Match OData v2 structure exactly: `{d: {results: [...]}}`
- Check field names and types

## Example: Complete Workflow

This project demonstrates a complete implementation:

1. **Mock Data**: `/webapp/localService/mockdata.js`
2. **Mock Server**: `/webapp/localService/mockserver.js`
3. **Component Init**: `/webapp/Component.js`
4. **Service Layer**: `/webapp/service/*.js` (unchanged)
5. **Controllers**: `/webapp/controller/*.js` (with fallbacks)

Study these files to understand the complete pattern.

## Reusing in Other Applications

1. Copy `/webapp/localService/` directory
2. Update `mockdata.js` with your API responses
3. Update `mockserver.js` URL patterns for your endpoints
4. Add `mockserver.init()` to your `Component.js`
5. Test with `npm start` on localhost

That's it! Your application now supports full local testing with mock data.

## Support

For issues or questions:
- Check browser console for error messages
- Verify Network tab shows no actual HTTP requests
- Ensure mock data structure matches expected format
- Review this guide's troubleshooting section

---

**Created for**: SAP UI5 / SAP WebIDE / SAP Business Application Studio
**Pattern**: jQuery AJAX Interception with jqXHR Mocking
**Compatible with**: UI5 1.52+, OpenUI5, SAPUI5
