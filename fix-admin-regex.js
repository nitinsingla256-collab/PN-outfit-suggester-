const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const splitPoint = '<Clock className="w-4 h-4 text-gray-600" />';
const parts = code.split(splitPoint);

if (parts.length > 1) {
  const newEnd = `
                    <span>Recent Live Audit Events</span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("activity")}
                  >
                    View All Logs ({activityLogs.length})
                  </Button>
                </div>
                <div className="divide-y divide-gray-100">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" size="sm">{log.category}</Badge>
                        <span className="font-medium text-gray-800">{log.action}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}`;
  
  fs.writeFileSync('src/pages/AdminPage.tsx', parts[0] + splitPoint + newEnd);
}
