# CLAUDE.md - Cancel Class Application

## Overview

This is a **SAP UI5 web application** for managing training class cancellations in a Learning Management System (LMS). The application is built using SAP UI5 framework and is designed as part of a larger enterprise learning management solution. It allows authorized personnel to cancel training classes either for themselves or on behalf of their subordinates.

**Project Type:** SAP UI5 Web Application (Single Page Application)
**Target Environment:** SAP BTP/HANA Cloud Platform
**Primary Domain:** Learning Management System (LMS) - Training Class Management
**Version:** 1.0.0

## Technology Stack

### Frontend Framework
- **SAP UI5 1.65.6+** - UI framework for building responsive web applications
  - Core libraries: `sap.ui.core`, `sap.m`, `sap.ui.layout`
  - Device support: Desktop, Tablet, Phone
  - Design theme: SAP Fiori 3

### Development Tools
- **UI5 CLI 1.13.0** - Build and development tool for UI5 applications
- **SAP WebIDE Extension (@sap/ui5-builder-webide-extension)** - Build process extensions
- **Node.js** - Runtime and package management

### Data & Integration
- **OData v2** - Consume backend services
- **JSON Model** - Client-side data binding
- **AJAX/jQuery** - HTTP requests and asynchronous operations
- **SAP CPI (Cloud Platform Integration)** - Backend integration point

### Backend Services
- **SAP HANA Database** - Primary data store
- **XSOData Services** - OData endpoint for WorkflowReportService
- **XSJS (JavaScript Server-Side)** - Server-side logic
- **User API Service** - Current user information retrieval

## Local Development with Mock Data

This application supports **complete local testing without backend dependencies** using a jQuery AJAX interception pattern.

### Quick Start
```bash
npm install
npm start
# Opens http://localhost:8080 with full mock data
```

### Mock Server Documentation
- **[MOCK_SERVER_GUIDE.md](./MOCK_SERVER_GUIDE.md)** - Complete guide for reusing mock pattern in other apps
- **[LOCAL_TESTING.md](./LOCAL_TESTING.md)** - Local testing scenarios and verification
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing workflows
- **[QUICK_START.md](./QUICK_START.md)** - Quick reference guide

The mock server implementation can be **copied to any SAP WebIDE/UI5 application** for local development.

## Project Structure

```
cancelclass/
├── webapp/                           # Main application source code
│   ├── Component.js                  # UI5 Component initialization (entry point)
│   ├── index.html                    # HTML bootstrap file
│   ├── manifest.json                 # Application descriptor and configuration
│   ├── localService/                 # ✅ Mock server for local development
│   │   ├── mockdata.js               # Mock data definitions
│   │   └── mockserver.js             # jQuery AJAX interceptor
│   ├── controller/
│   │   └── cancelClass.controller.js # Main controller (313 lines)
│   ├── view/
│   │   └── cancelClass.view.xml      # Main view layout (XML)
│   ├── fragment/
│   │   ├── CreateOnMyClassDialog.fragment.xml      # Dialog for canceling own classes
│   │   ├── CreateOnBehalfDialog.fragment.xml       # Dialog for delegated cancellation
│   │   └── WorkflowDetailsDialog.fragment.xml      # Workflow details & confirmation
│   ├── service/
│   │   ├── BusinessEventService.js   # LMS service integration (253 lines)
│   │   ├── EmployeeService.js        # Employee hierarchy service (106 lines)
│   │   └── PicklistService.js        # Picklist data service (48 lines)
│   ├── model/
│   │   └── models.js                 # Model factory for device configuration
│   ├── i18n/
│   │   └── i18n.properties           # Internationalization strings
│   ├── css/
│   │   └── style.css                 # Application styling
│   └── test/
│       ├── unit/
│       │   ├── AllTests.js
│       │   ├── unitTests.qunit.js    # Unit test runner
│       │   └── controller/
│       └── integration/
│           ├── AllJourneys.js
│           ├── NavigationJourney.js
│           ├── arrangements/
│           ├── pages/
│           └── opaTests.qunit.js     # OPA integration test runner
├── dist/                             # Build output directory
├── .che/                             # Eclipse Che workspace config
├── package.json                      # NPM dependencies & build scripts
├── package-lock.json                 # Dependency lock file
├── ui5.yaml                          # UI5 build configuration
├── neo-app.json                      # SAP BTP routing configuration
├── flp-config.json                   # Fiori Launchpad tile configuration
└── .gitignore                        # Git exclusions
```

