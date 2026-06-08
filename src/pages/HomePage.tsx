import { useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";
import { statisticsService } from "../services/statisticsService";
import type { User, Driver, StatisticsDto } from "../types";

type Period = "ALL" | "7" | "14" | "30" | "CUSTOM";

function HomePage() {
  const userJson = localStorage.getItem("currentUser");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isAdmin = currentUser?.role === "ADMIN";

  const [userCount, setUserCount] = useState<number | null>(null);
  const [driverCount, setDriverCount] = useState<number | null>(null);
  const [stats, setStats] = useState<StatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30"); //default na zadnjih 30 dana - ne radi na all zbog backenda - treba doraditi backend da podrži all
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const fetchStats = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    try {
      let query: { days?: number; from?: string; to?: string } = {};
      if (period === "ALL") {
        query = {};
      } else if (period === "CUSTOM") {
        if (!customFrom || !customTo) {
          setLoading(false);
          return;
        }
        query = {
          from: `${customFrom}T00:00:00`,
          to: `${customTo}T23:59:59`,
        };
      } else {
        query = { days: Number(period) };
      }
    const [usersRes, driversRes, statsRes] = await Promise.all([
        api.get<User[]>("/voya/api/users/all"),
        api.get<Driver[]>("/voya/api/drivers/all"),
        statisticsService.get(query),
      ]);
      setUserCount(usersRes.data.length);
      setDriverCount(driversRes.data.length);
      setStats(statsRes);
    } catch (err) {
      console.error("Greška pri dohvaćanju statistika:", err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, period, customFrom, customTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="p-8">
      <div className="text-[10px] tracking-[0.3em] text-[var(--color-ink-muted)] mb-2 uppercase">
        Pregled
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <h1
            className="text-4xl font-light"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dobrodošli, {currentUser?.firstName}.
          </h1>
          <p className="text-[var(--color-ink-soft)] mt-2 text-sm">
            Trenutno stanje sustava.
          </p>
        </div>
        {isAdmin && <PeriodTabs value={period} onChange={setPeriod} />}
      </div>

      {isAdmin && period === "CUSTOM" && (
        <div className="flex items-center gap-4 mt-6 p-4 bg-[var(--color-surface)] border border-[var(--color-rule)]">
          <div className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
            Interval
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-ink-soft)]">Od</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-rule)] text-sm px-3 py-1.5 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-ink-soft)]">Do</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="bg-[var(--color-surface-elevated)] border border-[var(--color-rule)] text-sm px-3 py-1.5 text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-gold)]"
            />
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
            <StatCard
              label="Promet"
              value={
                loading || !stats
                  ? "—"
                  : `${formatNumber(stats.totalRevenue)} €`
              }
            />
            <StatCard
              label="Rezervacije"
              value={
                loading || !stats ? "—" : stats.totalReservations.toString()
              }
            />
            <StatCard
              label="Korisnici"
              value={loading ? "—" : (userCount?.toString() ?? "—")}
            />
            <StatCard
              label="Vozači"
              value={loading ? "—" : (driverCount?.toString() ?? "—")}
            />
          </div>

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <RankList
                title="Top vozači"
                items={topN(
                  stats.driverReservationCount.map((d) => ({
                    id: d.driverId,
                    label: `${d.driverName} ${d.driverLastName}`,
                    count: d.count,
                  })),
                )}
              />
              <RankList
                title="Top vozila"
                items={topN(
                  stats.vehicleReservationCount.map((v) => ({
                    id: v.vehicleId,
                    label: v.name || v.registration,
                    hint: v.name ? v.registration : undefined,
                    count: v.count,
                  })),
                )}
              />
              <RankList
                title="Top klijenti"
                items={topN(
                  stats.clientReservationCount.map((c) => ({
                    id: c.clientId,
                    label: `${c.clientFirstName} ${c.clientLastName}`,
                    count: c.count,
                  })),
                )}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Komponente ---------- */

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] p-6">
      <div className="text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase mb-3">
        {label}
      </div>
      <div
        className="text-4xl font-light tabular-nums"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </div>
    </div>
  );
}

function PeriodTabs({
  value,
  onChange,
}: {
  value: Period;
  onChange: (p: Period) => void;
}) {
  const periods: { value: Period; label: string }[] = [
    { value: "ALL", label: "Sve" },
    { value: "30", label: "30 dana" },
    { value: "14", label: "14 dana" },
    { value: "7", label: "7 dana" },
    { value: "CUSTOM", label: "Interval" },
  ];
  return (
    <div className="flex border border-[var(--color-rule)]">
      {periods.map((p) => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={`px-4 py-1.5 text-xs transition-colors ${
            value === p.value
              ? "bg-[var(--color-gold-faint)] text-[var(--color-gold)]"
              : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-ink)]"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

interface RankItem {
  id: number;
  label: string;
  hint?: string;
  count: number;
}

function RankList({ title, items }: { title: string; items: RankItem[] }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)]">
      <div className="px-6 py-3 border-b border-[var(--color-rule)] text-[10px] tracking-[0.2em] text-[var(--color-ink-muted)] uppercase">
        {title}
      </div>
      {items.length === 0 ? (
        <div className="px-6 py-6 text-sm text-[var(--color-ink-muted)]">
          Nema podataka.
        </div>
      ) : (
        <ol>
          {items.map((item, index) => (
            <li
              key={item.id}
              className="flex items-center px-6 py-3 border-b border-[var(--color-rule)] last:border-b-0"
            >
              <div className="w-6 text-xs text-[var(--color-ink-muted)] font-mono">
                {index + 1}.
              </div>
              <div className="flex-1">
                <div className="text-sm text-[var(--color-ink)]">
                  {item.label}
                </div>
                {item.hint && (
                  <div className="text-xs text-[var(--color-ink-muted)] font-mono">
                    {item.hint}
                  </div>
                )}
              </div>
              <div className="text-sm font-mono text-[var(--color-gold)] tabular-nums">
                {item.count}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/* ---------- Helperi ---------- */

function topN<T extends { count: number }>(items: T[], n = 5): T[] {
  return [...items].sort((a, b) => b.count - a.count).slice(0, n);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("hr-HR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export default HomePage;