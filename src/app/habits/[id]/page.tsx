import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from '@/components/ui/bar-chart';
import { Card, Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/ui/main-layout';
import { AchievementCard } from '@/components/ui/achievement-card';

export default function HabitPage({ habit }) {
  const router = useRouter();
  const [chartData, setChartData] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Fetch chart data
    // This is a placeholder and should be replaced with actual data fetching logic
    setChartData([
      { date: '2023-05-01', value: 4 },
      { date: '2023-05-02', value: 3 },
      { date: '2023-05-03', value: 2 },
      { date: '2023-05-04', value: 5 },
      { date: '2023-05-05', value: 7 },
      { date: '2023-05-06', value: 6 },
      { date: '2023-05-07', value: 8 },
    ]);

    // Fetch logs
    // This is a placeholder and should be replaced with actual data fetching logic
    setLogs([
      { id: 1, logDate: '2023-05-01', completed: true, value: 5 },
      { id: 2, logDate: '2023-05-02', completed: false, value: 0 },
      { id: 3, logDate: '2023-05-03', completed: true, value: 6 },
      { id: 4, logDate: '2023-05-04', completed: true, value: 7 },
      { id: 5, logDate: '2023-05-05', completed: false, value: 0 },
      { id: 6, logDate: '2023-05-06', completed: true, value: 8 },
      { id: 7, logDate: '2023-05-07', completed: true, value: 9 },
    ]);
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Habit Details</h1>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsContent value="overview">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Overview</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Current Progress</h4>
                    <p className="text-sm text-muted-foreground">
                      {habit.currentProgress} {habit.unit || ''}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Target</h4>
                    <p className="text-sm text-muted-foreground">
                      {habit.targetValue} {habit.unit || ''}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Completion Rate</h4>
                    <p className="text-sm text-muted-foreground">
                      {habit.completionRate}%
                    </p>
                  </div>
                </div>
              </Card>
              
              <div className="mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickMargin={10}
                      domain={[0, Math.max(habit.targetValue * 1.2, 1)]}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [
                        `${value} ${habit.unit || ''}`,
                        'Value'
                      ]}
                    />
                    <Bar
                      dataKey="value"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                    <Bar
                      dataKey="target"
                      fill="rgba(0,0,0,0.08)"
                      radius={[4, 4, 0, 0]}
                      barSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Completion History</h3>
                
                <div className="space-y-3">
                  {logs.slice().reverse().map((log) => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 border-b last:border-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${log.completed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <div className="font-medium text-sm">
                            {format(new Date(log.logDate), 'EEEE, MMMM d')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {log.completed
                              ? `Completed: ${log.value} ${habit.unit || ''}`
                              : 'Not completed'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(log.logDate), 'h:mm a')}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <AchievementCard
                  title="First Step"
                  description={`Complete ${habit.name} for the first time`}
                  iconUrl="/icons/first-step.svg"
                  unlockedAt="2023-05-02"
                />
                
                <AchievementCard
                  title="Consistent"
                  description={`Complete ${habit.name} for 7 days in a row`}
                  iconUrl="/icons/consistent.svg"
                  unlockedAt="2023-05-15"
                />
                
                <AchievementCard
                  title="Habit Master"
                  description={`Complete ${habit.name} for 30 days in a row`}
                  iconUrl="/icons/master.svg"
                  locked={true}
                />
                
                <AchievementCard
                  title="Overachiever"
                  description={`Complete ${habit.name} at 150% of your target`}
                  iconUrl="/icons/overachiever.svg"
                  locked={true}
                />
              </div>
              
              <Button variant="outline" className="w-full">
                View All Related Achievements
              </Button>
            </TabsContent>
          </TabsList>
          
          <TabsContent value="overview">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Additional Information</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Frequency</h4>
                  <p className="text-sm text-muted-foreground">
                    {habit.frequency === 'daily' ? 'Daily' : 
                     habit.frequency === 'weekly' ? 'Weekly' : 
                     habit.frequency === 'monthly' ? 'Monthly' : 
                     habit.frequency}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Category</h4>
                  <p className="text-sm text-muted-foreground">
                    {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Start Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(habit.startDate), 'MMMM d, yyyy')}
                  </p>
                </div>
                
                {habit.reminderTime && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Reminder</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(`2000-01-01T${habit.reminderTime}`), 'h:mm a')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
} 