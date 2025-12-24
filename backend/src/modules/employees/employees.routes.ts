import { Router } from 'express';
import { EmployeesController } from './employees.controller';
const router = Router();
const controller = new EmployeesController();
router.get('/', controller.getAll);
router.get('/available/:serviceType', controller.getAvailable);
export default router;