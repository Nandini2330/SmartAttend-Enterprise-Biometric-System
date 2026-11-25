import { LanguageCode } from '../types';

export const translations = {
  en: {
    appName: 'SmartAttend',
    parentPortal: 'Parent Portal',
    home: 'Home',
    attendance: 'Attendance',
    messages: 'Circulars',
    notifications: 'Alerts',
    profile: 'Profile',

    welcomeBack: 'Welcome back',
    switchChild: 'Switch Student',
    todayStatus: "Today's Status",
    currentSession: 'Session 2026-2027',

    // Statuses
    present: 'Present',
    absent: 'Absent',
    late: 'Late Arrival',
    leave: 'On Leave',
    halfDay: 'Half Day',
    holiday: 'School Holiday',

    // Clock In / Out
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    clockInTime: 'Arrival Time',
    clockOutTime: 'Departure Time',
    arrivedSchool: 'Arrived at School',
    leftSchool: 'Departed from School',
    inSession: 'Currently in School Session',
    notCheckedOut: 'Not Checked Out Yet',
    completed: 'Completed',
    pending: 'Pending',
    verificationMethod: 'Biometric Method',
    safeArrival: 'Student has arrived safely at campus',
    safeDeparture: 'Student has departed safely from campus',

    // KPIs
    monthly: 'Monthly',
    weekly: 'Weekly',
    monthlyAttendance: 'Monthly Rate',
    workingDays: 'Working Days',
    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    lateDays: 'Late Arrivals',
    leaveDays: 'Approved Leaves',
    cbseCompliant: 'CBSE Compliant (>=75%)',
    cbseWarning: 'Attendance Warning (<75%)',

    // History
    attendanceHistory: 'Attendance History',
    dailyLedger: 'Daily Ledger Records',
    selectDate: 'Tap any date to view biometric timestamps',
    attendanceDetails: 'Attendance Record Details',
    close: 'Close',
    remarks: 'Official School Remarks',

    // Leave
    leaveManagement: 'Absence & Leave Requests',
    applyLeave: 'Submit Leave Request',
    newLeave: 'New Leave Request',
    leaveType: 'Leave Category',
    startDate: 'Start Date',
    endDate: 'End Date',
    reason: 'Reason for Absence',
    reasonPlaceholder: 'e.g. Fever, Medical Appointment, Family Event',
    description: 'Detailed Note for Teacher',
    descriptionPlaceholder: 'Please provide full details for the class teacher...',
    submitRequest: 'Submit for School Approval',
    cancel: 'Cancel',
    pendingReview: 'Pending Approval',
    approved: 'Approved by School',
    rejected: 'Rejected by School',
    leaveDisclaimer: 'Note: Submitting a request does not automatically grant leave. School staff will review and approve.',

    // Circulars
    circulars: 'School Announcements & Circulars',
    allCirculars: 'All',
    urgent: 'Urgent',
    downloadDoc: 'View Attached Document',

    // Alerts & Live Notifications
    alertsNotifications: 'Notifications & Alerts',
    markAllRead: 'Mark All as Read',
    noNotifications: 'No new notifications',
    liveAlertBanner: 'SmartAttend • Live Attendance Alert',
    simulatePunchSection: 'Live Punch & Notification Simulator',
    simulateClockIn: '📥 Simulate Clock In',
    simulateClockOut: '📤 Simulate Clock Out',
    clockInAlertTitle: 'Safe Gate Entry Verified (Clock In)',
    clockOutAlertTitle: 'Campus Departure Verified (Clock Out)',
    clockInAlertBody: 'Your child {name} has clocked IN at {time} via Face Recognition (Gate 1).',
    clockOutAlertBody: 'Your child {name} has clocked OUT at {time} via Main Gate Departure Kiosk.',
    dismiss: 'Dismiss',
    viewAlerts: 'View All Alerts',
    justNow: 'Just now',
    testPunchPrompt: 'Tap below to test real-time gate clock-in/out and receive immediate push alerts:',

    // Profile & Settings
    parentAccount: 'Parent Account',
    linkedStudents: 'Linked Children in SmartAttend',
    appSettings: 'Application Preferences',
    language: 'Language / भाषा',
    theme: 'Appearance Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    entryAlerts: 'Live Gate Entry Push Alerts',
    exitAlerts: 'Live Gate Exit Push Alerts',
    absenceAlerts: 'Urgent Absence Cutoff Alerts',
    changePassword: 'Change Password',
    signOut: 'Sign Out from App',

    // Auth
    loginTitle: 'Parent Portal Login',
    loginSubtitle: 'Enter your registered credentials to monitor your child.',
    emailOrPhone: 'Registered Email or Mobile',
    password: 'Password',
    loginButton: 'Sign In to Portal',
    forgotPassword: 'Forgot Password?',
    quickDemoAccounts: 'Quick Parent Perspective Accounts (Testing)',
    invalidCredentials: 'Invalid credentials. Please verify your email/phone and password.'
  },
  mr: {
    appName: 'स्मार्टअटेंड',
    parentPortal: 'पालक पोर्टल',
    home: 'मुख्य',
    attendance: 'उपस्थिती',
    messages: 'परिपत्रके',
    notifications: 'सूचना',
    profile: 'सेटिंग्ज',

    welcomeBack: 'स्वागत आहे',
    switchChild: 'विद्यार्थी निवडा',
    todayStatus: 'आजची उपस्थिती',
    currentSession: 'शैक्षणिक सत्र २०२६-२०२७',

    // Statuses
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    late: 'उशिरा आगमन',
    leave: 'रजेवर',
    halfDay: 'अर्धा दिवस',
    holiday: 'शाळेला सुट्टी',

    // Clock In / Out
    clockIn: 'क्लॉक इन (आगमन)',
    clockOut: 'क्लॉक आउट (प्रस्थान)',
    clockInTime: 'शाळेत येण्याची वेळ',
    clockOutTime: 'शाळेतून निघण्याची वेळ',
    arrivedSchool: 'शाळेत उपस्थित',
    leftSchool: 'शाळेतून रवाना',
    inSession: 'सध्या शाळेत वर्गात आहे',
    notCheckedOut: 'अजून शाळा सुटलेली नाही',
    completed: 'नोंद पूर्ण',
    pending: 'नोंद बाकी',
    verificationMethod: 'बायोमेट्रिक पडताळणी',
    safeArrival: 'विद्यार्थी सुरक्षितपणे शाळेत दाखल झाला आहे',
    safeDeparture: 'विद्यार्थी सुरक्षितपणे शाळेतून बाहेर पडला आहे',

    // KPIs
    monthly: 'मासिक',
    weekly: 'साप्ताहिक',
    monthlyAttendance: 'मासिक उपस्थिती',
    workingDays: 'एकूण कामाचे दिवस',
    presentDays: 'उपस्थित दिवस',
    absentDays: 'अनुपस्थित दिवस',
    lateDays: 'उशिरा आलेले दिवस',
    leaveDays: 'मंजूर रजा दिवस',
    cbseCompliant: 'CBSE निकष पूर्ण (>=७५%)',
    cbseWarning: 'उपस्थिती धोक्याचा इशारा (<७५%)',

    // History
    attendanceHistory: 'उपस्थितीचा संपूर्ण इतिहास',
    dailyLedger: 'दैनिक उपस्थिती नोंदवही',
    selectDate: 'तपशील पाहण्यासाठी कोणत्याही तारखेवर टॅप करा',
    attendanceDetails: 'उपस्थिती नोंद तपशील',
    close: 'बंद करा',
    remarks: 'शाळेची अधिकृत नोंद',

    // Leave
    leaveManagement: 'रजेचे अर्ज व व्यवस्थापन',
    applyLeave: 'रजेचा अर्ज करा',
    newLeave: 'नवीन रजेचा अर्ज',
    leaveType: 'रजेचा प्रकार',
    startDate: 'सुरुवात तारीख',
    endDate: 'शेवट तारीख',
    reason: 'रजेचे कारण',
    reasonPlaceholder: 'उदा. आजारपण, डॉक्टरांची भेट, कौटुंबिक कार्य',
    description: 'शिक्षकांसाठी सविस्तर माहिती',
    descriptionPlaceholder: 'कृपया वर्गशिक्षकांसाठी सविस्तर कारण लिहा...',
    submitRequest: 'शाळेच्या मान्यतेसाठी सादर करा',
    cancel: 'रद्द करा',
    pendingReview: 'शिक्षकांच्या मान्यतेची प्रतीक्षा',
    approved: 'शाळेकडून मंजूर',
    rejected: 'शाळेकडून नामंजूर',
    leaveDisclaimer: 'टीप: अर्ज केल्यावर लगेच रजा मंजूर होत नाही. अधिकृत शिक्षक/मुख्याध्यापक तपासणी करून मान्यता देतील.',

    // Circulars
    circulars: 'शालेय परिपत्रके व महत्त्वाच्या सूचना',
    allCirculars: 'सर्व',
    urgent: 'तातडीचे',
    downloadDoc: 'संलग्न परिपत्रक पहा',

    // Alerts & Live Notifications
    alertsNotifications: 'सूचना व सतर्कता अलर्ट',
    markAllRead: 'सर्व वाचल्याचे चिन्हांकित करा',
    noNotifications: 'नवीन सूचना नाहीत',
    liveAlertBanner: 'स्मार्टअटेंड • थेट हजेरी अलर्ट',
    simulatePunchSection: 'थेट हजेरी व सूचना चाचणी (Simulator)',
    simulateClockIn: '📥 क्लॉक इन करा (Clock In)',
    simulateClockOut: '📤 क्लॉक आउट करा (Clock Out)',
    clockInAlertTitle: 'शाळेत सुरक्षित आगमन (Clock In)',
    clockOutAlertTitle: 'शाळेतून सुरक्षित प्रस्थान (Clock Out)',
    clockInAlertBody: 'आपला पाल्या {name} सकाळी/दुपारी {time} वाजता गेट १ मधून शाळेत हजर झाला आहे.',
    clockOutAlertBody: 'आपला पाल्या {name} दुपारी {time} वाजता मुख्य गेटमधून शाळेतून बाहेर पडला आहे.',
    dismiss: 'बंद करा',
    viewAlerts: 'सर्व सूचना पहा',
    justNow: 'आत्ताच',
    testPunchPrompt: 'थेट बायोमेट्रिक हजेरी आणि पुश सूचना पाहण्यासाठी खालील बटणावर टॅप करा:',

    // Profile & Settings
    parentAccount: 'पालक खाते',
    linkedStudents: 'स्मार्टअटेंडमध्ये जोडलेले विद्यार्थी',
    appSettings: 'अ‍ॅप सेटिंग्ज व पसंती',
    language: 'अ‍ॅपची भाषा (Language)',
    theme: 'डिस्प्ले थीम',
    lightMode: 'लाईट थीम',
    darkMode: 'डार्क थीम',
    entryAlerts: 'थेट प्रवेशाची पुश सूचना',
    exitAlerts: 'शाळा सुटल्याची पुश सूचना',
    absenceAlerts: 'अनुपस्थितीचा तातडीचा इशारा',
    changePassword: 'पासवर्ड बदला',
    signOut: 'अ‍ॅपमधून लॉग आउट व्हा',

    // Auth
    loginTitle: 'पालक पोर्टल लॉगिन',
    loginSubtitle: 'आपल्या पाल्याची उपस्थिती पाहण्यासाठी नोंदणीकृत माहिती भरा.',
    emailOrPhone: 'नोंदणीकृत ईमेल किंवा मोबाईल',
    password: 'पासवर्ड',
    loginButton: 'लॉग इन करा',
    forgotPassword: 'पासवर्ड विसरलात?',
    quickDemoAccounts: 'चाचणीसाठी पालक खाती (Testing Perspective)',
    invalidCredentials: 'अवैध माहिती. कृपया ईमेल/मोबाईल आणि पासवर्ड तपासा.'
  }
};

export const useI18n = (lang: LanguageCode) => {
  return translations[lang] || translations.en;
};
