import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  showHome?: boolean;
}

const PageHeader = ({ title, subtitle, actions, showHome = true }: PageHeaderProps) => (
  <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
    <div className="flex items-center gap-3">
      {showHome && (
        <Link to="/">
          <Button variant="outline" size="icon" className="rounded-full border-border hover:border-primary/50 shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      )}
      <div>
        <h1 className="text-4xl md:text-6xl font-bold text-gradient font-['Luckiest_Guy'] tracking-wide">
          {title}
        </h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-2">
      {actions}
      <UserMenu />
      <ThemeToggle />
    </div>
  </div>
);

export default PageHeader;
