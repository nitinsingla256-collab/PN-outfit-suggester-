import fs from 'fs';
let code = fs.readFileSync('index.html', 'utf8');

const newErrorScript = `
    <div id="global-error" style="display:none; padding: 30px; font-family: sans-serif; color: #1e293b; background: #fff; z-index: 99999; position: fixed; inset: 0; overflow-y: auto;">
       <h1 style="color: #e11d48; margin-bottom: 10px;">Application Startup Error</h1>
       <p style="margin-bottom: 20px;">PN Outfit Suggester encountered an unexpected issue while starting.</p>
       <pre id="global-error-text" style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; white-space: pre-wrap; font-size: 12px;"></pre>
       <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer;">Retry Application</button>
    </div>
    <script>
      function showGlobalError(msg) {
        var el = document.getElementById('global-error');
        var text = document.getElementById('global-error-text');
        if (el && text && el.style.display === 'none') {
          el.style.display = 'block';
          text.innerText = msg;
          var root = document.getElementById('root');
          if (root) root.style.display = 'none';
        }
      }
      window.addEventListener('error', function(e) {
        showGlobalError('Error: ' + e.message + '\\n' + e.filename + ':' + e.lineno + '\\n\\nStack:\\n' + (e.error ? e.error.stack : 'No stack'));
      });
      window.addEventListener('unhandledrejection', function(e) {
        showGlobalError('Unhandled Promise Rejection:\\n' + (e.reason && e.reason.stack ? e.reason.stack : (e.reason ? e.reason.message : String(e.reason))));
      });
      
      // Fallback monitor: if root is empty after 5 seconds, show error
      setTimeout(function() {
         var root = document.getElementById('root');
         if (root && root.innerHTML.trim() === '' && document.getElementById('global-error').style.display === 'none') {
             showGlobalError('The application failed to render anything (white screen). Check console for module loading errors.');
         }
      }, 5000);
    </script>
`;

code = code.replace(/<div id="global-error"[\s\S]*?<\/script>/, newErrorScript.trim());
fs.writeFileSync('index.html', code);
