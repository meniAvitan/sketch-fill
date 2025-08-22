import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, RefreshCw, FileText, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  fieldType: "text" | "number" | "select";
  label: string;
  options?: string[];
}

interface SketchConfig {
  image: string;
  hotspots: Hotspot[];
}

interface HotspotData {
  [key: string]: string | number;
}

interface DashboardProps {
  onBack: () => void;
}

const Dashboard = ({ onBack }: DashboardProps) => {
  const [config, setConfig] = useState<SketchConfig | null>(null);
  const [hotspotData, setHotspotData] = useState<HotspotData>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load configuration
    const savedConfig = localStorage.getItem('sketchConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        toast.error("שגיאה בטעינת התצורה");
      }
    }

    // Load data
    const savedData = localStorage.getItem('hotspotData');
    if (savedData) {
      try {
        setHotspotData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading data");
      }
    }
  };

  const exportToCSV = () => {
    if (!config) return;

    const headers = ["נקודה", "תווית", "סוג שדה", "ערך", "סטטוס"];
    const rows = config.hotspots.map((hotspot, index) => [
      (index + 1).toString(),
      hotspot.label,
      hotspot.fieldType === "text" ? "טקסט" : 
      hotspot.fieldType === "number" ? "מספר" : "בחירה",
      hotspotData[hotspot.id]?.toString() || "",
      hotspotData[hotspot.id] !== undefined ? "הושלם" : "ממתין"
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sketch-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("הקובץ הורד בהצלחה!");
  };

  const getStats = () => {
    if (!config) return { total: 0, completed: 0, pending: 0 };
    
    const total = config.hotspots.length;
    const completed = config.hotspots.filter(h => hotspotData[h.id] !== undefined).length;
    const pending = total - completed;
    
    return { total, completed, pending };
  };

  const { total, completed, pending } = getStats();

  if (!config) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>אין נתונים זמינים</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              עדיין לא הוגדר שרטוט או נתונים במערכת
            </p>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              חזרה
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              חזרה
            </Button>
            <h1 className="text-2xl font-bold">דוח נתונים</h1>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              רענן
            </Button>
            <Button onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              הורד CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">סך הכל נקודות</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">הושלמו</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{completed}</div>
              <p className="text-xs text-muted-foreground">
                {total > 0 ? Math.round((completed / total) * 100) : 0}% מההשלמה
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממתינות</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{pending}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>התקדמות כללית</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-4 bg-muted rounded-full">
              <div 
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {completed} מתוך {total} נקודות הושלמו
            </p>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>פירוט נתונים</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">מס׳</TableHead>
                  <TableHead className="text-right">תווית</TableHead>
                  <TableHead className="text-right">סוג שדה</TableHead>
                  <TableHead className="text-right">ערך</TableHead>
                  <TableHead className="text-right">סטטוס</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.hotspots.map((hotspot, index) => {
                  const value = hotspotData[hotspot.id];
                  const isCompleted = value !== undefined;
                  
                  return (
                    <TableRow key={hotspot.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{hotspot.label}</TableCell>
                      <TableCell>
                        {hotspot.fieldType === "text" ? "טקסט" : 
                         hotspot.fieldType === "number" ? "מספר" : "בחירה"}
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <span className="font-medium">{value}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <div className="flex items-center gap-2 text-success">
                            <CheckCircle className="w-4 h-4" />
                            <span>הושלם</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-warning">
                            <Clock className="w-4 h-4" />
                            <span>ממתין</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Empty State */}
        {config.hotspots.length === 0 && (
          <Card className="mt-6">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">אין נקודות מוגדרות</h3>
              <p className="text-muted-foreground">
                יש להגדיר נקודות במסך הניהול לפני שניתן לצפות בנתונים
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;