import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Trash, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getUserProfile, getInvoices, deleteInvoice, Invoice, UserProfile } from "@/lib/storage";
import { generatePDF, saveAsImage } from "@/utils/pdfGenerator";
import InvoicePreview from "@/components/invoice/InvoicePreview";

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    if (!invoiceId) {
      navigate("/invoices");
      return;
    }
    
    const profile = getUserProfile();
    if (!profile) {
      toast({
        title: "Profile not found",
        description: "Please create a profile before viewing invoices",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }
    
    setUserProfile(profile);
    
    const invoices = getInvoices();
    const foundInvoice = invoices.find((inv) => inv.id === invoiceId);
    
    if (!foundInvoice) {
      toast({
        title: "Invoice not found",
        description: "The requested invoice could not be found",
        variant: "destructive",
      });
      navigate("/invoices");
      return;
    }
    
    setInvoice(foundInvoice);
  }, [invoiceId, navigate, toast]);
  
  const handleDeleteInvoice = () => {
    if (!invoice) return;
    
    try {
      deleteInvoice(invoice.id);
      
      toast({
        title: "Invoice deleted",
        description: `Invoice ${invoice.invoiceNumber} has been deleted.`,
      });
      
      navigate("/invoices");
    } catch (error) {
      toast({
        title: "Error deleting invoice",
        description: "There was an error deleting the invoice.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const handleGeneratePDF = async () => {
    try {
      await generatePDF('invoice-preview', `${invoice?.invoiceNumber}.pdf`);
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "There was an error generating the PDF.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveAsImage = async () => {
    try {
      await saveAsImage('invoice-preview', `${invoice?.invoiceNumber}.png`);
      toast({
        title: "Image Generated",
        description: "Invoice image has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error generating image",
        description: "There was an error generating the image.",
        variant: "destructive",
      });
    }
  };
  
  if (!invoice || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <h2 className="mt-4 text-lg font-medium">Loading invoice...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">
              View and export invoice details
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveAsImage}>
            <Download className="mr-2 h-4 w-4" /> Save as Image
          </Button>
          <Button variant="outline" onClick={handleGeneratePDF}>
            <Download className="mr-2 h-4 w-4" /> Generate PDF
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <div className="p-6">
          <InvoicePreview invoice={invoice} userProfile={userProfile} />
        </div>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice {invoice.invoiceNumber}? This action cannot be undone.
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
