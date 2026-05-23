import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import BoltIcon from '@mui/icons-material/Bolt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import HistoryIcon from '@mui/icons-material/History';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';

function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!Number.isFinite(Number(target))) {
      setCount(0);
      return;
    }

    const finalValue = Number(target);
    if (finalValue === 0) {
      setCount(0);
      return;
    }

    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      setCount(Math.round(finalValue * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
}

const CSS = `
  .dash-root {
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #0f172a;
  }

  .dash-greeting {
    margin-bottom: 24px;
    animation: dashFadeIn .45s ease both;
  }

  .dash-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 20px;
  }

  .dash-card {
    background: #f8fafc;
    border: 1px solid #dbe2ea;
    border-radius: 16px;
    padding: 18px;
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    animation: dashFadeIn .45s ease both;
  }

  .dash-card:hover {
    transform: translateY(-2px);
    border-color: #c7d2e2;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  }

  .dash-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .dash-card-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #64748b;
    margin-bottom: 4px;
    font-weight: 700;
  }

  .dash-card-value {
    font-size: 38px;
    line-height: 1;
    font-weight: 800;
    color: #0f172a;
  }

  .dash-card-trend {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 700;
  }

  .dash-bottom {
    display: grid;
    grid-template-columns: 1fr 1.35fr 1.35fr;
    gap: 14px;
  }

  .dash-panel {
    background: #f8fafc;
    border: 1px solid #dbe2ea;
    border-radius: 16px;
    overflow: hidden;
    animation: dashFadeIn .5s ease both;
  }

  .dash-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #e2e8f0;
  }

  .dash-panel-title-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .dash-panel-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
  }

  .dash-panel-body {
    padding: 14px 16px;
  }

  .dash-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .dash-action-btn {
    min-height: 122px;
    border-radius: 14px;
    border: 1px solid #dbe2ea;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 9px;
    font-size: 16px;
    font-weight: 700;
    color: #334155;
    cursor: pointer;
    transition: all .18s ease;
  }

  .dash-action-btn:hover {
    background: #e2e8f0;
    border-color: #cbd5e1;
  }

  .dash-action-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dash-badge {
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  .bar-row { margin-bottom: 13px; }
  .bar-label-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .bar-label {
    font-size: 16px;
    font-weight: 700;
    color: #334155;
  }
  .bar-pct {
    font-size: 13px;
    font-weight: 800;
    color: #475569;
  }
  .bar-track {
    height: 8px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    width: var(--w);
    border-radius: 999px;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .activity-item:last-child { border-bottom: none; }

  .activity-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 7px;
  }

  .activity-text {
    font-size: 16px;
    color: #334155;
    line-height: 1.35;
    font-weight: 500;
  }

  .activity-time {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
  }

  .dash-loading {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #475569;
    font-size: 14px;
    margin-bottom: 20px;
  }

  .dash-spinner {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 3px solid #dbe2ea;
    border-top-color: #334155;
    animation: dashSpin .7s linear infinite;
  }

  @keyframes dashSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes dashFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 1200px) {
    .dash-bottom {
      grid-template-columns: 1fr;
    }
  }
`;

function getGreetingText() {
  const hour = new Date().getHours();
  if (hour < 6) return 'Xayrli tun';
  if (hour < 12) return 'Xayrli tong';
  if (hour < 17) return 'Xayrli kun';
  return 'Xayrli kech';
}

function getUserName() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return 'Admin';
    const user = JSON.parse(raw);
    return user.firstName || user.first_name || user.name || user.full_name || 'Admin';
  } catch {
    return 'Admin';
  }
}

function formatNumber(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString('uz-UZ');
}

function StatCard({ icon, iconBg, label, value, trend, trendColor }) {
  const animated = useCountUp(value);

  return (
    <div className="dash-card">
      <div className="dash-card-icon" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="dash-card-label">{label}</div>
      <div className="dash-card-value">{formatNumber(animated)}</div>
      <div className="dash-card-trend" style={{ color: trendColor }}>{trend}</div>
    </div>
  );
}

