/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { PlanOutfitModal } from '../components/planner/PlanOutfitModal';
import { WeatherWidget } from '../components/ui/WeatherWidget';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  CloudSun,
} from 'lucide-react';

export function PlannerPage() {
  const {
    plans,
    outfits,
    deletePlan,
    togglePlanCompleted,
    navigateTo,
    isPlanModalOpen,
    setIsPlanModalOpen,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 29)); // August 2026 anchor
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-30');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date(2026, 7, 29);
    setCurrentDate(now);
    setSelectedDateStr('2026-08-29');
  };

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthDays - i);
      days.push({
        dateStr: `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`,
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const str = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr: str,
        dayNum: d,
        isCurrentMonth: true,
      });
    }

    // Trailing padding to make 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let r = 1; r <= remaining; r++) {
      const nextDate = new Date(year, month + 1, r);
      days.push({
        dateStr: `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`,
        dayNum: r,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Selected date plans
  const selectedPlans = plans.filter(p => p.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-500">
              Wardrobe Schedule
            </span>
            <span className="text-gray-400">·</span>
            <span className="text-xs text-gray-600 font-mono">Calendar Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 font-editorial">
            Style Planner
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Map out weekly ensembles, travel itineraries, and destination styling in advance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="gold-outline"
            size="sm"
            onClick={() => navigateTo('/stylist')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Get a Suggestion
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPlanModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Plan Outfit
          </Button>
        </div>
      </div>

      {/* 2. Calendar Grid & Selected Day Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Calendar View */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="p-5 backdrop-blur-xl bg-white/70 border-white/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-200/20 rounded-full blur-[100px] pointer-events-none"></div>
            {/* Calendar Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 font-editorial">
                  {monthName}
                </h3>
                <Button variant="secondary" size="sm" onClick={handleToday} className="text-xs">
                  Today
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map(day => {
                const isSelected = day.dateStr === selectedDateStr;
                const isToday = day.dateStr === '2026-08-29';
                const dayPlans = plans.filter(p => p.date === day.dateStr);

                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={day.dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(day.dateStr)}
                    className={`min-h-[70px] sm:min-h-[85px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden shadow-sm ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40 text-gray-900 backdrop-blur-sm'
                        : day.isCurrentMonth
                        ? 'bg-white border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                        : 'bg-white/40 border-gray-100 text-gray-400 opacity-60 backdrop-blur-md'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedDayHighlight"
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent pointer-events-none"
                      />
                    )}
                    <div className="flex items-center justify-between relative z-10">
                      <span
                        className={`text-xs font-mono font-medium ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-emerald-500 text-gray-50 flex items-center justify-center font-bold'
                            : isSelected
                            ? 'text-emerald-500'
                            : ''
                        }`}
                      >
                        {day.dayNum}
                      </span>
                      {dayPlans.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>

                    {/* Micro tags inside day cell */}
                    {dayPlans.length > 0 && (
                      <div className="space-y-1 mt-1">
                        {dayPlans.slice(0, 2).map(p => (
                          <div
                            key={p.id}
                            className="text-[9px] px-1.5 py-0.5 rounded bg-white border border-gray-200 truncate text-emerald-500 font-medium"
                          >
                            {p.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Selected Date Details Column */}
        <div className="lg:col-span-4 space-y-4">
          <WeatherWidget />
          <Card className="p-5 backdrop-blur-xl bg-white/80 border-white/40 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Scheduled Day
                </span>
                <h4 className="text-sm font-semibold text-gray-900 font-mono mt-0.5">
                  {selectedDateStr}
                </h4>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="text-xs"
                onClick={() => setIsPlanModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Plan Look
              </Button>
            </div>

            {selectedPlans.length > 0 ? (
              <AnimatePresence>
                <div className="space-y-3 mt-4">
                  {selectedPlans.map(plan => (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={plan.id}
                      className="p-4 rounded-xl bg-white/60 backdrop-blur-lg border border-gray-200/60 space-y-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-20 h-20 bg-emerald-100/30 blur-2xl rounded-full pointer-events-none group-hover:bg-emerald-200/40 transition-colors"></div>
                      <div className="flex items-start justify-between gap-2 relative z-10">
                      <div>
                        <Badge variant="gold" size="sm">
                          {plan.occasion}
                        </Badge>
                        <h4 className="text-sm font-semibold text-gray-900 mt-2">{plan.title}</h4>
                      </div>
                      <button
                        onClick={() => togglePlanCompleted(plan.id)}
                        className={`p-1 rounded-lg transition-colors ${
                          plan.isCompleted ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title={plan.isCompleted ? 'Marked as worn' : 'Mark as worn'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>

                    {plan.time && (
                      <p className="text-xs text-gray-600 flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {plan.time}
                      </p>
                    )}

                    {plan.location && (
                      <p className="text-xs text-gray-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        {plan.location}
                      </p>
                    )}

                    {plan.notes && (
                      <p className="text-xs text-gray-600 italic bg-gray-50/60 p-2 rounded-lg border border-gray-200">
                        &ldquo;{plan.notes}&rdquo;
                      </p>
                    )}

                    {/* Outfit linked preview */}
                    {plan.outfit && (
                      <div className="pt-2 border-t border-gray-200 flex items-center gap-2">
                        {plan.outfit.imageUrl && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                            <img
                              src={plan.outfit.imageUrl}
                              alt={plan.outfit.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-gray-500 block">Assigned Look:</span>
                          <span className="text-xs font-medium text-emerald-500 truncate block">
                            {plan.outfit.name}
                          </span>
                        </div>
                      </div>
                    )}

                      <div className="flex items-center justify-end pt-2 border-t border-gray-200/60 relative z-10">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-50"
                          onClick={() => deletePlan(plan.id)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Delete Schedule
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <div className="py-8 text-center space-y-2">
                <CalendarIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h5 className="text-xs font-semibold text-gray-700">No Look Scheduled</h5>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                  Click &ldquo;Plan Look&rdquo; to reserve an ensemble for {selectedDateStr}.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Plan Outfit Modal */}
      <PlanOutfitModal
        defaultDate={selectedDateStr}
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </div>
  );
}
