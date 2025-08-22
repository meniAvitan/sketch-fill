import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Hotspot {
  id: string;
  x: number;
  y: number;
  fieldType: "text" | "number" | "select";
  label: string;
  options?: string[];
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [sketchImage, setSketchImage] = useState<string | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [isAddingHotspot, setIsAddingHotspot] = useState(false);
  const [newHotspot, setNewHotspot] = useState<Partial<Hotspot>>({
    fieldType: "text",
    label: "",
    options: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSketchImage(e.target?.result as string);
          setHotspots([]);
          toast.success("שרטוט הועלה בהצלחה!");
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("יש להעלות קובץ PDF או תמונה בלבד");
      }
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingHotspot || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    if (newHotspot.label && newHotspot.fieldType) {
      const hotspot: Hotspot = {
        id: Date.now().toString(),
        x,
        y,
        fieldType: newHotspot.fieldType as "text" | "number" | "select",
        label: newHotspot.label,
        options: newHotspot.fieldType === "select" ? newHotspot.options : undefined
      };

      setHotspots(prev => [...prev, hotspot]);
      setNewHotspot({ fieldType: "text", label: "", options: [] });
      setIsAddingHotspot(false);
      toast.success("נקודה נוספה בהצלחה!");
    } else {
      toast.error("יש למלא את פרטי הנקודה לפני הוספתה");
    }
  };

  const removeHotspot = (id: string) => {
    setHotspots(prev => prev.filter(h => h.id !== id));
    toast.success("נקודה הוסרה");
  };

  const saveConfiguration = () => {
    if (!sketchImage || hotspots.length === 0) {
      toast.error("יש להעלות שרטוט ולהוסיף לפחות נקודה אחת");
      return;
    }

    // Save to localStorage for demo purposes
    localStorage.setItem('sketchConfig', JSON.stringify({
      image: sketchImage,
      hotspots: hotspots
    }));
    
    toast.success("התצורה נשמרה בהצלחה!");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            חזרה
          </Button>
          <h1 className="text-2xl font-bold">ניהול שרטוטים</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>העלאת שרטוט</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  בחר קובץ
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>הוספת נקודה</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="label">תווית הנקודה</Label>
                  <Input
                    id="label"
                    value={newHotspot.label || ""}
                    onChange={(e) => setNewHotspot(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="לדוגמה: מספר חדר"
                  />
                </div>

                <div>
                  <Label htmlFor="fieldType">סוג השדה</Label>
                  <Select 
                    value={newHotspot.fieldType} 
                    onValueChange={(value: "text" | "number" | "select") => 
                      setNewHotspot(prev => ({ ...prev, fieldType: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">טקסט חופשי</SelectItem>
                      <SelectItem value="number">מספר</SelectItem>
                      <SelectItem value="select">בחירה מרשימה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newHotspot.fieldType === "select" && (
                  <div>
                    <Label htmlFor="options">אפשרויות (מופרדות בפסיק)</Label>
                    <Input
                      id="options"
                      placeholder="אפשרות 1, אפשרות 2, אפשרות 3"
                      onChange={(e) => setNewHotspot(prev => ({ 
                        ...prev, 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      }))}
                    />
                  </div>
                )}

                <Button 
                  onClick={() => setIsAddingHotspot(true)}
                  disabled={!newHotspot.label || !sketchImage}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  הוסף נקודה
                </Button>

                {isAddingHotspot && (
                  <p className="text-sm text-muted-foreground bg-accent/20 p-3 rounded">
                    לחץ על השרטוט במקום שבו תרצה להוסיף את הנקודה
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>שמירה</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={saveConfiguration} className="w-full">
                  שמור תצורה
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>שרטוט עם נקודות</CardTitle>
              </CardHeader>
              <CardContent>
                {sketchImage ? (
                  <div 
                    ref={canvasRef}
                    className="relative border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden cursor-crosshair"
                    onClick={handleCanvasClick}
                  >
                    <img 
                      src={sketchImage} 
                      alt="שרטוט" 
                      className="w-full h-auto"
                    />
                    {hotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="absolute w-6 h-6 bg-hotspot hover:bg-hotspot-hover rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group"
                        style={{
                          left: `${hotspot.x}%`,
                          top: `${hotspot.y}%`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeHotspot(hotspot.id);
                        }}
                      >
                        <span className="text-xs font-bold text-white">
                          {hotspots.indexOf(hotspot) + 1}
                        </span>
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {hotspot.label}
                          <br />
                          <span className="text-red-300">לחץ למחיקה</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">העלה שרטוט להתחלת העבודה</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hotspots List */}
            {hotspots.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>נקודות שנוצרו ({hotspots.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {hotspots.map((hotspot, index) => (
                      <div key={hotspot.id} className="flex items-center justify-between p-3 bg-muted rounded">
                        <div>
                          <span className="font-medium">{index + 1}. {hotspot.label}</span>
                          <span className="text-sm text-muted-foreground mr-2">
                            ({hotspot.fieldType === "text" ? "טקסט" : 
                              hotspot.fieldType === "number" ? "מספר" : "בחירה"})
                          </span>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeHotspot(hotspot.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;