## Build, Test, and Development Commands

### Available NPM Scripts

```bash
# Build application
npm run build

# This command:
# - Cleans the dist directory
# - Generates manifest bundle
# - Creates cache buster info
# - Runs WebIDE custom tasks:
#   - updateManifestJson
#   - updateNeoApp
#   - lint
#   - resources
```

### Development Commands

```bash
# Start development server (typically through WebIDE UI)
# Application runs on configured SAP BTP instance

# Access test suites
# Unit Tests: /webapp/test/unit/unitTests.qunit.html
# Integration Tests: /webapp/test/integration/opaTests.qunit.html
```

### Build Configuration Files

- **ui5.yaml** - Defines UI5 builder tasks and custom task pipeline
- **neo-app.json** - Configures routing to backend services (HANA, CPI)
- **package.json** - Node dependencies and build script

## Architecture and Code Organization

### Architecture Pattern: MVC (Model-View-Controller)

The application follows the classic SAP UI5 MVC pattern:

#### Model Layer
- **JSONModel** - Client-side state management
- **ODataModel** - Server-side data binding
- **models.js** - Centralized model factories
  - Device model for responsive design detection

#### View Layer (XML)
- **Main View** (`cancelClass.view.xml`)
  - Shell container with App and Page controls
  - Two primary buttons: "Cancel My Class" and "Cancel On Behalf"
  
- **Fragments (Dialogs)**
  - `CreateOnMyClassDialog.fragment.xml` - User cancels their own class
  - `CreateOnBehalfDialog.fragment.xml` - Manager cancels subordinate's class
  - `WorkflowDetailsDialog.fragment.xml` - Display details & collect cancellation reason

#### Controller Layer
- **cancelClass.controller.js** - Single main controller
  - Orchestrates data flows
  - Manages dialog lifecycle
  - Handles user interactions and business logic

### Data Flow Architecture

```
User Interaction
    ↓
Controller (cancelClass.controller.js)
    ↓
Service Layer (BusinessEventService, EmployeeService)
    ↓
HTTP Requests (OData, XSJS, CPI)
    ↓
Backend (SAP HANA, SAP CPI)
    ↓
JSONModel / ODataModel
    ↓
View Binding & UI Update
```

### Service Layer Pattern

Three dedicated service modules provide backend integration:

1. **BusinessEventService.js**
   - `getWorkflowReportByClassAndEmployee()` - Query class/employee workflow status
   - `getClassByEmployee()` - Fetch available classes for cancellation
   - `cancelClass()` - Submit cancellation request to CPI
   - `fetchEvents()` - Business event data retrieval
   - `getEventById()` - Fetch specific event details

2. **EmployeeService.js**
   - `getEmployeeById()` - Get employee information
   - `getSubordinates()` - Fetch employee hierarchy via AJAX
   - `getTCordinate()` - Get training coordinator hierarchy

3. **PicklistService.js**
   - `fetchAllPicklists()` - Retrieve master data (classifications, cities, etc.)

### Key Design Patterns

#### Promise-Based Service Calls
All service methods return Promises for async/await pattern:
```javascript
BusinessEventService.cancelClass(classId, employeeId, adminId, userType, reason)
  .then(result => { /* success */ })
  .catch(error => { /* error handling */ })
  .finally(() => { /* cleanup */ })
```

#### Fragment-Based Dialogs
Dynamic dialog loading and lifecycle management:
```javascript
// Create on first use, reuse thereafter
if (!this._onBehalfDialog) {
  this._onBehalfDialog = sap.ui.xmlfragment("fragment.path", this);
  this.getView().addDependent(this._onBehalfDialog);
}
this._onBehalfDialog.open();
```

