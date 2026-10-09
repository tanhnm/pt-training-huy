import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Dumbbell, Clock, CheckCircle2, Circle } from "lucide-react";
import ItemCompletionTracker from "@/components/ItemCompletionTracker";

/**
 * WorkoutRoutineCard – Displays a day's exercises in a structured format with set/rep tracking.
 */
export default function WorkoutRoutineCard({ day, exercises, onComplete, clientId, trainerId, isTrainer }) {
  const [expanded, setExpanded] = useState(false);
  const [completedSets, setCompletedSets] = useState({});

  const toggleSet = (exerciseIdx, setIdx) => {
    const key = `${exerciseIdx}-${setIdx}`;
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalSets = exercises.reduce((sum, e) => sum + (e.sets || 0), 0);
  const completedSetCount = Object.values(completedSets).filter(Boolean).length;
  const allDone = completedSetCount === totalSets && totalSets > 0;

  return (
    <div className="glass-card rounded-xl overflow-hidden border border-border shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500/10 border border-emerald-500/30">
          <span className="text-sm font-black text-emerald-500">B{day}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm">Buổi {day}</p>
          <p className="text-xs text-muted-foreground">{exercises.length} bài tập · {totalSets} hiệp tổng cộng</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {allDone && (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hidden sm:inline-flex">
              Hoàn thành ✓
            </Badge>
          )}
          {completedSetCount > 0 && !allDone && (
            <span className="text-xs text-amber-500 font-semibold">{completedSetCount}/{totalSets}</span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border divide-y divide-border/30">
          {exercises.map((exercise, eIdx) => (
            <div key={eIdx} className="p-4 bg-card/60">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/10 border border-purple-500/20">
                  <Dumbbell className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-foreground text-sm">{exercise.name}</p>
                    {clientId && (
                      <ItemCompletionTracker 
                        clientId={clientId}
                        trainerId={trainerId}
                        type="workout"
                        itemId={`D${day}-${exercise.name}`}
                        isTrainer={isTrainer}
                      />
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 flex-wrap items-center">
                    <span className="text-xs text-foreground font-medium bg-secondary px-2 py-0.5 rounded-md border border-border">
                      {exercise.sets} hiệp × {exercise.reps} reps
                    </span>
                    {exercise.rest_seconds && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        nghỉ {exercise.rest_seconds}s
                      </span>
                    )}
                    {exercise.target_rir !== undefined && (
                      <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                        Mục tiêu RIR: {exercise.target_rir}
                      </span>
                    )}
                  </div>
                  {exercise.notes && (
                    <p className="text-xs text-muted-foreground mt-1.5 italic bg-secondary/30 p-2 rounded-md border border-border/40">
                      💡 {exercise.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Set trackers */}
              <div className="flex gap-2 flex-wrap ml-11">
                {Array.from({ length: exercise.sets || 0 }).map((_, sIdx) => {
                  const key = `${eIdx}-${sIdx}`;
                  const done = !!completedSets[key];
                  return (
                    <button
                      key={sIdx}
                      onClick={() => toggleSet(eIdx, sIdx)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all font-medium border ${
                        done
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 shadow-sm"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Circle className="w-3.5 h-3.5 opacity-60" />}
                      Hiệp {sIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {allDone && (
            <div className="p-4 bg-card">
              <Button
                className="w-full font-bold text-black border-none transition-all shadow-md bg-gradient-to-r from-emerald-400 to-teal-500 hover:opacity-90"
                onClick={() => onComplete?.({ day, exercises })}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Xác nhận Hoàn thành Buổi {day}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}