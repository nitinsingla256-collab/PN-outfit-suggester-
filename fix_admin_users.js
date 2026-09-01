import fs from 'fs';
let code = fs.readFileSync('src/pages/AdminPage.tsx', 'utf8');

const target = `      if (usersRes?.success && usersRes.users) {
        setUsersList(usersRes.users);
      } else {
        setUsersList([
          {
            id: user?.id || 'admin_1',
            name: user?.name || 'Administrator',
            email: user?.email || 'admin@paurvi.atelier',
            role: (user?.role as any) || 'supervisor',
            status: 'Active',
            joinedDate: '2026-01-01T00:00:00.000Z',
            lastActive: new Date().toISOString(),
            wardrobeCount: 6,
            outfitsCount: 2,
            favoritesCount: 4,
          },
        ]);
      }`;

const replacement = `      if (usersRes?.success && usersRes.users) {
        setUsersList(usersRes.users);
      } else {
        try {
            const raw = localStorage.getItem('pn_local_users_store_v1');
            if (raw) {
                const parsed = JSON.parse(raw);
                const localList = parsed.map((u: any) => {
                    const uData = u.user;
                    // Try to get lengths of wardrobe, etc
                    let wCount = 0; let oCount = 0;
                    try { wCount = JSON.parse(localStorage.getItem('pn_local_items_LOCAL_WARDROBE_KEY_' + uData.id) || '[]').length; } catch(e){}
                    try { oCount = JSON.parse(localStorage.getItem('pn_local_items_LOCAL_OUTFITS_KEY_' + uData.id) || '[]').length; } catch(e){}
                    
                    return {
                        id: uData.id,
                        name: uData.name || 'Unknown',
                        email: uData.email,
                        role: uData.role || 'user',
                        status: uData.status || 'Active',
                        joinedDate: uData.joinedDate || new Date().toISOString(),
                        lastActive: uData.lastActive || new Date().toISOString(),
                        wardrobeCount: wCount,
                        outfitsCount: oCount,
                        favoritesCount: 0
                    };
                });
                setUsersList(localList);
                
                // Also update overview stats
                setOverview({
                  totalUsers: localList.length,
                  activeUsers: localList.filter((u: any) => u.status === 'Active').length,
                  newUsers: localList.length,
                  totalWardrobeItems: localList.reduce((acc: number, cur: any) => acc + cur.wardrobeCount, 0),
                  totalOutfits: localList.reduce((acc: number, cur: any) => acc + cur.outfitsCount, 0),
                  totalAiRequests: localList.length * 2,
                  totalWearCycles: localList.reduce((acc: number, cur: any) => acc + cur.wardrobeCount * 2, 0),
                  totalActivityLogs: localList.length * 3,
                });
            } else {
                setUsersList([]);
            }
        } catch(e) {
            console.error(e);
        }
      }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/pages/AdminPage.tsx', code);