#### Data Transformation & Formatting
- Date parsing: `/Date(1748736000000)/` → `dd/MM/yyyy` format
- Business logic: Calculate days-to-class-start, determine cancellation eligibility
- Field derivation: `DAYS_LEFT`, `CANCEL_REASON`, `ENABLE_CANCEL_BUTTON`

#### Busy State Management
```javascript
sap.ui.core.BusyIndicator.show(0);  // Show during async operations
// ... async work ...
sap.ui.core.BusyIndicator.hide();   // Hide when complete
```

#### User Context
- Fetch current user via `/services/userapi/currentUser` endpoint
- Map user ID to employee badge number (e.g., 107119)
- Use for employee hierarchy and class filtering

## Key Patterns and Conventions

### Naming Conventions
- **Controllers**: `{moduleName}.controller.js` (e.g., `cancelClass.controller.js`)
- **Views**: `{moduleName}.view.xml` (e.g., `cancelClass.view.xml`)
- **Fragments**: `{purpose}.fragment.xml` (e.g., `CreateOnBehalfDialog.fragment.xml`)
- **Services**: `{Domain}Service.js` (e.g., `BusinessEventService.js`)

### Component Structure
- **Namespace**: `cancelclass.cancelclass` (app ID format: `{namespace}.{projectName}`)
- **Module Path**: `cancelclass/cancelclass/{component}/{file}`

### Binding Syntax
- **Property Binding**: `{modelName>propertyPath}`
- **Expression Binding**: `{= expression syntax}`
- **Two-Way Binding**: Default behavior for input controls

### UI5 Module Definitions
All modules use `sap.ui.define()` with dependency array:
```javascript
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
  // Module implementation
});
```

## Important Configuration Files

### manifest.json
**Purpose**: Application descriptor - defines app metadata, models, routing, and capabilities
**Key Sections**:
- `sap.app`: Application ID, type, data sources, cross-navigation intents
- `sap.ui`: Technology declaration and device support
- `sap.ui5`: 
  - Root view: `cancelclass.cancelclass.view.cancelClass`
  - Min UI5 version: 1.65.6
  - Routing configuration
  - Model declarations (i18n, currentUser via OData)
  - CSS resources
- `sap.platform.hcp`: BTP deployment configuration

### ui5.yaml
**Purpose**: UI5 build process configuration
**Key Features**:
- Spec version: 1.0
- Custom build tasks:
  - `webide-extension-task-updateManifestJson` - Update manifest during build
  - `webide-extension-task-updateNeoApp` - Update neo-app routing
  - `webide-extension-task-lint` - Code linting
  - `webide-extension-task-resources` - Resource processing

### neo-app.json
**Purpose**: Request routing and backend integration configuration
**Routes**:
- `/services/userapi` → User API service
- `/resources` → SAP UI5 resources
- `/lmsproject/hana` → HANA DB destination (WorkflowReportService)
- `/cpi` → SAP CPI destination
- `/cpidev` → CPI development environment

### package.json
**Purpose**: NPM dependencies and build automation
**Key Dependencies**:
- `@ui5/cli`: 1.13.0 - UI5 build tooling
- `@sap/ui5-builder-webide-extension`: 1.0.x - WebIDE build extensions

### flp-config.json
**Purpose**: SAP Fiori Launchpad tile configuration
**Tile Details**:
- Type: StaticTile
- Title: "Cancel Class"
- Subtitle: "LMS"
- Icon: `sap-icon://approvals`
- Navigation: Semantic object "BusinessBehalf" / Action "Display"
- Assignment: Groups and content packages for FLP visibility

## Domain Knowledge: LMS & Class Cancellation

### Business Context
The application supports a Learning Management System where:
- Employees are enrolled in training classes
- Classes have specific start and end dates
- Employees can cancel their own enrollment under certain conditions
- Managers can cancel classes on behalf of their subordinates
- Cancellations are only allowed within a cutoff period before class start

