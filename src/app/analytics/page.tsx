  <Card className="p-4 mb-6">
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <FaChartBar className="text-primary mr-2" />
        <h3 className="font-medium">Habit Completion by Category</h3>
      </div>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3 rounded-full bg-green-100 flex items-center justify-center">
          <FaRunning className="text-green-600 h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Fitness</span>
            <span>85%</span>
          </div>
          <div className="h-2 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: "85%" }}></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3 rounded-full bg-orange-100 flex items-center justify-center">
          <FaApple className="text-orange-600 h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Nutrition</span>
            <span>68%</span>
          </div>
          <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600 rounded-full" style={{ width: "68%" }}></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3 rounded-full bg-blue-100 flex items-center justify-center">
          <FaBed className="text-blue-600 h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Sleep</span>
            <span>72%</span>
          </div>
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: "72%" }}></div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <div className="w-8 h-8 mr-3 rounded-full bg-purple-100 flex items-center justify-center">
          <FaBrain className="text-purple-600 h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Mindfulness</span>
            <span>63%</span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: "63%" }}></div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="mt-4 pt-4 border-t">
      <div className="text-sm text-muted-foreground">
        <strong>Recommendation:</strong> Try to improve your mindfulness habits to achieve better balance.
      </div>
    </div>
  </Card>
  
  <div className="flex justify-between mt-6">
    <Button
      variant="outline"
      onClick={handleExportData}
    >
      <FaDownload className="mr-2 h-4 w-4" />
      Export Data
    </Button>
    
    <Button
      variant="outline"
      onClick={handleShareReport}
    >
      <FaShare className="mr-2 h-4 w-4" />
      Share Report
    </Button>
  </div>
</>