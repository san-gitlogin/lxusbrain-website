import * as React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CookieIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// --------------------------------
// Types and Interfaces
// --------------------------------

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  isEssential?: boolean;
}

interface CookiePreferences {
  [key: string]: boolean;
}

// --------------------------------
// Default Configurations
// --------------------------------

const DEFAULT_COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description: "Required for core website functionality, such as navigation and security.",
    isEssential: true,
  },
  {
    id: "analytics",
    name: "Analytics Cookies",
    description: "Track anonymous usage to improve our services.",
  },
  {
    id: "marketing",
    name: "Marketing Cookies",
    description: "Enable personalized ads across websites.",
  },
];

const STORAGE_KEY = "cookie_preferences";
const CONSENT_KEY = "cookie_consent_given";

// --------------------------------
// Main Component
// --------------------------------

interface CookieConsentProps {
  className?: string;
  categories?: CookieCategory[];
  cookiePolicyUrl?: string;
  onAccept?: (preferences: boolean[]) => void;
  onDecline?: () => void;
}

function CookieConsent({
  className,
  categories = DEFAULT_COOKIE_CATEGORIES,
  cookiePolicyUrl = "/legal/privacy",
  onAccept,
  onDecline,
}: CookieConsentProps) {
  const [mounted, setMounted] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = React.useState(false);

  // Simple boolean array - index matches category index
  const [preferences, setPreferences] = React.useState<boolean[]>(() =>
    categories.map(cat => !!cat.isEssential)
  );

  // Check if consent was already given
  React.useEffect(() => {
    setMounted(true);

    try {
      const consentGiven = localStorage.getItem(CONSENT_KEY) === "true";
      const storedPrefs = localStorage.getItem(STORAGE_KEY);

      if (consentGiven && storedPrefs) {
        const parsedPrefs = JSON.parse(storedPrefs) as boolean[];
        if (Array.isArray(parsedPrefs) && parsedPrefs.length === categories.length) {
          setPreferences(parsedPrefs);
          onAccept?.(parsedPrefs);
          return;
        }
      }

      // No valid consent found, show banner after delay
      setTimeout(() => setShowBanner(true), 1500);
    } catch (error) {
      console.error("Error reading cookie preferences:", error);
      setTimeout(() => setShowBanner(true), 1500);
    }
  }, [categories.length, onAccept]);

  const savePreferences = React.useCallback((prefs: boolean[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      localStorage.setItem(CONSENT_KEY, "true");
    } catch (error) {
      console.error("Error saving cookie preferences:", error);
    }

    setShowBanner(false);
    setShowCustomizeDialog(false);
    onAccept?.(prefs);
  }, [onAccept]);

  const handleAcceptAll = React.useCallback(() => {
    const allTrue = categories.map(() => true);
    setPreferences(allTrue);
    savePreferences(allTrue);
  }, [categories, savePreferences]);

  const handleRejectAll = React.useCallback(() => {
    const essentialOnly = categories.map(cat => !!cat.isEssential);
    setPreferences(essentialOnly);
    savePreferences(essentialOnly);
    onDecline?.();
  }, [categories, savePreferences, onDecline]);

  const handleSaveCustom = React.useCallback(() => {
    savePreferences(preferences);
  }, [preferences, savePreferences]);

  const handleToggle = React.useCallback((index: number, checked: boolean) => {
    if (categories[index]?.isEssential) return; // Can't toggle essential cookies

    setPreferences(prev => {
      const newPrefs = [...prev];
      newPrefs[index] = checked;
      return newPrefs;
    });
  }, [categories]);

  if (!mounted) return null;

  return (
    <>
      <CookieBanner
        isVisible={showBanner}
        onAcceptAll={handleAcceptAll}
        onCustomize={() => setShowCustomizeDialog(true)}
        cookiePolicyUrl={cookiePolicyUrl}
        className={className}
      />

      <CookieCustomizeDialog
        open={showCustomizeDialog}
        onOpenChange={setShowCustomizeDialog}
        categories={categories}
        preferences={preferences}
        onToggle={handleToggle}
        onSave={handleSaveCustom}
        onRejectAll={handleRejectAll}
      />
    </>
  );
}

