
import { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingType } from "@/lib/storage";

interface BillingTypeSelectorProps {
  billingType: BillingType;
  onBillingTypeChange: (type: BillingType) => void;
}

export default function BillingTypeSelector({
  billingType,
  onBillingTypeChange,
}: BillingTypeSelectorProps) {
  return (
    <Tabs
      defaultValue={billingType}
      value={billingType}
      onValueChange={(value) => onBillingTypeChange(value as BillingType)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="hotel">Hotel</TabsTrigger>
        <TabsTrigger value="grocery">Grocery</TabsTrigger>
        <TabsTrigger value="custom">Custom</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
