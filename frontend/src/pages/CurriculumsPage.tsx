import { useState, useMemo } from "react";
import { Plus, X, Loader2, Calendar } from "lucide-react";
import { useCourses } from "@/hooks";
import type { Course } from "@/types";

// Define time periods
const PERIODS = [
  { id: 1, label: "1", time: "08:10-09:00" },
  { id: 2, label: "2", time: "09:10-10:00" },
  { id: 3, label: "3", time: "10:20-11:10" },
  { id: 4, label: "4", time: "11:20-12:10" },
  { id: "lunch", label: "LUNCH", time: "12:10-13:00" },
  { id: 5, label: "5", time: "13:10-14:00" },
  { id: 6, label: "6", time: "14:10-15:00" },
  { id: 7, label: "7", time: "15:20-16:10" },
  { id: 8, label: "8", time: "16:20-17:10" },
  { id: 9, label: "9", time: "17:20-18:10" },
  { id: 10, label: "10", time: "18:20-19:10" },
  { id: 11, label: "11", time: "19:20-20:10" },
  { id: 12, label: "12", time: "20:20-21:10" },
];

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const DAY_LABELS: Record<string, string> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
};

type TimetableSlot = {
  day: string;
  period: string | number;
  courseId: number | null;
};

// Local storage key for timetable
const TIMETABLE_KEY = "curriculum_timetable";

const pastelColors = [
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-700" },
  { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-700" },
  { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-700" },
  { bg: "bg-green-100", border: "border-green-300", text: "text-green-700" },
  { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700" },
  { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-700" },
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
];

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

  const { data: courses = [], isLoading: coursesLoading } = useCourses();

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
    return pastelColors[courseId % pastelColors.length];
  };

  // Count scheduled sessions
  const scheduledCount = timetable.filter((s) => s.courseId !== null).length;

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Weekly Schedule</h1>
          <p className="text-gray-500 mt-1">Organize your course schedule</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="pastel-blue-gradient rounded-2xl px-5 py-3 soft-shadow">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <span className="font-semibold text-gray-800">
                {scheduledCount} sessions
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-3xl soft-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="w-24 p-4 text-left text-gray-500 font-medium text-sm border-r border-gray-100">
                  Time
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="p-4 text-center font-semibold border-r border-gray-100 last:border-r-0"
                  >
                    <span className="text-indigo-600">{day}</span>
                    <span className="block text-xs text-gray-400 font-normal mt-0.5">
                      {DAY_LABELS[day]}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr
                  key={period.id}
                  className={
                    period.id === "lunch"
                      ? "bg-amber-50/50"
                      : "hover:bg-gray-50/50"
                  }
                >
                  <td className="p-3 border-r border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-700">
                        {period.label}
                      </div>
                      <div className="text-xs text-gray-400">{period.time}</div>
                    </div>
                  </td>
                  {DAYS.map((day) => {
                    if (period.id === "lunch") {
                      return (
                        <td
                          key={day}
                          className="p-2 border-r border-t border-gray-100 last:border-r-0"
                        >
                          <div className="h-16 flex items-center justify-center">
                            <span className="text-amber-400 text-sm font-medium">
                              Lunch Break
                            </span>
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
                    const colors = course ? getCourseColor(course.id) : null;

                    return (
                      <td
                        key={day}
                        className="p-2 border-r border-t border-gray-100 last:border-r-0"
                      >
                        {course && colors ? (
                          <div
                            className={`h-16 rounded-2xl border-l-4 px-3 py-2 ${colors.bg} ${colors.border} relative group cursor-default`}
                          >
                            <p
                              className={`text-sm font-semibold ${colors.text} truncate`}
                            >
                              {course.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {course.category || "Course"}
                            </p>
                            <button
                              onClick={() => clearSlot(day, period.id)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/60 rounded-lg"
                            >
                              <X size={14} className="text-gray-500" />
                            </button>
                          </div>
                        ) : isSelecting ? (
                          <div className="h-16 bg-gray-50 rounded-2xl p-2 overflow-y-auto border-2 border-indigo-200">
                            <div className="space-y-1">
                              {courses.map((c) => {
                                const cColors = getCourseColor(c.id);
                                return (
                                  <button
                                    key={c.id}
                                    onClick={() =>
                                      assignCourse(day, period.id, c.id)
                                    }
                                    className={`w-full text-left text-xs p-1.5 ${cColors.bg} hover:opacity-80 rounded-lg truncate ${cColors.text} font-medium`}
                                  >
                                    {c.title}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => setIsSelectingCourse(null)}
                                className="w-full text-left text-xs p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
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
                            className="h-16 w-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex items-center justify-center group"
                          >
                            <Plus
                              size={18}
                              className="text-gray-300 group-hover:text-indigo-400"
                            />
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
      </div>

      {/* Available Courses */}
      <div className="bg-white rounded-3xl p-6 soft-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Available Courses
        </h2>
        {courses.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {courses.map((course) => {
              const colors = getCourseColor(course.id);
              return (
                <div
                  key={course.id}
                  className={`px-4 py-3 rounded-2xl border-l-4 ${colors.bg} ${colors.border}`}
                >
                  <p className={`text-sm font-semibold ${colors.text}`}>
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {course.category || "No category"}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-gray-500">
              No courses available. Create some courses first!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