// --------------------------------
// Sub-Components
// --------------------------------

interface CookieBannerProps {
  isVisible: boolean;
  onAcceptAll: () => void;
  onCustomize: () => void;
  cookiePolicyUrl: string;
  className?: string;
}

function CookieBanner({
  isVisible,
  onAcceptAll,
  onCustomize,
  cookiePolicyUrl,
  className,
}: CookieBannerProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "fixed bottom-0 left-0 right-0 sm:left-4 sm:bottom-4 z-50 w-full sm:max-w-md",
            className
          )}
        >
          <div className="m-3 bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3 p-4 pb-2">
              <div className="bg-cyan-500/10 p-2 rounded-lg">
                <CookieIcon className="h-4 w-4 text-cyan-400" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Cookie Preferences</h2>
            </div>
            <div className="px-4 pb-3">
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                We use cookies to enhance your experience, personalize content, and analyze traffic.
              </p>
              <Link
                to={cookiePolicyUrl}
                className="text-xs inline-flex items-center text-cyan-400 hover:text-cyan-300 hover:underline group font-medium transition-colors"
              >
                Cookie Policy
                <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="p-3 flex gap-2 border-t border-border/50 bg-muted/20">
              <Button
                onClick={onCustomize}
                size="sm"
                variant="outline"
                className="flex-1 h-8 rounded-lg text-xs transition-all hover:bg-white/5"
              >
                Customize
              </Button>
              <Button
                onClick={onAcceptAll}
                size="sm"
                className="flex-1 h-8 rounded-lg text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CookieCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CookieCategory[];
  preferences: boolean[];
  onToggle: (index: number, checked: boolean) => void;
  onSave: () => void;
  onRejectAll: () => void;
}

function CookieCustomizeDialog({
  open,
  onOpenChange,
  categories,
  preferences,
  onToggle,
  onSave,
  onRejectAll,
}: CookieCustomizeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card/95 backdrop-blur-lg z-[200] sm:max-w-[420px] p-0 gap-0 border-border/50 shadow-2xl">
        <DialogHeader className="p-5 pb-3 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold">Manage Cookies</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Customize your cookie preferences below.
          </DialogDescription>
        </DialogHeader>
        <div className="px-5 py-4 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className={cn(
                "p-3 border rounded-xl transition-all duration-200",
                preferences[index]
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-border/50 hover:border-border/70"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    preferences[index] ? "bg-cyan-500/10" : "bg-muted"
                  )}>
                    {category.icon || <CookieIcon className="h-3.5 w-3.5 text-cyan-400" />}
                  </div>
                  <Label
                    htmlFor={`cookie-${index}`}
                    className="font-medium text-sm cursor-pointer"
                  >
                    {category.name}
                    {category.isEssential && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-400">
                              Required
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">These cookies cannot be disabled.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </Label>
                </div>
                <Switch
                  id={`cookie-${index}`}
                  checked={preferences[index] || false}
                  onCheckedChange={(checked) => onToggle(index, checked)}
                  disabled={category.isEssential}
                  className="data-[state=checked]:bg-cyan-500"
                />
              </div>
              <p className="text-xs mt-2 text-muted-foreground leading-relaxed pl-8">
                {category.description}
              </p>
            </motion.div>
          ))}
        </div>
        <DialogFooter className="p-4 border-t border-border/50 bg-muted/20">
          <div className="flex w-full gap-2">
            <Button
              variant="outline"
              onClick={onRejectAll}
              size="sm"
              className="flex-1 h-9 text-sm transition-all hover:bg-white/5"
            >
              Reject All
            </Button>
            <Button
              onClick={onSave}
              size="sm"
              className="flex-1 h-9 text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              Save Preferences
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --------------------------------
// Exports
// --------------------------------

export { CookieConsent };
export type { CookieCategory, CookieConsentProps, CookiePreferences };
