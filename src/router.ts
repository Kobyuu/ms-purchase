import { Router } from 'express';
import { handleInputErrors } from './middleware/handleInputErrors';
import { PurchaseController } from './controllers/purchaseController';

const router = Router();

// Ruta para obtener todas las compras
router.get('/', handleInputErrors, PurchaseController.getPurchases);

// Ruta para crear una nueva compra
router.post('/', handleInputErrors, PurchaseController.createPurchase);

// Ruta para eliminar una compra
router.delete('/:id', handleInputErrors, PurchaseController.deletePurchase);

export default router;