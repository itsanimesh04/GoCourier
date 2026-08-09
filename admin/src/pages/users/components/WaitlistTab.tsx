import { useState } from "react";
import type { WaitlistUserType } from "../../../types/config.type";
import { FiMail, FiMoreVertical, FiSearch } from "react-icons/fi";
import WaitlistDetailModal from "./WaitlistDetailModal";
import { parseDevice } from "../utils/device.util";
import { formatDate } from "../../../utils/date.util";

function WaitlistTab({ users }: { users: WaitlistUserType[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<WaitlistUserType | null>(null);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Device
                </th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Joined
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user, i) => {
                const { osIcon, browserIcon, osLabel, browserLabel } =
                  parseDevice(user.device);
                return (
                  <tr
                    key={i}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                    onClick={() => setSelected(user)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                          <FiMail size={15} />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 rounded-lg px-2.5 py-1.5">
                          <span className="text-gray-500">{osIcon}</span>
                          <span className="text-xs font-medium">{osLabel}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-gray-100 text-gray-600 rounded-lg px-2.5 py-1.5">
                          <span className="text-gray-500">{browserIcon}</span>
                          <span className="text-xs font-medium">
                            {browserLabel}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400">
                        <FiMoreVertical size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-12 text-center text-sm text-gray-400"
                  >
                    No waitlist users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {users.length} waitlist users
          </p>
        </div>
      </div>

      {selected && (
        <WaitlistDetailModal user={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}


export default WaitlistTab;