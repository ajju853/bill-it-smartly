
import { useTheme } from "@/components/ThemeProvider";
import { formatDate } from "@/lib/utils";
import { 
  Invoice, 
  UserProfile, 
  HotelBillingDetails, 
  GroceryBillingDetails, 
  CustomBillingDetails 
} from "@/lib/storage";

interface InvoicePreviewProps {
  invoice: Invoice;
  userProfile: UserProfile;
}

export default function InvoicePreview({ invoice, userProfile }: InvoicePreviewProps) {
  const { theme } = useTheme();
  const isDarkTheme = theme === "dark";

  const renderBillingDetails = () => {
    switch (invoice.billingType) {
      case 'hotel':
        const hotelDetails = invoice.billingDetails as HotelBillingDetails;
        return (
          <div className="text-sm border-t pt-2 mt-2">
            <p><strong>Room:</strong> {hotelDetails.roomNumber}</p>
            <p><strong>Check-in:</strong> {formatDate(hotelDetails.checkIn)}</p>
            <p><strong>Check-out:</strong> {formatDate(hotelDetails.checkOut)}</p>
            <p><strong>Nights:</strong> {hotelDetails.nights}</p>
          </div>
        );
      case 'grocery':
        const groceryDetails = invoice.billingDetails as GroceryBillingDetails;
        return (
          <div className="text-sm border-t pt-2 mt-2">
            <p><strong>Type:</strong> {groceryDetails.isWeightBased ? 'Weight-based billing' : 'Unit-based billing'}</p>
          </div>
        );
      case 'custom':
        const customDetails = invoice.billingDetails as CustomBillingDetails;
        if (customDetails?.customFields?.length > 0) {
          return (
            <div className="text-sm border-t pt-2 mt-2">
              {customDetails.customFields.map((field, index) => (
                field.key && <p key={index}><strong>{field.key}:</strong> {field.value}</p>
              ))}
            </div>
          );
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <div 
      id="invoice-preview" 
      className={isDarkTheme ? "print-invoice-dark" : "print-invoice"}
    >
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between">
          <div>
            {userProfile.logo && (
              <img 
                src={userProfile.logo} 
                alt={userProfile.businessName} 
                className="h-16 w-auto object-contain mb-2"
              />
            )}
            <h1 className="text-2xl font-bold">{userProfile.businessName}</h1>
            <p className="text-sm">{userProfile.name}</p>
            <p className="text-sm">{userProfile.email}</p>
            {userProfile.phone && <p className="text-sm">{userProfile.phone}</p>}
            {userProfile.address && <p className="text-sm whitespace-pre-line">{userProfile.address}</p>}
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-bold">Invoice</h2>
            <p className="text-sm"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
            <p className="text-sm"><strong>Date:</strong> {formatDate(invoice.issueDate)}</p>
            {invoice.dueDate && (
              <p className="text-sm"><strong>Due Date:</strong> {formatDate(invoice.dueDate)}</p>
            )}
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="border-t border-b py-4">
          <h3 className="font-bold mb-2">Bill To:</h3>
          <p>{invoice.customer.name}</p>
          {invoice.customer.email && <p>{invoice.customer.email}</p>}
          {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
          {invoice.customer.address && <p>{invoice.customer.address}</p>}
          {renderBillingDetails()}
        </div>
        
        {/* Items Table */}
        <div className="border-b">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-1">Item</th>
                <th className="py-2 px-1 text-right">
                  {invoice.billingType === 'grocery' && 
                   (invoice.billingDetails as GroceryBillingDetails)?.isWeightBased 
                    ? 'Weight' : 'Quantity'}
                </th>
                <th className="py-2 px-1 text-right">Unit Price</th>
                <th className="py-2 px-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="invoice-item-row">
                  <td className="py-3 px-1">{item.name}</td>
                  <td className="py-3 px-1 text-right">{item.quantity}</td>
                  <td className="py-3 px-1 text-right">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-3 px-1 text-right">₹{item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span className="font-medium">Subtotal:</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            
            {invoice.tax > 0 && (
              <div className="flex justify-between py-1">
                <span className="font-medium">Tax ({invoice.tax}%):</span>
                <span>₹{invoice.taxAmount?.toFixed(2)}</span>
              </div>
            )}
            
            {invoice.discount > 0 && (
              <div className="flex justify-between py-1">
                <span className="font-medium">Discount ({invoice.discount}%):</span>
                <span>-₹{invoice.discountAmount?.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-2 border-t mt-2 font-bold">
              <span>Total:</span>
              <span>₹{invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {invoice.notes && (
          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Notes:</h3>
            <p className="text-sm whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
