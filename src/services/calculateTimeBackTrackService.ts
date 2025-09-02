import { DeliveryBatch, Package } from '../schemas/package.schema';
import { FleetCapacity } from '../schemas/fleet.schema';
import { Shipment } from '../schemas/shipment.schema';

export function calculateDeliveryTimes(deliveryBatch: DeliveryBatch, fleetCapacity: FleetCapacity): Package[] {
    function calculateShipmentTime(shipment: Package[]): number {
        if (shipment.length === 0) return 0;
        const maxDistance = Math.max(...shipment.map(pkg => pkg.distance));
        return (2 * maxDistance) / fleetCapacity.maxSpeed;
    }

    function createAllShipments(packages: Package[]): Shipment[] {
        let bestSolution: Shipment[] = [];
        let bestShipmentCount = Infinity;
        
        const initialShipments: Shipment[] = [{
            packages: [],
            totalWeight: 0,
            totalDeliveryTime: 0
        }];
        
        function backtrack(currentShipments: Shipment[], packageIndex: number): void {
            if (packageIndex === packages.length) {
                if (currentShipments.length < bestShipmentCount) {
                    bestShipmentCount = currentShipments.length;
                    bestSolution = currentShipments.map(shipment => ({
                        packages: [...shipment.packages],
                        totalWeight: shipment.totalWeight,
                        totalDeliveryTime: shipment.totalDeliveryTime
                    }));
                }
                return;
            }
            
            if (currentShipments.length >= bestShipmentCount) {
                return;
            }
            
            const currentPackage = packages[packageIndex];
            
            for (let i = 0; i < currentShipments.length; i++) {
                const shipment = currentShipments[i];
                
                if (shipment.totalWeight + currentPackage.weight <= fleetCapacity.maxCarriableWeight) {
                    shipment.packages.push(currentPackage);
                    shipment.totalWeight += currentPackage.weight;
                    
                    backtrack(currentShipments, packageIndex + 1);
                    
                    shipment.packages.pop();
                    shipment.totalWeight -= currentPackage.weight;
                }
            }
            
            const newShipment: Shipment = {
                packages: [currentPackage],
                totalWeight: currentPackage.weight,
                totalDeliveryTime: 0
            };
            
            currentShipments.push(newShipment);
            backtrack(currentShipments, packageIndex + 1);
            currentShipments.pop();
        }
        
        backtrack(initialShipments, 0);
        
        bestSolution.forEach(shipment => {
            shipment.totalDeliveryTime = calculateShipmentTime(shipment.packages);
        });
       
        // based on assignment document
        bestSolution.sort((a, b) => {
            if (b.packages.length !== a.packages.length) {
                return b.packages.length - a.packages.length;
            }
            if (b.totalWeight !== a.totalWeight) {
                return b.totalWeight - a.totalWeight;
            }
            return a.totalDeliveryTime - b.totalDeliveryTime;
        });
        
        return bestSolution;
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
