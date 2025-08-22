import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, FileText, BarChart } from "lucide-react";
import AdminPanel from "@/components/AdminPanel";
import WorkerView from "@/components/WorkerView";
import Dashboard from "@/components/Dashboard";

type View = "home" | "admin" | "worker" | "dashboard";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("home");

  const renderView = () => {
    switch (currentView) {
      case "admin":
        return <AdminPanel onBack={() => setCurrentView("home")} />;
      case "worker":
        return <WorkerView onBack={() => setCurrentView("home")} />;
      case "dashboard":
        return <Dashboard onBack={() => setCurrentView("home")} />;
      default:
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  מערכת שרטוטים אינטראקטיביים
                </h1>
                <p className="text-xl text-muted-foreground">
                  מלאו טפסים ישירות על גבי השרטוטים המוכרים לכם
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("admin")}>
                  <CardHeader className="text-center">
                    <Settings className="w-12 h-12 mx-auto text-primary mb-4" />
                    <CardTitle className="text-xl">ניהול מערכת</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      העלאת שרטוטים והגדרת נקודות מילוי
                    </p>
                    <Button className="w-full mt-4" variant="outline">
                      כניסה כמנהל
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("worker")}>
                  <CardHeader className="text-center">
                    <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                    <CardTitle className="text-xl">מילוי נתונים</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      מילוי נתונים על גבי השרטוטים
                    </p>
                    <Button className="w-full mt-4">
                      כניסה כעובד
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView("dashboard")}>
                  <CardHeader className="text-center">
                    <BarChart className="w-12 h-12 mx-auto text-primary mb-4" />
                    <CardTitle className="text-xl">דוחות</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">
                      צפייה בנתונים שנאספו
                    </p>
                    <Button className="w-full mt-4" variant="outline">
                      צפייה בדוחות
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 text-center">
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>העלאת PDF/תמונות</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <span>נקודות אינטראקטיביות</span>
                  </div>
                  <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                  <div className="flex items-center gap-2">
                    <span>מילוי פשוט</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return renderView();
};

export default Index;