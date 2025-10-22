# Quick Start - Cancel Class Application

## 🚀 Application is Running!

**URL**: http://localhost:8080

## 📍 Access Points

### Option 1: Main Application
http://localhost:8080/index.html

### Option 2: Test Version (Recommended for local testing)
http://localhost:8080/test.html
- Includes a blue banner indicating "LOCAL TESTING MODE"
- Visual confirmation that mock data is active

## 👤 Mock User Credentials

You are automatically logged in as:
- **Name**: John Smith
- **Employee ID**: 107119
- **Role**: Manager
- **Has**: 3 upcoming training classes & 2 subordinates

## ✅ What You Can Test

### 1. Cancel Your Own Class
Click **"Cancel My Class"** button
→ See 3 available classes
→ Select one and choose a cancellation reason
→ Confirm cancellation

### 2. Cancel on Behalf (Manager Function)
Click **"Cancel on Behalf"** button
→ Select an employee (Jane Doe or Mike Johnson)
→ Select their class
→ Choose cancellation reason
→ Confirm cancellation

## 📊 Mock Data Includes

- **3 Training Classes**: SAP ABAP, SAP Fiori, Cloud Platform Integration
- **2 Subordinates**: Jane Doe & Mike Johnson
- **16 Cancellation Reasons**: In English & Arabic
- **Realistic Delays**: 500ms-1000ms network simulation

## 🔍 Verification

Open Browser DevTools Console (F12) and you should see:
```
Mock server started - running in LOCAL mode with mock data
Running in LOCAL mode with mock data enabled
```

## ⚡ Key Features Working Locally

✅ User authentication (mocked)
✅ Class listing and selection
✅ Employee subordinate lookup
✅ Cancellation reason picklists
✅ Class cancellation workflow
✅ Success/error message handling
✅ Date formatting and validation
✅ Eligibility rule checking

## 📖 Full Documentation

- **LOCAL_TESTING.md** - Comprehensive testing guide
- **CLAUDE.md** - Architecture and development guide

## 🛑 Stop Server

Press `Ctrl+C` in the terminal where `npm start` is running

## 🔄 Restart After Code Changes

Most changes are auto-reloaded, but for significant changes:
```bash
# Stop with Ctrl+C, then:
npm start
```

---

**Status**: ✅ Ready for local testing with full mock data support!
