# Cancel Class - SAP UI5 Learning Management System

[![SAP UI5](https://img.shields.io/badge/SAP%20UI5-1.65.6%2B-0FAAFF)](https://sapui5.hana.ondemand.com/)
[![OpenUI5](https://img.shields.io/badge/OpenUI5-Compatible-orange)](https://openui5.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

A comprehensive SAP UI5 application for managing training class cancellations in enterprise Learning Management Systems (LMS).

## Features

- **Self-Service Cancellation**: Cancel your own enrolled classes
- **Delegated Cancellation**: Managers can cancel classes on behalf of subordinates
- **Business Rules Engine**: Automatic eligibility validation based on:
  - Class start date
  - Training type (Internal/External/Online)
  - Cancellation cutoff periods (5 or 10 days)
- **Workflow Integration**: Seamless integration with SAP workflow systems
- **Multi-Language Support**: English and Arabic (prepared)
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js 12+ and npm
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/eco-sec/cancelclass.git
cd cancelclass

# Install dependencies
npm install

# Start development server with mock data
npm start
```

The application will open at **http://localhost:8080** with **full mock data** enabled.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | Complete architecture and development guide |
| [MOCK_SERVER_GUIDE.md](./MOCK_SERVER_GUIDE.md) | **Reusable mock server implementation for any SAP UI5 app** |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Comprehensive testing workflows and verification |
| [LOCAL_TESTING.md](./LOCAL_TESTING.md) | Local testing scenarios and troubleshooting |
| [QUICK_START.md](./QUICK_START.md) | Quick reference for common tasks |

## 🎯 Local Testing with Mock Data

This application features a **production-ready mock server** that enables complete local development without any backend dependencies.

### Key Features of Mock Implementation

✅ **Zero Backend Required** - Develop entirely offline
✅ **jQuery AJAX Interception** - Intercepts all HTTP calls before network layer
✅ **Auto Environment Detection** - Automatically disabled in production
✅ **OData v2 Compatible** - Full support for SAP OData services
✅ **Dynamic Data Filtering** - URL parameter-based mock responses
✅ **Reusable Pattern** - Copy to any SAP UI5/WebIDE application

### Mock Data Available

- **4 Subordinate Employees**: Jane Doe, Mike Johnson, Sarah Williams, Ahmed Hassan
- **3 Classes per Employee**: ABAP Fundamentals, Fiori Development, Cloud Integration
- **16 Cancellation Reasons**: Work commitments, personal emergency, health issues, etc.
- **User Authentication**: Default user (107119 - John Smith)

### Testing Workflows

**Test 1: Cancel on Behalf**
1. Click "Cancel on Behalf"
2. Select subordinate → Classes load automatically
3. Select class → Workflow details display
4. Choose cancellation reason
5. Confirm cancellation

**Test 2: Cancel My Class**
1. Click "Cancel My Class"
2. Select your class from dropdown
3. Complete cancellation workflow

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete test scenarios.

## 🏗️ Architecture

### Technology Stack

- **Frontend**: SAP UI5 1.65.6+ / OpenUI5
- **Build Tool**: UI5 CLI 1.13.0
- **Backend Integration**: OData v2, SAP CPI
- **Data Store**: SAP HANA (XSOData, XSJS)
- **Design**: SAP Fiori 3 Guidelines

### Project Structure

```
cancelclass/
├── webapp/
│   ├── localService/          # 🎭 Mock server (reusable!)
│   │   ├── mockdata.js        # Mock data definitions
│   │   └── mockserver.js      # jQuery AJAX interceptor
│   ├── controller/            # Application logic
│   ├── view/                  # XML views
│   ├── fragment/              # Reusable dialog fragments
│   ├── service/               # Backend service integration
│   ├── Component.js           # App initialization
│   └── manifest.json          # App descriptor
├── MOCK_SERVER_GUIDE.md       # 📖 Reusable mock pattern guide
└── CLAUDE.md                  # Complete technical documentation
```

## 📦 Build Commands

```bash
# Development server with mock data
npm start

# Build for production
npm run build

# Build with WebIDE extensions
npm run build:mta
```

## 🔧 Reusing Mock Server in Other Applications

The mock server implementation is **fully reusable** for any SAP UI5/WebIDE application:

1. **Copy** `/webapp/localService/` directory to your project
2. **Update** `mockdata.js` with your API responses
3. **Customize** `mockserver.js` URL patterns for your endpoints
4. **Initialize** in your `Component.js`:
   ```javascript
   if (window.location.hostname === "localhost") {
       mockserver.init();
   }
   ```

See [MOCK_SERVER_GUIDE.md](./MOCK_SERVER_GUIDE.md) for complete implementation guide.

## 🎨 Business Rules

### Cancellation Eligibility

| Training Type | Cutoff Period | Rule |
|---------------|---------------|------|
| Internal (Type 1) | 5 days | Must cancel >5 days before start |
| External (Type 2) | 5 days | Must cancel >5 days before start |
| Online (Type 3) | 10 days | Must cancel >10 days before start |

### Cancellation Status

- **Eligible**: Class can be cancelled (button enabled)
- **Period Expired**: Within cutoff period (button disabled)
- **Already Started**: Class start date passed (button disabled)

## 🌐 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/services/userapi/currentUser` | GET | Current user authentication |
| `/cpi/employee/getSubordinate` | GET | Employee hierarchy |
| `/lmsproject/.../WorkflowLogView` | GET | Class assignments (OData) |
| `/lmsproject/.../PicklistService` | GET | Cancellation reasons |
| `/cpi/LMS/cancelComplete` | POST | Cancel class action |

All endpoints are **fully mocked** for local development.

## 🧪 Testing

### Verification Checklist

- [x] Application loads at http://localhost:8080
- [x] Console shows "Running in LOCAL mode"
- [x] Subordinates dropdown populates (4 employees)
- [x] Classes load dynamically per subordinate (3 each)
- [x] Workflow details show formatted dates
- [x] Cancellation reasons load (16 options)
- [x] Cancellation submission succeeds
- [x] No actual network requests made (check DevTools)

## 🚢 Deployment

### SAP BTP Deployment

The application is designed for deployment on:
- SAP Business Technology Platform (BTP)
- SAP HANA Cloud Platform
- SAP WebIDE / Business Application Studio

Mock server automatically detects production environment and disables itself.

### Environment Variables

No configuration required - automatic detection based on `window.location.hostname`

## 📄 License

Proprietary - Enterprise Learning Management System

## 👥 Authors

- **Development**: Enterprise Learning Team
- **Mock Server Pattern**: Claude Code Implementation
- **Documentation**: Comprehensive guides for reusability

## 🤝 Contributing

This is a proprietary enterprise application. For internal development:

1. Clone repository
2. Create feature branch
3. Test with mock data locally
4. Submit pull request with comprehensive testing

## 📞 Support

For issues or questions:
- Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for troubleshooting
- Review [MOCK_SERVER_GUIDE.md](./MOCK_SERVER_GUIDE.md) for mock server issues
- Consult [CLAUDE.md](./CLAUDE.md) for architecture details

## 🎯 Key Highlights

✨ **Complete Local Development** - No backend required
✨ **Production-Ready Mock Server** - Reusable in any SAP UI5 app
✨ **Comprehensive Documentation** - 5 detailed guides
✨ **Business Logic Validation** - Automatic eligibility checking
✨ **Responsive Design** - Works on all devices
✨ **SAP Fiori Compliant** - Follows SAP design guidelines

---

**Built with** [SAP UI5](https://sapui5.hana.ondemand.com/) | **Powered by** [Claude Code](https://claude.com/claude-code)
