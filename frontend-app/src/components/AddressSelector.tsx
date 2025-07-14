import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
}

export function AddressSelector({ addresses, selectedAddress, onSelect }: AddressSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select Delivery Address</h3>
      <RadioGroup 
        value={selectedAddress ? `${selectedAddress.street}-${selectedAddress.zipCode}` : ""}
        onValueChange={(value) => {
          const [street, zipCode] = value.split('-')
          const address = addresses.find(addr => 
            addr.street === street && addr.zipCode === zipCode
          )
          if (address) onSelect(address)
        }}
      >
        {addresses.map((address, index) => (
          <div key={`${address.street}-${address.zipCode}`} className="flex items-center space-x-2 border p-4 rounded-lg">
            <RadioGroupItem 
              value={`${address.street}-${address.zipCode}`} 
              id={`address-${index}`} 
            />
            <Label htmlFor={`address-${index}`} className="w-full">
              <div className="font-medium">{address.street}</div>
              <div className="text-sm text-gray-600">
                {address.city}, {address.state} - {address.zipCode}
              </div>
              {address.isDefault && (
                <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Default
                </span>
              )}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
