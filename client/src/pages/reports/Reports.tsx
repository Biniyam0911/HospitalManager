import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, FileBarChart, FileText, Printer } from "lucide-react";

// Financial report sample data
const financialData = [
  { month: "Jan", revenue: 42500, expenses: 32000, profit: 10500 },
  { month: "Feb", revenue: 45200, expenses: 34500, profit: 10700 },
  { month: "Mar", revenue: 48900, expenses: 35600, profit: 13300 },
  { month: "Apr", revenue: 46300, expenses: 33900, profit: 12400 },
  { month: "May", revenue: 49800, expenses: 36200, profit: 13600 },
  { month: "Jun", revenue: 52400, expenses: 37800, profit: 14600 },
];

// Revenue by department data
const departmentRevenueData = [
  { name: "Emergency", value: 25000 },
  { name: "Cardiology", value: 32000 },
  { name: "Neurology", value: 18000 },
  { name: "Pediatrics", value: 22000 },
  { name: "Orthopedics", value: 28000 },
];

// Patient statistics data
const patientStatsData = [
  { month: "Jan", inpatients: 85, outpatients: 320 },
  { month: "Feb", inpatients: 90, outpatients: 340 },
  { month: "Mar", inpatients: 105, outpatients: 390 },
  { month: "Apr", inpatients: 95, outpatients: 350 },
  { month: "May", inpatients: 110, outpatients: 410 },
  { month: "Jun", inpatients: 120, outpatients: 430 },
];

// Operational metrics data
const operationalData = [
  { metric: "Average Length of Stay", value: 3.2, unit: "days" },
  { metric: "Bed Occupancy Rate", value: 75, unit: "%" },
  { metric: "Staff to Patient Ratio", value: 1.5, unit: "ratio" },
  { metric: "Average Wait Time", value: 22, unit: "minutes" },
  { metric: "Operating Room Utilization", value: 92, unit: "%" },
];

// Department performance data
const departmentPerformanceData = [
  { name: "Emergency", metrics: { cases: 520, avgWait: 15, satisfaction: 85 } },
  { name: "Cardiology", metrics: { cases: 320, avgWait: 25, satisfaction: 92 } },
  { name: "Neurology", metrics: { cases: 180, avgWait: 30, satisfaction: 88 } },
  { name: "Pediatrics", metrics: { cases: 420, avgWait: 20, satisfaction: 90 } },
  { name: "Orthopedics", metrics: { cases: 250, avgWait: 35, satisfaction: 82 } },
];

