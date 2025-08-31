import { DeliveryBatch, Package } from '../schemas/package.schema';
import { FleetCapacity } from '../schemas/fleet.schema';
import { Shipment } from '../schemas/shipment.schema';

/**
 * Calculate delivery times for packages using a fleet of vehicles
 * @param deliveryBatch - The batch of packages to deliver
 * @param fleetCapacity - The capacity and specifications of the delivery fleet
 * @returns An array of bills with delivery times for each package
 */
export function calculateDeliveryTimes(deliveryBatch: DeliveryBatch, fleetCapacity: FleetCapacity): Package[] {
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

    // Helper function to calculate the time needed for a shipment
    function calculateShipmentTime(shipment: Package[]): number {
        if (shipment.length === 0) return 0;

        // Find the maximum distance in the shipment (longest delivery)
        const maxDistance = Math.max(...shipment.map(pkg => pkg.distance));

        // Time = distance / speed (for delivery) + distance / speed (for return)
        // Since delivery and return distances are the same, it's 2 * time
        return (2 * maxDistance) / fleetCapacity.maxSpeed;
    }

    // Create all possible shipments
    function createAllShipments(packages: Package[]): Shipment[] {
        // Create a working copy of packages
        const remainingPackages = [...packages];
        const shipments: Shipment[] = [];

        while (remainingPackages.length > 0) {
            // Create a shipment with maximum packages that fit in vehicle capacity
            const shipmentPackages: Package[] = [];
            let currentWeight = 0;
            
            // Sort packages by weight (descending) to try to fit packages better
            remainingPackages.sort((a, b) => b.weight - a.weight);
            
            // Create a shipment with maximum packages that fit in vehicle capacity
            for (let i = 0; i < remainingPackages.length; i++) {
                const pkg = remainingPackages[i];
                
                // Check if adding this package exceeds the vehicle capacity
                if (currentWeight + pkg.weight <= fleetCapacity.maxCarriableWeight) {
                    shipmentPackages.push(pkg);
                    currentWeight += pkg.weight;
                }
            }
            
            // Remove selected packages from remaining packages
            // We need to remove them in reverse order to avoid index issues
            for (let i = shipmentPackages.length - 1; i >= 0; i--) {
                const pkg = shipmentPackages[i];
                const index = remainingPackages.indexOf(pkg);
                if (index !== -1) {
                    remainingPackages.splice(index, 1);
                }
            }
            
            // Only add shipment if it contains packages
            if (shipmentPackages.length > 0) {
                const totalDeliveryTime = calculateShipmentTime(shipmentPackages);
                shipments.push({
                    packages: shipmentPackages,
                    totalWeight: shipmentPackages.reduce((sum, pkg) => sum + pkg.weight, 0),
                    totalDeliveryTime
                });
            }
        }

        // Sort shipments by number of packages (descending), then by total weight (descending), then by delivery time (ascending)
        shipments.sort((a, b) => {
            if (b.packages.length !== a.packages.length) {
                return b.packages.length - a.packages.length;
            }
            if (b.totalWeight !== a.totalWeight) {
                return b.totalWeight - a.totalWeight;
            }
            return a.totalDeliveryTime - b.totalDeliveryTime;
        });

        return shipments;
    }

    const packages = [...deliveryBatch.packages];
    const deliveryTimes: Record<string, number> = {};
    const vehicleReturnTimes: number[] = new Array(fleetCapacity.numberOfVehicles).fill(0);
    const remainingShipments = [...createAllShipments(packages)];

    while (remainingShipments.length > 0) {
        // Find the next available vehicle
        const nextVehicleIndex = findNextAvailableVehicle(vehicleReturnTimes);
        const vehicleReturnTime = vehicleReturnTimes[nextVehicleIndex];

        // Take the first shipment (already sorted by priority)
        const shipment = remainingShipments.shift()!;

        // Calculate delivery time for this shipment
        const deliveryTime = vehicleReturnTime + shipment.totalDeliveryTime;

        // Update delivery times for all packages in this shipment
        shipment.packages.forEach(pkg => {
            deliveryTimes[pkg.packageId] = vehicleReturnTime + (pkg.distance / fleetCapacity.maxSpeed)
        });

        // Update vehicle return time
        vehicleReturnTimes[nextVehicleIndex] = deliveryTime;
    }

    // Convert delivery times to bills
    return deliveryBatch.packages.map(pkg => ({
        packageId: pkg.packageId,
        weight: pkg.weight,
        distance: pkg.distance,
        deliveryTime: deliveryTimes[pkg.packageId]
    }));
}
