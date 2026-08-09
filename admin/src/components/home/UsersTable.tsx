import { useState } from "react";
import { FiSearch, FiFilter, FiEye, FiUsers } from "react-icons/fi";
import type { UserType } from "../../types/user.type";
import UserDetailModal from "../../pages/users/components/UserDetailModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

interface UsersTableProps {
  users: UserType[];
}

const UsersTable = ({ users }: UsersTableProps) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserType | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FiUsers size={18} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Users
            </h3>
            <span className="ml-1 text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
              {users.length}
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative">
            <FiSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or username…"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <FiFilter size={15} />
            Filter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  No
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-sm text-gray-400"
                  >
                    {search
                      ? `No users matching "${search}"`
                      : "No users found"}
                  </td>
                </tr>
              ) : (
                filtered.map((user, index) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm text-gray-400">
                      {String(index + 1).padStart(2, "0")}
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-600">
                      {user.details?.age ?? "—"}
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-500">
                      {formatTime(user.createdAt)}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          user.isEmailVerified || true
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-500"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.isEmailVerified || true
                              ? "bg-emerald-500"
                              : "bg-red-400"
                          }`}
                        />
                        {user.isEmailVerified || true ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelected(user)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {users.length} users
          </p>
        </div>
      </div>

      {selected && (
        <UserDetailModal user={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
};

export default UsersTable;