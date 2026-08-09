import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLogOut, FiX } from "react-icons/fi";
import authService from "../services/admin/auth.service";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      navigate("/login");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="admin-card w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center">
            <FiLogOut size={22} className="text-red-400" />
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-(--text-muted)"
          >
            <FiX size={16} />
          </button>
        </div>
        <div className="px-6 pb-6">
          <h2 className="text-lg font-bold mb-1">Sign out?</h2>
          <p className="text-sm text-(--text-muted) mb-6">
            You will need to sign back in to access GoCourier Admin.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="admin-btn admin-btn-ghost flex-1" disabled={loading}>
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="admin-btn flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={loading}
            >
              {loading ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
