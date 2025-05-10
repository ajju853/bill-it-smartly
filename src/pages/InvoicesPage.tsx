import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { FileText, Search, Trash, Eye, Download, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getInvoices, deleteInvoice, Invoice, BillingType } from "@/lib/storage";
import { formatDate } from "@/lib/utils";
import { generatePDF } from "@/utils/pdfGenerator";

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  
  // Load invoices
  useEffect(() => {
    const loadedInvoices = getInvoices();
    // Sort by most recent first
    loadedInvoices.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setInvoices(loadedInvoices);
    setFilteredInvoices(loadedInvoices);
  }, []);
  
  // Handle filtering and searching
  useEffect(() => {
    let result = [...invoices];
    
    // Filter by type
    if (filterType !== "all") {
      result = result.filter((invoice) => invoice.billingType === filterType);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(term) ||
          invoice.customer.name.toLowerCase().includes(term) ||
          (invoice.customer.email && invoice.customer.email.toLowerCase().includes(term))
      );
    }
    
    setFilteredInvoices(result);
  }, [invoices, filterType, searchTerm]);
  
  // Get billing type label
  const getBillingTypeLabel = (type: BillingType): string => {
    switch (type) {
      case "hotel":
        return "Hotel";
      case "grocery":
        return "Grocery";
      case "custom":
        return "Custom";
      default:
        return type;
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return `₹${amount.toFixed(2)}`;
  };
  
  // Delete invoice
  const confirmDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteInvoice = () => {
    if (!invoiceToDelete) return;
    
    try {
      deleteInvoice(invoiceToDelete.id);
      
      // Update invoices list
      const updatedInvoices = invoices.filter(
        (invoice) => invoice.id !== invoiceToDelete.id
      );
      setInvoices(updatedInvoices);
      
      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoiceToDelete.invoiceNumber} has been deleted.`,
      });
    } catch (error) {
      toast({
        title: "Error deleting invoice",
        description: "There was an error deleting the invoice.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };
  
  // Generate PDF for an invoice
  const handleGeneratePDF = async (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and view your created invoices
          </p>
        </div>
        
        <Button onClick={() => navigate("/create-invoice")}>
          <CreditCard className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterType}
          onValueChange={setFilterType}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="grocery">Grocery</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {invoices.length === 0 
                      ? "No invoices found. Create your first invoice!" 
                      : "No invoices match your search or filter criteria."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div>{invoice.customer.name}</div>
                        {invoice.customer.email && (
                          <div className="text-xs text-muted-foreground">
                            {invoice.customer.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getBillingTypeLabel(invoice.billingType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGeneratePDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDeleteInvoice(invoice)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{" "}
              {invoiceToDelete?.invoiceNumber}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInvoice}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