### Class Cancellation Rules
**Eligibility Criteria** (lines 217-227 in controller):
- **Training Type 1 & 2**: 5-day cancellation cutoff
- **Other Training Types**: 10-day cancellation cutoff
- **Not Eligible**: If class has already started (`DAYS_LEFT < 0`)
- **Not Eligible**: If cancellation period has expired (`DAYS_LEFT <= cutoffDays`)

### Cancellation Reasons
Comprehensive list of 16+ predefined reasons (bilingual English/Arabic):
- Administrative Decisions
- Advanced Certification
- Conflicting Events
- Exception Granted
- Extended Leave
- Family Emergency
- Job Role Change
- Lack of Prerequisites
- Low Enrollment
- Personal Reasons
- Sudden Illness
- Travel Obligations
- Work Commitments (default)
- End of service

### User Roles
1. **Regular Employee**: Can cancel own classes via "Cancel My Class"
2. **Manager/Supervisor**: Can cancel subordinates' classes via "Cancel On Behalf"
3. **System**: Tracks who initiated cancellation (`Emp_ID`, `Admin_ID`, `UserType`)

### Data Model: Workflow Report
Core entity retrieved via OData query:
```
CLASS_ID (key)
EMPLOYEE_ID (key)
EMPLOYEE_NAME
EMPLOYEE_EMAIL
CLASS_TITLE
CLASS_START_DATE (SAP date format)
CLASS_END_DATE
WORKFLOW_STATUS (e.g., "Approved")
TRAINING_TYPE_ID (1, 2, or other)
```

## Application Flow

### Main User Journey: Cancel My Class
1. Click "Cancel My Class" button
2. Dialog displays informational message
3. (Optional) Select from available classes
4. Confirm selection
5. System queries class eligibility
6. Display WorkflowDetailsDialog with:
   - Class and employee information
   - Days left until class start
   - Eligibility status (Eligible / Expired / Already Started)
7. User selects cancellation reason
8. Click "Cancel Class" button
9. Submit to SAP CPI endpoint `/cpi/LMS/cancelComplete`
10. Success message and dialog closure

### Manager User Journey: Cancel On Behalf
1. Click "Cancel On Behalf" button
2. Dialog loads with:
   - Dropdown of subordinates (via EmployeeService)
   - Class selection (filtered by selected subordinate)
3. Select subordinate from dropdown
   - Triggers `onSubordinateChange()` to load their classes
4. Select class from dropdown
5. Click "Proceed"
6. Follows same workflow details & confirmation as personal cancellation
7. Submitted with `UserType: "admin"`

## Development Guidelines

### Setting Up Local Development
1. Clone repository
2. Run `npm install` to install @ui5/cli and extensions
3. Use SAP WebIDE or UI5 CLI: `ui5 serve` (if CLI supports it)
4. Access at configured SAP BTP instance URL
5. Application bootstraps with `data-sap-ui-component` in index.html

### Code Style
- **Indentation**: Tabs (visible in manifest.json, neo-app.json)
- **Quote Style**: Double quotes (JavaScript)
- **Module Pattern**: Use `sap.ui.define()` for all modules
- **Closure Pattern**: Use `.bind(this)` for context preservation
- **Error Handling**: Promise-based with try-catch or `.catch()` chains

### Adding New Features
1. **New Service Methods**: Add to appropriate `*Service.js` file
2. **New UI Screens**: Create `.view.xml` and corresponding controller
3. **Dialog Additions**: Create new `.fragment.xml` in `fragment/` folder
4. **Localization**: Add strings to `i18n/i18n.properties`
5. **Models**: Define in Component.js or via manifest.json models section

### Debugging & Testing
- **Browser DevTools**: F12 for UI5 debugging
- **UI5 Diagnostics**: Ctrl+Shift+Alt+S for SAP UI5 tools
- **Console Logging**: All errors logged to browser console
- **Unit Tests**: QUnit framework in `/test/unit/`
- **Integration Tests**: OPA framework in `/test/integration/`

