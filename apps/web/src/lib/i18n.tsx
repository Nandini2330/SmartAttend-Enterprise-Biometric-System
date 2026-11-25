import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'mr';

export interface Translations {
  // Navigation & Branding
  brandName: string;
  brandTagline: string;
  overviewDashboard: string;
  livePunchMonitor: string;
  studentDirectory: string;
  classesAndDivisions: string;
  attendanceHistory: string;
  leaveApplications: string;
  reportsAndAnalytics: string;
  biometricEnrollment: string;
  deviceManagement: string;
  whatsAppLogs: string;
  absenceReconciliation: string;
  schoolConfiguration: string;
  auditLogs: string;
  visitorPickup: string;
  timetable: string;
  schoolCalendar: string;
  childAttendance: string;
  myAttendance: string;
  childReports: string;
  myReports: string;
  connectedCampus: string;
  realtimeActive: string;
  platformVersion: string;

  // Sidebar Sections & Perspective
  sectionMain: string;
  sectionAcademic: string;
  sectionOperations: string;
  sectionInfrastructure: string;
  switchRolePerspective: string;
  parentPortals: string;
  staffPortals: string;

  // Roles
  roleSuperAdmin: string;
  rolePrincipalAdmin: string;
  roleTeacher: string;
  roleParent: string;
  roleStudent: string;

  // Statuses
  present: string;
  absent: string;
  late: string;
  halfDay: string;
  onLeave: string;
  holiday: string;
  excused: string;
  approved: string;
  pending: string;
  rejected: string;
  online: string;
  offline: string;

  // Verification Methods
  methodFace: string;
  methodFingerprint: string;
  methodSimulated: string;
  methodManual: string;
  methodCard: string;

  // Days & Time
  dayMon: string;
  dayTue: string;
  dayWed: string;
  dayThu: string;
  dayFri: string;
  daySat: string;
  daySun: string;
  dayToday: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;

  // Metrics
  totalEnrolled: string;
  presentToday: string;
  lateArrivals: string;
  onlineDevices: string;
  whatsAppSent: string;
  attendanceRate: string;

  // Common Actions & Labels
  search: string;
  filter: string;
  all: string;
  actions: string;
  status: string;
  date: string;
  time: string;
  dayLabel: string;
  save: string;
  cancel: string;
  edit: string;
  deleteBtn: string;
  addBtn: string;
  close: string;
  exportCsv: string;
  exportPdf: string;
  printBtn: string;
  signOut: string;
  sendAlert: string;
  refresh: string;
  verified: string;
  records: string;
  rows: string;
  loading: string;
  noRecordsFound: string;
  lightMode: string;
  darkMode: string;
  searchNavbarPlaceholder: string;
  childLabel: string;
  automatedAlerts: string;
  queuedDelivered: string;
  notice: string;

  // Overview Dashboard
  overviewTitle: string;
  overviewSub: string;
  quickActions: string;
  remedialClasses: string;
  recentActivity: string;
  attendanceByClass: string;
  liveSystemActive: string;
  academicSessionBadge: string;
  schoolOpeningLabel: string;
  graceLabel: string;
  absenceCutoffLabel: string;
  simulatePunchBtn: string;
  runReconciliationBtn: string;
  totalStudentsCard: string;
  enrolledActiveSub: string;
  presentTodayCard: string;
  onTimeArrivalsSub: string;
  absentTodayCard: string;
  cutoffConfirmedSub: string;
  lateArrivalsCard: string;
  arrivedAfterSub: string;
  weeklyTrendsTitle: string;
  weeklyTrendsSub: string;
  todayRateLabel: string;
  cutoffThresholdNote: string;
  cbseWarningTitle: string;
  cbseWarningSub: string;
  currentRateLabel: string;
  consecutiveDaysLabel: string;
  recentActivitySub: string;
  riskAlertHeader: string;
  riskAlertSub: string;

  // Student Directory Page
  studentDirectoryTitle: string;
  studentDirectorySub: string;
  bulkCsvImport: string;
  registerStudentBtn: string;
  searchPlaceholder: string;
  searchStudents: string;
  classLabel: string;
  allClasses: string;
  totalStudents: string;
  colStudent: string;
  colAdmissionNo: string;
  colClassDivision: string;
  colRollNo: string;
  colBiometrics: string;
  colGuardian: string;
  colActions: string;
  badgeFace: string;
  badgeNoFace: string;
  badgeFinger: string;
  badgeNoFinger: string;
  badgeIdCard: string;
  badgeNoneLinked: string;
  idCardBtn: string;
  addStudentModalTitle: string;
  firstNameLabel: string;
  lastNameLabel: string;
  genderLabel: string;
  maleOption: string;
  femaleOption: string;
  otherOption: string;
  guardianNameLabel: string;
  guardianPhoneLabel: string;
  saveStudentBtn: string;

  // Live Monitor Page
  liveMonitorTitle: string;
  liveMonitorSub: string;
  gateClockTitle: string;
  istTimeLabel: string;
  testBiometricsTitle: string;
  selectStudentLabel: string;
  facePunchBtn: string;
  fingerprintPunchBtn: string;
  offlineQueueBtn: string;
  duplicateTestBtn: string;
  streamFeedTitle: string;
  liveIngestSub: string;

  // Classes & Divisions
  classesTitle: string;
  classesSub: string;
  tabSections: string;
  tabTimetable: string;
  tabSubjectAtt: string;
  tabPromotion: string;
  classTeacherLabel: string;
  capacityLabel: string;
  enrolledLabel: string;

  // Timetable & Periods
  timetableTitle: string;
  timetableSub: string;
  addSlotBtn: string;
  periodLabel: string;
  subjectLabel: string;
  teacherLabel: string;
  roomLabLabel: string;
  emptySlotLabel: string;
  noConflictNotice: string;

  // School Calendar
  calendarTitle: string;
  calendarSub: string;
  upcomingEventsTitle: string;
  holidaysTab: string;
  examsTab: string;
  eventsTab: string;
  addEventBtn: string;

  // Attendance History
  historyTitle: string;
  historySub: string;
  filterDateLabel: string;
  arrivalTimeCol: string;
  verificationMethodCol: string;

  // Visitor Pickup
  visitorTitle: string;
  visitorSub: string;
  verifyPickupBtn: string;
  authorizedGuardianLabel: string;
  gatePassLabel: string;
  issuePassBtn: string;

  // Leave Applications
  leavesTitle: string;
  leavesSub: string;
  applyLeaveBtn: string;
  pendingLeavesTab: string;
  approvedLeavesTab: string;
  rejectedLeavesTab: string;
  leaveTypeLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  reasonLabel: string;
  approveBtn: string;
  rejectBtn: string;

  // Reports & Analytics
  reportsTitle: string;
  reportsSub: string;
  tabGenerator: string;
  tabInstitutional: string;
  tabReportHistory: string;
  reportTypeLabel: string;
  academicYearLabel: string;
  fromDateLabel: string;
  toDateLabel: string;
  classGradeLabel: string;
  divisionLabel: string;
  studentLabel: string;
  statusLabel: string;
  facultyTeacherLabel: string;
  targetFormatLabel: string;
  pdfFormatBtn: string;
  excelFormatBtn: string;
  generatePreviewBtn: string;
  downloadExcelBtn: string;
  downloadPdfBtn: string;
  officialAuditHeader: string;
  principalSignatureLabel: string;
  catAttendance: string;
  catStudent: string;
  catLeave: string;
  catAcademic: string;
  catBiometric: string;

  // Biometric Enrollment
  biometricsTitle: string;
  biometricsSub: string;
  enrollFaceBtn: string;
  enrollFingerprintBtn: string;
  captureScanBtn: string;
  enrollSuccessMsg: string;

  // Device Management
  devicesTitle: string;
  devicesSub: string;
  onlineDevicesCard: string;
  syncStatusCard: string;
  restartDeviceBtn: string;
  deviceIpCol: string;
  deviceStatusCol: string;

  // Absence Reconciliation
  reconcileTitle: string;
  reconcileSub: string;
  executeReconcileBtn: string;
  cutoffRulesCard: string;

  // School Settings
  settingsTitle: string;
  settingsSub: string;
  saveSettingsBtn: string;
  schoolNameLabel: string;
  openingTimeLabel: string;
  cutoffTimeLabel: string;
  graceMinutesLabel: string;

  // Audit Logs
  auditTitle: string;
  auditSub: string;
  auditActionCol: string;
  auditTimestampCol: string;
  auditUserCol: string;

  // Login Page
  loginTitle: string;
  loginSub: string;
  selectRoleHeading: string;
  emailLabel: string;
  passwordLabel: string;
  signInBtn: string;
  demoCredentialsNote: string;

  // Verified Guardian Portal
  guardianPortalTitle: string;
  childStatementSub: string;
  punctualityCard: string;
  absencesLeavesCard: string;
  printStatementBtn: string;

  // Language name
  languageName: string;
  saveToDatabase: string;
  antiReplayActive: string;

