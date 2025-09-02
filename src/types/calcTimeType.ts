import { DeliveryBatch } from "../schemas/package.schema";
import { FleetCapacity } from "../schemas/fleet.schema";
import { Package } from "../schemas/package.schema";

export type CalcTime =  (deliveryBatch: DeliveryBatch, fleetCapacity: FleetCapacity) => Package[]