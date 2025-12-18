# ⚡ Fake Database - Quick Start

## ✅ What's New

Your registration now works **WITHOUT the backend running!**

Data is saved to **browser localStorage** (fake database).

---

## 🚀 How to Use

### Step 1: Enable Demo Mode

**Option A: Toggle Button**
- Look for **"🔧 Demo Mode"** toggle in top-right corner
- Check the box to enable

**Option B: JavaScript Console**
```javascript
fakeDB.enableDemoMode();
location.reload();
```

### Step 2: Register a User

1. Go to `pages/register.html`
2. Fill the form
3. Click Register
4. **✅ Data saved to localStorage!**

### Step 3: Login

1. Go to `pages/login.html`
2. Enter your registered credentials
3. **✅ Login works!**

---

## 🔍 View Your Data

### Method 1: View Users Page
Open: `pages/view-users.html`

Shows all users stored in fake database.

### Method 2: Browser Console
```javascript
// See all users
fakeDB.getAllUsers();

// Get specific user
fakeDB.getUserByUsername('yourusername');
```

### Method 3: Browser DevTools
1. Press **F12**
2. Go to **Application** tab
3. **Local Storage** → Your site
4. Key: `fakeHotelUsers`

---

## 🎯 Default Users

These are pre-loaded (password: `admin123`):

- `admin` - Admin
- `ahmed` - Staff
- `customer1` - Customer

---

## 🔄 Switch Between Modes

**Demo Mode (Fake DB):**
- ✅ Works without backend
- ✅ Data in localStorage
- ✅ Fast, no network

**Real API Mode:**
- ✅ Connects to backend
- ✅ Data in MySQL
- ✅ Requires backend running

**Toggle:** Use the "🔧 Demo Mode" button!

---

## 📊 Features

✅ User registration  
✅ Password hashing (simulated)  
✅ Duplicate checking  
✅ User login  
✅ Data persistence  
✅ Export/Import data  
✅ View all users  

---

## 🧪 Test It Now!

1. **Enable Demo Mode** (toggle button)
2. **Register** a new user
3. **Login** with that user
4. **View** users at `view-users.html`

**No backend needed!** 🎉

---

See `FAKE_DATABASE_GUIDE.md` for complete documentation.

