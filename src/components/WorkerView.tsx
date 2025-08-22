import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
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

interface WorkerViewProps {
  onBack: () => void;
}

const WorkerView = ({ onBack }: WorkerViewProps) => {
  const [config, setConfig] = useState<SketchConfig | null>(null);
  const [hotspotData, setHotspotData] = useState<HotspotData>({});
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [currentValue, setCurrentValue] = useState<string>("");

  useEffect(() => {
    // Load configuration from localStorage
    const savedConfig = localStorage.getItem('sketchConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        toast.error("שגיאה בטעינת התצורה");
      }
    }

    // Load existing data
    const savedData = localStorage.getItem('hotspotData');
    if (savedData) {
      try {
        setHotspotData(JSON.parse(savedData));
      } catch (error) {
        console.error("Error loading data");
      }
    }
  }, []);

  const handleHotspotClick = (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
    setCurrentValue(hotspotData[hotspot.id]?.toString() || "");
  };

  const saveHotspotData = () => {
    if (!selectedHotspot || !currentValue.trim()) {
      toast.error("יש למלא את השדה");
      return;
    }

    const newData = {
      ...hotspotData,
      [selectedHotspot.id]: selectedHotspot.fieldType === "number" ? 
        parseFloat(currentValue) : currentValue
    };

    setHotspotData(newData);
    localStorage.setItem('hotspotData', JSON.stringify(newData));
    setSelectedHotspot(null);
    setCurrentValue("");
    toast.success("הנתון נשמר בהצלחה!");
  };

  const getCompletionStatus = () => {
    if (!config) return { completed: 0, total: 0 };
    const total = config.hotspots.length;
    const completed = config.hotspots.filter(h => hotspotData[h.id] !== undefined).length;
    return { completed, total };
  };

  const { completed, total } = getCompletionStatus();

  if (!config) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-warning mb-4" />
            <CardTitle>אין שרטוט זמין</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              המנהל עדיין לא העלה שרטוט או הגדיר נקודות מילוי
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              חזרה
            </Button>
            <h1 className="text-2xl font-bold">מילוי נתונים</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{completed}</span>
              <span className="text-muted-foreground"> מתוך {total} הושלמו</span>
            </div>
            <div className="w-24 h-2 bg-muted rounded-full">
              <div 
                className="h-full bg-success rounded-full transition-all"
                style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              שרטוט עם נקודות מילוי
              {completed === total && total > 0 && (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative border rounded-lg overflow-hidden">
              <img 
                src={config.image} 
                alt="שרטוט" 
                className="w-full h-auto"
              />
              {config.hotspots.map((hotspot, index) => {
                const isCompleted = hotspotData[hotspot.id] !== undefined;
                return (
                  <div
                    key={hotspot.id}
                    className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group transition-all hover:scale-110 ${
                      isCompleted ? 'bg-success' : 'bg-hotspot hover:bg-hotspot-hover'
                    }`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`
                    }}
                    onClick={() => handleHotspotClick(hotspot)}
                  >
                    <span className="text-xs font-bold text-white">
                      {index + 1}
                    </span>
                    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      <div className="font-medium">{hotspot.label}</div>
                      {isCompleted ? (
                        <div className="text-green-300">✓ הושלם: {hotspotData[hotspot.id]}</div>
                      ) : (
                        <div className="text-yellow-300">לחץ למילוי</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Progress Summary */}
        {config.hotspots.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>סיכום התקדמות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {config.hotspots.map((hotspot, index) => {
                  const isCompleted = hotspotData[hotspot.id] !== undefined;
                  const value = hotspotData[hotspot.id];
                  
                  return (
                    <div 
                      key={hotspot.id}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        isCompleted ? 'bg-success/10 border-success' : 'bg-muted border-muted-foreground/20'
                      }`}
                      onClick={() => handleHotspotClick(hotspot)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{index + 1}. {hotspot.label}</span>
                          <div className="text-sm text-muted-foreground">
                            {hotspot.fieldType === "text" ? "טקסט" : 
                             hotspot.fieldType === "number" ? "מספר" : "בחירה"}
                          </div>
                        </div>
                        <div className="text-left">
                          {isCompleted ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success" />
                              <span className="font-medium">{value}</span>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">
                              מלא
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Hotspot Data Dialog */}
      <Dialog open={!!selectedHotspot} onOpenChange={() => setSelectedHotspot(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedHotspot?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="value">ערך</Label>
              {selectedHotspot?.fieldType === "select" ? (
                <Select value={currentValue} onValueChange={setCurrentValue}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="בחר אפשרות" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border shadow-md z-50">
                    {selectedHotspot.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="value"
                  type={selectedHotspot?.fieldType === "number" ? "number" : "text"}
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder={`הכנס ${selectedHotspot?.fieldType === "number" ? "מספר" : "טקסט"}`}
                />
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={saveHotspotData} className="flex-1">
                שמור
              </Button>
              <Button variant="outline" onClick={() => setSelectedHotspot(null)} className="flex-1">
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkerView;