import React, { useState, useEffect, JSX } from "react";
import { CalendarDays, Users, Clock, FileClock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Card component
const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-xl border bg-white shadow p-4">{children}</div>
);

// CardContent component
const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => <div className={`p-2 ${className}`}>{children}</div>;

// Button component
const Button: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}> = ({ children, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${className}`}
  >
    {children}
  </button>
);

interface DateRange {
  from: Date;
  to: Date;
}
interface CalendarDateRangePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

// CalendarDateRangePicker Component
const CalendarDateRangePicker: React.FC<CalendarDateRangePickerProps> = ({
  dateRange,
  setDateRange,
}) => {
  const handleToday = () => {
    const today = new Date();
    setDateRange({ from: today, to: today });
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleToday}>Today</Button>
      <div className="text-sm text-gray-600">
        From: {dateRange.from.toDateString()} <br />
        To: {dateRange.to.toDateString()}
      </div>
    </div>
  );
};

interface Stat {
    
  icon: JSX.Element;
  label: string;
  value: number;
}

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });
  const [recentLogins, setRecentLogins] = useState<
    Array<{ name: string; lastLogin: string }>
  >([]);

  useEffect(() => {
    const fetchRecentLogins = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/logins");
        const data = await res.json();
        setRecentLogins(data);
      } catch (error) {
        console.error("Error fetching recent logins:", error);
      }
    };
    fetchRecentLogins();
  }, []);

  const analytics = {
    registeredUsers: 542,
    activeSessions: 132,
    pendingOnboarding: 18,
    pendingKYC: 24,
  };

  const stats: Stat[] = [
    {
      icon: <Users className="text-blue-500" />,
      label: "Registered Users",
      value: analytics.registeredUsers,
    },
    {
      icon: <Clock className="text-green-500" />,
      label: "Active Sessions",
      value: analytics.activeSessions,
    },
    {
      icon: <FileClock className="text-yellow-500" />,
      label: "Pending Onboarding",
      value: analytics.pendingOnboarding,
    },
    {
      icon: <FileText className="text-red-500" />,
      label: "Pending KYC",
      value: analytics.pendingKYC,
    },
  ];

  const handleStatClick = (label: string): void => {
    if (label === "Registered Users") {
      navigate("/registered-users");
    }
    // add other label-based routes here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <CalendarDateRangePicker
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="rounded-2xl bg-white p-4 shadow-xl border cursor-pointer"
            onClick={() => handleStatClick(stat.label)}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-4">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-xl font-semibold">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Insights */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-gray-700 mb-4">
          Additional Insights
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">Recent Logins</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {recentLogins.length === 0 ? (
                  <li>No recent logins.</li>
                ) : (
                  recentLogins.map((user, i) => (
                    <li
                      key={i}
                      className="flex justify-between border-b pb-1"
                    >
                      <span>{user.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(user.lastLogin).toLocaleString()}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-semibold mb-2">System Notices</h3>
              <p className="text-sm text-gray-600">
                Scheduled maintenance on 15th April, 2:00 AM - 4:00 AM IST
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
