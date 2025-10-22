# Deployment Guide - Cancel Class Application

## Overview

This guide covers deploying the Cancel Class application to production SAP environments (BTP, Neo, HANA Cloud).

## ✅ Mock Server Auto-Disable

**Good news**: The mock server **automatically disables itself in production** - no code changes required!

### How It Works

The application detects the environment based on hostname:

```javascript
// In webapp/Component.js
var sRunMode = window.location.hostname === "localhost" ||
               window.location.hostname === "127.0.0.1" ? "local" : "production";

if (sRunMode === "local") {
    mockserver.init();  // Only runs on localhost!
    console.log("🔧 Running in LOCAL mode with mock data enabled");
} else {
    console.log("🌐 Running in PRODUCTION mode");
}
```

### Environment Detection Table

| Environment | Hostname Example | Mock Status | Backend Used |
|-------------|-----------------|-------------|--------------|
| **Local Dev** | `localhost:8080` | ✅ ENABLED | Mock data |
| **SAP WebIDE Preview** | `*.dispatcher.hana.ondemand.com` | ❌ DISABLED | Real backend |
| **SAP BTP** | `your-app.cfapps.eu10.hana.ondemand.com` | ❌ DISABLED | Real backend |
| **SAP Neo** | `*.hana.ondemand.com` | ❌ DISABLED | Real backend |
| **Custom Domain** | `app.yourcompany.com` | ❌ DISABLED | Real backend |

## Deployment Options

### Option 1: Deploy with Mock Files (Recommended)

**Advantages**:
- ✅ No code changes needed
- ✅ Can test locally after deployment
- ✅ Easy troubleshooting
- ✅ Mock files are small (~10KB total)

**Steps**:
```bash
# Build application
npm run build

# Deploy to SAP BTP/Neo
# (mock server automatically disabled)
```

### Option 2: Deploy without Mock Files (Optional)

**Advantages**:
- ✅ Slightly smaller bundle size
- ✅ Cleaner production package

**Steps**:

1. **Uncomment exclusion in `ui5.yaml`**:
   ```yaml
   resources:
     configuration:
       excludes:
         - "**/localService/**"  # Uncomment this line
   ```

2. **Or manually remove before deployment**:
   ```bash
   # Build first
   npm run build

   # Remove mock files from dist
   rm -rf dist/localService/
   rm -f dist/test*.html dist/test*.js

   # Deploy dist folder
   ```

## SAP BTP Cloud Foundry Deployment

### Prerequisites

- Cloud Foundry CLI installed
- SAP BTP account with space
- Destination service configured

### Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Create `manifest.yml`** (if not exists):
   ```yaml
   applications:
     - name: cancelclass
       memory: 128M
       buildpack: https://github.com/cloudfoundry/staticfile-buildpack.git
       path: dist
       env:
         FORCE_HTTPS: true
   ```

3. **Deploy**:
   ```bash
   cf login -a https://api.cf.eu10.hana.ondemand.com
   cf target -o your-org -s your-space
   cf push
   ```

4. **Verify**:
   ```bash
   cf apps
   # Check console logs - should show "Running in PRODUCTION mode"
   ```

## SAP Neo Platform Deployment

### Prerequisites

- SAP Neo CLI tools
- Neo account credentials
- Destinations configured

### Deployment Steps

1. **Build the application**:
   ```bash
   npm run build:mta
   ```

2. **Deploy using Neo console**:
   ```bash
   neo deploy --host hana.ondemand.com \
              --account your-account \
              --application cancelclass \
              --user your-email \
              --source dist
   ```

3. **Or use SAP WebIDE**:
   - Right-click project → Deploy → Deploy to SAP Cloud Platform
   - Select destination
   - Click Deploy

## Verification Checklist

After deployment, verify the following:

### 1. Check Console Logs

Open browser DevTools → Console:

✅ **Should see**:
```
🌐 Running in PRODUCTION mode
```

❌ **Should NOT see**:
```
🔧 Running in LOCAL mode with mock data enabled
🌐 AJAX Request intercepted: ...
✅ Mocking: User API
```

### 2. Check Network Tab

Open DevTools → Network tab:

✅ **Should see**: Real HTTP requests to backend services
- `/services/userapi/currentUser`
- `/cpi/employee/getSubordinate`
- `/lmsproject/hana/xsodata/...`

❌ **Should NOT see**: Status 200 with 0ms response time (mock responses)

### 3. Test Functionality

1. **Load Application**
   - ✅ Application loads without errors
   - ✅ No console errors about missing endpoints

2. **Test User Authentication**
   - ✅ Real user data loads from backend
   - ✅ Username displays correctly

3. **Test Cancel on Behalf**
   - ✅ Click "Cancel on Behalf"
   - ✅ Real subordinates load from backend
   - ✅ Classes load for selected subordinate

4. **Test Cancellation Workflow**
   - ✅ Can complete full cancellation flow
   - ✅ Backend updates class status

## Backend Configuration

Ensure the following backend services are configured:

### 1. User API Service

**Endpoint**: `/services/userapi/currentUser`
**Required**: User authentication and session management
**Returns**: Current user information

### 2. Employee Service (CPI)

**Endpoint**: `/cpi/employee/getSubordinate?employeeId={id}`
**Required**: Employee hierarchy
**Returns**: List of subordinates

