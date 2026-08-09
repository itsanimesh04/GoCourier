import { FiAlertCircle, FiAward, FiBarChart2, FiCalendar, FiCheckCircle, FiClock, FiMail, FiTarget, FiUser, FiX, FiZap } from "react-icons/fi";
import type { UserType } from "../../../types/user.type";
import { getInitials } from "../utils/other.util";
import { RiMoneyRupeeCircleLine } from "react-icons/ri";
import { formatDate } from "../../../utils/date.util";

const detailIconMap: Record<string, React.ReactNode> = {
  gender: <FiUser size={13} />,
  age: <FiCalendar size={13} />,
  weight: <FiBarChart2 size={13} />,
  height: <FiBarChart2 size={13} />,
  fitnessGoal: <FiTarget size={13} />,
  activityLevel: <FiZap size={13} />,
  equipmentType: <FiAward size={13} />,
  daysPerWeek: <FiCalendar size={13} />,
  minutesPerSession: <FiClock size={13} />,
};

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").trim();
}


function UserDetailModal({
  user,
  onClose,
}: {
  user: UserType;
  onClose: () => void;
}) {
  const initials = getInitials(user.name);
  const detailEntries = user.details
    ? Object.entries(user.details).filter(([, v]) => Boolean(v))
    : [];
 
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Banner ── */}
        <div className="relative h-28 bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-6 w-36 h-36 rounded-full bg-white/10" />
          <div className="absolute top-3 right-20 w-16 h-16 rounded-full bg-white/5" />
 
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10"
          >
            <FiX size={15} />
          </button>
        </div>
 
        {/* ── Avatar row (overlapping banner) ── */}
        <div className="px-7 mt-4 mb-5 flex items-end justify-between">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 text-2xl font-bold flex items-center justify-center shadow-lg border-4 border-white ring-1 ring-blue-100 shrink-0">
              {initials}
            </div>
            <div className="mb-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {user.name}
              </h2>
              <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
          </div>
 
          {/* Badges */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                user.isEmailVerified
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-red-50 text-red-500 border-red-100"
              }`}
            >
              {user.isEmailVerified ? (
                <FiCheckCircle size={12} />
              ) : (
                <FiAlertCircle size={12} />
              )}
              {user.isEmailVerified ? "Verified" : "Unverified"}
            </span>
            <span
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
                user.isPaid
                  ? "bg-blue-50 text-blue-600 border-blue-100"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
            >
              <RiMoneyRupeeCircleLine size={13} />
              {user.isPaid ? "Paid" : "Free"}
            </span>
          </div>
        </div>
 
        {/* ── Divider ── */}
        <div className="mx-7 border-t border-gray-100 mb-5" />
 
        {/* ── Contact row ── */}
        <div className="px-7 mb-6 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
              <FiMail size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
              <FiCalendar size={14} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
 
        {/* ── Profile Details ── */}
        {detailEntries.length > 0 && (
          <div className="px-7 pb-7">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Profile Details
            </p>
            <div className="grid grid-cols-3 gap-3">
              {detailEntries.map(([key, val]) => (
                <div
                  key={key}
                  className="group relative bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-2xl px-4 py-3.5 transition-all duration-150"
                >
                  <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-blue-400 mb-1.5 transition-colors">
                    {detailIconMap[key] ?? <FiUser size={13} />}
                    <span className="text-xs font-medium capitalize">
                      {formatLabel(key)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-800">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDetailModal;