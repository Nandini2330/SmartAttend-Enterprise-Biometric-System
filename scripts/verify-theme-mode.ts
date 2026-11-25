import { dataStore, PARENT_PROFILES } from '../apps/web/src/lib/data-store';
import type { UserRole } from '@smartattend/shared-types';

console.log('================================================================');
console.log('   🌓 SMARTATTEND: LIGHT & DARK MODE SYSTEM VERIFICATION       ');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✘ FAIL: ${message}`);
    failed++;
  }
}

// 1. Initial Theme State Verification
assert(
  dataStore.theme === 'light' || dataStore.theme === 'dark',
  `Initial theme property is valid ('${dataStore.theme}')`
);

// 2. Set Dark Mode
dataStore.setTheme('dark');
assert(dataStore.theme === 'dark', 'setTheme("dark") updates state to dark');

// 3. Set Light Mode
dataStore.setTheme('light');
assert(dataStore.theme === 'light', 'setTheme("light") updates state to light');

// 4. Toggle Mode
dataStore.toggleTheme();
assert(dataStore.theme === 'dark', 'toggleTheme() transitions from light -> dark');
dataStore.toggleTheme();
assert(dataStore.theme === 'light', 'toggleTheme() transitions from dark -> light');

// 4b. Verify DOM theme application (with mock document)
const mockClassList = new Set<string>();
const mockDocument = {
  documentElement: {
    classList: {
      add: (c: string) => mockClassList.add(c),
      remove: (c: string) => mockClassList.delete(c),
      contains: (c: string) => mockClassList.has(c)
    },
    style: { colorScheme: '' }
  },
  body: {
    classList: {
      add: (c: string) => mockClassList.add(c),
      remove: (c: string) => mockClassList.delete(c),
      contains: (c: string) => mockClassList.has(c)
    }
  }
};
(global as any).document = mockDocument;

dataStore.setTheme('dark');
assert(mockDocument.documentElement.classList.contains('dark'), 'document.documentElement receives "dark" class');
assert(mockDocument.body.classList.contains('dark'), 'document.body receives "dark" class');
assert(mockDocument.documentElement.style.colorScheme === 'dark', 'document.documentElement.style.colorScheme is set to "dark"');

dataStore.setTheme('light');
assert(!mockDocument.documentElement.classList.contains('dark'), 'document.documentElement removes "dark" class in light mode');
assert(!mockDocument.body.classList.contains('dark'), 'document.body removes "dark" class in light mode');
assert(mockDocument.documentElement.style.colorScheme === 'light', 'document.documentElement.style.colorScheme is set to "light"');

// 5. Verify across all system logins
const allRoles: UserRole[] = ['super_admin', 'school_admin', 'teacher', 'student', 'parent'];

for (const role of allRoles) {
  // Test in Dark Mode
  dataStore.setTheme('dark');
  dataStore.switchRole(role);
  assert(
    dataStore.currentUser.role === role && dataStore.theme === 'dark',
    `Role '${role}' retains Dark Mode upon login`
  );

  // Test in Light Mode
  dataStore.setTheme('light');
  assert(
    dataStore.currentUser.role === role && dataStore.theme === 'light',
    `Role '${role}' retains Light Mode upon toggle`
  );
}

// 6. Verify across all individual Parent Accounts
for (const p of PARENT_PROFILES) {
  dataStore.setTheme('dark');
  dataStore.switchParentUser(p.id);
  assert(
    dataStore.currentUser.email === p.email && dataStore.theme === 'dark',
    `Parent account '${p.name}' operates correctly in Dark Mode`
  );

  dataStore.setTheme('light');
  assert(
    dataStore.currentUser.email === p.email && dataStore.theme === 'light',
    `Parent account '${p.name}' operates correctly in Light Mode`
  );
}

console.log('\n================================================================');
console.log(`Summary: ${passed} Passed, ${failed} Failed out of ${passed + failed} Theme Tests`);
console.log('================================================================\n');

if (failed > 0) {
  process.exit(1);
}

