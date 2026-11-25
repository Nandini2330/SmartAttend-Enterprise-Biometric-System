# SmartAttend — Hardware Compatibility & Commissioning Checklist

Before deploying biometric devices on a school campus, inspect the hardware against this readiness matrix.

---

## 1. Terminal Compatibility Matrix

| Category | Device Model | Protocol / Interface | Recommended School Location | Driver / SDK Requirement |
|---|---|---|---|---|
| **Fingerprint Terminal** | ZKTeco K40 / IN01-A | TCP/IP (Port 4370) | Main Gates, Bus Drop-off points | Standalone ZK SDK / pyzk adapter |
| **High-Speed Optical** | ZKTeco SilkID Series | TCP/IP / Push Protocol | Large Campus Entrances (2000+ students) | SilkID Live-finger detection firmware |
| **USB Desktop Scanner** | Mantra MFS100 | USB 2.0 (UIDAI RD Service) | Admin Office, Enrollment Desk | Mantra RD Service v1.0.4+ |
| **Rugged Optical** | SecuGen Hamster Pro 20 | USB 2.0 / HID | Science Labs, Library Desk | SecuGen FDx SDK Pro |
| **Face Kiosk** | SmartAttend AI Vision Kiosk | Gigabit Ethernet / Wi-Fi 6 | Main Building Foyer, Corridors | HD WDR Camera (1080p, 60fps) + Mini PC |

---

## 2. Pre-Commissioning Checklist

### Physical & Environmental
- [ ] Device mounted at suitable height (1.1m to 1.3m for mixed primary and secondary students).
- [ ] Direct sunlight excluded (backlighting degrades facial detection and optical fingerprint prisms).
- [ ] Uninterruptible Power Supply (UPS) installed with minimum 2-hour battery backup.

### Network Configuration
- [ ] Static IP address allocated for each network terminal on dedicated school VLAN.
- [ ] Port `4370` (TCP/UDP) open between Device Bridge and terminal IP.
- [ ] Network latency tested (< 25ms round-trip).

### Enrollment & Quality Checks
- [ ] Minimum quality score of 75 required for fingerprint enrollment.
- [ ] Minimum quality score of 80 required for facial vector enrollment.
- [ ] Two fingers (Primary thumb/index + alternate finger) enrolled per student for redundancy.
- [ ] Test punch executed and validated in SmartAttend Live Attendance feed.
