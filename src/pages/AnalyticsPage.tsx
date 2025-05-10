
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { format, subDays, subMonths, startOfMonth, endOfMonth, isAfter, isBefore } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getInvoices, Invoice } from "@/lib/storage";
import { CalendarDays, Calendar, ArrowUpDown } from "lucide-react";

type TimeRange = "daily" | "weekly" | "monthly" | "yearly";
type ChartView = "line" | "bar";

interface Customer {
  name: string;
  email?: string;
  totalSpent: number;
  invoiceCount: number;
}

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

export default function AnalyticsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly");
  const [chartView, setChartView] = useState<ChartView>("bar");
  const [sortBy, setSortBy] = useState<"amount" | "count">("amount");
  
  // Load invoices
  useEffect(() => {
    const loadedInvoices = getInvoices();
    setInvoices(loadedInvoices);
  }, []);

  // Generate chart data based on time range
  const chartData = useMemo(() => {
    if (invoices.length === 0) return [];
    
    const now = new Date();
    let data: Record<string, { date: string, total: number, count: number }> = {};
    
    // Define time buckets based on selected range
    if (timeRange === "daily") {
      // Last 30 days
      for (let i = 0; i < 30; i++) {
        const date = subDays(now, i);
        const dateKey = format(date, "yyyy-MM-dd");
        const dateLabel = format(date, "MMM dd");
        data[dateKey] = { date: dateLabel, total: 0, count: 0 };
      }
    } else if (timeRange === "weekly") {
      // Last 12 weeks
      for (let i = 0; i < 12; i++) {
        const date = subDays(now, i * 7);
        const weekKey = format(date, "yyyy-'W'w");
        const weekLabel = `Week ${format(date, "w")}`;
        data[weekKey] = { date: weekLabel, total: 0, count: 0 };
      }
    } else if (timeRange === "monthly") {
      // Last 12 months
      for (let i = 0; i < 12; i++) {
        const date = subMonths(now, i);
        const monthKey = format(date, "yyyy-MM");
        const monthLabel = format(date, "MMM yyyy");
        data[monthKey] = { date: monthLabel, total: 0, count: 0 };
      }
    } else if (timeRange === "yearly") {
      // Last 5 years
      for (let i = 0; i < 5; i++) {
        const date = new Date(now.getFullYear() - i, 0, 1);
        const yearKey = format(date, "yyyy");
        const yearLabel = format(date, "yyyy");
        data[yearKey] = { date: yearLabel, total: 0, count: 0 };
      }
    }
    
    // Process invoices
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.issueDate);
      
      if (timeRange === "daily") {
        const dateKey = format(invoiceDate, "yyyy-MM-dd");
        if (data[dateKey]) {
          data[dateKey].total += invoice.total;
          data[dateKey].count += 1;
        }
      } else if (timeRange === "weekly") {
        const weekKey = format(invoiceDate, "yyyy-'W'w");
        if (data[weekKey]) {
          data[weekKey].total += invoice.total;
          data[weekKey].count += 1;
        }
      } else if (timeRange === "monthly") {
        const monthKey = format(invoiceDate, "yyyy-MM");
        if (data[monthKey]) {
          data[monthKey].total += invoice.total;
          data[monthKey].count += 1;
        }
      } else if (timeRange === "yearly") {
        const yearKey = format(invoiceDate, "yyyy");
        if (data[yearKey]) {
          data[yearKey].total += invoice.total;
          data[yearKey].count += 1;
        }
      }
    });
    
    // Convert to array and sort chronologically
    return Object.values(data).sort((a, b) => {
      if (timeRange === "yearly") {
        return b.date.localeCompare(a.date);
      }
      return a.date.localeCompare(b.date);
    });
  }, [invoices, timeRange]);

  // Generate category data
  const categoryData = useMemo(() => {
    if (invoices.length === 0) return [];
    
    const categories: Record<string, CategoryData> = {
      hotel: { name: "Hotel", value: 0, count: 0 },
      grocery: { name: "Grocery", value: 0, count: 0 },
      custom: { name: "Custom", value: 0, count: 0 },
    };
    
    invoices.forEach(invoice => {
      categories[invoice.billingType].value += invoice.total;
      categories[invoice.billingType].count += 1;
    });
    
    return Object.values(categories);
  }, [invoices]);

  // Generate top customers data
  const topCustomers = useMemo(() => {
    if (invoices.length === 0) return [];
    
    const customers: Record<string, Customer> = {};
    
    invoices.forEach(invoice => {
      const customerKey = invoice.customer.email || invoice.customer.name;
      
      if (!customers[customerKey]) {
        customers[customerKey] = {
          name: invoice.customer.name,
          email: invoice.customer.email,
          totalSpent: 0,
          invoiceCount: 0,
        };
      }
      
      customers[customerKey].totalSpent += invoice.total;
      customers[customerKey].invoiceCount += 1;
    });
    
    return Object.values(customers)
      .sort((a, b) => sortBy === "amount" 
        ? b.totalSpent - a.totalSpent 
        : b.invoiceCount - a.invoiceCount)
      .slice(0, 10);
  }, [invoices, sortBy]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  // Calculate summary stats
  const totalRevenue = useMemo(() => invoices.reduce((sum, invoice) => sum + invoice.total, 0), [invoices]);
  const avgInvoiceValue = invoices.length ? totalRevenue / invoices.length : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Insights and performance metrics for your business
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[180px]">
              <CalendarDays className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-1 rounded-md bg-muted p-1 text-muted-foreground">
            <Button 
              variant={chartView === 'bar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartView('bar')}
              className="px-3"
            >
              Bar
            </Button>
            <Button
              variant={chartView === 'line' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setChartView('line')}
              className="px-3"
            >
              Line
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Invoice Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{avgInvoiceValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per invoice average
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Most Used Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {categoryData.sort((a, b) => b.count - a.count)[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoryData.sort((a, b) => b.count - a.count)[0]?.count || 0} invoices
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>{timeRange === "daily" ? "Daily" : timeRange === "weekly" ? "Weekly" : timeRange === "monthly" ? "Monthly" : "Yearly"} Earnings</CardTitle>
            <CardDescription>
              Revenue trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ChartContainer 
                  config={{
                    revenue: { theme: { light: '#0ea5e9', dark: '#0ea5e9' } },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'bar' ? (
                      <BarChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <ChartTooltip
                          content={(props) => (
                            <ChartTooltipContent
                              {...props}
                              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                          )}
                        />
                        <Bar 
                          dataKey="total" 
                          name="Revenue" 
                          fill="var(--color-revenue)" 
                        />
                      </BarChart>
                    ) : (
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `₹${value}`}
                        />
                        <ChartTooltip
                          content={(props) => (
                            <ChartTooltipContent
                              {...props}
                              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                              labelFormatter={(label) => `Date: ${label}`}
                            />
                          )}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          name="Revenue" 
                          stroke="var(--color-revenue)" 
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>
              Revenue by billing type
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-[250px] w-full">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 w-full">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex flex-col items-center">
                  <div className="text-lg font-bold">{category.name}</div>
                  <div className="text-muted-foreground">₹{category.value.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{category.count} invoices</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>
                Based on {sortBy === "amount" ? "billing volume" : "frequency"}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortBy(sortBy === "amount" ? "count" : "amount")}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort by {sortBy === "amount" ? "Count" : "Amount"}
            </Button>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Invoices</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map((customer) => (
                    <TableRow key={customer.email || customer.name}>
                      <TableCell className="font-medium">
                        <div>{customer.name}</div>
                        {customer.email && (
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{customer.invoiceCount}</TableCell>
                      <TableCell className="text-right">₹{customer.totalSpent.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-muted-foreground">No customer data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
