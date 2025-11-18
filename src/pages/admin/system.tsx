import { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react";
// import { fetchAlerts, fetchSystemStatus } from "../../api/AdminApi.js";

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const [alertsData, statusData] = await Promise.all([
  //       fetchAlerts(),
  //       fetchSystemStatus(),
  //     ]);
  //     setAlerts(alertsData);
  //     setSystemStatus(statusData);
  //   };
  //   fetchData();
  // }, []);

  const resolveAlert = (id) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const getAlertColor = (type) => {
    switch (type) {
      case "error": return "bg-red-500 text-white";
      case "warning": return "bg-orange-500 text-white";
      case "info": return "bg-blue-500 text-white";
      case "success": return "bg-green-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case "error": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "info": return <Clock className="w-5 h-5 text-blue-500" />;
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    return hours < 24 ? `${hours}h ago` : d.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Alerts</h1>
        <p className="text-muted-foreground mt-1">Monitor platform health and issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Active Alerts</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-500">{activeAlerts.length}</p></CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Resolved</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-500">{resolvedAlerts.length}</p></CardContent>
        </Card>
        <Card><CardHeader><CardTitle>Total</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{alerts.length}</p></CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Issues requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {activeAlerts.length > 0 ? (
            activeAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4 mb-2 flex justify-between items-start">
                <div className="flex gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <h3 className="font-semibold">{alert.title}</h3>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(alert.timestamp)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>Resolve</Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteAlert(alert.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-6">All systems operational ✅</p>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      {systemStatus && (
        <Card>
          <CardHeader><CardTitle>System Status</CardTitle></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium capitalize">{key}</span>
                  <Badge className={
                    value.status === "Operational"
                      ? "bg-green-500 text-white"
                      : value.status === "Caution"
                      ? "bg-orange-500 text-white"
                      : "bg-red-500 text-white"
                  }>
                    {value.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {Object.entries(value)
                    .filter(([k]) => k !== "status")
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" | ")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SystemAlerts;