  // Classes & Promotions
  morningGraceLabel: string;
  viewRosterLabel: string;
  enrolledStudentsLabel: string;
  masterTimetableLabel: string;
  teacherWorkloadTelemetry: string;
  workloadSub: string;
  weeklyHoursLabel: string;
  studyLibraryLabel: string;
  promotionSafeguardsTitle: string;
  promotionSafeguardsDesc: string;
  newAcademicSessionBtn: string;
  activeSessionLabel: string;
  switchSessionLabel: string;
  promotionConfigTitle: string;
  sourceClassLabel: string;
  sourceDivLabel: string;
  targetClassLabel: string;
  targetDivLabel: string;
  targetSessionLabel: string;
  allDivisionsOption: string;
  eligibleStudentsTitle: string;
  eligibleStudentsSub: string;
  selectAllEligibleBtn: string;
  selectAllBtn: string;
  deselectAllBtn: string;
  colCompliance: string;
  colEligibility: string;
  colTargetDest: string;
  statusAlreadyPromoted: string;
  statusPassEligible: string;
  statusAttDeficit: string;
  executeBulkPromoBtn: string;
  historyLedgerTitle: string;
  historyLedgerSub: string;
  lecturePunchTitle: string;
  lockLectureBtn: string;
  markAbsentBtn: string;
  markPresentBtn: string;

  // History & Privacy
  parentPrivacyEnforced: string;
  childAttendanceTitle: string;
  institutionAttendanceTitle: string;
  parentHistorySub: string;
  staffHistorySub: string;
  manualAttendanceBtn: string;
  exportChildCsv: string;
  exportCsvReport: string;
  registeredChildBadge: string;
  switchChildLabel: string;
  onTimeArrivals: string;
  lateCheckins: string;
  absencesLeaves: string;
  punctualityRate: string;
  securityPrivacyTitle: string;
  securityPrivacySub: string;
  testPrivacyBlockBtn: string;
  testingPrivacy: string;
  allStatusesOption: string;
  colRemarks: string;
  firstArrivalCol: string;
  manualModalTitle: string;

  // Visitor Pickup
  tabStudentPickup: string;
  tabCampusVisitors: string;
  tabPreAuthorized: string;
  visitorLogsTitle: string;
  visitorNameLabel: string;
  visitorPhoneLabel: string;
  relationshipLabel: string;
  pickupReasonLabel: string;
  verifyAndIssuePassBtn: string;
  otpModalTitle: string;
  enterOtpLabel: string;
  verifyOtpBtn: string;
  printPassBtn: string;
  gatePassIssuedTitle: string;

  // Leaves & Corrections
  tabLeaves: string;
  tabCorrections: string;
  requestCorrectionBtn: string;
  allStatusFilter: string;
  pendingStatusFilter: string;
  approvedStatusFilter: string;
  rejectedStatusFilter: string;
  colLeavePeriod: string;
  colReason: string;
  applyLeaveModalTitle: string;
  submitApplicationBtn: string;
  reviewRemarksLabel: string;

  // Device Management
  tabTelemetry: string;
  tabOfflineQueue: string;
  pingDeviceBtn: string;
  reconnectBtn: string;
  hardwareStatusLabel: string;
  terminalNameCol: string;
  terminalModelCol: string;
  syncLogsTitle: string;

  // Absence Reconciliation
  reconciliationTitle: string;
  reconciliationSub: string;
  runCutoffBtn: string;
  reconcilingDb: string;
  officialOpeningCard: string;
  gracePeriodCard: string;
  cutoffTimeCard: string;
  absentRosterTitle: string;
  absentRosterSub: string;
  alertQueuedBadge: string;
  notRequiredOnLeave: string;

  // School Settings
  tabPolicies: string;
  tabHolidays: string;
  tabPromotions: string;
  attendanceRulesTitle: string;
  saveTimingsBtn: string;
  addHolidayTitle: string;
  holidayNameLabel: string;
  holidayDateLabel: string;
  holidayDescLabel: string;
  addHolidayBtn: string;

  // Audit Logs
  auditLogsTitle: string;
  auditLogsSub: string;
  dpdpBadge: string;
  colAction: string;
  colOperator: string;
  colEntity: string;
  colIp: string;
  colDetails: string;
  colTimestamp: string;

  // Login Page
  portalHeading: string;
  portalSub: string;
  quickRolePerspective: string;
  secureLoginTitle: string;
  secureLoginSub: string;
  signingIn: string;
  accountLockedMsg: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    brandName: 'SmartAttend',
    brandTagline: 'ENTERPRISE BIOMETRICS',
    overviewDashboard: 'Overview Dashboard',
    livePunchMonitor: 'Live Punch Monitor',
    studentDirectory: 'Student Directory',
    classesAndDivisions: 'Classes & Divisions',
    attendanceHistory: 'Attendance History',
    leaveApplications: 'Leave Applications',
    reportsAndAnalytics: 'Reports & Analytics',
    biometricEnrollment: 'Biometric Enrollment',
    deviceManagement: 'Device & Terminal Bridge',
    whatsAppLogs: 'WhatsApp Cloud Logs',
    absenceReconciliation: 'Absence Reconciliation',
    schoolConfiguration: 'School Configuration',
    auditLogs: 'Security & Audit Logs',
    visitorPickup: 'Gate & Visitor Pickup',
    timetable: 'Timetable & Periods',
    schoolCalendar: 'School Calendar & Events',
    childAttendance: 'Child Attendance',
    myAttendance: 'My Attendance',
    childReports: 'Child Reports & Stats',
    myReports: 'My Reports & Stats',
    connectedCampus: 'Connected Campus',
    realtimeActive: 'Realtime Gateway Active',
    platformVersion: 'SmartAttend Platform',

    sectionMain: 'Main',
    sectionAcademic: 'Academic',
    sectionOperations: 'Operations',
    sectionInfrastructure: 'Infrastructure',
    switchRolePerspective: 'Switch Role Perspective',
    parentPortals: 'Parent Portals',
    staffPortals: 'Staff & Student Portals',

    roleSuperAdmin: 'Super Admin',
    rolePrincipalAdmin: 'Principal / Admin',
    roleTeacher: 'Teacher',
    roleParent: 'Parent',
    roleStudent: 'Student',

    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    halfDay: 'Half Day',
    onLeave: 'On Leave',
    holiday: 'Holiday',
    excused: 'Excused',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    online: 'Online',
    offline: 'Offline',

    methodFace: 'Face 3D',
    methodFingerprint: 'Fingerprint',
    methodSimulated: 'Simulated',
    methodManual: 'Manual',
    methodCard: 'Smart Card',

    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
    daySun: 'Sun',
    dayToday: 'Today',
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',

    totalEnrolled: 'Total Enrolled',
    presentToday: 'Present Today',
    lateArrivals: 'Late Arrivals',
    onlineDevices: 'Online Devices',
    whatsAppSent: 'WhatsApp Sent',
    attendanceRate: 'Attendance Rate',

    search: 'Search',
    filter: 'Filter',
    all: 'All',
    actions: 'Actions',
    status: 'Status',
    date: 'Date',
    time: 'Time',
    dayLabel: 'Day',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    deleteBtn: 'Delete',
    addBtn: 'Add',
    close: 'Close',
    exportCsv: 'Export CSV',
    exportPdf: 'Official Statement',
    printBtn: 'Print Document',
    signOut: 'Sign Out',
    sendAlert: 'Send Alert',
    refresh: 'Refresh',
    verified: 'Verified Biometric Entry',
    records: 'records',
    rows: 'rows',
    loading: 'Loading...',
    noRecordsFound: 'No database records found matching the filter.',
    lightMode: 'Switch to Light Mode',
    darkMode: 'Switch to Dark Mode',
    searchNavbarPlaceholder: 'Search students, roll no, admission...',
    childLabel: 'Child:',
    automatedAlerts: 'Automated Alerts',
    queuedDelivered: 'queued / delivered',
    notice: 'Notice',

    overviewTitle: 'Campus Attendance Operations & Analytics',
    overviewSub: 'Real-time biometric ingest, automated parent alerts, and predictive risk telemetry.',
    quickActions: 'Quick Actions',
    remedialClasses: 'Remedial Classes Needed',
    recentActivity: 'Recent Attendance Activity',
    attendanceByClass: 'Attendance Distribution by Class',
    liveSystemActive: 'Live System Active',
    academicSessionBadge: 'Academic Session 2026–2027',
    schoolOpeningLabel: 'School Opening',
    graceLabel: 'Grace',
    absenceCutoffLabel: 'Absence Cutoff',
    simulatePunchBtn: 'Simulate Punch',
    runReconciliationBtn: 'Run Reconciliation',
    totalStudentsCard: 'Total Students',
    enrolledActiveSub: 'Enrolled & Active',
    presentTodayCard: 'Present Today',
    onTimeArrivalsSub: 'On-time arrivals',
    absentTodayCard: 'Absent Today',
    cutoffConfirmedSub: 'Cutoff confirmed',
    lateArrivalsCard: 'Late Arrivals',
    arrivedAfterSub: 'Arrived after',
    weeklyTrendsTitle: 'Attendance Overview & Weekly Trends',
    weeklyTrendsSub: '5-day dynamic attendance pattern across all enrolled classes',
    todayRateLabel: "Today's Attendance Rate",
    cutoffThresholdNote: 'Cutoff threshold: 10:00 AM',
    cbseWarningTitle: 'CBSE Attendance Risk Warning',
    cbseWarningSub: 'Students below mandatory 75% attendance threshold (Admit Card Withheld)',
    currentRateLabel: 'Current Rate',
    consecutiveDaysLabel: 'Need consecutive days to reach 75%',
    recentActivitySub: 'Live biometric check-in log from campus gate terminals',
    riskAlertHeader: 'CBSE Attendance Risk Warning',
    riskAlertSub: 'Action Required Before Exam Admit Cards',

