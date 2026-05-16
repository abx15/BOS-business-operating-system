"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { formatMonth } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface StaffMember { id: string; name: string; designation: string; }
interface AttendanceRecord { staffId: string; date: string; status: "PRESENT" | "ABSENT" | "HALF_DAY"; }

const STATUS_STYLES = {
  PRESENT:  { bg: "#bc5090", color: "white", label: "P" },
  ABSENT:   { bg: "#ff6361", color: "white", label: "A" },
  HALF_DAY: { bg: "#ff8531", color: "white", label: "H" },
};

export default function AttendancePage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [marking, setMarking] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [staffRes, attRes] = await Promise.all([
        api.get("/staff?limit=100"),
        api.get(`/attendance?month=${currentMonth}`),
      ]);
      setStaff(staffRes.data.data ?? []);
      setAttendance(attRes.data.data ?? []);
    } catch { toast.error("Failed to load data"); }
    finally { setLoading(false); }
  }, [currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const changeMonth = (dir: number) => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 1 + dir, 1);
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  const getDaysInMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    return new Date(y, m, 0).getDate();
  };

  const getAttendance = (staffId: string, day: number) => {
    const dateStr = `${currentMonth}-${String(day).padStart(2, "0")}`;
    return attendance.find((a) => a.staffId === staffId && a.date.slice(0, 10) === dateStr);
  };

  const markAttendance = async (staffId: string, day: number, status: "PRESENT" | "ABSENT" | "HALF_DAY") => {
    const key = `${staffId}-${day}`;
    setMarking(key);
    try {
      const date = new Date(`${currentMonth}-${String(day).padStart(2, "0")}T00:00:00.000Z`).toISOString();
      await api.post("/attendance", { staffId, date, status });
      await fetchData();
    } catch { toast.error("Failed to mark attendance"); }
    finally { setMarking(null); }
  };

  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Attendance" description="Mark daily attendance for your staff" />

      {/* Month navigator */}
      <div className="flex items-center gap-3 mb-5">
        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-semibold text-base min-w-36 text-center">{formatMonth(currentMonth)}</span>
        <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="flex gap-2 ml-4">
          {Object.entries(STATUS_STYLES).map(([status, style]) => (
            <Badge key={status} style={{ background: style.bg, color: style.color, border: "none" }} className="text-xs">
              {style.label} = {status.replace("_", " ")}
            </Badge>
          ))}
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : staff.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-20" />
          <p>Add staff members first to mark attendance</p>
        </div>
      ) : (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground min-w-36 sticky left-0 bg-muted/30">Staff</th>
                  {days.map((d) => (
                    <th key={d} className="px-1.5 py-3 font-medium text-muted-foreground text-center min-w-8">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-2 sticky left-0 bg-background border-r">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-muted-foreground">{member.designation}</p>
                    </td>
                    {days.map((day) => {
                      const rec = getAttendance(member.id, day);
                      const key = `${member.id}-${day}`;
                      const isLoading = marking === key;
                      const today = new Date();
                      const cellDate = new Date(`${currentMonth}-${String(day).padStart(2, "0")}`);
                      const isFuture = cellDate > today;

                      return (
                        <td key={day} className="px-1 py-2 text-center">
                          {isFuture ? (
                            <div className="w-7 h-7 rounded-md mx-auto bg-muted/30" />
                          ) : isLoading ? (
                            <div className="w-7 h-7 rounded-md mx-auto bg-muted animate-pulse" />
                          ) : rec ? (
                            <button
                              onClick={() => {
                                const statuses: ("PRESENT" | "ABSENT" | "HALF_DAY")[] = ["PRESENT", "ABSENT", "HALF_DAY"];
                                const next = statuses[(statuses.indexOf(rec.status) + 1) % 3];
                                markAttendance(member.id, day, next);
                              }}
                              className="w-7 h-7 rounded-md mx-auto flex items-center justify-center font-bold transition-transform hover:scale-110"
                              style={{ background: STATUS_STYLES[rec.status].bg, color: STATUS_STYLES[rec.status].color }}
                            >
                              {STATUS_STYLES[rec.status].label}
                            </button>
                          ) : (
                            <button
                              onClick={() => markAttendance(member.id, day, "PRESENT")}
                              className="w-7 h-7 rounded-md mx-auto border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center text-muted-foreground"
                            >
                              +
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
        </Card>
      )}
    </div>
  );
}
