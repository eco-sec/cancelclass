# Local Testing Guide

This guide explains how to run and test the Cancel Class application locally with mock data.

## Prerequisites

- Node.js and npm installed
- Dependencies installed (`npm install`)

## Running Locally

```bash
npm start
```

The application will start on http://localhost:8080

## Testing URLs

- **Main Application**: http://localhost:8080/webapp/index.html
- **Test Version** (with testing banner): http://localhost:8080/webapp/test.html

## Mock Data Overview

When running on localhost, the application automatically uses mock data instead of real SAP backend services. The mock server intercepts all backend calls and returns predefined test data.

### Mock User

- **Name**: John Smith
- **Employee ID**: 107119
- **Role**: Manager (has subordinates)
- **Email**: john.smith@example.com

### Mock Classes

The mock user has 3 approved training classes:

1. **SAP ABAP Programming Fundamentals** (CL001)
   - Start: 8 days from now
   - Type: 1 (Eligible for cancellation - within 5-day window)

2. **SAP Fiori Development** (CL002)
   - Start: 15 days from now
   - Type: 2 (Eligible for cancellation)

3. **Cloud Platform Integration** (CL003)
   - Start: 22 days from now
   - Type: 3 (Eligible for cancellation - within 10-day window)

### Mock Subordinates

As a manager, John Smith has 2 subordinates:

1. **Jane Doe** (107120) - Developer
2. **Mike Johnson** (107121) - Junior Developer

### Cancellation Reasons

16 predefined cancellation reasons are available (bilingual English/Arabic):
- Work Commitments
- Personal Emergency
- Health Issues
- Family Obligations
- Conflicting Schedule
- And 11 more...

## Testing Scenarios

### Scenario 1: Cancel Own Class

1. Open the application
2. Click "Cancel My Class" button
3. The dialog will show the 3 mock classes
4. Select a class
5. Choose a cancellation reason
6. Click "Confirm"
7. Success message should appear

### Scenario 2: Cancel Class on Behalf (Manager)

1. Open the application
2. Click "Cancel on Behalf" button
3. Select an employee from the subordinates list (Jane Doe or Mike Johnson)
4. Select a class
5. Choose a cancellation reason
6. Click "Confirm"
7. Success message should appear

### Scenario 3: Eligibility Rules

The application enforces these rules:
- **Type 1 & 2 classes**: Must cancel at least 5 days before start
- **Other types**: Must cancel at least 10 days before start

All mock classes are configured to be eligible for cancellation.

## Mock Server Configuration

The mock server is located in `/webapp/localService/`:

- **mockdata.js** - Contains all mock data definitions
- **mockserver.js** - Configures mock endpoints and responses

### Mocked Endpoints

- `/services/userapi/currentUser` - Current user info
- `/cpi/employee/*` - Employee data and subordinates
- `/lmsproject/hana/xsodata/*` - OData services for classes and workflows
- `/lmsproject/hana/xsjs/*` - XSJS services for picklists
- `/cpi/LMS/cancelComplete` - Class cancellation endpoint
- `/cpi/businessEvent/create` - Business event creation

## Network Delay Simulation

The mock server simulates network delays:
- Standard requests: 500ms delay
- Cancel operation: 1000ms delay (to simulate processing time)

This helps test loading indicators and async behavior.

## Modifying Mock Data

To customize mock data for testing:

1. Edit `/webapp/localService/mockdata.js`
2. Modify the data objects (users, classes, subordinates, etc.)
3. Refresh the browser (no server restart needed)

Example: Adding a new class
```javascript
{
    CLASS_ID: "CL004",
    CLASS_TITLE: "Your Custom Class",
    CLASS_START_DATE: "/Date(1737504000000)/",
    CLASS_TYPE: "1",
    EMPLOYEE_ID: "107119",
    WORKFLOW_STATUS: "Approved",
    DAYS_TO_START: 30
}
```

## Browser Console

Open browser DevTools (F12) to see:
- Mock server initialization message
- Network requests being intercepted
- Response data
- Any errors or warnings

## Switching Between Local and Production

The application automatically detects the environment:

- **Local mode**: When running on localhost or 127.0.0.1
  - Mock server is initialized
  - All backend calls are mocked

- **Production mode**: When deployed to SAP BTP
  - Real backend services are used
  - Mock server is not loaded

## Known Limitations

When running locally with mocks:

1. **Authentication**: Bypassed (always logged in as mock user)
2. **Real-time data**: Static mock data (doesn't persist changes)
3. **Workflow integration**: Mocked responses (no actual workflow created)
4. **Complex validations**: Some backend validations are simplified

## Troubleshooting

### Issue: Application not loading

- Check browser console for errors
- Verify npm start is running without errors
- Try accessing http://localhost:8080 directly

### Issue: Mock data not working

- Check console for "Mock server started" message
- Verify you're accessing via localhost (not 127.0.0.1 if that's causing issues)
- Clear browser cache and reload

### Issue: Services still failing

- Check Network tab in browser DevTools
- Verify the mock server is intercepting requests
- Check for JavaScript errors in console

## Production Deployment

When deploying to SAP BTP Neo:

1. Build the application: `npm run build`
2. Deploy the `/dist` folder to SAP BTP
3. Configure destinations in neo-app.json:
   - HANA_DB_DEV_LMS
   - CPI or CPI_DEV
4. The mock server will NOT be initialized in production

## Support

For issues or questions:
- Check browser console for error messages
- Review CLAUDE.md for architecture details
- Check GitHub repository for updates
