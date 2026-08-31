// routes/budgetStatus.routes.ts
import express from 'express';
import { getBudgetStatusSummary } from '../controllers/budgetStatus.controller';

const router = express.Router();

router.get('/budget-status', getBudgetStatusSummary);

export default router;