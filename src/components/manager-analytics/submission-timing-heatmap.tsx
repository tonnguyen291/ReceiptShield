'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Calendar, Users, AlertTriangle } from 'lucide-react';

interface SubmissionTimingData {
  day: string;
  employee: string;
  count: number;
  amount: number;
}

interface SubmissionTimingHeatmapProps {
  data: SubmissionTimingData[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function SubmissionTimingHeatmap({ data }: SubmissionTimingHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Submission Timing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No submission timing data available
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a matrix for the heatmap
  const employees = [...new Set(data.map(item => item.employee))];
  const heatmapData: { [key: string]: { [day: string]: { count: number; amount: number } } } = {};
  
  // Initialize the matrix
  employees.forEach(employee => {
    heatmapData[employee] = {};
    DAYS.forEach(day => {
      heatmapData[employee][day] = { count: 0, amount: 0 };
    });
  });
  
  // Populate the matrix
  data.forEach(item => {
    if (heatmapData[item.employee] && heatmapData[item.employee][item.day]) {
      heatmapData[item.employee][item.day].count += item.count;
      heatmapData[item.employee][item.day].amount += item.amount;
    }
  });

  // Calculate statistics
  const totalSubmissions = data.reduce((sum, item) => sum + item.count, 0);
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const avgPerDay = totalSubmissions / 7;
  const avgPerEmployee = totalSubmissions / employees.length;

  // Find anomalies (high submission counts)
  const anomalies = data.filter(item => item.count > avgPerDay * 2);
  const endOfMonthPattern = data.filter(item => 
    item.day === 'Fri' && item.count > avgPerDay * 1.5
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getIntensityColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = count / maxCount;
    if (intensity > 0.8) return 'bg-red-600 text-white';
    if (intensity > 0.6) return 'bg-red-500 text-white';
    if (intensity > 0.4) return 'bg-orange-400 text-white';
    if (intensity > 0.2) return 'bg-yellow-300 text-gray-900';
    return 'bg-green-200 text-gray-900';
  };

  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Submission Timing Analysis
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Total Submissions:</span>
            <span className="font-semibold">{totalSubmissions}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Employees:</span>
            <span className="font-semibold">{employees.length}</span>
          </div>
          {anomalies.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Anomalies:</span>
              <span className="font-semibold text-orange-600">{anomalies.length}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-sm font-medium text-gray-700 p-2">Employee</div>
              {DAYS.map(day => (
                <div key={day} className="text-sm font-medium text-gray-700 p-2 text-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Heatmap Rows */}
            <div className="space-y-1">
              {employees.map(employee => (
                <div key={employee} className="grid grid-cols-8 gap-1">
                  <div className="text-sm text-gray-600 p-2 font-medium truncate">
                    {employee}
                  </div>
                  {DAYS.map(day => {
                    const cellData = heatmapData[employee][day];
                    const isAnomaly = cellData.count > avgPerDay * 2;
                    return (
                      <div
                        key={`${employee}-${day}`}
                        className={`p-2 text-center text-xs rounded transition-all hover:scale-105 ${
                          getIntensityColor(cellData.count, maxCount)
                        } ${isAnomaly ? 'ring-2 ring-red-400' : ''}`}
                        title={`${employee} - ${day}: ${cellData.count} submissions, ${formatCurrency(cellData.amount)}`}
                      >
                        <div className="font-semibold">{cellData.count}</div>
                        {cellData.amount > 0 && (
                          <div className="text-xs opacity-75">
                            {formatCurrency(cellData.amount)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-600">Intensity:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-100 rounded"></div>
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-300 rounded"></div>
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Very High</span>
          </div>
        </div>
        
        {/* Anomaly Analysis */}
        {anomalies.length > 0 && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Submission Anomalies Detected
            </h4>
            <div className="space-y-2">
              {anomalies.slice(0, 5).map((anomaly, index) => (
                <div key={index} className="text-sm text-orange-700">
                  <span className="font-medium">{anomaly.employee}</span> submitted{' '}
                  <span className="font-semibold">{anomaly.count} receipts</span> on{' '}
                  <span className="font-semibold">{anomaly.day}</span> totaling{' '}
                  <span className="font-semibold">{formatCurrency(anomaly.amount)}</span>
                </div>
              ))}
              {anomalies.length > 5 && (
                <div className="text-sm text-orange-600">
                  ... and {anomalies.length - 5} more anomalies
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Pattern Analysis */}
        {endOfMonthPattern.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              End-of-Week Pattern Detected
            </h4>
            <p className="text-sm text-blue-700">
              Higher submission activity observed on Fridays, suggesting end-of-week expense reporting patterns.
            </p>
          </div>
        )}
        
        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Avg per Day</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {avgPerDay.toFixed(1)}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Avg per Employee</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {avgPerEmployee.toFixed(1)}
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Total Amount</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {formatCurrency(totalAmount)}
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Anomalies</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-1">
              {anomalies.length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
