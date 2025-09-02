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
        const sortedPackages = [...packages].sort((a, b) => b.weight - a.weight);
        const shipments: Shipment[] = [];

        for (const pkg of sortedPackages) {
            let bestShipmentIndex = -1;
            let minLeftoverCapacity = Infinity;
            
            for (let i = 0; i < shipments.length; i++) {
                const shipment = shipments[i];
                const newTotalWeight = shipment.totalWeight + pkg.weight;
                
                if (newTotalWeight <= fleetCapacity.maxCarriableWeight) {
                    const leftoverCapacity = fleetCapacity.maxCarriableWeight - newTotalWeight;
                    if (leftoverCapacity < minLeftoverCapacity) {
                        minLeftoverCapacity = leftoverCapacity;
                        bestShipmentIndex = i;
                    }
                }
            }
            
            if (bestShipmentIndex !== -1) {
                shipments[bestShipmentIndex].packages.push(pkg);
                shipments[bestShipmentIndex].totalWeight += pkg.weight;
            } else {
                const totalDeliveryTime = calculateShipmentTime([pkg]);
                shipments.push({
                    packages: [pkg],
                    totalWeight: pkg.weight,
                    totalDeliveryTime
                });
            }
        }

        shipments.forEach(shipment => {
            shipment.totalDeliveryTime = calculateShipmentTime(shipment.packages);
        });

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