const COLORS = ['#2196F3', '#4CAF50', '#F44336', '#9E9E9E', '#607D8B'];

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState("monthly");
  const [reportType, setReportType] = useState("financial");

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-borderColor shadow-sm rounded-md">
          <p className="font-medium text-textDark">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-borderColor shadow-sm rounded-md">
          <p className="font-medium text-textDark">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].payload.fill }}>
            {`Revenue: ${payload[0].value.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-textDark">Reports & Analytics</h1>
          <p className="text-midGrey">View and generate hospital performance reports</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => alert("Feature not implemented")}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden md:inline">Print</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => alert("Feature not implemented")}
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileBarChart className="h-4 w-4 mr-2 text-primary" />
              Financial Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">6</div>
            <p className="text-midGrey text-sm mt-1">Available reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileText className="h-4 w-4 mr-2 text-secondary" />
              Operational Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">8</div>
            <p className="text-midGrey text-sm mt-1">Available reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileBarChart className="h-4 w-4 mr-2 text-alert" />
              Clinical Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">5</div>
            <p className="text-midGrey text-sm mt-1">Available reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <FileBarChart className="h-4 w-4 mr-2 text-midGrey" />
              Custom Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">3</div>
            <p className="text-midGrey text-sm mt-1">Saved templates</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-borderColor mb-6">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-4">
          <div className="w-full md:w-64">
            <Select
              value={reportType}
              onValueChange={setReportType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="financial">Financial Report</SelectItem>
                <SelectItem value="operational">Operational Metrics</SelectItem>
                <SelectItem value="patient">Patient Statistics</SelectItem>
                <SelectItem value="department">Department Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-48">
            <Select
              value={reportPeriod}
              onValueChange={setReportPeriod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {reportType === "financial" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Financial Performance (Last 6 Months)</CardTitle>
                <CardDescription>Revenue, expenses, and profit analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={financialData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#2196F3" />
                      <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                      <Bar dataKey="profit" name="Profit" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Revenue by Department</CardTitle>
                  <CardDescription>Breakdown of revenue sources</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentRevenueData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {departmentRevenueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Financial Summary</CardTitle>
                  <CardDescription>Key financial metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-textDark">Total Revenue (YTD)</span>
                        <span className="text-sm font-medium text-textDark">$285,100</span>
                      </div>
                      <div className="w-full bg-neutral rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-textDark">Total Expenses (YTD)</span>
                        <span className="text-sm font-medium text-textDark">$210,000</span>
                      </div>
                      <div className="w-full bg-neutral rounded-full h-2.5">
                        <div className="bg-alert h-2.5 rounded-full" style={{ width: "55%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-textDark">Net Profit (YTD)</span>
                        <span className="text-sm font-medium text-textDark">$75,100</span>
                      </div>
                      <div className="w-full bg-neutral rounded-full h-2.5">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: "35%" }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-textDark">Outstanding Receivables</span>
                        <span className="text-sm font-medium text-textDark">$42,500</span>
                      </div>
                      <div className="w-full bg-neutral rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: "22%" }}></div>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-textDark">Profit Margin</span>
                        <span className="text-sm font-medium text-secondary">26.3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {reportType === "patient" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Patient Statistics (Last 6 Months)</CardTitle>
                <CardDescription>Inpatient and outpatient numbers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={patientStatsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="inpatients" name="Inpatients" stroke="#2196F3" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="outpatients" name="Outpatients" stroke="#4CAF50" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Patient Demographics</CardTitle>
                  <CardDescription>Age distribution of patients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "0-18", value: 220 },
                            { name: "19-35", value: 380 },
                            { name: "36-50", value: 420 },
                            { name: "51-65", value: 520 },
                            { name: "65+", value: 680 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[...Array(5)].map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Patient Metrics</CardTitle>
                  <CardDescription>Key patient statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-neutral/30 rounded-lg">
                      <span className="text-sm text-textDark">Total Patients (YTD)</span>
                      <span className="text-sm font-medium text-textDark">2,248</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-neutral/30 rounded-lg">
                      <span className="text-sm text-textDark">New Patients (Last Month)</span>
                      <span className="text-sm font-medium text-primary">186</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-neutral/30 rounded-lg">
                      <span className="text-sm text-textDark">Average Length of Stay</span>
                      <span className="text-sm font-medium text-textDark">3.2 days</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-neutral/30 rounded-lg">
                      <span className="text-sm text-textDark">Readmission Rate</span>
                      <span className="text-sm font-medium text-alert">4.8%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-neutral/30 rounded-lg">
                      <span className="text-sm text-textDark">Patient Satisfaction</span>
                      <span className="text-sm font-medium text-secondary">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {reportType === "operational" && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Operational Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {operationalData.map((item, index) => (
                    <div key={index} className="bg-neutral/30 p-4 rounded-lg">
                      <div className="text-midGrey text-sm">{item.metric}</div>
                      <div className="flex items-end mt-2">
                        <span className="text-2xl font-bold">{item.value}</span>
                        <span className="text-sm text-midGrey ml-1 mb-1">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Resource Utilization</CardTitle>
                <CardDescription>Efficiency metrics by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Emergency", utilization: 92 },
                        { name: "Operating Rooms", utilization: 85 },
                        { name: "ICU Beds", utilization: 78 },
                        { name: "General Wards", utilization: 72 },
                        { name: "Radiology", utilization: 68 },
                        { name: "Laboratory", utilization: 75 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="utilization" name="Utilization %" fill="#2196F3" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "department" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {departmentPerformanceData.map((dept, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{dept.name} Department</CardTitle>
                    <CardDescription>Performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-textDark">Cases Handled</span>
                          <span className="text-sm font-medium text-textDark">{dept.metrics.cases}</span>
                        </div>
                        <div className="w-full bg-neutral rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${(dept.metrics.cases / 600) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-textDark">Avg. Wait Time</span>
                          <span className="text-sm font-medium text-textDark">{dept.metrics.avgWait} mins</span>
                        </div>
                        <div className="w-full bg-neutral rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${dept.metrics.avgWait > 30 ? 'bg-alert' : 'bg-secondary'}`}
                            style={{ width: `${(dept.metrics.avgWait / 45) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-textDark">Patient Satisfaction</span>
                          <span className="text-sm font-medium text-textDark">{dept.metrics.satisfaction}%</span>
                        </div>
                        <div className="w-full bg-neutral rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${dept.metrics.satisfaction < 80 ? 'bg-alert' : 'bg-secondary'}`}
                            style={{ width: `${dept.metrics.satisfaction}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Department Comparison</CardTitle>
                <CardDescription>Key metrics across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentPerformanceData.map(dept => ({
                        name: dept.name,
                        cases: dept.metrics.cases,
                        satisfaction: dept.metrics.satisfaction,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#2196F3" />
                      <YAxis yAxisId="right" orientation="right" stroke="#4CAF50" domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="cases" name="Cases" fill="#2196F3" />
                      <Bar yAxisId="right" dataKey="satisfaction" name="Satisfaction %" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
