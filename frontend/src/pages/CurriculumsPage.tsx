import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coursesApi } from "@/api";
import type { Course } from "@/types";

// Define time periods
const PERIODS = [
  { id: 1, label: "1", time: "08:00-08:50" },
  { id: 2, label: "2", time: "09:00-09:50" },
  { id: 3, label: "3", time: "10:00-10:50" },
  { id: 4, label: "4", time: "11:00-11:50" },
  { id: "lunch", label: "LUNCH", time: "12:00-13:00" },
  { id: 5, label: "5", time: "13:00-13:50" },
  { id: 6, label: "6", time: "14:00-14:50" },
  { id: 7, label: "7", time: "15:00-15:50" },
  { id: 8, label: "8", time: "16:00-16:50" },
  { id: 9, label: "9", time: "17:00-17:50" },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];

type TimetableSlot = {
  day: string;
  period: string | number;
  courseId: number | null;
};

// Local storage key for timetable
const TIMETABLE_KEY = "curriculum_timetable";

export default function CurriculumsPage() {
  const [isSelectingCourse, setIsSelectingCourse] = useState<{
    day: string;
    period: string | number;
  } | null>(null);

  // Load timetable from localStorage
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(TIMETABLE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    // Initialize empty timetable
    const initial: TimetableSlot[] = [];
    DAYS.forEach((day) => {
      PERIODS.forEach((period) => {
        if (period.id !== "lunch") {
          initial.push({ day, period: period.id, courseId: null });
        }
      });
    });
    return initial;
  });

  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: coursesApi.list,
  });

  const coursesById = useMemo(() => {
    const map: Record<number, Course> = {};
    courses.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, [courses]);

  const saveTimetable = (newTimetable: TimetableSlot[]) => {
    setTimetable(newTimetable);
    localStorage.setItem(TIMETABLE_KEY, JSON.stringify(newTimetable));
  };

  const getSlot = (
    day: string,
    period: string | number
  ): TimetableSlot | undefined => {
    return timetable.find((s) => s.day === day && s.period === period);
  };

  const assignCourse = (
    day: string,
    period: string | number,
    courseId: number | null
  ) => {
    const newTimetable = timetable.map((slot) => {
      if (slot.day === day && slot.period === period) {
        return { ...slot, courseId };
      }
      return slot;
    });
    saveTimetable(newTimetable);
    setIsSelectingCourse(null);
  };

  const clearSlot = (day: string, period: string | number) => {
    assignCourse(day, period, null);
  };

  const getCourseColor = (courseId: number) => {
    const colors = [
      "bg-blue-500/30 border-blue-400",
      "bg-purple-500/30 border-purple-400",
      "bg-green-500/30 border-green-400",
      "bg-orange-500/30 border-orange-400",
      "bg-pink-500/30 border-pink-400",
      "bg-cyan-500/30 border-cyan-400",
      "bg-yellow-500/30 border-yellow-400",
      "bg-red-500/30 border-red-400",
    ];
    return colors[courseId % colors.length];
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Weekly Schedule</h1>
          <p className="text-slate-400">Organize your course schedule</p>
        </div>
      </div>

      {/* Timetable Grid */}
      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-slate-700/50">
                  <th className="w-20 p-3 text-left text-slate-400 font-medium border-r border-slate-600"></th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-3 text-center text-white font-semibold border-r border-slate-600 last:border-r-0"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr
                    key={period.id}
                    className={period.id === "lunch" ? "bg-slate-600/30" : ""}
                  >
                    <td className="p-2 border-r border-t border-slate-600 text-center">
                      <div className="text-sm font-medium text-slate-300">
                        {period.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {period.time}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      if (period.id === "lunch") {
                        return (
                          <td
                            key={day}
                            className="p-2 border-r border-t border-slate-600 last:border-r-0"
                          >
                            <div className="h-12 flex items-center justify-center">
                              <span className="text-slate-500 text-sm">—</span>
                            </div>
                          </td>
                        );
                      }

                      const slot = getSlot(day, period.id);
                      const course = slot?.courseId
                        ? coursesById[slot.courseId]
                        : null;
                      const isSelecting =
                        isSelectingCourse?.day === day &&
                        isSelectingCourse?.period === period.id;

                      return (
                        <td
                          key={day}
                          className="p-1 border-r border-t border-slate-600 last:border-r-0"
                        >
                          {course ? (
                            <div
                              className={`h-14 rounded-lg border-l-4 px-2 py-1 ${getCourseColor(
                                course.id
                              )} relative group`}
                            >
                              <p className="text-sm font-medium text-white truncate">
                                {course.title}
                              </p>
                              <p className="text-xs text-slate-400">
                                {course.category || "Course"}
                              </p>
                              <button
                                onClick={() => clearSlot(day, period.id)}
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                              >
                                <X size={12} className="text-slate-400" />
                              </button>
                            </div>
                          ) : isSelecting ? (
                            <div className="h-14 bg-slate-700/50 rounded-lg p-1 overflow-y-auto">
                              <div className="space-y-1">
                                {courses.map((c) => (
                                  <button
                                    key={c.id}
                                    onClick={() =>
                                      assignCourse(day, period.id, c.id)
                                    }
                                    className="w-full text-left text-xs p-1 hover:bg-slate-600 rounded truncate text-slate-300"
                                  >
                                    {c.title}
                                  </button>
                                ))}
                                <button
                                  onClick={() => setIsSelectingCourse(null)}
                                  className="w-full text-left text-xs p-1 text-slate-500 hover:bg-slate-600 rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                setIsSelectingCourse({ day, period: period.id })
                              }
                              className="h-14 w-full rounded-lg border-2 border-dashed border-slate-600 hover:border-slate-500 hover:bg-slate-700/30 transition-colors flex items-center justify-center"
                            >
                              <Plus size={16} className="text-slate-500" />
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Available Courses */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">
            Available Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className={`px-3 py-2 rounded-lg border-l-4 ${getCourseColor(
                    course.id
                  )} cursor-default`}
                >
                  <p className="text-sm font-medium text-white">
                    {course.title}
                  </p>
                  <p className="text-xs text-slate-400">
                    {course.category || "No category"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">
              No courses available. Create some courses first!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
