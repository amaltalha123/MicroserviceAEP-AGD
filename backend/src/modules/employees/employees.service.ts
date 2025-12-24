import prisma from '../../config/database';
export class EmployeesService {
    async getAllEmployees() {
        return await prisma.employees.findMany({
            where: { is_active: true },
            });
            }
            async getEmployeeById(id: string) {
            return await prisma.employees.findUnique({
            where: { id },
        });
    }
    async getAvailableEmployees(serviceType: 'lighting' | 'waste') {
        return await prisma.employees.findMany({
            where: {
            service_type: serviceType,
            status: 'available',
            is_active: true,
            },
            orderBy: [
            { total_interventions: 'asc' },
            { created_at: 'asc' },
            ],
        });
    }
    async updateEmployeeStatus(
        id: string,
        status: 'available' | 'unavailable'
        ) {
        return await prisma.employees.update({
        where: { id },
        data: { status },
        });
    }
}