const fs = require('fs');
const newAdminCode = `
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Activity } from "lucide-react";

export function AdminPage() {
  const { user } = useApp();
  
  if (!user || user.role !== 'supervisor') {
    return <div className="p-8">Access Denied</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-editorial">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl">
          System overview and management interface.
        </p>
      </div>
      
      <Card className="p-12 flex flex-col items-center justify-center text-gray-400 bg-white/50">
        <Activity className="w-12 h-12 mb-4 text-emerald-200" />
        <p>Admin panel simplified for stability.</p>
      </Card>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/AdminPage.tsx', newAdminCode);
