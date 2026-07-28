import * as express from 'express';
import { getDivCodes, getPoDetailRegister, getPoNo, getProjectNames, getStatusOptions, getSupplierNames} from '../controllers/report/po_detail_register';
import passport from 'passport';
import { checkUserAuthorization } from '../middleware/checkUserAthorization';

const router = express.Router();

router.get('/po-no',
            passport.authenticate("jwt", { session: false }),
            checkUserAuthorization,
            getPoNo);
router.get('/po-detail-register',
            passport.authenticate("jwt", { session: false }),
            checkUserAuthorization,
            getPoDetailRegister);
router.get('/project-names',
            passport.authenticate("jwt", { session: false }),
            checkUserAuthorization,
            getProjectNames);
router.get('/supplier-names',
            passport.authenticate("jwt", { session: false }),
            checkUserAuthorization,
            getSupplierNames);
router.get('/status-options',
            passport.authenticate("jwt", { session: false }),
            checkUserAuthorization,
            getStatusOptions);
router.get('/div-codes',
            passport.authenticate("jwt", { session: false }),
            checkUserAuthorization,
            getDivCodes);

export default router;