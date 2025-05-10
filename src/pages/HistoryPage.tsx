
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { Download, Calendar } from "lucide-react";
import { getInvoices, Invoice } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

type TimeRange = "last_30_days" | "last_3_months" | "last_6_months" | "last_year" | "all_time";

interface MonthlyData {
  month: string;
  total: number;
  count: number;
}

interface BillingTypeData {
  type: string;
  count: number;
  total: number;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("last_3_months");
  const [chartData, setChartData] = useState<MonthlyData[]>([]);
  const [billingTypeData, setBillingTypeData] = useState<BillingTypeData[]>([]);
  
  // Load invoices
  useEffect(() => {
    const loadedInvoices = getInvoices();
    setInvoices(loadedInvoices);
  }, []);
  
  // Process data based on selected time range
  useEffect(() => {
    if (invoices.length === 0) {
      setChartData([]);
      setBillingTypeData([]);
      return;
    }
    
    // Get date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case "last_30_days":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case "last_3_months":
        startDate = subMonths(now, 3);
        break;
      case "last_6_months":
        startDate = subMonths(now, 6);
        break;
      case "last_year":
        startDate = subMonths(now, 12);
        break;
      case "all_time":
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Filter invoices by date range
    const filteredInvoices = timeRange === "all_time" 
      ? [...invoices]
      : invoices.filter(invoice => {
          const invoiceDate = new Date(invoice.issueDate);
          return isAfter(invoiceDate, startDate) && isBefore(invoiceDate, now);
        });
    
    // Process chart data (by month)
    const monthlyData: Record<string, MonthlyData> = {};
    
    filteredInvoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      const monthKey = format(date, "yyyy-MM");
      const monthLabel = format(date, "MMM yyyy");
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          total: 0,
          count: 0,
        };
      }
      
      monthlyData[monthKey].total += invoice.total;
      monthlyData[monthKey].count += 1;
    });
    
    // Convert to array and sort by date
    const monthlyDataArray = Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    setChartData(monthlyDataArray);
    
    // Process billing type data
    const typeData: Record<string, BillingTypeData> = {
      hotel: { type: "Hotel", count: 0, total: 0 },
      grocery: { type: "Grocery", count: 0, total: 0 },
      custom: { type: "Custom", count: 0, total: 0 },
    };
    
    filteredInvoices.forEach(invoice => {
      typeData[invoice.billingType].count += 1;
      typeData[invoice.billingType].total += invoice.total;
    });
    
    setBillingTypeData(Object.values(typeData));
  }, [invoices, timeRange]);
  
  // Get totals
  const totalRevenue = chartData.reduce((sum, data) => sum + data.total, 0);
  const totalInvoices = chartData.reduce((sum, data) => sum + data.count, 0);
  
  // Export data to CSV
  const exportToCSV = () => {
    try {
      if (invoices.length === 0) {
        toast({
          title: "No data to export",
          description: "There are no invoices to export.",
          variant: "destructive",
        });
        return;
      }
      
      // CSV header row
      const csvHeader = [
        "Invoice Number",
        "Date",
        "Customer Name",
        "Customer Email",
        "Billing Type",
        "Subtotal",
        "Tax",
        "Discount",
        "Total"
      ].join(",");
      
      // CSV data rows
      const csvRows = invoices.map(invoice => {
        const row = [
          invoice.invoiceNumber,
          invoice.issueDate,
          invoice.customer.name,
          invoice.customer.email || "",
          invoice.billingType,
          invoice.subtotal.toFixed(2),
          invoice.taxAmount?.toFixed(2) || "0.00",
          invoice.discountAmount?.toFixed(2) || "0.00",
          invoice.total.toFixed(2)
        ];
        
        return row.map(item => `"${item}"`).join(",");
      });
      
      // Combine header and rows
      const csv = [csvHeader, ...csvRows].join("\n");
      
      // Create download link
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "invoice_history.csv");
      link.click();
      
      toast({
        title: "Export successful",
        description: "Invoice history has been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data.",
        variant: "destructive",
      });
    }
  };
  
  // Get time range label
  const getTimeRangeLabel = (range: TimeRange): string => {
    switch (range) {
      case "last_30_days":
        return "Last 30 Days";
      case "last_3_months":
        return "Last 3 Months";
      case "last_6_months":
        return "Last 6 Months";
      case "last_year":
        return "Last Year";
      case "all_time":
        return "All Time";
      default:
        return "";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing History</h1>
          <p className="text-muted-foreground">
            View and analyze your invoice history
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_30_days">Last 30 Days</SelectItem>
              <SelectItem value="last_3_months">Last 3 Months</SelectItem>
              <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>
      </div>
      
      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Invoice History</h2>
              <p className="text-muted-foreground mb-6">
                You haven't created any invoices yet.
              </p>
              <Button onClick={() => navigate("/create-invoice")}>
                Create Your First Invoice
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue ({getTimeRangeLabel(timeRange)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  From {totalInvoices} invoice{totalInvoices !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time ({getTimeRangeLabel(timeRange)})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
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
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        name="Revenue"
                        stroke="#0ea5e9" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for the selected time range</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {billingTypeData.map((type) => (
                  <Card key={type.type}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col">
                        <span className="text-lg font-medium">{type.type} Invoices</span>
                        <div className="flex flex-col mt-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Count:</span>
                            <span className="font-medium">{type.count}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-medium">${type.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-muted-foreground">Average:</span>
                            <span className="font-medium">
                              ${type.count > 0 ? (type.total / type.count).toFixed(2) : '0.00'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
