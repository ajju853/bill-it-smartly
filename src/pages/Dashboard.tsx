
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, User, Clock } from "lucide-react";
import { getUserProfile, getInvoices, Invoice } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [invoiceCount, setInvoiceCount] = useState<number>(0);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const profile = getUserProfile();
    setHasProfile(!!profile);
    
    const invoices = getInvoices();
    setInvoiceCount(invoices.length);
    setRecentInvoices(invoices.slice(0, 5));
    
    const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    setTotalAmount(total);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {hasProfile ? 'Overview of your billing system' : 'Welcome to your Smart Billing System'}
          </p>
        </div>
        <Button onClick={() => navigate("/create-invoice")}>
          <CreditCard className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {!hasProfile && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="bg-amber-100 dark:bg-amber-800/30 p-2 rounded-full">
                <User className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-medium">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                  Set up your business profile to appear on invoices
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Complete Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceCount}</div>
            <p className="text-xs text-muted-foreground">
              {invoiceCount === 0 ? 'No invoices created yet' : `${invoiceCount} invoice${invoiceCount !== 1 ? 's' : ''} created`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalAmount === 0 ? 'No revenue recorded' : 'Total from all invoices'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{invoiceCount > 0 ? (totalAmount / invoiceCount).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {invoiceCount === 0 ? 'No invoices to calculate average' : 'Average invoice amount'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            {recentInvoices.length > 0 
              ? `Your ${recentInvoices.length} most recent invoices` 
              : 'No invoices created yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">Start creating invoices to see them here</p>
              <Button onClick={() => navigate("/create-invoice")}>
                Create Your First Invoice
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                    <span className="text-sm text-muted-foreground">
                      {invoice.customer.name} &bull; {formatDate(invoice.issueDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">₹{invoice.total.toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {recentInvoices.length > 0 && (
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate("/invoices")}>
              View All Invoices
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