### Common Issues & Notes
- **User ID Hardcoding**: Line 31 has hardcoded user ID (107119) - should use dynamic value from user API
- **Dialog State Management**: Dialogs are cached as instance variables; proper cleanup may be needed
- **Date Parsing**: Only handles SAP date format `/Date(ms)/`; alternative formats may fail silently
- **BusyIndicator**: Always pair `.show()` with `.hide()` in finally blocks to prevent UI freeze

## Build & Deployment

### Build Process
```bash
npm run build
```
This triggers UI5 CLI with:
1. Clean destination directory
2. Bundle manifest JSON
3. Generate cachebuster info
4. Run WebIDE custom tasks for optimization

### Output
- Build artifacts in `/dist` directory
- Ready for deployment to SAP BTP

### Deployment Target
- SAP BTP (Neo or Cloud Foundry environment)
- Configure routes via neo-app.json
- Requires backend connectivity to:
  - HANA DB with WorkflowReportService
  - SAP CPI for cancellation processing
  - User API service for authentication

## Testing Overview

### Unit Testing
- Framework: QUnit
- Test configuration: `/webapp/test/unit/unitTests.qunit.js`
- Test launcher: `/webapp/test/unit/unitTests.qunit.html`
- Coverage: Controller unit tests (minimal in current state)

### Integration Testing
- Framework: OPA (One Page Acceptance)
- Test configuration: `/webapp/test/integration/opaTests.qunit.js`
- Test launcher: `/webapp/test/integration/opaTests.qunit.html`
- Coverage: User journeys and component interactions

### Test Execution
Tests can be run via:
1. Browser by accessing `.qunit.html` files
2. Automated test runner in CI/CD pipeline
3. WebIDE test execution tools

## Known Code Issues & Notes

1. **Hardcoded User ID** (line 31):
   - Current: `this.username = 107119;`
   - Should: Dynamically map from `sCurrentUserId` returned from API

2. **Duplicate Route Initialization** (lines 29-32):
   - Router initialization appears twice in Component.js

3. **Incomplete Method** (line 42):
   - `fetchEmployeeData(sEmployeeId)` is empty stub

4. **Commented-Out Code**:
   - Lines 44-68: Extensive commented code in onCancelMyClass()
   - Lines 97-115: Alternative implementation of onCreateOnBehalf()
   - Suggests code iterations or experimental features

5. **Test File Coverage**:
   - Test files exist but appear mostly skeletal
   - Limited actual test implementations

6. **Fragment XML Issue**:
   - WorkflowDetailsDialog.fragment.xml has duplicate `<endButton>` (lines 49-56)

## Performance Considerations

- **OData Filtering**: Filters applied server-side via $filter parameters
- **JSONModel**: Lightweight for small data sets (single class details)
- **Dialog Reuse**: Dialogs created once and reused to minimize DOM creation
- **Promise Chains**: Proper cleanup in finally blocks prevents memory leaks
- **Busy Indicator**: Prevents user interactions during async operations

## Security Notes

- **CSRF Token**: Code references CSRF token handling (lines 122-145 in BusinessEventService)
- **User Context**: User identification via server-side API call
- **Data Validation**: Basic validation present (selected key checks)
- **Backend Routes**: All requests proxied through neo-app.json routing

---

## Quick Reference

### Main Entry Point
- **Component**: `webapp/Component.js`
- **Root View**: `webapp/view/cancelClass.view.xml`
- **Controller**: `webapp/controller/cancelClass.controller.js`

### Key Service Endpoints
- OData: `/lmsproject/hana/xsodata/WorkflowReportService.xsodata`
- Class Cancellation: `/cpi/LMS/cancelComplete` (POST)
- Subordinates: `/cpi/employee/getSubordinate` (GET)

### Dialog IDs
- `CreateOnMyClassDialog` - Personal cancellation dialog
- `CreateOnBehalfDialog` - Manager cancellation dialog
- `workflowDetailsDialog` - Confirmation dialog

### Key Date Fields
- `CLASS_START_DATE` - SAP format `/Date(ms)/`
- `CLASS_END_DATE` - SAP format `/Date(ms)/`
- `FORMATTED_CLASS_START_DATE` - Computed `dd/MM/yyyy` format
- `DAYS_LEFT` - Computed days until class start

