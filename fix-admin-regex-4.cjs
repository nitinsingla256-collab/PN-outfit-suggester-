const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const splitPoint = '{activeTab === "overview" && overview && (';
const parts = code.split(splitPoint);

if (parts.length > 1) {
  const newEnd = `
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Activity className="w-12 h-12 mb-4 text-gray-300" />
            <p>Admin overview loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}`;
  
  fs.writeFileSync('src/pages/AdminPage.tsx', parts[0] + splitPoint + newEnd);
}
