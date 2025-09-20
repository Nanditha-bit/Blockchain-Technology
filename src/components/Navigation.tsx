import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Users, 
  Wallet, 
  Database,
  Activity,
  Github,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  fileCount: number;
  sharedCount: number;
  isConnected: boolean;
}

export const Navigation = ({ 
  activeSection, 
  onSectionChange, 
  fileCount, 
  sharedCount,
  isConnected 
}: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      count: null,
    },
    {
      id: 'files',
      label: 'My Files',
      icon: FileText,
      count: fileCount,
    },
    {
      id: 'shared',
      label: 'Shared',
      icon: Users,
      count: sharedCount,
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: Wallet,
      count: null,
    },
  ];

  const NavItem = ({ item, isMobile = false }: { item: typeof navItems[0]; isMobile?: boolean }) => (
    <Button
      variant={activeSection === item.id ? "default" : "ghost"}
      size={isMobile ? "lg" : "sm"}
      onClick={() => {
        onSectionChange(item.id);
        if (isMobile) setIsMobileMenuOpen(false);
      }}
      className={`${isMobile ? 'w-full justify-start' : ''} ${
        activeSection === item.id 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'hover:bg-muted/50'
      }`}
    >
      <item.icon className={`w-4 h-4 ${isMobile ? 'mr-3' : 'mr-2'}`} />
      {item.label}
      {item.count !== null && item.count > 0 && (
        <Badge 
          variant={activeSection === item.id ? "secondary" : "outline"}
          className={`ml-2 ${
            activeSection === item.id 
              ? 'bg-primary-foreground/20 text-primary-foreground' 
              : ''
          }`}
        >
          {item.count}
        </Badge>
      )}
    </Button>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg">DecentralShare</div>
              <div className="text-xs text-muted-foreground">Blockchain File Storage</div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-muted/30 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
            <span className="text-sm">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Additional Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4" />
            </a>
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="w-4 h-4" />
            <span>IPFS Connected</span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold">DecentralShare</div>
              <div className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 mb-6 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} isMobile />
            ))}
          </div>
        )}
      </div>
    </>
  );
};