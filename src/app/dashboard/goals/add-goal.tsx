import { MeasurementUnitSelector } from "@/components/measurement-unit-selector";
import { getUnitLabel, defaultMeasurements } from "@/lib/measurements";

// Inside your component where you declare state:
const [measurementUnit, setMeasurementUnit] = useState<string>('');

// Inside useEffect that handles form initialization or goal type change:
useEffect(() => {
  if (goalType) {
    // Set the default measurement unit for this goal type
    setMeasurementUnit(defaultMeasurements[goalType] || 'units');
  }
}, [goalType]);

// In your form JSX, add the measurement unit selector after the goal type selector:
<div className="space-y-4">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label htmlFor="goal-type" className="text-sm font-medium">
        Goal Type
      </label>
      <Select 
        value={goalType} 
        onValueChange={(value) => setGoalType(value)}
      >
        {/* Existing goal type options */}
      </Select>
    </div>
    
    {/* Add the measurement unit selector */}
    <MeasurementUnitSelector 
      activityType={goalType} // Goal type is often the same as activity type
      value={measurementUnit}
      onChange={setMeasurementUnit}
    />
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label htmlFor="target-value" className="text-sm font-medium">
        Target Value
      </label>
      <div className="flex items-center">
        <Input
          id="target-value"
          type="number"
          min="0"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder={`Enter ${goalType} target`}
          className="w-full"
        />
        <span className="ml-2 text-sm text-muted-foreground">
          {measurementUnit}
        </span>
      </div>
    </div>
    
    {/* Other form fields */}
  </div>
</div>

// Modify your handleSubmit function to include the measurement unit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation...
  
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError("You must be logged in to set a goal");
      return;
    }
    
    // Create the goal with the measurement unit
    const { data, error } = await supabase
      .from('health_goals')
      .insert([
        {
          user_id: user.id,
          goal_type: goalType,
          target_value: parseFloat(targetValue),
          start_date: startDate,
          target_date: targetDate,
          status: 'active',
          current_value: 0,
          measurement_unit: measurementUnit, // Add this field
          notes: goalNotes
        }
      ])
      .select();
    
    if (error) throw error;
    
    // Reset form and show success...
    
  } catch (err) {
    // Error handling...
  }
}; 