### 3. Workflow Report Service (HANA XSOData)

**Endpoint**: `/lmsproject/hana/xsodata/WorkflowReportService.xsodata/WorkflowLogView`
**Required**: Class assignments
**Returns**: OData v2 response with class data

### 4. Picklist Service (HANA XSJS)

**Endpoint**: `/lmsproject/hana/xsjs/PicklistService.xsjs`
**Required**: Cancellation reasons
**Returns**: List of cancellation reason codes

### 5. Cancel Class Service (CPI)

**Endpoint**: `/cpi/LMS/cancelComplete`
**Method**: POST
**Required**: Class cancellation action
**Returns**: Success/failure response

## Troubleshooting

### Issue: Mock server still running in production

**Symptoms**:
- Console shows "Running in LOCAL mode"
- No actual HTTP requests in Network tab

**Solution**:
Check `Component.js` environment detection:
```javascript
// Make sure hostname check is correct
console.log("Current hostname:", window.location.hostname);

// Should NOT be localhost/127.0.0.1 in production
```

### Issue: Backend services not responding

**Symptoms**:
- Console shows "Running in PRODUCTION mode" ✅
- Network tab shows 404/500 errors

**Solution**:
1. Verify destination configuration in SAP BTP cockpit
2. Check CORS settings
3. Verify backend services are deployed and running
4. Check authentication/authorization

### Issue: CORS errors

**Symptoms**:
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**:
Configure destinations in SAP BTP:
```json
{
  "name": "employee_service",
  "url": "https://your-backend.com",
  "authentication": "OAuth2UserTokenExchange",
  "proxyType": "Internet",
  "forwardAuthToken": true
}
```

## Rolling Back to Mock Data

If you need to test locally after deployment:

1. **Clone repository**:
   ```bash
   git clone https://github.com/eco-sec/cancelclass.git
   cd cancelclass
   ```

2. **Install and run**:
   ```bash
   npm install
   npm start
   ```

3. **Mock server automatically activates** on localhost!

## Build Optimization

### Remove Test Files from Production

Update `ui5.yaml`:
```yaml
resources:
  configuration:
    excludes:
      - "**/test*.html"      # Test pages
      - "**/test*.js"        # Test scripts
      - "**/*.md"            # Documentation
      - "**/localService/**" # Mock server (optional)
```

### Minimize Bundle Size

```bash
# Build with minification
npm run build

# Check bundle size
du -sh dist/
```

## Environment Variables (Optional)

For more control, you can use environment variables:

### Option A: Build-time Environment

1. **Create `.env.production`**:
   ```
   VUE_APP_MOCK_ENABLED=false
   VUE_APP_API_URL=https://your-backend.com
   ```

2. **Update Component.js**:
   ```javascript
   var mockEnabled = process.env.VUE_APP_MOCK_ENABLED === "true";
   if (mockEnabled) {
       mockserver.init();
   }
   ```

### Option B: Runtime Detection (Current Implementation)

The current implementation uses **runtime hostname detection** which is simpler and doesn't require environment configuration.

## Deployment Best Practices

1. ✅ **Always build before deploying**
   ```bash
   npm run build
   ```

2. ✅ **Test in SAP WebIDE preview first**
   - Mock server will be disabled automatically
   - Verify backend connectivity

3. ✅ **Check console logs after deployment**
   - Should see "Running in PRODUCTION mode"

4. ✅ **Monitor backend service health**
   - Verify all endpoints are accessible
   - Check response times

5. ✅ **Keep mock files in repository**
   - Useful for future local development
   - Easy troubleshooting

6. ✅ **Document backend dependencies**
   - List all required services
   - Document API contracts

## Multi-Environment Strategy

### Development
- **Where**: `localhost:8080`
- **Mock Server**: ✅ Enabled
- **Backend**: Mock data
- **Purpose**: Feature development

### Testing/QA
- **Where**: SAP BTP test space
- **Mock Server**: ❌ Disabled
- **Backend**: Test backend
- **Purpose**: Integration testing

### Production
- **Where**: SAP BTP production space
- **Mock Server**: ❌ Disabled
- **Backend**: Production backend
- **Purpose**: Live operations

## Summary

### ✅ What You Need to Remember

1. **No code changes required** - Mock server auto-disables
2. **Deploy as-is** - Just run `npm run build` and deploy
3. **Verify after deployment** - Check console for "PRODUCTION mode"
4. **Backend must be configured** - Ensure all services are accessible

### ❌ What You DON'T Need to Do

1. ❌ Manually remove mock files (optional only)
2. ❌ Change environment variables
3. ❌ Modify Component.js
4. ❌ Comment out code

### 🎯 Deployment Command Summary

```bash
# Standard deployment (recommended)
npm run build
# Deploy dist/ folder to SAP BTP/Neo

# Optional: Remove mock files for smaller bundle
npm run build
rm -rf dist/localService/
# Deploy dist/ folder
```

That's it! The application is production-ready with **zero configuration changes** needed.

---

**For questions or issues**, refer to:
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing workflows
- [MOCK_SERVER_GUIDE.md](./MOCK_SERVER_GUIDE.md) - Mock server details
- [CLAUDE.md](./CLAUDE.md) - Complete architecture
