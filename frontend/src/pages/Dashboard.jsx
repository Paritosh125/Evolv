// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import api from "../api";
import { AuthContext } from "../App";
import BadgeUnlockPopup from "../components/BadgeUnlockPopup";

const LEVEL_XP_BASE = 100;

const weekDaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekDaysFull = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

export default function Dashboard() {
    const { token } = useContext(AuthContext);
    const [habits, setHabits] = useState([]);
    const [title, setTitle] = useState("");
    const [frequency, setFrequency] = useState("daily");
    const [days, setDays] = useState([]); // e.g. ["Mon","Wed"]
    const [stats, setStats] = useState({ xp: 0, level: 1, coins: 0 });
    const [loading, setLoading] = useState(false);
    const [unlockedBadges, setUnlockedBadges] = useState([]);

    const today = new Date();
    const todayStr = today.toDateString();
    const todayName = weekDaysFull[today.getDay()]; // "Monday"

    useEffect(() => {
        if (!token) return;
        refreshAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    async function refreshAll() {
        setLoading(true);
        try {
            await Promise.all([fetchHabits(), fetchProfile()]);
        } catch (err) {
            console.error("refreshAll error", err);
        } finally {
            setLoading(false);
        }
    }

    async function fetchHabits() {
        try {
            const res = await api.get("/habits");
            const normalized = (res.data || []).map((h) => ({
                ...h,
                frequency: h.frequency || "daily",
                days: Array.isArray(h.days) ? h.days : h.days ? [h.days] : [],
            }));
            setHabits(normalized);
        } catch (err) {
            console.error("fetchHabits", err);
            setHabits([]);
        }
    }

    async function fetchProfile() {
        try {
            const res = await api.get("/users/profile");
            const p = res.data || {};
            setStats({
                xp: typeof p.xp === "number" ? p.xp : 0,
                level: typeof p.level === "number" ? p.level : 1,
                coins: typeof p.coins === "number" ? p.coins : 0,
            });
        } catch (err) {
            console.error("fetchProfile", err);
            setStats({ xp: 0, level: 1, coins: 0 });
        }
    }

    function computeProgressPercent() {
        // xp is expected to be remainder toward next level
        const level = Math.max(1, stats.level || 1);
        const xpRemainder = Math.max(0, stats.xp || 0);
        const xpRequired = LEVEL_XP_BASE * level;
        return Math.min(100, Math.round((xpRemainder / xpRequired) * 100));
    }

    function isCompletedToday(habit) {
        if (!habit.lastCompleted) return false;
        try {
            const d = new Date(habit.lastCompleted);
            return d.toDateString() === todayStr;
        } catch {
            return false;
        }
    }

    function isAvailableToday(habit) {
        if (!habit.frequency || habit.frequency === "daily") return true;
        if (habit.frequency === "weekly") {
            const daysLower = (habit.days || []).map((d) => String(d).toLowerCase());
            if (daysLower.length === 0) return true;
            const todayLower = todayName.toLowerCase();
            return daysLower.includes(todayLower) || daysLower.includes(todayLower.slice(0, 3));
        }
        return true;
    }

    async function addHabit(e) {
        e?.preventDefault?.();
        if (!title.trim()) return;
        try {
            const payload = { title: title.trim(), frequency, days };
            const res = await api.post("/habits", payload);
            const created = res.data && res.data._id ? res.data : null;
            if (created) {
                // append created habit
                setHabits((prev) => [
                    {
                        ...created,
                        frequency: created.frequency || payload.frequency,
                        days: Array.isArray(created.days) ? created.days : created.days ? [created.days] : [],
                    },
                    ...prev,
                ]);
            } else {
                // fallback refresh
                await fetchHabits();
            }
            setTitle("");
            setFrequency("daily");
            setDays([]);
        } catch (err) {
            console.error("addHabit error", err);
            alert(err?.response?.data?.message || "Failed to add habit");
        }
    }

    async function completeHabit(habitId) {
        try {
            // call complete endpoint
            const res = await api.put(`/habits/${habitId}/complete`);
            // response may contain res.data.habit and/or rewards and/or unlockedBadges
            const updatedHabit = res.data?.habit ?? null;

            // If unlocked badges are returned, show popup
            if (Array.isArray(res.data?.unlockedBadges) && res.data.unlockedBadges.length > 0) {
                setUnlockedBadges(res.data.unlockedBadges);
            }

            // update habit locally (best-effort)
            setHabits((prev) =>
                prev.map((h) =>
                    h._id === habitId
                        ? {
                            ...h,
                            streak: updatedHabit?.streak ?? (h.streak ? h.streak + 1 : 1),
                            lastCompleted: updatedHabit?.lastCompleted ?? new Date().toISOString(),
                            completedCount: updatedHabit?.completedCount ?? (h.completedCount ? h.completedCount + 1 : 1),
                        }
                        : h
                )
            );

            // refresh profile to get latest xp/level/coins
            await fetchProfile();
        } catch (err) {
            console.error("completeHabit error", err);
            const msg = err?.response?.data?.message || "Failed to complete habit";
            alert(msg);
        }
    }

    async function deleteHabit(habitId) {
        if (!confirm("Delete this habit? This cannot be undone.")) return;
        try {
            await api.delete(`/habits/${habitId}`);
            setHabits((prev) => prev.filter((h) => h._id !== habitId));
        } catch (err) {
            console.error("deleteHabit error", err);
            alert(err?.response?.data?.message || "Failed to delete habit");
        }
    }

    function toggleDay(dayLabel) {
        setDays((prev) => (prev.includes(dayLabel) ? prev.filter((d) => d !== dayLabel) : [...prev, dayLabel]));
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#111827] text-[var(--color-text)] p-6">
            {/* Badge unlock popup (confetti + modal inside component) */}
            {unlockedBadges.length > 0 && (
                <BadgeUnlockPopup badges={unlockedBadges} onClose={() => setUnlockedBadges([])} />
            )}

            <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-400">⚔️ Your Quest Board</h1>
                <div className="text-sm text-primary/80">
                    Level <span className="font-semibold text-[var(--color-xp)]">{stats.level}</span> • XP <span className="font-semibold text-[var(--color-xp)]">{stats.xp}</span> • Coins <span className="font-semibold text-[var(--color-reward)]">{stats.coins}</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* main area */}
                <section className="lg:col-span-3 space-y-6">
                    <motion.form onSubmit={addHabit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a] border border-[#0b1220] rounded-2xl p-4 shadow-lg">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                className="flex-1 px-4 py-3 rounded-xl bg-[#0b1220] text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a new habit (ex: Read 30 mins)"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />

                            <div className="flex items-center gap-2">
                                <select className="px-3 py-2 bg-[#0b1220] rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>

                            <button type="submit" className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-700 hover:from-blue-600 hover:to-indigo-800 text-white font-semibold shadow-md">
                                Add
                            </button>
                        </div>

                        {frequency === "weekly" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {weekDaysShort.map((d) => (
                                    <button key={d} type="button" onClick={() => toggleDay(d)} className={`px-3 py-1 rounded-lg text-sm transition ${days.includes(d) ? "bg-blue-600 text-white" : "bg-[#121827] text-gray-300 hover:bg-[#162138]"}`}>
                                        {d}
                                    </button>
                                ))}
                                <p className="mt-2 text-xs text-primary/70">Pick days you want this weekly habit to be active.</p>
                            </div>
                        )}
                    </motion.form>

                    {/* habits list */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        {loading ? (
                            <div className="col-span-full p-6 bg-[#0f172a] rounded-2xl">Loading habits...</div>
                        ) : habits.length === 0 ? (
                            <div className="col-span-full p-6 bg-[#0f172a] rounded-2xl text-center">No habits yet — add your first quest!</div>
                        ) : (
                            habits.map((habit) => {
                                const completedToday = isCompletedToday(habit);
                                const availableToday = isAvailableToday(habit);
                                return (
                                    <motion.article key={habit._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0f172a] border border-transparent hover:border-blue-500 rounded-2xl p-4 shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{habit.title}</h3>
                                                <div className="text-sm text-primary/80 mt-1">
                                                    {habit.frequency === "weekly" ? `Weekly: ${Array.isArray(habit.days) && habit.days.length ? habit.days.join(", ") : "No days set"}` : "Daily"}
                                                </div>
                                                <div className="text-xs text-primary/60 mt-2">
                                                    Streak: <span className="font-semibold text-[var(--color-xp)]">{habit.streak || 0}</span>
                                                    {"  •  "}
                                                    Completed: <span className="font-medium">{habit.completedCount || 0}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-xs text-primary/70">{habit.lastCompleted ? new Date(habit.lastCompleted).toLocaleDateString() : "Not yet"}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => completeHabit(habit._id)}
                                                disabled={completedToday || !availableToday}
                                                className={`flex-1 px-3 py-2 rounded-lg font-semibold transition ${completedToday ? "bg-gray-600 text-white cursor-not-allowed" : availableToday ? "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow" : "bg-gray-800 text-gray-400 cursor-not-allowed"}`}
                                            >
                                                {completedToday ? "Completed" : availableToday ? "Complete" : "Not available"}
                                            </button>

                                            <button onClick={() => deleteHabit(habit._id)} className="px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white">
                                                Delete
                                            </button>
                                        </div>
                                    </motion.article>
                                );
                            })
                        )}
                    </div>
                </section>

                {/* sidebar */}
                <aside className="space-y-6">
                    <div className="bg-[#0f172a] rounded-2xl p-4 shadow-lg border border-[#0b1220]">
                        <h4 className="text-sm text-primary/80">Progress</h4>
                        <div className="mt-2 flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-[var(--color-xp)]">{stats.xp}</div>
                                <div className="text-xs text-primary/70">XP (current level)</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold">Level</div>
                                <div className="text-2xl font-bold text-[var(--color-reward)]">{stats.level}</div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="w-full bg-[#081122] rounded-full h-3 overflow-hidden">
                                <div className="h-3 bg-gradient-to-r from-indigo-500 to-blue-600 transition-all" style={{ width: `${computeProgressPercent()}%` }} />
                            </div>
                            <div className="mt-2 text-xs text-primary/70">{computeProgressPercent()}% to next level</div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-2xl p-4 shadow-lg border border-[#0b1220]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-primary/80">Coins</div>
                                <div className="text-2xl font-bold text-[var(--color-reward)]">{stats.coins}</div>
                            </div>
                            <div className="text-xs text-primary/60">Use in badge shop</div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-2xl p-4 shadow-lg border border-[#0b1220]">
                        <div className="text-sm text-primary/80 mb-2">Quick Tips</div>
                        <ul className="text-xs text-primary/70 space-y-1">
                            <li>• Daily habits auto-available every day.</li>
                            <li>• Weekly habits only available on chosen days.</li>
                            <li>• Complete a habit once per active day to gain rewards.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
