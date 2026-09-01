import fs from 'fs';
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

const helper = `
const safeLocalStorage = {
  getItem(key: string): string | null {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  },
  setItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch (e) {}
  },
  removeItem(key: string): void {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};
`;

code = code.replace("const LOCAL_USERS_STORE_KEY = 'pn_local_users_store_v1';", "const LOCAL_USERS_STORE_KEY = 'pn_local_users_store_v1';\n" + helper);
code = code.replace(/localStorage\.getItem/g, 'safeLocalStorage.getItem');
code = code.replace(/localStorage\.setItem/g, 'safeLocalStorage.setItem');
code = code.replace(/localStorage\.removeItem/g, 'safeLocalStorage.removeItem');

fs.writeFileSync('src/services/authService.ts', code);
