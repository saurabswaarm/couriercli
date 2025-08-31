import { DeliveryBatch, Package } from '../schemas/package.schema';
import { FleetCapacity } from '../schemas/fleet.schema';
import { Bill } from '../schemas/bill.schema';

/**
 * Calculate delivery times for packages using a fleet of vehicles
 * @param deliveryBatch - The batch of packages to deliver
 * @param fleetCapacity - The capacity and specifications of the delivery fleet
 * @returns An array of bills with delivery times for each package
 */
export function calculateDeliveryTimes(deliveryBatch: DeliveryBatch, fleetCapacity: FleetCapacity): Bill[] {
  // Helper function to find the next available vehicle
  function findNextAvailableVehicle(vehicleReturnTimes: number[]): number {
    let minTime = vehicleReturnTimes[0];
    let minIndex = 0;
    
    for (let i = 1; i < vehicleReturnTimes.length; i++) {
      if (vehicleReturnTimes[i] < minTime) {
        minTime = vehicleReturnTimes[i];
        minIndex = i;
      }
    }
    
    return minIndex;
  }

  // Helper function to create a shipment of packages for a vehicle
  function createShipment(packages: Package[]): Package[] {
    // Greedy approach: select packages with maximum count that fit in vehicle capacity
    const shipment: Package[] = [];
    let currentWeight = 0;
    
    // Sort packages by weight (descending) to prefer heavier packages
    const sortedPackages = [...packages].sort((a, b) => b.weight - a.weight);
    
    for (let i = 0; i < sortedPackages.length; i++) {
      const pkg = sortedPackages[i];
      
      // Check if adding this package exceeds the vehicle capacity
      if (currentWeight + pkg.weight <= fleetCapacity.maxCarriableWeight) {
        shipment.push(pkg);
        currentWeight += pkg.weight;
        
        // Remove this package from the available packages
        const indexInOriginal = packages.indexOf(pkg);
        if (indexInOriginal !== -1) {
          packages.splice(indexInOriginal, 1);
        }
      }
    }
    
    return shipment;
  }

  // Helper function to calculate the time needed for a shipment
  function calculateShipmentTime(shipment: Package[]): number {
    if (shipment.length === 0) return 0;
    
    // Find the maximum distance in the shipment (longest delivery)
    const maxDistance = Math.max(...shipment.map(pkg => pkg.distance));
    
    // Time = distance / speed (for delivery) + distance / speed (for return)
    // Since delivery and return distances are the same, it's 2 * time
    return (2 * maxDistance) / fleetCapacity.maxSpeed;
  }

  // Create a copy of packages to avoid modifying the original
  const packages = [...deliveryBatch.packages];
  
  // Sort packages by weight (descending) for consistent ordering
  packages.sort((a, b) => b.weight - a.weight);
  
  // Initialize delivery times for all packages
  const deliveryTimes: Record<string, number> = {};
  
  // Track vehicle availability (time when each vehicle returns)
  const vehicleReturnTimes: number[] = new Array(fleetCapacity.numberOfVehicles).fill(0);
  
  // Group packages into shipments using greedy approach
  while (packages.length > 0) {
    // Find the next available vehicle
    const nextVehicleIndex = findNextAvailableVehicle(vehicleReturnTimes);
    const vehicleReturnTime = vehicleReturnTimes[nextVehicleIndex];
    
    // Create a shipment for this vehicle
    const shipment = createShipment(packages);
    
    // Calculate delivery time for this shipment
    const deliveryTime = vehicleReturnTime + calculateShipmentTime(shipment);
    
    // Update delivery times for all packages in this shipment
    shipment.forEach(pkg => {
      deliveryTimes[pkg.packageId] = deliveryTime;
    });
    
    // Update vehicle return time (vehicle returns after delivering the last package)
    vehicleReturnTimes[nextVehicleIndex] = deliveryTime;
  }
  
  // Convert delivery times to bills
  return deliveryBatch.packages.map(pkg => ({
    packageId: pkg.packageId,
    discount: 0, // No discount calculation for time
    totalCost: 0, // No cost calculation for time
    deliveryTime: deliveryTimes[pkg.packageId]
  }));
}
