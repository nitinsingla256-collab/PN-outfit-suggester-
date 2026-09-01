/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { PlanOutfitModal } from "../components/planner/PlanOutfitModal";
import { WeatherWidget } from "../components/ui/WeatherWidget";

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
} from "lucide-react";

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

  const formatTodayStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() =>
    formatTodayStr(new Date()),
  );

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateStr(formatTodayStr(now));
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
        dateStr: `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`,
        dayNum: prevDate.getDate(),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const str = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
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
        dateStr: `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}`,
        dayNum: r,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Selected date plans
  const selectedPlans = plans.filter((p) => p.date === selectedDateStr);

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Atelier Calendar
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                {plans.length} Scheduled {plans.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-editorial">
              Style Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              Map out weekly ensembles, formal engagements, and destination styling with linked wardrobe pieces.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl px-4 py-2"
              onClick={() => navigateTo("/stylist")}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
            >
              Ask Stylist
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="rounded-xl px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
              onClick={() => setIsPlanModalOpen(true)}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Schedule Look
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Main Calendar & Agenda Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar View (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900 font-editorial">
                {monthName}
              </h3>
              <button
                onClick={handleToday}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg"
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, idx) => {
              const isSelected = day.dateStr === selectedDateStr;
              const hasPlans = plans.some((p) => p.date === day.dateStr);

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className={`aspect-square rounded-2xl p-1.5 flex flex-col items-center justify-between text-xs transition-all relative ${
                    isSelected
                      ? "bg-slate-900 text-white font-bold shadow-md"
                      : day.isCurrentMonth
                        ? "hover:bg-slate-100 text-slate-800 bg-slate-50/50"
                        : "text-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs">{day.dayNum}</span>
                  {hasPlans && (
                    <div
                      className={`w-1.5 h-1.5 rounded-full mb-1 ${
                        isSelected ? "bg-emerald-400" : "bg-emerald-600"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Agenda (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                  Agenda for
                </span>
                <h3 className="text-lg font-bold text-slate-900 font-editorial">
                  {new Date(selectedDateStr + "T00:00:00").toLocaleDateString(
                    undefined,
                    {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </h3>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl px-3 py-1.5 text-xs"
                onClick={() => setIsPlanModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Look
              </Button>
            </div>

            {selectedPlans.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-100">
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 font-editorial">
                    No outfits scheduled for this day
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Plan your signature ensemble in advance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {plan.occasion}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => togglePlanCompleted(plan.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            plan.isCompleted
                              ? "text-emerald-600 bg-emerald-100"
                              : "text-slate-400 hover:text-emerald-600"
                          }`}
                          title={plan.isCompleted ? "Completed" : "Mark completed"}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 font-editorial">
                        {plan.title}
                      </h4>
                      {plan.location && (
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {plan.location}
                        </p>
                      )}
                      {plan.time && (
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {plan.time}
                        </p>
                      )}
                    </div>

                    {plan.notes && (
                      <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                        &ldquo;{plan.notes}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <WeatherWidget />
        </div>
      </div>

      {isPlanModalOpen && (
        <PlanOutfitModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          defaultDate={selectedDateStr}
        />
      )}
    </div>
  );
}
