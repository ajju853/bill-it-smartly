
import { ChangeEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TotalCalculatorProps {
  subtotal: number;
  tax: number;
  taxAmount: number;
  discount: number;
  discountAmount: number;
  total: number;
  onTaxChange: (tax: number) => void;
  onDiscountChange: (discount: number) => void;
}

export default function TotalCalculator({
  subtotal,
  tax,
  taxAmount,
  discount,
  discountAmount,
  total,
  onTaxChange,
  onDiscountChange,
}: TotalCalculatorProps) {
  const handleTaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTax = parseFloat(e.target.value) || 0;
    onTaxChange(newTax);
  };

  const handleDiscountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDiscount = parseFloat(e.target.value) || 0;
    onDiscountChange(newDiscount);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="tax">Tax (%)</Label>
            <Input
              id="tax"
              type="number"
              min="0"
              step="0.01"
              value={tax}
              onChange={handleTaxChange}
              placeholder="Enter tax percentage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={discount}
              onChange={handleDiscountChange}
              placeholder="Enter discount percentage"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Tax ({tax}%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Discount ({discount}%):</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 text-lg font-semibold">
            <span>Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
