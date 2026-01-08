import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface AvailabilityBlock {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

const AvailabilityCalendar = () => {
  const today = new Date();

  // ❌ Removed all dummy data
  const [availability, setAvailability] = useState<AvailabilityBlock[]>([]);

  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  const addAvailability = () => {
    if (!newDate) return;
    const newBlock: AvailabilityBlock = {
      id: Date.now().toString(),
      date: new Date(newDate),
      startTime: newStartTime,
      endTime: newEndTime,
      isAvailable: true,
    };
    setAvailability([...availability, newBlock].sort((a, b) => a.date.getTime() - b.date.getTime()));
    setNewDate('');
  };

  const removeAvailability = (id: string) => {
    setAvailability(availability.filter((a) => a.id !== id));
  };

  const upcomingDates = availability.filter((a) => a.date >= today);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Availability Calendar</h1>
        <p className="text-muted-foreground mt-1">Set your working hours and block dates</p>
      </div>

      {/* Add New Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Add Availability</CardTitle>
          <CardDescription>Mark yourself available for new bookings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={format(today, 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addAvailability} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Availability Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingDates.length > 0 ? (
            <div className="space-y-3">
              {upcomingDates.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {format(slot.date, 'EEEE, MMMM d')}
                        </p>

                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Available
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAvailability(slot.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No availability scheduled yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Default Working Hours</CardTitle>
          <CardDescription>These are your standard working hours for the week</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
            (day, index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="font-medium text-foreground">{day}</span>
                <div className="flex items-center gap-2">
                  <Input type="time" defaultValue="09:00" className="w-24" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="time" defaultValue="17:00" className="w-24" />
                  <Button variant="ghost" size="sm" className="ml-2">
                    EDIT
                  </Button>
                </div>
              </div>
            )
          )}
          <Button className="w-full mt-4">Save Working Hours</Button>
        </CardContent>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
          <CardDescription>Mark dates when you're not available for work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blockDate">Block a Date</Label>
            <div className="flex gap-2">
              <Input id="blockDate" type="date" />
              <Button>Block Date</Button>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <div className="text-center text-muted-foreground py-4">
              <p>No blocked dates scheduled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityCalendar;
