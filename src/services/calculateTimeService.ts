import { DeliveryBatch, Package } from '../schemas/package.schema';
import { FleetCapacity } from '../schemas/fleet.schema';
import { Shipment } from '../schemas/shipment.schema';

/**
 * Calculate delivery times for packages using a fleet of vehicles
 * @param deliveryBatch - The batch of packages to deliver
 * @param fleetCapacity - The capacity and specifications of the delivery fleet
 * @returns An array of packages with delivery times for each package
 */
export function calculateDeliveryTimes(deliveryBatch: DeliveryBatch, fleetCapacity: FleetCapacity): Package[] {
    function calculateShipmentTime(shipment: Package[]): number {
        if (shipment.length === 0) return 0;
        const maxDistance = Math.max(...shipment.map(pkg => pkg.distance));
        return (2 * maxDistance) / fleetCapacity.maxSpeed;
    }

    function createAllShipments(packages: Package[]): Shipment[] {
        const remainingPackages = [...packages];
        const shipments: Shipment[] = [];

        while (remainingPackages.length > 0) {
            const shipmentPackages: Package[] = [];
            let currentWeight = 0;
            
            remainingPackages.sort((a, b) => b.weight - a.weight);
            
            for (let i = 0; i < remainingPackages.length; i++) {
                const pkg = remainingPackages[i];
                
                if (currentWeight + pkg.weight <= fleetCapacity.maxCarriableWeight) {
                    shipmentPackages.push(pkg);
                    currentWeight += pkg.weight;
                }
            }
            
            // removal in reverse to avoid index issues
            for (let i = shipmentPackages.length - 1; i >= 0; i--) {
                const pkg = shipmentPackages[i];
                const index = remainingPackages.indexOf(pkg);
                if (index !== -1) {
                    remainingPackages.splice(index, 1);
                }
            }
            
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

    const deliveryTimes: Record<string, number> = {};
    const vehicleReturnTimes: number[] = new Array(fleetCapacity.numberOfVehicles).fill(0);
    const remainingShipments = [...createAllShipments(deliveryBatch.packages)];

    while (remainingShipments.length > 0) {
        const nextVehicleIndex = vehicleReturnTimes.indexOf(Math.min(...vehicleReturnTimes));
        const vehicleReturnTime = vehicleReturnTimes[nextVehicleIndex];

        const shipment = remainingShipments.shift()!;
        const deliveryTime = vehicleReturnTime + shipment.totalDeliveryTime;

        shipment.packages.forEach(pkg => {
            deliveryTimes[pkg.packageId] = vehicleReturnTime + (pkg.distance / fleetCapacity.maxSpeed)
        });

        vehicleReturnTimes[nextVehicleIndex] = deliveryTime;
    }

    return deliveryBatch.packages.map(pkg => ({
        packageId: pkg.packageId,
        weight: pkg.weight,
        distance: pkg.distance,
        offerCode: pkg.offerCode,
        deliveryTime: deliveryTimes[pkg.packageId]
    }));
}
