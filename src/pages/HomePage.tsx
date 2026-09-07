import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { Plus, Sparkles, Layers, Image as ImageIcon } from "lucide-react";

export function HomePage() {
  const {
    user,
    wardrobe,
    navigateTo,
    setIsAddClothingModalOpen,
    setSelectedWardrobeItemForDetail,
  } = useApp();

  /* Time-based greeting */
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const userDisplayName = user.name ? user.name.split(" ")[0] : "Client";

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    wardrobe.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [wardrobe]);

  const recentItems = useMemo(() => {
    return [...wardrobe]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);
  }, [wardrobe]);

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500 py-4">
      {/* 1. Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-editorial">
            {greeting}, {userDisplayName}.
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Your wardrobe, organized and ready.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddClothingModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Clothing
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => navigateTo("/stylist")}
            leftIcon={<Sparkles className="w-4 h-4" />}
            disabled={wardrobe.length === 0}
          >
            Ask Stylist
          </Button>
        </div>
      </div>

      {wardrobe.length === 0 ? (
        /* Empty State */
        <div className="py-12">
          <EmptyState
            icon={<Layers className="w-8 h-8 text-slate-400" />}
            title="Your wardrobe is empty."
            description="Add your first clothing piece to start building your digital wardrobe."
            primaryAction={{
              label: "Add Clothing",
              onClick: () => setIsAddClothingModalOpen(true),
              icon: <Plus className="w-4 h-4" />,
            }}
            secondaryAction={{
              label: "Set Up Style Profile",
              onClick: () => navigateTo("/profile"),
            }}
          />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Wardrobe Summary */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-editorial mb-4">
              Wardrobe Summary
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <div
                  key={category}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 shadow-sm"
                >
                  <span className="text-sm font-semibold text-slate-700">{category}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-sm font-bold text-emerald-600">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 font-editorial">
                Recent Pieces
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("/wardrobe")}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedWardrobeItemForDetail(item)}
                  className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all hover:shadow-md"
                >
                  <div className="aspect-square bg-slate-100 relative">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {item.category} {item.type ? `· ${item.type}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
