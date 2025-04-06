{selectedEntry.tags && selectedEntry.tags.length > 0 && (
  <div className="mt-4">
    <div className="text-sm font-medium text-muted-foreground">Tags</div>
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedEntry.tags.map(tag => (
        <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
          {tag}
        </Badge>
      ))}
    </div>
  </div>
)}
</CardContent>
<CardFooter className="flex justify-between border-t pt-4">
  <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>
    Close
  </Button>
  <Button 
    variant="destructive" 
    size="sm" 
    onClick={() => {
      handleDeleteEntry(selectedEntry.id);
      setSelectedEntry(null);
    }}
  >
    Delete Entry
  </Button>
</CardFooter>
</Card>
)}
</TabsContent>

{/* Insights Tab */}
<TabsContent value="insights">
  <div className="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Mood Distribution</CardTitle>
        <CardDescription>
          How your mood has varied over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Very Low', value: entries.filter(e => e.mood_score === 1).length },
              { name: 'Low', value: entries.filter(e => e.mood_score === 2).length },
              { name: 'Neutral', value: entries.filter(e => e.mood_score === 3).length },
              { name: 'Good', value: entries.filter(e => e.mood_score === 4).length },
              { name: 'Excellent', value: entries.filter(e => e.mood_score === 5).length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Days" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Stress vs Energy</CardTitle>
        <CardDescription>
          Relationship between your stress and energy levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={entries.map(entry => ({
              date: format(parseISO(entry.date), 'MMM d'),
              stress: entry.stress_level,
              energy: entry.energy_level,
            }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="stress" name="Stress" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="energy" name="Energy" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Mental Health Insights</CardTitle>
        <CardDescription>Personalized insights based on your data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.length < 3 ? (
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-muted-foreground">Log at least 3 entries to see personalized insights</p>
          </div>
        ) : (
          <>
            {summary.avgMood < 3 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h4 className="font-medium flex items-center text-amber-800 dark:text-amber-300">
                  <Meh className="h-5 w-5 mr-2" />
                  Your mood has been below average lately
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Consider practicing self-care activities or reaching out to someone you trust. Small steps like regular exercise or mindfulness can help improve your mental well-being.
                </p>
              </div>
            )}
            
            {entries.filter(e => e.stress_level >= 4).length >= 3 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="font-medium flex items-center text-red-800 dark:text-red-300">
                  <CloudLightning className="h-5 w-5 mr-2" />
                  High stress levels detected
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  You've reported high stress levels multiple times. Consider stress-reduction techniques like deep breathing, meditation, or adjusting your workload if possible.
                </p>
              </div>
            )}
            
            {summary.avgEnergy < 3 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium flex items-center text-blue-800 dark:text-blue-300">
                  <Battery className="h-5 w-5 mr-2" />
                  Your energy levels have been low
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Low energy could be related to sleep quality, diet, or stress. Try to maintain regular sleep patterns and consider light exercise which can paradoxically increase energy levels.
                </p>
              </div>
            )}
            
            {summary.avgMood >= 4 && summary.avgEnergy >= 4 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <h4 className="font-medium flex items-center text-green-800 dark:text-green-300">
                  <Smile className="h-5 w-5 mr-2" />
                  You're doing great!
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your mental health indicators are positive. Keep up with the activities and routines that are working well for you.
                </p>
              </div>
            )}
          </>
        )}
        
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
          <h4 className="font-medium flex items-center text-purple-800 dark:text-purple-300">
            <Brain className="h-5 w-5 mr-2" />
            Mental Health Resources
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Remember that tracking is just one part of mental health care. If you're consistently struggling, consider speaking with a professional. Your well-being is important.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.nimh.nih.gov/health/find-help" target="_blank" rel="noopener noreferrer">
                Find Help Resources
              </a>
            </Button>
            <Button variant="outline" size="sm" className="text-xs" asChild>
              <a href="https://www.crisistextline.org/" target="_blank" rel="noopener noreferrer">
                Crisis Text Line
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>

{/* History Tab */}
<TabsContent value="history">
  <Card>
    <CardHeader>
      <CardTitle>Entry History</CardTitle>
      <CardDescription>
        View all your past mental health entries
      </CardDescription>
    </CardHeader>
    <CardContent>
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-2" />
          <p className="text-sm text-muted-foreground mb-4">No entries recorded for this period</p>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Entry
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div 
              key={entry.id} 
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                </div>
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center",
                  entry.mood_score <= 2 && "bg-red-100 text-red-600",
                  entry.mood_score === 3 && "bg-yellow-100 text-yellow-600",
                  entry.mood_score >= 4 && "bg-green-100 text-green-600",
                )}>
                  {getMoodIcon(entry.mood_score)}
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex items-center mr-4">
                  <Sun className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-sm">Energy: {entry.energy_level}/5</span>
                </div>
                <div className="flex items-center">
                  <CloudLightning className="h-4 w-4 mr-1 text-red-500" />
                  <span className="text-sm">Stress: {entry.stress_level}/5</span>
                </div>
              </div>
              {entry.tags && entry.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {entry.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {entry.tags.length > 3 && (
                    <Badge variant="secondary" className="bg-muted text-xs">
                      +{entry.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
</Tabs>

{/* Add Entry Dialog */}
<Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Record Mental Health Entry</DialogTitle>
      <DialogDescription>
        Track your mood, energy levels, and overall mental state.
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            id="date"
            type="date"
            value={newEntry.date}
            onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Mood</Label>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Frown className="h-5 w-5 text-red-500" />
            <Meh className="h-5 w-5 text-yellow-500" />
            <Smile className="h-5 w-5 text-green-500" />
          </div>
          <Slider
            value={[newEntry.mood_score || 3]}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => setNewEntry({ ...newEntry, mood_score: value[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Very Low</span>
            <span>Low</span>
            <span>Neutral</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Energy Level</Label>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <SunDim className="h-5 w-5 text-muted-foreground" />
            <Sun className="h-5 w-5 text-amber-500" />
          </div>
          <Slider
            value={[newEntry.energy_level || 3]}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => setNewEntry({ ...newEntry, energy_level: value[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Very Low</span>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Very High</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Stress Level</Label>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            <CloudLightning className="h-5 w-5 text-red-500" />
          </div>
          <Slider
            value={[newEntry.stress_level || 3]}
            min={1}
            max={5}
            step={1}
            onValueChange={(value) => setNewEntry({ ...newEntry, stress_level: value[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Very Low</span>
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
            <span>Very High</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Sleep Quality (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <Button 
              key={rating} 
              type="button" 
              variant={newEntry.sleep_quality === rating ? "default" : "outline"}
              size="sm"
              onClick={() => setNewEntry({ ...newEntry, sleep_quality: rating })}
              className="w-10 h-10 p-0"
            >
              {rating}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="cursor-pointer hover:bg-muted"
              onClick={() => toggleTag(tag)}
            >
              {tag} <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
        <Select onValueChange={(value) => {
          if (value && !selectedTags.includes(value)) {
            setSelectedTags([...selectedTags, value]);
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select tags" />
          </SelectTrigger>
          <SelectContent>
            {MENTAL_HEALTH_TAGS.filter(tag => !selectedTags.includes(tag)).map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional thoughts or context..."
          value={newEntry.notes || ''}
          onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
          rows={3}
        />
      </div>
    </div>
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleAddEntry}>
        Save Entry
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
</div>
);
} 