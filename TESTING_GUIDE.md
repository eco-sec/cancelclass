# Testing Guide - Cancel Class Application

## Application is now running with full mock data support!

The application is running at: **http://localhost:8080**

## Mock Data Overview

### Default User
- **Badge Number**: 107119
- **Name**: John Smith
- **Email**: john.smith@example.com
- **Role**: Manager with subordinates

### Mock Subordinates
1. **107120** - Jane Doe
2. **107121** - Mike Johnson
3. **107122** - Sarah Williams
4. **107123** - Ahmed Hassan

### Mock Classes
All employees have 3 classes assigned:
- **CL001**: SAP ABAP Programming Fundamentals
- **CL002**: SAP Fiori Development
- **CL003**: Cloud Platform Integration

## Testing Workflows

### Test 1: Cancel My Own Class
✅ **How to Test:**
1. Open http://localhost:8080
2. Click "Cancel My Class" button
3. Select a class from dropdown (should show 3 classes)
4. Click "Proceed"
5. Review class details in the workflow dialog
6. Select a cancellation reason
7. Click "Confirm Cancellation"

✅ **Expected Result:**
- Class list loads successfully from mock data
- Workflow details show formatted dates and eligibility status
- Cancellation succeeds with success message

### Test 2: Cancel on Behalf of Subordinate
✅ **How to Test:**
1. Click "Cancel on Behalf" button
2. Wait for subordinates dropdown to populate (4 employees)
3. Select a subordinate (e.g., "107120 - Jane Doe")
4. Class dropdown should auto-populate with that employee's classes
5. Select a class
6. Click "Proceed"
7. Review workflow details
8. Select cancellation reason
9. Click "Confirm Cancellation"

✅ **Expected Result:**
- Subordinates list loads with 4 employees
- Classes load dynamically based on selected subordinate
- Cancellation workflow completes successfully

### Test 3: Cancellation Business Rules
✅ **Eligibility Rules:**
- **Training Type 1 or 2**: Must cancel >5 days before start date
- **Training Type 3**: Must cancel >10 days before start date
- **Already Started**: Cannot cancel if start date has passed

✅ **How to Test:**
1. Follow Test 1 or Test 2 workflow
2. Check "Days Left" and "Eligibility" in workflow dialog
3. "Confirm Cancellation" button should be:
   - **Enabled** if eligible
   - **Disabled** if not eligible with reason shown

## Console Verification

### Expected Console Logs
When you open the application, you should see:

```
🔧 Initializing Mock Server with jQuery AJAX interception...
🔧 Running in LOCAL mode with mock data enabled
✅ Mock server started successfully!
🌐 AJAX Request intercepted: /services/userapi/currentUser
✅ Mocking: User API
✅ User loaded: 107119
```

When clicking "Cancel on Behalf":
```
🌐 AJAX Request intercepted: /cpi/employee/getSubordinate?employeeId=107119
✅ Mocking: Subordinates API
```

When selecting subordinate:
```
🌐 AJAX Request intercepted: /lmsproject/hana/xsodata/WorkflowReportService.xsodata/WorkflowLogView?...
✅ Mocking: Classes API
```

## Mock Data Details

### Date Format
All dates in mock data use SAP format: `/Date(milliseconds)/`

Example:
- `/Date(1735689600000)/` = January 1, 2025

### Training Types
- **Type 1**: Internal Training (5 day cancellation policy)
- **Type 2**: External Training (5 day cancellation policy)
- **Type 3**: Online Training (10 day cancellation policy)

### Cancellation Reasons
16 predefined reasons including:
1. Work Commitments
2. Personal Emergency
3. Health Issues
4. Family Obligations
5. Conflicting Schedule
... and more

## Troubleshooting

### Issue: Subordinates dropdown is empty
**Check:**
1. Open browser DevTools (F12) → Console
2. Look for: `✅ Mocking: Subordinates API`
3. If missing, mock server didn't intercept the call
4. Refresh the page (Ctrl+R or Cmd+R)

### Issue: Classes dropdown is empty
**Check:**
1. Verify subordinate was selected
2. Check console for: `✅ Mocking: Classes API`
3. Verify mock data structure in `/webapp/localService/mockdata.js`

### Issue: User not loaded
**Check:**
1. Console should show: `✅ User loaded: 107119`
2. If showing "Error retrieving user info", mock API didn't respond
3. Default fallback username is "107119" - app should still work

### Issue: Cancellation fails
**Check:**
1. Console for: `✅ Mocking: Cancel Class API`
2. Mock server should return success response
3. Check browser Network tab for failed requests

## Verification Checklist

- [ ] Application loads at http://localhost:8080
- [ ] Console shows "Running in LOCAL mode with mock data enabled"
- [ ] "Cancel My Class" button is visible
- [ ] "Cancel on Behalf" button is visible
- [ ] Clicking "Cancel on Behalf" shows busy indicator
- [ ] Subordinates dropdown populates with 4 employees
- [ ] Selecting subordinate triggers class loading
- [ ] Classes dropdown shows 3 classes
- [ ] "Proceed" opens workflow details dialog
- [ ] Workflow details show formatted dates
- [ ] Cancellation reason dropdown has 16 options
- [ ] "Confirm Cancellation" shows success message

## Next Steps

Once all tests pass, you can:
1. Commit changes to git repository
2. Deploy to SAP Neo environment
3. Replace mock data with real backend services
4. Test with production credentials

## Mock Server Architecture

The mock server uses **jQuery ajaxPrefilter** to intercept ALL AJAX calls before they reach the network layer. This ensures:
- No actual HTTP requests are made
- Mock data is returned instantly
- No backend dependencies required
- All service patterns are tested locally

### Endpoints Mocked
1. `/services/userapi/currentUser` - User authentication
2. `/cpi/employee/getSubordinate` - Employee hierarchy
3. `/lmsproject/hana/xsodata/WorkflowReportService.xsodata/WorkflowLogView` - Class assignments
4. `/lmsproject/hana/xsjs/PicklistService.xsjs` - Cancellation reasons
5. `/cpi/LMS/cancelComplete` - Cancel class action

All endpoints return mock data from `/webapp/localService/mockdata.js`.
