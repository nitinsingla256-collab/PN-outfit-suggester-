const fs = require('fs');

let authPage = fs.readFileSync('src/pages/AuthPage.tsx', 'utf8');

const errorBannerStart = authPage.indexOf('{/* Error Banner */}');
if (errorBannerStart > -1) {
  const modeSigninStart = authPage.indexOf('<div>\n              {/* ================= SIGN IN MODE ================= */}');
  if (modeSigninStart > -1) {
    // Remove the old banners
    authPage = authPage.slice(0, errorBannerStart) + authPage.slice(modeSigninStart);
  }
}

// Remove the Password Strength UI
const strengthStart = authPage.indexOf('{/* Password Strength and Requirements */}');
if (strengthStart > -1) {
  const strengthEnd = authPage.indexOf('</div>\n                      )}', strengthStart);
  if (strengthEnd > -1) {
    authPage = authPage.slice(0, Math.max(0, strengthStart - 1)) + authPage.slice(strengthEnd + 33);
  }
}

const bannerHtml = `
                    {/* Error Banner */}
                    {error && (
                      <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    {/* Success Banner */}
                    {successMessage && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-emerald-700 text-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{successMessage}</span>
                      </div>
                    )}
`;

// Insert before the buttons
authPage = authPage.replace(/(<div className="pt-[246]">\s*<button\s*type="submit")/g, bannerHtml + '\n                    $1');

fs.writeFileSync('src/pages/AuthPage.tsx', authPage);
