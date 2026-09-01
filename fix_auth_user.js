import fs from 'fs';
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

// add getCurrentUser
if (!code.includes('getCurrentUser(): User | null')) {
    code = code.replace('getToken(): string | null {', 'getCurrentUser(): User | null { return this.currentUser; }\n\n  getToken(): string | null {');
}
fs.writeFileSync('src/services/authService.ts', code);
