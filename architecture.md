# Courier CLI Architecture

## Overview

The Courier CLI is a command-line application built with TypeScript that calculates delivery costs and times for packages based on various parameters such as weight, distance, and fleet capacity. The application uses a modular architecture with clear separation of concerns to ensure maintainability and testability.

## System Components

### 1. Command Layer

Commands act as the entry point for user interactions, handling input collection through interactive prompts and orchestrating the business logic.

**Key Components:**
- `CalculateCostCommand`: Handles the calculation of delivery costs for packages
- `CalculateTimeCommand`: Manages the calculation of delivery times based on package and fleet details

### 2. Service Layer

Services contain the core business logic of the application, implementing algorithms for cost calculation and delivery time estimation.

**Key Components:**
- `CalculateCostService`: Implements logic for calculating delivery costs, including discount application
- `CalculateTimeService`: Implements the algorithm for calculating optimal delivery times based on package characteristics and fleet capacity

### 3. Schema Layer

Schemas define the data structures used throughout the application and provide validation using Zod.

**Key Components:**
- `PackageSchema`: Defines the structure of package data
- `FleetSchema`: Defines the structure of fleet capacity data
- `CouponSchema`: Defines the structure of coupon/discount data
- `RateSchema`: Defines the rate configuration for cost calculation
- `ShipmentSchema`: Defines the structure of shipment data (grouping of packages)

### 4. Utility Layer

Utilities provide helper functions for validation, processing, and configuration loading.

**Key Components:**
- `ValidationUtils`: Functions for validating user input
- `ProcessingUtils`: Functions for processing and transforming user input
- `ConfigLoader`: Functions for loading configuration from JSON files
- `ConfigValidationUtils`: Functions for validating configuration data

## Data Flow

1. **User Input Collection**:
   - The Command Layer collects user input through interactive prompts using Inquirer
   - Input is validated using validation utilities

2. **Input Processing**:
   - Raw user input is processed and transformed into structured data objects
   - Data is validated against schemas

3. **Business Logic Execution**:
   - Services perform calculations based on the processed input
   - Configuration data is loaded from configuration files

4. **Result Output**:
   - Results are formatted and displayed to the user via the command line

## Key Algorithms

### Cost Calculation Algorithm
- Base delivery cost plus weighted factors for package weight and distance
- Discount application based on coupon codes and conditions
- Validation of final costs

### Delivery Time Calculation Algorithm
- Creation of optimal shipments based on vehicle capacity constraints
- Priority-based scheduling of shipments
- Calculation of delivery and return times
- Vehicle allocation for efficient delivery

## Configuration

The application uses JSON configuration files stored in the `configs/` directory:
- `rate-config.json`: Defines the rate multipliers for weight and distance
- `coupon-config.json`: Defines available coupon codes and their conditions

## Testing Strategy

The project employs Jest for testing with:
- Unit tests for individual services (`*.test.ts`)
- Command prompt tests for testing user interactions (`*.prompts.test.ts`)
- Tests focused on both functionality and user experience

## Design Patterns

1. **Command Pattern**: 
   - Commands encapsulate all information needed to perform an action

2. **Service Layer Pattern**: 
   - Business logic is separated into service classes

3. **Data Transfer Object (DTO) Pattern**: 
   - Structured objects for transferring data between components

4. **Factory Pattern**: 
   - Creation of complex objects like shipments

5. **Validation Chain**: 
   - Multiple validation steps to ensure data integrity

## Dependencies

- TypeScript: Static typing for improved code quality
- Inquirer: Interactive command-line user interfaces
- Zod: Schema validation
- Jest: Testing framework
