import { FiCalendar, FiClock, FiMail, FiX } from "react-icons/fi";
import type { WaitlistUserType } from "../../../types/config.type";
import { parseDevice } from "../utils/device.util";
import { formatDate } from "../../../utils/date.util";

function WaitlistDetailModal({
  user,
  onClose,
}: {
  user: WaitlistUserType;
  onClose: () => void;
}) {
  const { osIcon, browserIcon, osLabel, browserLabel } = parseDevice(
    user.device,
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-linear-to-br from-violet-600 to-violet-500 p-6 pb-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <FiX size={16} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <FiClock size={26} className="text-white" />
          </div>
          <h2 className="text-lg font-bold text-white">Waitlist Member</h2>
          <p className="text-violet-200 text-sm truncate">{user.email}</p>
        </div>

        <div className="p-5 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <FiMail size={15} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-semibold text-gray-800">
                {user.email}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <FiCalendar size={15} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Joined</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(user.joinedAt)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-2">Device Info</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-700">
                <span className="text-gray-500">{osIcon}</span>
                <span className="text-sm font-medium">{osLabel}</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-gray-700">
                <span className="text-gray-500">{browserIcon}</span>
                <span className="text-sm font-medium">{browserLabel}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{user.device}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WaitlistDetailModal;
