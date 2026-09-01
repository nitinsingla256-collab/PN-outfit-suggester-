import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir('src');
for (const file of files) {
    let code = fs.readFileSync(file, 'utf8');
    let original = code;
    code = code.replace(/try \{ return safeLocalStorage\.getItem\(key\); \} catch \(e\) \{ return null; \}/g, 'try { return window.localStorage.getItem(key); } catch (e) { return null; }');
    code = code.replace(/try \{ safeLocalStorage\.setItem\(key, value\); \} catch \(e\) \{\}/g, 'try { window.localStorage.setItem(key, value); } catch (e) {}');
    code = code.replace(/try \{ safeLocalStorage\.removeItem\(key\); \} catch \(e\) \{\}/g, 'try { window.localStorage.removeItem(key); } catch (e) {}');
    
    if (code !== original) {
        console.log(`Fixed ${file}`);
        fs.writeFileSync(file, code);
    }
}
