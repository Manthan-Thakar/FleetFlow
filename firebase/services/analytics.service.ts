// firebase/services/analytics.service.ts
import { db } from '@/firebase/config/firebaseConfig';
import { query, collection, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Vehicle, Shift } from '@/types';

/**
 * Get fleet analytics for a company
 */
export const getFleetAnalytics = async (companyId: string) => {
  try {
    // Get all vehicles for the company
    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('companyId', '==', companyId)
    );
    const vehiclesSnapshot = await getDocs(vehiclesQuery);
    const vehicles = vehiclesSnapshot.docs.map(doc => doc.data()) as Vehicle[];

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === 'active').length;
    const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length;
    const inactiveVehicles = vehicles.filter(v => v.status === 'inactive').length;

    // Calculate utilization (vehicles with assignments)
    const assignedVehicles = vehicles.filter(v => v.assignedDriverId).length;
    const utilizationRate = totalVehicles > 0 ? (assignedVehicles / totalVehicles) * 100 : 0;

    // Average fuel efficiency
    const vehiclesWithFuelData = vehicles.filter(v => v.fuelEfficiency);
    const avgFuelEfficiency = vehiclesWithFuelData.length > 0
      ? vehiclesWithFuelData.reduce((sum, v) => sum + (v.fuelEfficiency || 0), 0) / vehiclesWithFuelData.length
      : 0;

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      inactiveVehicles,
      assignedVehicles,
      utilizationRate: parseFloat(utilizationRate.toFixed(2)),
      avgFuelEfficiency: parseFloat(avgFuelEfficiency.toFixed(2)),
    };
  } catch (error: any) {
    console.error('Error fetching fleet analytics:', error);
    throw new Error(error.message || 'Failed to fetch fleet analytics');
  }
};

/**
 * Get fuel consumption analytics
 */
export const getFuelAnalytics = async (companyId: string) => {
  try {
    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('companyId', '==', companyId)
    );
    const vehiclesSnapshot = await getDocs(vehiclesQuery);
    const vehicles = vehiclesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as (Vehicle & { id: string })[];

    // Sort by efficiency
    const sortedByEfficiency = [...vehicles].sort((a, b) => (b.fuelEfficiency || 0) - (a.fuelEfficiency || 0));

    const mostEfficientVehicle = sortedByEfficiency.length > 0
      ? {
          id: sortedByEfficiency[0].id,
          name: `${sortedByEfficiency[0].make} ${sortedByEfficiency[0].model}`,
          efficiency: sortedByEfficiency[0].fuelEfficiency || 0,
        }
      : null;

    const leastEfficientVehicle = sortedByEfficiency.length > 0
      ? {
          id: sortedByEfficiency[sortedByEfficiency.length - 1].id,
          name: `${sortedByEfficiency[sortedByEfficiency.length - 1].make} ${sortedByEfficiency[sortedByEfficiency.length - 1].model}`,
          efficiency: sortedByEfficiency[sortedByEfficiency.length - 1].fuelEfficiency || 0,
        }
      : null;

    const avgFuelEfficiency = vehicles.filter(v => v.fuelEfficiency).length > 0
      ? vehicles.filter(v => v.fuelEfficiency).reduce((sum, v) => sum + (v.fuelEfficiency || 0), 0) / vehicles.filter(v => v.fuelEfficiency).length
      : 0;

    return {
      totalVehicles: vehicles.length,
      mostEfficientVehicle,
      leastEfficientVehicle,
      avgFuelEfficiency: parseFloat(avgFuelEfficiency.toFixed(2)),
    };
  } catch (error: any) {
    console.error('Error fetching fuel analytics:', error);
    throw new Error(error.message || 'Failed to fetch fuel analytics');
  }
};

/**
 * Get cost analytics (estimated based on available data)
 */
export const getCostAnalytics = async (companyId: string) => {
  try {
    const vehiclesQuery = query(
      collection(db, 'vehicles'),
      where('companyId', '==', companyId)
    );
    const vehiclesSnapshot = await getDocs(vehiclesQuery);
    const vehicles = vehiclesSnapshot.docs.map(doc => doc.data()) as Vehicle[];

    // Calculate estimated costs based on vehicle fuel consumption
    const estimatedMonthlyFuelCost = vehicles
      .filter(v => v.fuelEfficiency)
      .reduce((sum, v) => {
        const estimatedMonthlyLiters = (1000 / (v.fuelEfficiency || 1)) * 30; // Assume 1000km/month
        const fuelCostPerLiter = 2.5; // Example: $2.50 per liter
        return sum + estimatedMonthlyLiters * fuelCostPerLiter;
      }, 0);

    // Estimate maintenance cost (rough estimate)
    const estimatedMonthlyMaintenanceCost = vehicles.length * 150; // Estimate $150 per vehicle per month

    const totalEstimatedMonthlyCost = estimatedMonthlyFuelCost + estimatedMonthlyMaintenanceCost;

    return {
      estimatedMonthlyFuelCost: parseFloat(estimatedMonthlyFuelCost.toFixed(2)),
      estimatedMonthlyMaintenanceCost: parseFloat(estimatedMonthlyMaintenanceCost.toFixed(2)),
      totalEstimatedMonthlyCost: parseFloat(totalEstimatedMonthlyCost.toFixed(2)),
      costPerVehicle: vehicles.length > 0 ? parseFloat((totalEstimatedMonthlyCost / vehicles.length).toFixed(2)) : 0,
    };
  } catch (error: any) {
    console.error('Error fetching cost analytics:', error);
    throw new Error(error.message || 'Failed to fetch cost analytics');
  }
};
