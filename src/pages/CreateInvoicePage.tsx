
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { 
  getUserProfile, 
  saveInvoice,
  generateInvoiceNumber,
  BillingType,
  Customer,
  InvoiceItem,
  HotelBillingDetails,
  GroceryBillingDetails,
  CustomBillingDetails 
} from "@/lib/storage";
import { generatePDF, saveAsImage } from "@/utils/pdfGenerator";
import BillingTypeSelector from "@/components/invoice/BillingTypeSelector";
import CustomerForm from "@/components/invoice/CustomerForm";
import HotelBillingForm from "@/components/invoice/HotelBillingForm";
import GroceryBillingForm from "@/components/invoice/GroceryBillingForm";
import CustomBillingForm from "@/components/invoice/CustomBillingForm";
import ItemsTable from "@/components/invoice/ItemsTable";
import TotalCalculator from "@/components/invoice/TotalCalculator";
import InvoicePreview from "@/components/invoice/InvoicePreview";

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // User profile
  const [userProfile, setUserProfile] = useState(getUserProfile());
  
  // Basic invoice data
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().substring(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  
  // Invoice data
  const [billingType, setBillingType] = useState<BillingType>("hotel");
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  // Billing details
  const [hotelDetails, setHotelDetails] = useState<HotelBillingDetails>({
    roomNumber: "",
    checkIn: new Date().toISOString().substring(0, 10),
    checkOut: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
    nights: 1,
    services: [],
  });
  const [groceryDetails, setGroceryDetails] = useState<GroceryBillingDetails>({
    isWeightBased: false,
  });
  const [customDetails, setCustomDetails] = useState<CustomBillingDetails>({
    customFields: [],
  });
  
  // Calculated values
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * tax) / 100;
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal + taxAmount - discountAmount;
  
  // Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Initialize invoice number
  useEffect(() => {
    if (!userProfile) {
      toast({
        title: "Profile not found",
        description: "Please create a profile before creating invoices",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }
    
    setInvoiceNumber(generateInvoiceNumber());
  }, [navigate, toast, userProfile]);
  
  // Get the current billing details based on billing type
  const getCurrentBillingDetails = useCallback(() => {
    switch (billingType) {
      case "hotel":
        return hotelDetails;
      case "grocery":
        return groceryDetails;
      case "custom":
        return customDetails;
      default:
        return undefined;
    }
  }, [billingType, hotelDetails, groceryDetails, customDetails]);
  
  // Handle billing type change
  const handleBillingTypeChange = (type: BillingType) => {
    setBillingType(type);
  };
  
  // Generate invoice
  const handleCreateInvoice = async (generateType: 'save' | 'pdf' | 'image') => {
    if (!userProfile) {
      toast({
        title: "Profile not found",
        description: "Please create a profile before creating invoices",
        variant: "destructive",
      });
      return;
    }
    
    if (!customer.name) {
      toast({
        title: "Customer information missing",
        description: "Please enter customer name",
        variant: "destructive",
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice",
        variant: "destructive",
      });
      return;
    }
    
    if (billingType === "hotel") {
      if (!hotelDetails.roomNumber) {
        toast({
          title: "Hotel details missing",
          description: "Please enter room number",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsGenerating(true);
    
    try {
      // Create the invoice object
      const invoice = {
        invoiceNumber,
        issueDate,
        dueDate: dueDate || undefined,
        customer,
        items,
        subtotal,
        tax,
        taxAmount,
        discount,
        discountAmount,
        total,
        billingType,
        billingDetails: getCurrentBillingDetails(),
        notes: notes || undefined,
      };
      
      if (generateType === 'save') {
        // Save invoice to localStorage
        saveInvoice(invoice);
        
        // Show success message
        toast({
          title: "Invoice created",
          description: `Invoice ${invoiceNumber} has been created successfully.`,
        });
        
        // Navigate to invoices
        navigate("/invoices");
      } else {
        setPreviewOpen(true);
        
        // Wait for DOM to update with the preview
        setTimeout(async () => {
          try {
            if (generateType === 'pdf') {
              await generatePDF('invoice-preview', `${invoiceNumber}.pdf`);
              toast({
                title: "PDF Generated",
                description: "Invoice PDF has been generated successfully.",
              });
            } else if (generateType === 'image') {
              await saveAsImage('invoice-preview', `${invoiceNumber}.png`);
              toast({
                title: "Image Generated",
                description: "Invoice image has been generated successfully.",
              });
            }
          } catch (error) {
            console.error(error);
            toast({
              title: "Generation Error",
              description: "There was an error generating the output format.",
              variant: "destructive",
            });
          } finally {
            setIsGenerating(false);
          }
        }, 500);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating invoice",
        description: "There was an error creating the invoice.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Generate a new invoice for your customers
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Preview Invoice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Invoice Preview</DialogTitle>
              </DialogHeader>
              {userProfile && (
                <InvoicePreview
                  invoice={{
                    id: "preview",
                    invoiceNumber,
                    issueDate,
                    dueDate: dueDate || undefined,
                    customer,
                    items,
                    subtotal,
                    tax,
                    taxAmount,
                    discount,
                    discountAmount,
                    total,
                    billingType,
                    billingDetails: getCurrentBillingDetails(),
                    notes: notes || undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }}
                  userProfile={userProfile}
                />
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setPreviewOpen(false)}
                  disabled={isGenerating}
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleCreateInvoice('pdf')}
                  disabled={isGenerating}
                >
                  Generate PDF
                </Button>
                <Button
                  onClick={() => handleCreateInvoice('image')}
                  disabled={isGenerating}
                >
                  Save as Image
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button onClick={() => handleCreateInvoice('save')}>
            Create & Save Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Enter invoice number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <CustomerForm customer={customer} onCustomerChange={setCustomer} />
          
          <Card>
            <CardHeader>
              <CardTitle>Billing Type</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingTypeSelector
                billingType={billingType}
                onBillingTypeChange={handleBillingTypeChange}
              />
              
              <div className="mt-6">
                <Tabs value={billingType}>
                  <TabsContent value="hotel">
                    <HotelBillingForm
                      details={hotelDetails}
                      onDetailsChange={setHotelDetails}
                    />
                  </TabsContent>
                  <TabsContent value="grocery">
                    <GroceryBillingForm
                      details={groceryDetails}
                      onDetailsChange={setGroceryDetails}
                    />
                  </TabsContent>
                  <TabsContent value="custom">
                    <CustomBillingForm
                      details={customDetails}
                      onDetailsChange={setCustomDetails}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsTable
                items={items}
                onItemsChange={setItems}
                billingType={billingType}
                billingDetails={getCurrentBillingDetails()}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional notes for this invoice"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <TotalCalculator
            subtotal={subtotal}
            tax={tax}
            taxAmount={taxAmount}
            discount={discount}
            discountAmount={discountAmount}
            total={total}
            onTaxChange={setTax}
            onDiscountChange={setDiscount}
          />
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3">
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={() => handleCreateInvoice('save')}
                >
                  Create & Save Invoice
                </Button>
                
                <Separator />
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Preview Invoice
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Invoice Preview</DialogTitle>
                    </DialogHeader>
                    {userProfile && (
                      <InvoicePreview
                        invoice={{
                          id: "preview",
                          invoiceNumber,
                          issueDate,
                          dueDate: dueDate || undefined,
                          customer,
                          items,
                          subtotal,
                          tax,
                          taxAmount,
                          discount,
                          discountAmount,
                          total,
                          billingType,
                          billingDetails: getCurrentBillingDetails(),
                          notes: notes || undefined,
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                        }}
                        userProfile={userProfile}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleCreateInvoice('pdf')}
                >
                  Generate PDF
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleCreateInvoice('image')}
                >
                  Save as Image
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
