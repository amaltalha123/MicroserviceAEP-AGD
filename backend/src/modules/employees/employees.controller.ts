import { Request, Response } from 'express';
import { EmployeesService } from './employees.service';
const service = new EmployeesService();
export class EmployeesController {
    async getAll(req: Request, res: Response) {
        try {
        const employees = await service.getAllEmployees();
        res.json(employees);
        } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
        }
    }
    async getAvailable(req: Request, res: Response) {
        try {
        const { serviceType } = req.params;
        const employees = await service.getAvailableEmployees(
        serviceType as any
        );
        res.json(employees);
        } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
        }
    }
}