function ActionBtn({ icon, label, iconBg, iconColor, onClick }) {
  return (
    <button className="dash-action-btn" onClick={onClick}>
      <div className="dash-action-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      {label}
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const greeting = getGreetingText();
  const userName = getUserName();

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/v1/dashboard/stats');
        setStats(res.data?.data || res.data);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        setStats({
          students: 0,
          teachers: 0,
          groups: 0,
          courses: 0,
          rooms: 0,
          activeStudentsRate: 0,
          attendanceRate: 0,
          homeworkCompletionRate: 0,
          courseOccupancyRate: 0,
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = stats
    ? [
        {
          icon: <SchoolIcon sx={{ fontSize: 22, color: '#0f766e' }} />,
          iconBg: '#e6fffa',
          label: "O'quvchilar",
          value: stats.students ?? 0,
          trend: 'Faol',
          trendColor: '#0f766e',
        },
        {
          icon: <PeopleIcon sx={{ fontSize: 22, color: '#334155' }} />,
          iconBg: '#eef2f7',
          label: "O'qituvchilar",
          value: stats.teachers ?? 0,
          trend: 'Ishda',
          trendColor: '#334155',
        },
        {
          icon: <GroupsIcon sx={{ fontSize: 22, color: '#1d4ed8' }} />,
          iconBg: '#eaf2ff',
          label: 'Guruhlar',
          value: stats.groups ?? 0,
          trend: 'Faol',
          trendColor: '#1d4ed8',
        },
        {
          icon: <DashboardIcon sx={{ fontSize: 22, color: '#7c3aed' }} />,
          iconBg: '#f3ecff',
          label: 'Kurslar',
          value: stats.courses ?? 0,
          trend: 'Yangi',
          trendColor: '#7c3aed',
        },
        {
          icon: <SettingsIcon sx={{ fontSize: 22, color: '#0369a1' }} />,
          iconBg: '#e9f7ff',
          label: 'Xonalar',
          value: stats.rooms ?? 0,
          trend: 'Mavjud',
          trendColor: '#0369a1',
        },
      ]
    : [];

  const bars = [
    {
      label: "Faol o'quvchilar ulushi",
      pct: stats?.activeStudentsRate ?? 0,
      color: 'linear-gradient(90deg,#0f766e,#14b8a6)',
    },
    {
      label: 'Dars davomati',
      pct: stats?.attendanceRate ?? 0,
      color: 'linear-gradient(90deg,#334155,#64748b)',
    },
    {
      label: 'Vazifalar bajarilishi',
      pct: stats?.homeworkCompletionRate ?? 0,
      color: 'linear-gradient(90deg,#c2410c,#fb923c)',
    },
    {
      label: "Kurs to'liqlanishi",
      pct: stats?.courseOccupancyRate ?? 0,
      color: 'linear-gradient(90deg,#2563eb,#60a5fa)',
    },
  ];

  const toAgo = (dateStr) => {
    if (!dateStr) return '—';
    const diffMs = new Date() - new Date(dateStr);
    const min = Math.max(1, Math.round(diffMs / 60000));
    if (min < 60) return `${min} daqiqa oldin`;
    const hour = Math.round(min / 60);
    if (hour < 24) return `${hour} soat oldin`;
    return `${Math.round(hour / 24)} kun oldin`;
  };

  const activities =
    stats?.recentActivity && stats.recentActivity.length > 0
      ? stats.recentActivity.map((item) => ({
          dot: item.dot,
          text: item.text,
          time: toAgo(item.date),
        }))
      : [{ dot: '#94a3b8', text: "Hozircha faoliyat yo'q", time: '—' }];

  const actions = [
    {
      icon: <PersonAddAlt1Icon sx={{ fontSize: 21 }} />,
      label: "O'quvchi qo'shish",
      iconBg: '#e8fff6',
      iconColor: '#0f766e',
      path: '/students',
    },
    {
      icon: <GroupAddIcon sx={{ fontSize: 21 }} />,
      label: 'Guruh yaratish',
      iconBg: '#eef2ff',
      iconColor: '#334155',
      path: '/groups',
    },
    {
      icon: <BadgeIcon sx={{ fontSize: 21 }} />,
      label: "O'qituvchi qo'shish",
      iconBg: '#eaf2ff',
      iconColor: '#1d4ed8',
      path: '/teachers',
    },
    {
      icon: <AddCircleOutlinedIcon sx={{ fontSize: 21 }} />,
      label: "Kurs qo'shish",
      iconBg: '#fff4e6',
      iconColor: '#c2410c',
      path: '/management',
    },
  ];

  return (
    <div className="dash-root">
      <div className="dash-greeting">
        <div style={{ fontSize: 'clamp(30px, 4vw, 40px)', fontWeight: 800, color: '#0f172a' }}>
          {greeting}, {userName}!
        </div>
        <div style={{ marginTop: 4, fontSize: 'clamp(18px, 2.2vw, 26px)', color: '#64748b', fontWeight: 500 }}>
          {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {loading ? (
        <div className="dash-loading">
          <div className="dash-spinner" />
          Statistikalar yuklanmoqda...
        </div>
      ) : (
        <div className="dash-cards">
          {cards.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </div>
      )}

      <div className="dash-bottom">
        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-title-wrap">
              <BoltIcon sx={{ fontSize: 20, color: '#334155' }} />
              <span className="dash-panel-title">Tezkor harakatlar</span>
            </div>
          </div>
          <div className="dash-panel-body">
            <div className="dash-actions">
              {actions.map((action) => (
                <ActionBtn
                  key={action.label}
                  icon={action.icon}
                  label={action.label}
                  iconBg={action.iconBg}
                  iconColor={action.iconColor}
                  onClick={() => navigate(action.path)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-title-wrap">
              <QueryStatsIcon sx={{ fontSize: 20, color: '#334155' }} />
              <span className="dash-panel-title">Umumiy ko'rsatkichlar</span>
            </div>
            <span className="dash-badge" style={{ background: '#e2e8f0', color: '#334155' }}>
              {new Date().toLocaleString('uz-UZ', { month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="dash-panel-body">
            {bars.map((bar) => (
              <div key={bar.label} className="bar-row">
                <div className="bar-label-row">
                  <span className="bar-label">{bar.label}</span>
                  <span className="bar-pct">{bar.pct}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ '--w': `${bar.pct}%`, background: bar.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-panel">
          <div className="dash-panel-header">
            <div className="dash-panel-title-wrap">
              <HistoryIcon sx={{ fontSize: 20, color: '#334155' }} />
              <span className="dash-panel-title">So'nggi faoliyat</span>
            </div>
            <span className="dash-badge" style={{ background: '#e2e8f0', color: '#334155' }}>
              Bugun
            </span>
          </div>
          <div className="dash-panel-body">
            {activities.map((item, idx) => (
              <div key={idx} className="activity-item">
                <span className="activity-dot" style={{ background: item.dot || '#94a3b8' }} />
                <div>
                  <div className="activity-text">{item.text}</div>
                  <div className="activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
