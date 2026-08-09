import {
  FaAndroid,
  FaApple,
  FaChrome,
  FaEdge,
  FaFirefox,
  FaInstagram,
  FaLinux,
  FaMobileAlt,
  FaSafari,
  FaWindows,
} from "react-icons/fa";
import { FiActivity, FiUser } from "react-icons/fi";

export function parseDevice(device: string): {
  osIcon: React.ReactNode;
  browserIcon: React.ReactNode;
  osLabel: string;
  browserLabel: string;
} {
  const d = device.toLowerCase();

  let osIcon: React.ReactNode = <FiUser size={14} />;
  let osLabel = "Unknown OS";
  if (d.includes("mac os") || d.includes("macintosh")) {
    osIcon = <FaApple size={14} />;
    osLabel = "macOS";
  } else if (d.includes("ios") || d.includes("iphone") || d.includes("ipad")) {
    osIcon = <FaApple size={14} />;
    osLabel = "iOS";
  } else if (d.includes("android")) {
    osIcon = <FaAndroid size={14} />;
    osLabel = "Android";
  } else if (d.includes("windows")) {
    osIcon = <FaWindows size={14} />;
    osLabel = "Windows";
  } else if (d.includes("linux") || d.includes("ubuntu")) {
    osIcon = <FaLinux size={14} />;
    osLabel = "Linux";
  }

  let browserIcon: React.ReactNode = <FiActivity size={14} />;
  let browserLabel = "Browser";

  if (d.includes("instagram")) {
    browserIcon = <FaInstagram size={14} />;
    browserLabel = "Instagram";
  } else if (d.includes("chrome")) {
    browserIcon = <FaChrome size={14} />;
    browserLabel = "Chrome";
  } else if (d.includes("firefox")) {
    browserIcon = <FaFirefox size={14} />;
    browserLabel = "Firefox";
  } else if (d.includes("safari")) {
    browserIcon = <FaSafari size={14} />;
    browserLabel = "Safari";
  } else if (d.includes("edge")) {
    browserIcon = <FaEdge size={14} />;
    browserLabel = "Edge";
  }

  const isMobile =
    d.includes("iphone") || d.includes("android") || d.includes("mobile");
  if (isMobile && osLabel !== "iOS" && osLabel !== "Android") {
    osIcon = <FaMobileAlt size={14} />;
    osLabel = "Mobile";
  }

  return { osIcon, browserIcon, osLabel, browserLabel };
}