    studentDirectoryTitle: 'Student Directory & Biometric Profiles',
    studentDirectorySub: 'Manage registrations, bulk CSV enrollment, guardian links, and generate printable Smart ID cards.',
    bulkCsvImport: 'Bulk CSV Import',
    registerStudentBtn: 'Register Student',
    searchPlaceholder: 'Search by name, admission no, roll...',
    searchStudents: 'Search by student name, roll...',
    classLabel: 'Class:',
    allClasses: 'All Classes',
    totalStudents: 'Total Students',
    colStudent: 'STUDENT',
    colAdmissionNo: 'ADMISSION NO',
    colClassDivision: 'CLASS & DIVISION',
    colRollNo: 'ROLL NO',
    colBiometrics: 'BIOMETRICS',
    colGuardian: 'GUARDIAN CONTACT',
    colActions: 'ACTIONS',
    badgeFace: 'Face',
    badgeNoFace: 'No Face',
    badgeFinger: 'Fingerprint',
    badgeNoFinger: 'No Finger',
    badgeIdCard: 'ID Card',
    badgeNoneLinked: 'None linked',
    idCardBtn: 'Smart ID Card',
    addStudentModalTitle: 'Register New Student Profile',
    firstNameLabel: 'First Name *',
    lastNameLabel: 'Last Name *',
    genderLabel: 'Gender',
    maleOption: 'Male',
    femaleOption: 'Female',
    otherOption: 'Other',
    guardianNameLabel: 'Primary Guardian Name',
    guardianPhoneLabel: 'Guardian Phone Number (+91)',
    saveStudentBtn: 'Save Student Profile',

    liveMonitorTitle: 'Live Gate Biometric Punch Ingest Monitor',
    liveMonitorSub: 'Continuous real-time stream of student check-ins from campus facial recognition kiosks & fingerprint bridges.',
    gateClockTitle: 'Digital Campus Gate Clock',
    istTimeLabel: 'Indian Standard Time (IST)',
    testBiometricsTitle: 'Biometric Test Ingest Console',
    selectStudentLabel: 'Select Student for Verification Test',
    facePunchBtn: 'Simulate Face Check-In',
    fingerprintPunchBtn: 'Simulate Fingerprint Scan',
    offlineQueueBtn: 'Queue Offline Attendance',
    duplicateTestBtn: 'Simulate Duplicate Punch',
    streamFeedTitle: 'Live Attendance Feed',
    liveIngestSub: 'Real-time entry stream with anti-replay confirmation',

    classesTitle: 'Academic Structure, Timetable & Lecture Tracking',
    classesSub: 'Manage classes, school master timetables, faculty teaching workloads, and period-level lecture attendance.',
    tabSections: 'Classes & Sections',
    tabTimetable: 'Weekly Master Timetable',
    tabSubjectAtt: 'Subject-wise Attendance',
    tabPromotion: 'Academic Promotion Wizard',
    classTeacherLabel: 'Class Teacher',
    capacityLabel: 'Capacity',
    enrolledLabel: 'Enrolled',

    timetableTitle: 'Academic Timetable & Class Schedules',
    timetableSub: 'Design, review and manage academic timetables, period slots, faculty assignments, and rooms.',
    addSlotBtn: 'Add Schedule Slot',
    periodLabel: 'Period',
    subjectLabel: 'Subject',
    teacherLabel: 'Teacher',
    roomLabLabel: 'Room / Laboratory',
    emptySlotLabel: 'Empty Slot',
    noConflictNotice: 'Schedule conflict check verified. No overlapping faculty slots detected.',

    calendarTitle: 'School Calendar, Events & Holidays',
    calendarSub: 'Official academic term calendar, gazetted holidays, parent-teacher meetings, and examination dates.',
    upcomingEventsTitle: 'Upcoming Campus Events',
    holidaysTab: 'Holidays',
    examsTab: 'Examinations',
    eventsTab: 'School Events',
    addEventBtn: 'Add Calendar Event',

    historyTitle: 'Student Attendance Register & Historical Ledgers',
    historySub: 'Historical daily attendance records, arrival timestamps, verification audit trails, and student logs.',
    filterDateLabel: 'Select Date',
    arrivalTimeCol: 'Arrival Time',
    verificationMethodCol: 'Method',

    visitorTitle: 'Campus Gate & Visitor Pickup Management',
    visitorSub: 'Student departure authorization, guardian biometric verification, and digital visitor gate passes.',
    verifyPickupBtn: 'Verify Guardian & Issue Pass',
    authorizedGuardianLabel: 'Authorized Guardian',
    gatePassLabel: 'Digital Gate Pass',
    issuePassBtn: 'Issue Pass',

    leavesTitle: 'Student Leave Applications & Approval Center',
    leavesSub: 'Review and approve advance leave requests submitted by parents with medical notes & reasons.',
    applyLeaveBtn: 'Submit Leave Application',
    pendingLeavesTab: 'Pending Review',
    approvedLeavesTab: 'Approved Leaves',
    rejectedLeavesTab: 'Rejected Leaves',
    leaveTypeLabel: 'Leave Type',
    startDateLabel: 'Start Date',
    endDateLabel: 'End Date',
    reasonLabel: 'Reason for Absence',
    approveBtn: 'Approve Leave',
    rejectBtn: 'Reject Leave',

    reportsTitle: 'School Reports & Analytics Center',
    reportsSub: 'Generate, preview, export, and print official regulatory reports using live database records.',
    tabGenerator: 'Report Generator',
    tabInstitutional: 'Institutional Analytics',
    tabReportHistory: 'Report History',
    reportTypeLabel: 'Report Type *',
    academicYearLabel: 'Academic Session',
    fromDateLabel: 'From Date',
    toDateLabel: 'To Date',
    classGradeLabel: 'Class Grade',
    divisionLabel: 'Division / Section',
    studentLabel: 'Individual Student (Optional)',
    statusLabel: 'Attendance Status Filter',
    facultyTeacherLabel: 'Assigned Faculty Teacher',
    targetFormatLabel: 'Target Export Format:',
    pdfFormatBtn: 'PDF Document',
    excelFormatBtn: 'Excel (CSV)',
    generatePreviewBtn: 'Generate & Preview Report',
    downloadExcelBtn: 'Download Excel',
    downloadPdfBtn: 'Download as PDF / Print',
    officialAuditHeader: 'OFFICIAL REGULATORY REPORT',
    principalSignatureLabel: 'Principal / Registrar Signature',
    catAttendance: 'Attendance Reports',
    catStudent: 'Student Reports',
    catLeave: 'Leave Reports',
    catAcademic: 'Academic Reports',
    catBiometric: 'Biometric Reports',

    biometricsTitle: 'Student Biometric Enrollment & Credential Management',
    biometricsSub: 'Register 3D facial facial templates and optical fingerprint credentials for seamless campus entry.',
    enrollFaceBtn: 'Register Facial Template',
    enrollFingerprintBtn: 'Register Fingerprint',
    captureScanBtn: 'Capture Biometric Scan',
    enrollSuccessMsg: 'Biometric credential enrolled and cryptographic hash persisted.',

    devicesTitle: 'Hardware Gate Terminals & Device Bridge',
    devicesSub: 'Monitor physical biometric terminals, LAN connectivity, firmware status, and ZKTeco/Face mesh sync.',
    onlineDevicesCard: 'Online Terminals',
    syncStatusCard: 'Sync Daemon',
    restartDeviceBtn: 'Ping / Diagnostics',
    deviceIpCol: 'IP & Port',
    deviceStatusCol: 'Device State',

    reconcileTitle: 'End-of-Day Absence Reconciliation',
    reconcileSub: 'Execute formal cutoff reconciliation, mark unexcused absentees, and dispatch portal notices.',
    executeReconcileBtn: 'Execute Cutoff Reconciliation Now',
    cutoffRulesCard: 'Active Cutoff Schedule',

    settingsTitle: 'School Configuration & Governance Rules',
    settingsSub: 'Configure bell schedules, attendance cutoff thresholds, grace buffers, and CBSE compliance targets.',
    saveSettingsBtn: 'Save Institutional Settings',
    schoolNameLabel: 'School Institution Name',
    openingTimeLabel: 'Official Opening Bell Time',
    cutoffTimeLabel: 'Absence Cutoff Time',
    graceMinutesLabel: 'Grace Period (Minutes)',

    auditTitle: 'Security & Administrative Audit Logs',
    auditSub: 'Immutable ledger of attendance adjustments, staff overrides, security authentications, and system actions.',
    auditActionCol: 'Action Type',
    auditTimestampCol: 'Timestamp',
    auditUserCol: 'Initiated By',

    loginTitle: 'SmartAttend School ERP Portal',
    loginSub: 'Next-Generation Biometric Attendance & Institutional Management Platform',
    selectRoleHeading: 'Select Role Perspective to Login',
    emailLabel: 'Email Address / User ID',
    passwordLabel: 'Security Password',
    signInBtn: 'Sign In to SmartAttend Portal',
    demoCredentialsNote: 'Click any role above to prefill authentic credentials',

    guardianPortalTitle: "'s Official Attendance Statements",
    childStatementSub: 'Official Student Biometric Attendance Ledger • Session 2026-2027',
    punctualityCard: 'Punctuality & Arrival',
    absencesLeavesCard: 'Absences & Leaves',
    printStatementBtn: 'Print Official PDF Statement',

