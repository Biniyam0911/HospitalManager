import { useAuth } from "@/lib/auth";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Menu, Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-borderColor">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile menu button */}
        <button 
          type="button" 
          className="md:hidden text-textDark"
          onClick={onMenuToggle}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Search bar */}
        <div className="hidden md:block flex-1 max-w-md ml-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-midGrey" />
            </div>
            <Input 
              type="search" 
              placeholder="Search patients, doctors, services..." 
              className="block w-full pl-10 pr-3 py-2 border border-borderColor rounded-md text-sm placeholder-midGrey focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Header right items */}
        <div className="flex items-center ml-4 space-x-4">
          {/* Notifications */}
          <button type="button" className="text-midGrey hover:text-textDark relative">
            <Bell className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-alert"></span>
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center">
                <span className="hidden md:block mr-2 text-sm font-medium">{user?.name}</span>
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  <span>{user?.name?.split(' ').map((n: string) => n[0]).join('')}</span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Your Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/help")}>
                Help
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-alert">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
