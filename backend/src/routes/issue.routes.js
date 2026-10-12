import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadEvidence } from '../middleware/upload.js';
import { addComment, assignIssue, createIssue, dashboardStats, getIssue, listIssues, listOfficers, toggleUpvote, updateIssueStatus, uploadMedia } from '../controllers/issue.controller.js';

const router = Router();
router.use(authenticate);
router.get('/stats', dashboardStats);
router.get('/officers', authorize('admin'), listOfficers);
router.get('/', listIssues);
router.post('/media', uploadEvidence.array('photos', 8), uploadMedia);
router.post('/', authorize('citizen'), createIssue);
router.get('/:id', getIssue);
router.post('/:id/comments', addComment);
router.post('/:id/upvote', authorize('citizen'), toggleUpvote);
router.patch('/:id/status', authorize('admin', 'officer'), updateIssueStatus);
router.patch('/:id/assign', authorize('admin'), assignIssue);
export default router;
