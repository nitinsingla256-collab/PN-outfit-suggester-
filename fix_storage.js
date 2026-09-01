import fs from 'fs';
let code = fs.readFileSync('src/services/authService.ts', 'utf8');
code = code.replace(/try \{ return safeLocalStorage\.getItem\(key\); \} catch \(e\) \{ return null; \}/g, 'try { return window.localStorage.getItem(key); } catch (e) { return null; }');
code = code.replace(/try \{ safeLocalStorage\.setItem\(key, value\); \} catch \(e\) \{\}/g, 'try { window.localStorage.setItem(key, value); } catch (e) {}');
code = code.replace(/try \{ safeLocalStorage\.removeItem\(key\); \} catch \(e\) \{\}/g, 'try { window.localStorage.removeItem(key); } catch (e) {}');
fs.writeFileSync('src/services/authService.ts', code);
