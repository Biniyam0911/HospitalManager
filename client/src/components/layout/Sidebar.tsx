import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCog,
  FlaskRound,
  Hotel,
  AlertCircle,
  Package,
  DollarSign,
  BarChart4,
  Settings,
  FileText,
  ClipboardList,
  Building2,
  CreditCard,
  FlaskConical,
  Database,
  History,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-3 text-primary" />,
      path: "/",
      group: null,
    },
    {
      label: "Patient Management",
      icon: <Users className="h-5 w-5 mr-3 text-primary" />,
      path: "/patients",
      group: "Clinical Operations",
    },
    {
      label: "Staff Management",
      icon: <UserCog className="h-5 w-5 mr-3 text-primary" />,
      path: "/staff",
      group: "Clinical Operations",
    },
    {
      label: "Appointments",
      icon: <Calendar className="h-5 w-5 mr-3 text-primary" />,
      path: "/appointments",
      group: "Clinical Operations",
    },
    {
      label: "Emergency Department",
      icon: <AlertCircle className="h-5 w-5 mr-3 text-primary" />,
      path: "/emergency",
      group: "Clinical Operations",
    },
    {
      label: "Clinical Services",
      icon: <FlaskRound className="h-5 w-5 mr-3 text-primary" />,
      path: "/services",
      group: "Clinical Operations",
    },
    {
      label: "Service Orders",
      icon: <ClipboardList className="h-5 w-5 mr-3 text-primary" />,
      path: "/services/orders",
      group: "Clinical Operations",
    },
    {
      label: "Electronic Medical Records",
      icon: <FileText className="h-5 w-5 mr-3 text-primary" />,
      path: "/emr",
      group: "Clinical Operations",
    },
    {
      label: "Inpatient Services",
      icon: <Hotel className="h-5 w-5 mr-3 text-primary" />,
      path: "/inpatient/beds",
      group: "Clinical Operations",
    },
    {
      label: "Laboratory Systems",
      icon: <Database className="h-5 w-5 mr-3 text-primary" />,
      path: "/laboratory/systems",
      group: "Clinical Operations",
    },
    {
      label: "Lab Results",
      icon: <FlaskConical className="h-5 w-5 mr-3 text-primary" />,
      path: "/laboratory/results",
      group: "Clinical Operations",
    },
    {
      label: "Lab Sync Logs",
      icon: <History className="h-5 w-5 mr-3 text-primary" />,
      path: "/laboratory/sync-logs",
      group: "Clinical Operations",
    },
    {
      label: "Inventory Control",
      icon: <Package className="h-5 w-5 mr-3 text-primary" />,
      path: "/inventory",
      group: "Administration & Finance",
    },
    {
      label: "Financial Operations",
      icon: <DollarSign className="h-5 w-5 mr-3 text-primary" />,
      path: "/billing",
      group: "Administration & Finance",
    },
    {
      label: "Credit Companies",
      icon: <Building2 className="h-5 w-5 mr-3 text-primary" />,
      path: "/billing/credit-companies",
      group: "Administration & Finance",
    },
    {
      label: "Reports & Analytics",
      icon: <BarChart4 className="h-5 w-5 mr-3 text-primary" />,
      path: "/reports",
      group: "Reports & Settings",
    },
    {
      label: "Settings",
      icon: <Settings className="h-5 w-5 mr-3 text-primary" />,
      path: "/settings",
      group: "Reports & Settings",
    },
  ];

  type NavGroup = typeof navItems[0][];
  
  const navGroups: Record<string, NavGroup> = {
    "Clinical Operations": [],
    "Administration & Finance": [],
    "Reports & Settings": [],
  };

  // Group navigation items
  navItems.forEach((item) => {
    if (item.group) {
      navGroups[item.group].push(item);
    }
  });

  return (
    <div className="flex flex-col w-64 border-r border-borderColor bg-white h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-borderColor bg-primary text-white">
        <span className="text-xl font-semibold">MediCare ERP</span>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-borderColor flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
          <span>{user?.name?.split(' ').map((n: string) => n[0]).join('')}</span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-midGrey">{user?.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1">
          {/* Dashboard - outside of any group */}
          {navItems
            .filter((item) => !item.group)
            .map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center px-2 py-2 text-sm font-medium text-textDark hover:bg-neutral ${
                  isActive(item.path) ? "sidebar-item active" : ""
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

          {/* Groups */}
          {Object.entries(navGroups).map(([groupName, items]) => (
            <div key={groupName} className="space-y-1 pt-2">
              <div className="px-3 py-2 text-xs font-semibold text-midGrey tracking-wider uppercase">
                {groupName}
              </div>
              
              {items.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center px-2 py-2 text-sm font-medium text-textDark hover:bg-neutral ${
                    isActive(item.path) ? "sidebar-item active" : ""
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
