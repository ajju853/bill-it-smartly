
import { ChangeEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HotelBillingDetails } from "@/lib/storage";

interface HotelBillingFormProps {
  details: HotelBillingDetails;
  onDetailsChange: (details: HotelBillingDetails) => void;
}

export default function HotelBillingForm({
  details,
  onDetailsChange,
}: HotelBillingFormProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "checkIn" || name === "checkOut") {
      const updatedDetails = {
        ...details,
        [name]: value,
      };
      
      // Calculate nights if both dates are present
      if (updatedDetails.checkIn && updatedDetails.checkOut) {
        const checkIn = new Date(updatedDetails.checkIn);
        const checkOut = new Date(updatedDetails.checkOut);
        
        if (!isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
          const diffTime = checkOut.getTime() - checkIn.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Only update if valid date range (positive days)
          if (diffDays > 0) {
            updatedDetails.nights = diffDays;
          }
        }
      }
      
      onDetailsChange(updatedDetails);
    } else if (name === "nights") {
      onDetailsChange({
        ...details,
        nights: parseInt(value) || 0,
      });
    } else {
      onDetailsChange({
        ...details,
        [name]: value,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hotel Billing Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber" className="required">Room Number</Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              value={details.roomNumber}
              onChange={handleChange}
              placeholder="Enter room number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nights" className="required">Number of Nights</Label>
            <Input
              id="nights"
              name="nights"
              type="number"
              min="1"
              value={details.nights}
              onChange={handleChange}
              placeholder="Enter number of nights"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="checkIn" className="required">Check-in Date</Label>
            <Input
              id="checkIn"
              name="checkIn"
              type="date"
              value={details.checkIn}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="checkOut" className="required">Check-out Date</Label>
            <Input
              id="checkOut"
              name="checkOut"
              type="date"
              value={details.checkOut}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