    languageName: 'English',
    saveToDatabase: 'Save to PostgreSQL',
    antiReplayActive: 'Anti-replay verification: Already logged entry for today.',

    // Classes & Promotions
    morningGraceLabel: 'Morning Grace: 15 min',
    viewRosterLabel: 'View Roster →',
    enrolledStudentsLabel: 'Enrolled Students',
    masterTimetableLabel: 'Class Timetable Matrix',
    teacherWorkloadTelemetry: 'Teacher Teaching Workload Telemetry (CBSE Norms)',
    workloadSub: 'Monitoring assigned weekly teaching hours against 28 hr maximum threshold',
    weeklyHoursLabel: 'Weekly Hours:',
    studyLibraryLabel: 'Study / Library',
    promotionSafeguardsTitle: 'Academic Year Promotion & Transition Safeguards:',
    promotionSafeguardsDesc: 'Bulk promotion automatically preserves previous class enrollment history in class_enrollments, assigns students to target academic sessions and divisions, verifies attendance eligibility (min 75% required), and prevents duplicate promotions.',
    newAcademicSessionBtn: '+ New Academic Session',
    activeSessionLabel: 'Current Active Academic Session:',
    switchSessionLabel: 'Switch Active Session:',
    promotionConfigTitle: 'Promotion Configuration',
    sourceClassLabel: 'Source Class',
    sourceDivLabel: 'Source Division',
    targetClassLabel: 'Target Class',
    targetDivLabel: 'Target Division',
    targetSessionLabel: 'Target Academic Session',
    allDivisionsOption: 'All Divisions',
    eligibleStudentsTitle: 'Eligible Students for Batch Promotion',
    eligibleStudentsSub: 'Pre-validated against statutory minimum 75% attendance compliance. Uncheck retained students.',
    selectAllEligibleBtn: 'Select All Eligible',
    selectAllBtn: 'Select All',
    deselectAllBtn: 'Deselect All',
    colCompliance: 'Attendance Compliance',
    colEligibility: 'Promotion Eligibility',
    colTargetDest: 'Target Destination',
    statusAlreadyPromoted: 'ALREADY PROMOTED',
    statusPassEligible: 'PASS (ELIGIBLE)',
    statusAttDeficit: 'ATTENDANCE DEFICIT',
    executeBulkPromoBtn: 'Execute Bulk Promotion',
    historyLedgerTitle: 'Historical Class Enrollment Ledger',
    historyLedgerSub: 'Full student progression history across academic sessions. Prior records are archived without data loss.',
    lecturePunchTitle: 'Period Lecture Attendance Punch',
    lockLectureBtn: 'Lock Lecture Ledger',
    markAbsentBtn: 'Mark Absent',
    markPresentBtn: 'Mark Present',

    // History & Privacy
    parentPrivacyEnforced: 'Parent Privacy Enforced',
    childAttendanceTitle: 'Child Attendance Records & Verification History',
    institutionAttendanceTitle: 'Attendance Records & Audit History',
    parentHistorySub: 'Reconciled arrival timestamps, verification methods, and late calculations strictly for your registered child.',
    staffHistorySub: 'Reconciled daily records with timestamped verification methods and late arrival calculations across institution.',
    manualAttendanceBtn: 'Manual Attendance',
    exportChildCsv: 'Export Child CSV',
    exportCsvReport: 'Export CSV Report',
    registeredChildBadge: 'Your Registered Child',
    switchChildLabel: 'Switch Child:',
    onTimeArrivals: 'On-Time Arrivals',
    lateCheckins: 'Late Check-ins',
    absencesLeaves: 'Absences / Leaves',
    punctualityRate: 'Punctuality:',
    securityPrivacyTitle: 'Security Privacy Verification (IDOR Protection Test)',
    securityPrivacySub: "Attempt to query another student's attendance record by manually altering the requested student ID. Verify that the backend API strictly returns HTTP 403 Forbidden and shields other students' data.",
    testPrivacyBlockBtn: 'Test Privacy Block',
    testingPrivacy: 'Verifying...',
    allStatusesOption: 'All Statuses',
    colRemarks: 'Remarks / Reconciled Info',
    firstArrivalCol: 'First Arrival',
    manualModalTitle: 'Manual Attendance & Status Override',

    // Visitor Pickup
    tabStudentPickup: 'Student Early Dismissal & Gate Pass',
    tabCampusVisitors: 'General Campus Visitors',
    tabPreAuthorized: 'Pre-Authorized Guardians',
    visitorLogsTitle: 'Gate Dismissal & Early Departure Logs',
    visitorNameLabel: 'Visitor Full Name',
    visitorPhoneLabel: 'Contact Phone Number',
    relationshipLabel: 'Relationship to Student',
    pickupReasonLabel: 'Reason for Early Departure',
    verifyAndIssuePassBtn: 'Verify & Issue Gate Pass',
    otpModalTitle: 'Guardian Mobile OTP Verification',
    enterOtpLabel: 'Enter 6-Digit OTP',
    verifyOtpBtn: 'Verify OTP & Dismiss Student',
    printPassBtn: 'Print Gate Pass',
    gatePassIssuedTitle: 'Official Early Dismissal Gate Pass',

    // Leaves & Corrections
    tabLeaves: 'Student Leave Applications',
    tabCorrections: 'Attendance Correction Requests',
    requestCorrectionBtn: '+ Request Rectification',
    allStatusFilter: 'All Requests',
    pendingStatusFilter: 'Pending Review',
    approvedStatusFilter: 'Approved',
    rejectedStatusFilter: 'Rejected',
    colLeavePeriod: 'Leave Period',
    colReason: 'Reason & Notes',
    applyLeaveModalTitle: 'Submit Student Leave Application',
    submitApplicationBtn: 'Submit Application',
    reviewRemarksLabel: 'Review Remarks',

    // Device Management
    tabTelemetry: 'Live Hardware Telemetry',
    tabOfflineQueue: 'Offline Mesh & Sync Engine',
    pingDeviceBtn: 'Ping',
    reconnectBtn: 'Reconnect',
    hardwareStatusLabel: 'Hardware Bridge & Terminal Fleet',
    terminalNameCol: 'Device Name',
    terminalModelCol: 'Model & Location',
    syncLogsTitle: 'Real-time Sync Activity Logs',

    // Absence Reconciliation
    reconciliationTitle: 'Automated Absence Reconciliation Engine',
    reconciliationSub: 'Reconciles raw biometric punches against campus cutoff rules, approved leaves, and dispatches parent alerts.',
    runCutoffBtn: 'Run Cutoff Reconciliation',
    reconcilingDb: 'Reconciling Database...',
    officialOpeningCard: 'Official Opening',
    gracePeriodCard: 'Grace Period Buffer',
    cutoffTimeCard: 'Absence Cutoff Time',
    absentRosterTitle: "Today's Absent & On-Leave Roster",
    absentRosterSub: 'Students reconciled without a verified biometric punch for today',
    alertQueuedBadge: 'Absence Alert Queued',
    notRequiredOnLeave: 'Not required (On Leave)',

    // School Settings
    tabPolicies: 'Gate Policies & Notification Bell',
    tabHolidays: 'School Calendar & Holidays',
    tabPromotions: 'Academic Year & Student Promotion',
    attendanceRulesTitle: 'Attendance Window Rules',
    saveTimingsBtn: 'Save Gate Timings',
    addHolidayTitle: 'Add Official School Holiday',
    holidayNameLabel: 'Holiday Title',
    holidayDateLabel: 'Date',
    holidayDescLabel: 'Description / Notes',
    addHolidayBtn: 'Add to Calendar',

    // Audit Logs
    auditLogsTitle: 'Security Audit Logs & Compliance Trail',
    auditLogsSub: 'Immutable cryptographic log of user actions, biometric template generation, and attendance overrides.',
    dpdpBadge: 'DPDP Act / GDPR Compliant',
    colAction: 'Action',
    colOperator: 'Operator',
    colEntity: 'Entity',
    colIp: 'IP Address',
    colDetails: 'Details',
    colTimestamp: 'Timestamp',

