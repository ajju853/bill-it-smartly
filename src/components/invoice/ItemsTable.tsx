
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { InvoiceItem, BillingType, GroceryBillingDetails } from "@/lib/storage";

interface ItemsTableProps {
  items: InvoiceItem[];
  onItemsChange: (items: InvoiceItem[]) => void;
  billingType: BillingType;
  billingDetails?: any;
}

export default function ItemsTable({
  items,
  onItemsChange,
  billingType,
  billingDetails,
}: ItemsTableProps) {
  const isWeightBased = billingType === "grocery" && (billingDetails as GroceryBillingDetails)?.isWeightBased;
  
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    
    // Recalculate amount
    if (field === "quantity" || field === "unitPrice") {
      const quantity = field === "quantity" ? Number(value) : updatedItems[index].quantity;
      const unitPrice = field === "unitPrice" ? Number(value) : updatedItems[index].unitPrice;
      updatedItems[index].amount = quantity * unitPrice;
    }
    
    onItemsChange(updatedItems);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: crypto.randomUUID(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };
    
    onItemsChange([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Item</TableHead>
              <TableHead className="w-[15%] text-right">{isWeightBased ? "Weight" : "Quantity"}</TableHead>
              <TableHead className="w-[20%] text-right">Unit Price</TableHead>
              <TableHead className="w-[20%] text-right">Amount</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No items added yet. Click "Add Item" to add items to the invoice.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, "name", e.target.value)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min="0"
                      step={isWeightBased ? "0.01" : "1"}
                      placeholder={isWeightBased ? "Weight" : "Quantity"}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                      className="text-right"
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{item.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-start">
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="h-4 w-4 mr-1" /> Add Item
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2 items-end mt-6">
          <div className="flex justify-between w-full md:w-72">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="font-medium">
              ₹{items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
