import fs from 'fs';
let code = fs.readFileSync('src/services/authService.ts', 'utf8');

const target = `      this.currentUser = updated;
      safeLocalStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));`;

const replacement = `      this.currentUser = updated;
      safeLocalStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
      
      // Update the user in LOCAL_USERS_STORE_KEY
      if (updated.email) {
          const localUsers = this.getLocalUsers();
          const existingIndex = localUsers.findIndex(u => u.email.toLowerCase() === updated.email.toLowerCase());
          if (existingIndex >= 0) {
              localUsers[existingIndex].user = updated;
              safeLocalStorage.setItem(LOCAL_USERS_STORE_KEY, JSON.stringify(localUsers));
          }
      }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/services/authService.ts', code);