    // Login Page
    portalHeading: 'SmartAttend Enterprise ERP',
    portalSub: 'Next-generation biometric attendance, safety compliance & guardian portal',
    quickRolePerspective: 'One-Click Role Perspective Switch',
    secureLoginTitle: 'Authorized Access',
    secureLoginSub: 'Enter institutional credentials to access your portal',
    signingIn: 'Signing in...',
    accountLockedMsg: 'Account temporarily locked due to multiple failed attempts.'
  },
  mr: {
    brandName: 'स्मार्टअटेंड',
    brandTagline: 'बायोमेट्रिक हजेरी प्रणाली',
    overviewDashboard: 'मुख्य डॅशबोर्ड',
    livePunchMonitor: 'थेट हजेरी मॉनिटर',
    studentDirectory: 'विद्यार्थी यादी',
    classesAndDivisions: 'इयत्ता व तुकड्या',
    attendanceHistory: 'हजेरी इतिहास',
    leaveApplications: 'रजा अर्ज व्यवस्थापन',
    reportsAndAnalytics: 'अहवाल व विश्लेषण',
    biometricEnrollment: 'बायोमेट्रिक नोंदणी',
    deviceManagement: 'बायोमेट्रिक उपकरणे',
    whatsAppLogs: 'व्हॉट्सअ‍ॅप संदेश लॉग',
    absenceReconciliation: 'अनुपस्थिती पडताळणी',
    schoolConfiguration: 'शाळा संरचना',
    auditLogs: 'सुरक्षा व ऑडिट लॉग',
    visitorPickup: 'गेट व अभ्यागत पडताळणी',
    timetable: 'वेळापत्रक व तासिका',
    schoolCalendar: 'शालेय दिनदर्शिका व सुट्ट्या',
    childAttendance: 'पाल्य हजेरी',
    myAttendance: 'माझी हजेरी',
    childReports: 'पाल्य अहवाल व आकडेवारी',
    myReports: 'माझे अहवाल व आकडेवारी',
    connectedCampus: 'जोडलेले संकुल',
    realtimeActive: 'थेट गेटवे सक्रिय',
    platformVersion: 'स्मार्टअटेंड प्रणाली',

    sectionMain: 'मुख्य मेनू',
    sectionAcademic: 'शैक्षणिक',
    sectionOperations: 'संचलन व ऑपरेशन्स',
    sectionInfrastructure: 'प्रणाली व उपकरणे',
    switchRolePerspective: 'भूमिका / खाते बदला',
    parentPortals: 'पालक खाती',
    staffPortals: 'शिक्षक व प्रशासक खाती',

    roleSuperAdmin: 'मुख्य प्रशासक',
    rolePrincipalAdmin: 'प्राचार्य / प्रशासक',
    roleTeacher: 'शिक्षक',
    roleParent: 'पालक',
    roleStudent: 'विद्यार्थी',

    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    late: 'उशिरा',
    halfDay: 'अर्धा दिवस',
    onLeave: 'रजेवर',
    holiday: 'शासकीय सुट्टी',
    excused: 'सवलत प्राप्त',
    approved: 'मंजूर',
    pending: 'प्रलंबित',
    rejected: 'नाकारले',
    online: 'ऑनलाइन',
    offline: 'ऑफलाइन',

    methodFace: 'चेहरा (Face 3D)',
    methodFingerprint: 'बोटांचे ठसे (Fingerprint)',
    methodSimulated: 'सिम्युलेटेड',
    methodManual: 'मॅन्युअल',
    methodCard: 'स्मार्ट कार्ड',

    dayMon: 'सोम',
    dayTue: 'मंगळ',
    dayWed: 'बुध',
    dayThu: 'गुरु',
    dayFri: 'शुक्र',
    daySat: 'शनि',
    daySun: 'रवि',
    dayToday: 'आज',
    greetingMorning: 'शुभ सकाळ',
    greetingAfternoon: 'शुभ दुपार',
    greetingEvening: 'शुभ संध्याकाळ',

    totalEnrolled: 'एकूण नोंदणीकृत',
    presentToday: 'आज उपस्थित',
    lateArrivals: 'उशिरा आलेले',
    onlineDevices: 'सक्रिय उपकरणे',
    whatsAppSent: 'संदेश पाठवले',
    attendanceRate: 'हजेरी टक्केवारी',

    search: 'शोधा',
    filter: 'फिल्टर',
    all: 'सर्व',
    actions: 'कृती',
    status: 'स्थिती',
    date: 'दिनांक',
    time: 'वेळ',
    dayLabel: 'वार',
    save: 'बदल जतन करा',
    cancel: 'रद्द करा',
    edit: 'संपादित करा',
    deleteBtn: 'हटवा',
    addBtn: 'जोडा',
    close: 'बंद करा',
    exportCsv: 'एक्सेल CSV डाउनलोड',
    exportPdf: 'अधिकृत प्रमाणपत्र',
    printBtn: 'प्रिंट करा',
    signOut: 'बाहेर पडा (Sign Out)',
    sendAlert: 'पालकांना सूचना पाठवा',
    refresh: 'ताजे करा',
    verified: 'बायोमेट्रिक पडताळणी पूर्ण',
    records: 'नोंदी',
    rows: 'पंक्ती',
    loading: 'माहिती लोड होत आहे...',
    noRecordsFound: 'निवडलेल्या फिल्टरनुसार कोणतीही माहिती उपलब्ध नाही.',
    lightMode: 'लाइट मोड वापरा',
    darkMode: 'डार्क मोड वापरा',
    searchNavbarPlaceholder: 'विद्यार्थ्याचे नाव, हजेरी क्र. किंवा प्रवेश क्र. शोधा...',
    childLabel: 'पाल्य:',
    automatedAlerts: 'स्वयंचलित सूचना',
    queuedDelivered: 'पाठवलेले / रांगेत',
    notice: 'सूचना',

    overviewTitle: 'शालेय हजेरी संचलन व थेट विश्लेषण',
    overviewSub: 'थेट बायोमेट्रिक नोंद, स्वयंचलित पालक सूचना आणि हजेरी विश्लेषण.',
    quickActions: 'जलद कृती',
    remedialClasses: 'आवश्यक अतिरिक्त तासिका',
    recentActivity: 'अलीकडील हजेरी नोंदी',
    attendanceByClass: 'इयत्तानिहाय हजेरी प्रमाण',
    liveSystemActive: 'थेट प्रणाली सक्रिय',
    academicSessionBadge: 'शैक्षणिक वर्ष २०२६–२०२७',
    schoolOpeningLabel: 'शाळा सुरू होण्याची वेळ',
    graceLabel: 'सवलत वेळ',
    absenceCutoffLabel: 'अनुपस्थिती मर्यादा',
    simulatePunchBtn: 'हजेरी नोंदवा (Simulate)',
    runReconciliationBtn: 'हजेरी पडताळणी करा',
    totalStudentsCard: 'एकूण विद्यार्थी',
    enrolledActiveSub: 'नोंदणीकृत व सक्रिय',
    presentTodayCard: 'आज उपस्थित',
    onTimeArrivalsSub: 'वेळेवर आलेले विद्यार्थी',
    absentTodayCard: 'आज अनुपस्थित',
    cutoffConfirmedSub: 'कटऑफ निश्चित',
    lateArrivalsCard: 'उशिरा आलेले विद्यार्थी',
    arrivedAfterSub: 'नंतर आलेले',
    weeklyTrendsTitle: 'हजेरी आढावा व साप्ताहिक कल',
    weeklyTrendsSub: 'सर्व इयत्तांमधील ५-दिवसीय थेट हजेरी प्रगती',
    todayRateLabel: 'आजची हजेरी टक्केवारी',
    cutoffThresholdNote: 'अनुपस्थिती मर्यादा: १०:०० AM',
    cbseWarningTitle: 'कमी हजेरी धोक्याची सूचना (CBSE ७५% मर्यादा)',
    cbseWarningSub: '७५% पेक्षा कमी हजेरी असलेले विद्यार्थी (परीक्षेचे प्रवेशपत्र रोखले जाऊ शकते)',
    currentRateLabel: 'सध्याची टक्केवारी',
    consecutiveDaysLabel: '७५% गाठण्यासाठी सलग दिवस आवश्यक',
    recentActivitySub: 'शाळा गेट उपकरणांवरून थेट बायोमेट्रिक हजेरी नोंदी',
    riskAlertHeader: 'कमी हजेरी धोक्याची सूचना',
    riskAlertSub: 'परीक्षेचे हॉल तिकीट मिळण्यापूर्वी हजेरी पूर्ण करणे आवश्यक',

    studentDirectoryTitle: 'विद्यार्थी यादी व बायोमेट्रिक प्रोफाइल',
    studentDirectorySub: 'नोंदणी व्यवस्थापन, एकत्रित CSV आयात, पालक संपर्क आणि स्मार्ट ओळखपत्र निर्मिती.',
    bulkCsvImport: 'CSV फाईल आयात',
    registerStudentBtn: 'नवीन विद्यार्थी जोडा',
    searchPlaceholder: 'नाव, प्रवेश क्र. किंवा हजेरी क्र. शोधा...',
    searchStudents: 'विद्यार्थ्याचे नाव किंवा हजेरी क्रमांक शोधा...',
    classLabel: 'इयत्ता:',
    allClasses: 'सर्व इयत्ता',
    totalStudents: 'एकूण विद्यार्थी',
    colStudent: 'विद्यार्थी',
    colAdmissionNo: 'प्रवेश क्र.',
    colClassDivision: 'इयत्ता व तुकडी',
    colRollNo: 'हजेरी क्र.',
    colBiometrics: 'बायोमेट्रिक्स',
    colGuardian: 'पालक संपर्क',
    colActions: 'कृती',
    badgeFace: 'चेहरा',
    badgeNoFace: 'चेहरा नाही',
    badgeFinger: 'ठसे',
    badgeNoFinger: 'ठसे नाहीत',
    badgeIdCard: 'ओळखपत्र',
    badgeNoneLinked: 'जोडलेले नाही',
    idCardBtn: 'स्मार्ट ओळखपत्र',
    addStudentModalTitle: 'नवीन विद्यार्थी नोंदणी फॉर्म',
    firstNameLabel: 'पहिले नाव *',
    lastNameLabel: 'आडनाव *',
    genderLabel: 'लिंग',
    maleOption: 'मुलगा',
    femaleOption: 'मुलगी',
    otherOption: 'इतर',
    guardianNameLabel: 'पालकांचे संपूर्ण नाव',
    guardianPhoneLabel: 'पालक मोबाइल नंबर (+91)',
    saveStudentBtn: 'विद्यार्थी माहिती जतन करा',

    liveMonitorTitle: 'थेट बायोमेट्रिक हजेरी मॉनिटर',
    liveMonitorSub: 'शाळा गेट्स आणि फेशियल रेकग्निशन टर्मिनल्सवरून थेट येणाऱ्या नोंदींचे संचलन.',
    gateClockTitle: 'डिजिटल शालेय घड्याळ',
    istTimeLabel: 'भारतीय प्रमाणवेळ (IST)',
    testBiometricsTitle: 'बायोमेट्रिक चाचणी पॅनल',
    selectStudentLabel: 'चाचणीसाठी विद्यार्थी निवडा',
    facePunchBtn: 'फेस स्कॅन हजेरी नोंदवा',
    fingerprintPunchBtn: 'फिंगरप्रिंट हजेरी नोंदवा',
    offlineQueueBtn: 'ऑफलाइन रांगेत हजेरी नोंदवा',
    duplicateTestBtn: 'दुबार हजेरी तपासा',
    streamFeedTitle: 'थेट हजेरी नोंद प्रवाह',
    liveIngestSub: 'अँटी-रिप्ले सुरक्षेसहित थेट प्रवेश नोंदी',

    classesTitle: 'शैक्षणिक रचना, वर्ग व तासिका ट्रॅकिंग',
    classesSub: 'इयत्ता, तुकड्या, वेळापत्रक, शिक्षक कार्यभार आणि वर्गनिहाय हजेरी व्यवस्थापन.',
    tabSections: 'इयत्ता व तुकड्या',
    tabTimetable: 'साप्ताहिक वेळापत्रक',
    tabSubjectAtt: 'विषयनिहाय हजेरी',
    tabPromotion: 'वर्गोन्नती प्रक्रिया (Promotion)',
    classTeacherLabel: 'वर्गशिक्षक',
    capacityLabel: 'आसनक्षमता',
    enrolledLabel: 'प्रवेशित विद्यार्थी',

    timetableTitle: 'वेळापत्रक व तासिका नियोजन',
    timetableSub: 'साप्ताहिक तासिका, विषय शिक्षक वाटप, प्रयोगशाळा आणि वर्गखोल्यांचे नियोजन करा.',
    addSlotBtn: 'नवीन तासिका जोडा',
    periodLabel: 'तासिका',
    subjectLabel: 'विषय',
    teacherLabel: 'शिक्षक',
    roomLabLabel: 'वर्गखोली / लॅब',
    emptySlotLabel: 'रिकामी तासिका',
    noConflictNotice: 'वेळापत्रकात कोणतीही तफावत नाही. सर्व तासिका व्यवस्थित आहेत.',

    calendarTitle: 'शालेय दिनदर्शिका, कार्यक्रम व सुट्ट्या',
    calendarSub: 'अधिकृत शैक्षणिक दिनदर्शिका, शासकीय सुट्ट्या, पालक मेळावे व परीक्षांचे वेळापत्रक.',
    upcomingEventsTitle: 'आगामी शालेय कार्यक्रम',
    holidaysTab: 'सुट्ट्या',
    examsTab: 'परीक्षा',
    eventsTab: 'शालेय कार्यक्रम',
    addEventBtn: 'नवीन कार्यक्रम जोडा',

    historyTitle: 'विद्यार्थी हजेरी रजिस्टर व इतिहास',
    historySub: 'दैनिक हजेरी नोंदी, आगमन वेळ, पडताळणी पद्धत व विद्यार्थ्यांचा तपशीलवार हजेरी इतिहास.',
    filterDateLabel: 'तारीख निवडा',
    arrivalTimeCol: 'आगमन वेळ',
    verificationMethodCol: 'पडताळणी पद्धत',

    visitorTitle: 'शाळा गेट सुरक्षा व पालक पिकअप व्यवस्थापन',
    visitorSub: 'सुट्टीच्या वेळी विद्यार्थी सोडणे, अधिकृत पालक पडताळणी आणि डिजिटल गेट पास निर्मिती.',
    verifyPickupBtn: 'पालक पडताळणी करून पास द्या',
    authorizedGuardianLabel: 'अधिकृत पालक',
    gatePassLabel: 'डिजिटल गेट पास',
    issuePassBtn: 'गेट पास द्या',

    leavesTitle: 'विद्यार्थी रजा अर्ज व मंजुरी केंद्र',
    leavesSub: 'पालकांनी पाठवलेले रजा अर्ज तपासा आणि मुख्याध्यापक मान्यतेसह मंजूर किंवा नाकारा.',
    applyLeaveBtn: 'नवीन रजा अर्ज करा',
    pendingLeavesTab: 'प्रलंबित अर्ज',
    approvedLeavesTab: 'मंजूर अर्ज',
    rejectedLeavesTab: 'नाकारलेले अर्ज',
    leaveTypeLabel: 'रजेचा प्रकार',
    startDateLabel: 'सुरुवात तारीख',
    endDateLabel: 'शेवट तारीख',
    reasonLabel: 'रजेचे कारण',
    approveBtn: 'रजा मंजूर करा',
    rejectBtn: 'रजा नाकारा',

    reportsTitle: 'अधिकृत शालेय अहवाल व विश्लेषण केंद्र',
    reportsSub: 'थेट डेटाबेसमधून अधिकृत शालेय अहवाल तयार करा, एक्सेल व पीडीएफ स्वरूपात मिळवा किंवा प्रिंट करा.',
    tabGenerator: 'अहवाल निर्मिती केंद्र',
    tabInstitutional: 'संस्थात्मक विश्लेषण',
    tabReportHistory: 'अहवाल इतिहास',
    reportTypeLabel: 'अहवालाचा प्रकार निवडा *',
    academicYearLabel: 'शैक्षणिक वर्ष',
    fromDateLabel: 'या तारखेपासून',
    toDateLabel: 'या तारखेपर्यंत',
    classGradeLabel: 'इयत्ता निवडा',
    divisionLabel: 'तुकडी / विभाग',
    studentLabel: 'वैयक्तिक विद्यार्थी (ऐच्छिक)',
    statusLabel: 'हजेरी स्थिती फिल्टर',
    facultyTeacherLabel: 'नियुक्त शिक्षक',
    targetFormatLabel: 'अहवाल फॉरमॅट:',
    pdfFormatBtn: 'पीडीएफ (PDF)',
    excelFormatBtn: 'एक्सेल (CSV)',
    generatePreviewBtn: 'अहवाल तयार करा व पूर्वदृश्य पहा',
    downloadExcelBtn: 'एक्सेल डाउनलोड करा',
    downloadPdfBtn: 'पीडीएफ डाउनलोड / प्रिंट करा',
    officialAuditHeader: 'अधिकृत शालेय नियामक अहवाल',
    principalSignatureLabel: 'प्राचार्य / कुलसचिव स्वाक्षरी',
    catAttendance: 'हजेरी अहवाल',
    catStudent: 'विद्यार्थी अहवाल',
    catLeave: 'रजा अहवाल',
    catAcademic: 'शैक्षणिक अहवाल',
    catBiometric: 'बायोमेट्रिक अहवाल',

    biometricsTitle: 'बायोमेट्रिक नोंदणी व ओळख व्यवस्थापन',
    biometricsSub: 'विद्यार्थ्यांचे ३डी चेहरा मॉडेल आणि बोटांचे ठसे अधिकृत उपकरणांमध्ये नोंदवा.',
    enrollFaceBtn: 'चेहरा स्कॅन नोंदणी',
    enrollFingerprintBtn: 'फिंगरप्रिंट नोंदणी',
    captureScanBtn: 'बायोमेट्रिक स्कॅन घ्या',
    enrollSuccessMsg: 'बायोमेट्रिक नोंदणी यशस्वीरित्या पूर्ण झाली व सुरक्षितपणे जतन केली.',

    devicesTitle: 'बायोमेट्रिक उपकरणे व टर्मिनल ब्रिज',
    devicesSub: 'गेट टर्मिनल्स, नेटवर्क कनेक्टिव्हिटी, IP स्थिती आणि झेडकेटेको उपकरण जोडणी व्यवस्थापन.',
    onlineDevicesCard: 'ऑनलाइन उपकरणे',
    syncStatusCard: 'सिंक सेवा',
    restartDeviceBtn: 'उपकरण चाचणी / पिंग',
    deviceIpCol: 'आयपी व पोर्ट',
    deviceStatusCol: 'उपकरण स्थिती',

    reconcileTitle: 'दिवसाअखेर अनुपस्थिती पडताळणी',
    reconcileSub: 'कटऑफ वेळेनंतर हजेरी तपासून अनुपस्थित विद्यार्थ्यांच्या पालकांना पोर्टल सूचना पाठवा.',
    executeReconcileBtn: 'कटऑफ पडताळणी आता पूर्ण करा',
    cutoffRulesCard: 'सक्रिय कटऑफ नियम',

    settingsTitle: 'शाळा संरचना व नियम व्यवस्थापन',
    settingsSub: 'शाळेच्या वेळा, बायोमेट्रिक नियम, अनुपस्थिती कटऑफ आणि सीबीएसई हजेरी निकष व्यवस्थापित करा.',
    saveSettingsBtn: 'सेटिंग्ज जतन करा',
    schoolNameLabel: 'शाळेचे अधिकृत नाव',
    openingTimeLabel: 'शाळा सुरू होण्याची वेळ',
    cutoffTimeLabel: 'अनुपस्थिती कटऑफ वेळ',
    graceMinutesLabel: 'सवलत कालावधी (मिनिटे)',

    auditTitle: 'सुरक्षा व प्रशासकीय ऑडिट लॉग्स',
    auditSub: 'हजेरीतील बदल, मॅन्युअल नोंदी, लॉगिन इतिहास आणि प्रणाली सुरक्षेचा कायमस्वरूपी लेखाजोखा.',
    auditActionCol: 'कृती प्रकार',
    auditTimestampCol: 'वेळ व दिनांक',
    auditUserCol: 'कृती करणारी व्यक्ती',

    loginTitle: 'स्मार्टअटेंड शाळा व्यवस्थापन पोर्टल',
    loginSub: 'बायोमेट्रिक विद्यार्थी हजेरी व अत्याधुनिक संस्थात्मक संचलन प्रणाली',
    selectRoleHeading: 'लॉगिन करण्यासाठी तुमची भूमिका निवडा',
    emailLabel: 'ईमेल पत्ता / युझर आयडी',
    passwordLabel: 'पासवर्ड',
    signInBtn: 'स्मार्टअटेंड पोर्टलमध्ये प्रवेश करा',
    demoCredentialsNote: 'खाते निवडण्यासाठी वरील कोणत्याही भूमिकेवर क्लिक करा',

    guardianPortalTitle: 'यांचे अधिकृत हजेरी पत्रक',
    childStatementSub: 'अधिकृत विद्यार्थी बायोमेट्रिक हजेरी रजिस्टर • सत्र २०२६–२०२७',
    punctualityCard: 'वेळेवर येण्याचे प्रमाण',
    absencesLeavesCard: 'अनुपस्थिती व रजा',
    printStatementBtn: 'अधिकृत हजेरी पत्रक प्रिंट करा',

    languageName: 'मराठी',
    saveToDatabase: 'डेटाबेसमध्ये सेव्ह करा',
    antiReplayActive: 'अँटी-रिप्ले पडताळणी: आजची हजेरी नोंद आधीच झालेली आहे.',

    // Classes & Promotions
    morningGraceLabel: 'सकाळची सवलत: १५ मिनिटे',
    viewRosterLabel: 'यादी पहा →',
    enrolledStudentsLabel: 'नोंदणीकृत विद्यार्थी',
    masterTimetableLabel: 'वर्ग वेळापत्रक मॅट्रिक्स',
    teacherWorkloadTelemetry: 'शिक्षक अध्यापन कार्यभार (CBSE मानके)',
    workloadSub: '२८ तास कमाल मर्यादेनुसार साप्ताहिक अध्यापन तासांचे निरीक्षण',
    weeklyHoursLabel: 'साप्ताहिक तास:',
    studyLibraryLabel: 'स्वयंअध्ययन / ग्रंथालय',
    promotionSafeguardsTitle: 'शैक्षणिक वर्ष वर्गोन्नती आणि संक्रमण सुरक्षा:',
    promotionSafeguardsDesc: 'सामूहिक वर्गोन्नतीमुळे मागील शैक्षणिक नोंदी सुरक्षित राहतात, विद्यार्थ्यांना पुढील वर्गात प्रवेश दिला जातो, ७५% उपस्थिती तपासली जाते आणि दुबार नोंदणी टाळली जाते.',
    newAcademicSessionBtn: '+ नवीन शैक्षणिक वर्ष',
    activeSessionLabel: 'सध्याचे सक्रिय शैक्षणिक वर्ष:',
    switchSessionLabel: 'सक्रिय वर्ष बदला:',
    promotionConfigTitle: 'वर्गोन्नती संरचना',
    sourceClassLabel: 'सध्याचा वर्ग',
    sourceDivLabel: 'सध्याची तुकडी',
    targetClassLabel: 'पुढील वर्ग',
    targetDivLabel: 'पुढील तुकडी',
    targetSessionLabel: 'पुढील शैक्षणिक वर्ष',
    allDivisionsOption: 'सर्व तुकड्या',
    eligibleStudentsTitle: 'सामूहिक वर्गोन्नतीसाठी पात्र विद्यार्थी',
    eligibleStudentsSub: 'किमान ७५% उपस्थिती निकषावर आधारित. अनुत्तीर्ण विद्यार्थ्यांचे टिकमार्क काढा.',
    selectAllEligibleBtn: 'सर्व पात्र निवडा',
    selectAllBtn: 'सर्व निवडा',
    deselectAllBtn: 'सर्व निवड रद्द करा',
    colCompliance: 'उपस्थिती निकष',
    colEligibility: 'वर्गोन्नती पात्रता',
    colTargetDest: 'पुढील वर्ग',
    statusAlreadyPromoted: 'आधीच वर्गोन्नती झाली',
    statusPassEligible: 'उत्तीर्ण (पात्र)',
    statusAttDeficit: 'कमी उपस्थिती',
    executeBulkPromoBtn: 'सामूहिक वर्गोन्नती लागू करा',
    historyLedgerTitle: 'ऐतिहासिक वर्ग नोंदणी खतावणी',
    historyLedgerSub: 'विद्यार्थ्यांची मागील वर्षांमधील संपूर्ण नोंदणी माहिती. कोणताही डेटा नष्ट न होता सुरक्षित.',
    lecturePunchTitle: 'तासिका उपस्थिती नोंदणी',
    lockLectureBtn: 'तासिका हजेरी नोंद जतन करा',
    markAbsentBtn: 'गैरहजर नोंदवा',
    markPresentBtn: 'हजर नोंदवा',

    // History & Privacy
    parentPrivacyEnforced: 'पालक गोपनीयता लागू',
    childAttendanceTitle: 'पाल्य उपस्थिती नोंदी आणि पडताळणी इतिहास',
    institutionAttendanceTitle: 'उपस्थिती नोंदी आणि पडताळणी इतिहास',
    parentHistorySub: 'नोंदणीकृत पाल्याच्या उपस्थिती वेळा, पडताळणी पद्धत आणि विलंबाची अधिकृत माहिती.',
    staffHistorySub: 'शाळेतील सर्व विद्यार्थ्यांच्या दैनंदिन उपस्थितीच्या पडताळणी नोंदी आणि विलंब गणना.',
    manualAttendanceBtn: 'मॅन्युअल उपस्थिती',
    exportChildCsv: 'पाल्याची CSV प्रत',
    exportCsvReport: 'CSV अहवाल प्रत',
    registeredChildBadge: 'तुमचा नोंदणीकृत पाल्य',
    switchChildLabel: 'पाल्य बदला:',
    onTimeArrivals: 'वेळेवर आगमन',
    lateCheckins: 'उशिरा आगमन',
    absencesLeaves: 'गैरहजेरी / रजा',
    punctualityRate: 'वक्तशीरपणा:',
    securityPrivacyTitle: 'सुरक्षा गोपनीयता पडताळणी (IDOR संरक्षण चाचणी)',
    securityPrivacySub: 'दुसऱ्या विद्यार्थ्याचा आयडी बदलून उपस्थिती मिळवण्याचा प्रयत्न करा. सिस्टीम HTTP 403 Forbidden देऊन डेटा सुरक्षित ठेवते.',
    testPrivacyBlockBtn: 'डेटा सुरक्षितता चाचणी',
    testingPrivacy: 'तपासणी सुरू...',
    allStatusesOption: 'सर्व स्थिती',
    colRemarks: 'शेरा / पडताळणी तपशील',
    firstArrivalCol: 'पहिले आगमन',
    manualModalTitle: 'मॅन्युअल उपस्थिती आणि दुरुस्ती',

    // Visitor Pickup
    tabStudentPickup: 'विद्यार्थी वेळेपूर्वी रवानगी आणि गेट पास',
    tabCampusVisitors: 'शालेय अभ्यागत नोंदवही',
    tabPreAuthorized: 'पूर्व-अधिकृत पालक व नातेवाईक',
    visitorLogsTitle: 'विद्यार्थी सोडल्याच्या गेट नोंदी',
    visitorNameLabel: 'अभ्यागताचे पूर्ण नाव',
    visitorPhoneLabel: 'संपर्क फोन क्रमांक',
    relationshipLabel: 'विद्यार्थ्याशी नाते',
    pickupReasonLabel: 'वेळेपूर्वी नेण्याचे कारण',
    verifyAndIssuePassBtn: 'तपासणी करा आणि गेट पास द्या',
    otpModalTitle: 'पालक मोबाइल OTP पडताळणी',
    enterOtpLabel: '६-अंकी OTP टाका',
    verifyOtpBtn: 'OTP पडताळा आणि परवानगी द्या',
    printPassBtn: 'गेट पास प्रिंट करा',
    gatePassIssuedTitle: 'अधिकृत शालेय रवानगी गेट पास',

    // Leaves & Corrections
    tabLeaves: 'विद्यार्थी रजा अर्ज',
    tabCorrections: 'उपस्थिती दुरुस्ती विनंत्या',
    requestCorrectionBtn: '+ उपस्थिती दुरुस्ती विनंती',
    allStatusFilter: 'सर्व अर्ज',
    pendingStatusFilter: 'प्रलंबित अर्ज',
    approvedStatusFilter: 'मंजूर अर्ज',
    rejectedStatusFilter: 'नाकारलेले अर्ज',
    colLeavePeriod: 'रजेचा कालावधी',
    colReason: 'कारण आणि टिप',
    applyLeaveModalTitle: 'विद्यार्थी रजा अर्ज सादर करा',
    submitApplicationBtn: 'अर्ज सादर करा',
    reviewRemarksLabel: 'पुनरावलोकन शेरा',

    // Device Management
    tabTelemetry: 'थेट उपकरण स्थिती',
    tabOfflineQueue: 'ऑफलाइन मेश आणि सिंक इंजिन',
    pingDeviceBtn: 'पिंग तपासा',
    reconnectBtn: 'पुन्हा जोडा',
    hardwareStatusLabel: 'उपकरणे आणि बायोमेट्रिक टर्मिनल्स',
    terminalNameCol: 'उपकरणाचे नाव',
    terminalModelCol: 'मॉडेल आणि स्थान',
    syncLogsTitle: 'थेट सिंक नोंदी',

    // Absence Reconciliation
    reconciliationTitle: 'स्वयंचलित अनुपस्थिती पडताळणी इंजिन',
    reconciliationSub: 'बायोमेट्रिक नोंदी, कटऑफ नियम आणि मंजूर रजा यांची पडताळणी करून गैरहजर विद्यार्थ्यांची माहिती अपडेट करते.',
    runCutoffBtn: 'कटऑफ पडताळणी सुरू करा',
    reconcilingDb: 'पडताळणी सुरू आहे...',
    officialOpeningCard: 'शाळा सुरू होण्याची वेळ',
    gracePeriodCard: 'सवलतीचा अवधी',
    cutoffTimeCard: 'अनुपस्थिती कटऑफ वेळ',
    absentRosterTitle: 'आजचे गैरहजर आणि रजेवरील विद्यार्थी',
    absentRosterSub: 'बायोमेट्रिक नोंद नसलेले विद्यार्थी',
    alertQueuedBadge: 'अनुपस्थिती सूचना पाठवली',
    notRequiredOnLeave: 'लागू नाही (रजेवर)',

    // School Settings
    tabPolicies: 'गेट वेळ नियम आणि सूचना घंटा',
    tabHolidays: 'शालेय दिनदर्शिका आणि सुट्ट्या',
    tabPromotions: 'नवीन वर्ष आणि वर्गोन्नती',
    attendanceRulesTitle: 'उपस्थिती वेळेचे नियम',
    saveTimingsBtn: 'गेट वेळा जतन करा',
    addHolidayTitle: 'नवीन अधिकृत सुट्टी जोडा',
    holidayNameLabel: 'सुट्टीचे नाव',
    holidayDateLabel: 'तारीख',
    holidayDescLabel: 'वर्णन / टीप',
    addHolidayBtn: 'दिनदर्शिकेत जोडा',

    // Audit Logs
    auditLogsTitle: 'सुरक्षा ऑडिट नोंदी आणि गोपनीयता तपासणी',
    auditLogsSub: 'वापरकर्त्यांच्या सर्व कृती, बायोमेट्रिक प्रक्रिया आणि उपस्थिती बदलांच्या सुरक्षित नोंदी.',
    dpdpBadge: 'DPDP कायदा व गोपनीयता अनुरूप',
    colAction: 'कृती',
    colOperator: 'ऑपरेटर',
    colEntity: 'घटक',
    colIp: 'आयपी ॲड्रेस',
    colDetails: 'तपशील',
    colTimestamp: 'वेळ व तारीख',

    // Login Page
    portalHeading: 'SmartAttend शाळा ईआरपी प्रणाली',
    portalSub: 'आधुनिक बायोमेट्रिक उपस्थिती, सुरक्षा आणि पालक पोर्टल',
    quickRolePerspective: 'एका क्लिकवर भूमिका निवडा',
    secureLoginTitle: 'सुरक्षित लॉगिन',
    secureLoginSub: 'प्रवेशासाठी आपले शाळेचे लॉगिन तपशील टाका',
    signingIn: 'साइन इन होत आहे...',
    accountLockedMsg: 'अनेक अयशस्वी प्रयत्नांमुळे खाते तात्पुरते लॉक केले आहे.'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  formatStatus: (status: string) => string;
  formatRole: (role: string) => string;
  formatMethod: (method: string) => string;
  formatDay: (day: string) => string;
  formatLeaveType: (type: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => { },
  t: translations.en,
  formatStatus: (s) => s,
  formatRole: (r) => r,
  formatMethod: (m) => m,
  formatDay: (d) => d,
  formatLeaveType: (l) => l
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartattend_lang');
      if (saved === 'en' || saved === 'mr') return saved;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartattend_lang', lang);
    }
  };

  const currentTranslations = translations[language];

  // Dynamic translators
  const formatStatus = (status: string): string => {
    if (!status) return '';
    const norm = status.toUpperCase();
    if (language === 'mr') {
      switch (norm) {
        case 'PRESENT': return 'उपस्थित';
        case 'ABSENT': return 'अनुपस्थित';
        case 'LATE': return 'उशिरा';
        case 'HALF_DAY': return 'अर्धा दिवस';
        case 'ON_LEAVE': return 'रजेवर';
        case 'HOLIDAY': return 'सुट्टी';
        case 'EXCUSED': return 'सवलत प्राप्त';
        case 'APPROVED': return 'मंजूर';
        case 'PENDING': return 'प्रलंबित';
        case 'REJECTED': return 'नाकारले';
        case 'ONLINE': return 'ऑनलाइन';
        case 'OFFLINE': return 'ऑफलाइन';
        default: return status;
      }
    }
    switch (norm) {
      case 'PRESENT': return 'Present';
      case 'ABSENT': return 'Absent';
      case 'LATE': return 'Late';
      case 'HALF_DAY': return 'Half Day';
      case 'ON_LEAVE': return 'On Leave';
      case 'HOLIDAY': return 'Holiday';
      case 'EXCUSED': return 'Excused';
      case 'APPROVED': return 'Approved';
      case 'PENDING': return 'Pending';
      case 'REJECTED': return 'Rejected';
      case 'ONLINE': return 'Online';
      case 'OFFLINE': return 'Offline';
      default: return status;
    }
  };

  const formatRole = (role: string): string => {
    if (language === 'mr') {
      switch (role) {
        case 'super_admin': return 'मुख्य प्रशासक';
        case 'school_admin': return 'प्राचार्य / प्रशासक';
        case 'teacher': return 'शिक्षक';
        case 'parent': return 'पालक';
        case 'student': return 'विद्यार्थी';
        default: return role;
      }
    }
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'school_admin': return 'Principal / Admin';
      case 'teacher': return 'Teacher';
      case 'parent': return 'Parent';
      case 'student': return 'Student';
      default: return role;
    }
  };

  const formatMethod = (method: string): string => {
    if (language === 'mr') {
      switch (method) {
        case 'FACE': return 'चेहरा (Face 3D)';
        case 'FINGERPRINT': return 'बोटांचे ठसे (Fingerprint)';
        case 'SIMULATED': return 'सिम्युलेटेड';
        case 'MANUAL': return 'मॅन्युअल';
        default: return method;
      }
    }
    switch (method) {
      case 'FACE': return 'Face 3D';
      case 'FINGERPRINT': return 'Fingerprint';
      case 'SIMULATED': return 'Simulated';
      case 'MANUAL': return 'Manual';
      default: return method;
    }
  };

  const formatDay = (day: string): string => {
    if (language === 'mr') {
      switch (day) {
        case 'Monday': return 'सोमवार';
        case 'Tuesday': return 'मंगळवार';
        case 'Wednesday': return 'बुधवार';
        case 'Thursday': return 'गुरुवार';
        case 'Friday': return 'शुक्रवार';
        case 'Saturday': return 'शनिवार';
        case 'Sunday': return 'रविवार';
        case 'Mon': return 'सोम';
        case 'Tue': return 'मंगळ';
        case 'Wed': return 'बुध';
        case 'Thu': return 'गुरु';
        case 'Fri': return 'शुक्र';
        case 'Sat': return 'शनि';
        case 'Sun': return 'रवि';
        case 'Today': return 'आज';
        default: return day;
      }
    }
    return day;
  };

  const formatLeaveType = (type: string): string => {
    if (language === 'mr') {
      switch (type) {
        case 'SICK_LEAVE':
        case 'MEDICAL': return 'वैद्यकीय / आजारपण रजा';
        case 'PERSONAL_LEAVE':
        case 'CASUAL': return 'वैयक्तिक / कौटुंबिक रजा';
        case 'EMERGENCY_LEAVE':
        case 'FAMILY_EMERGENCY': return 'तातडीची / आपत्कालीन रजा';
        case 'OTHER': return 'इतर अधिकृत रजा';
        default: return type;
      }
    }
    switch (type) {
      case 'SICK_LEAVE':
      case 'MEDICAL': return 'Medical / Sick Leave';
      case 'PERSONAL_LEAVE':
      case 'CASUAL': return 'Personal / Family Leave';
      case 'EMERGENCY_LEAVE':
      case 'FAMILY_EMERGENCY': return 'Emergency Leave';
      case 'OTHER': return 'Other Authorized Absence';
      default: return type;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: currentTranslations,
        formatStatus,
        formatRole,
        formatMethod,
        formatDay,
        formatLeaveType
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
