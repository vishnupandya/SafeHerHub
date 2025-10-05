const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Report = require('../models/Report');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/evidence/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|pdf|doc|docx/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

// Create a new report
router.post('/', auth, upload.array('evidence', 5), [
  body('type').isIn(['incident', 'harassment', 'safety_concern', 'positive_experience', 'tip']).withMessage('Invalid report type'),
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('coordinates').isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of 2 numbers'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('isAnonymous').optional().isBoolean().withMessage('Is anonymous must be boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      title,
      description,
      coordinates,
      address,
      neighborhood,
      city,
      timestamp,
      severity = 'medium',
      isAnonymous = false,
      tags = [],
      voiceTranscription
    } = req.body;

    // Handle file uploads
    const evidence = req.files ? req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'photo' :
            file.mimetype.startsWith('video/') ? 'video' :
            file.mimetype.startsWith('audio/') ? 'audio' : 'document',
      url: `/uploads/evidence/${file.filename}`,
      filename: file.originalname
    })) : [];

    const report = new Report({
      user: req.user.id,
      type,
      title,
      description,
      location: {
        type: 'Point',
        coordinates: coordinates,
        address,
        neighborhood,
        city
      },
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      severity,
      isAnonymous,
      tags,
      evidence,
      voiceTranscription: voiceTranscription ? JSON.parse(voiceTranscription) : null
    });

    await report.save();

    // Analyze patterns
    report.analyzePatterns();

    // Find similar reports
    const similarReports = await report.findSimilarReports();
    report.similarReports = similarReports.map(similar => ({
      reportId: similar._id,
      similarityScore: 0.8 // Simplified similarity score
    }));

    await report.save();

    res.status(201).json({
      message: 'Report created successfully',
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reports
router.get('/my-reports', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status } = req.query;
    const query = { user: req.user.id };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name profile.avatar');

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get user reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public reports
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, type, city, radius = 1000 } = req.query;
    const query = { isPublic: true, status: 'submitted' };
    
    if (type) query.type = type;
    if (city) query['location.city'] = city;

    let reports;
    
    if (req.query.coordinates) {
      const coordinates = JSON.parse(req.query.coordinates);
      reports = await Report.find({
        ...query,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: radius
          }
        }
      });
    } else {
      reports = await Report.find(query);
    }

    reports = reports
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name profile.avatar');

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get public reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report by ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name profile.avatar')
      .populate('comments.user', 'name profile.avatar');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Increment view count
    report.views += 1;
    await report.save();

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('status').optional().isIn(['draft', 'submitted', 'under_review', 'resolved', 'archived']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user owns the report
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this report' });
    }

    const updates = req.body;
    Object.assign(report, updates);
    
    await report.save();

    res.json({
      message: 'Report updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Check if user owns the report
    if (report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to report
router.post('/:id/comments', auth, [
  body('text').trim().isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
  body('isAnonymous').optional().isBoolean().withMessage('Is anonymous must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, isAnonymous = false } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const comment = {
      user: req.user.id,
      text,
      isAnonymous
    };

    report.comments.push(comment);
    await report.save();

    res.json({
      message: 'Comment added successfully',
      comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote on report
router.post('/:id/vote', auth, [
  body('vote').isIn(['up', 'down']).withMessage('Vote must be either up or down')
], async (req, res) => {
  try {
    const { vote } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (vote === 'up') {
      report.upvotes += 1;
    } else {
      report.downvotes += 1;
    }

    await report.save();

    res.json({
      message: 'Vote recorded successfully',
      upvotes: report.upvotes,
      downvotes: report.downvotes
    });
  } catch (error) {
    console.error('Vote on report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get report statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Report.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalUpvotes: { $sum: '$upvotes' },
          averageSafetyScore: { $avg: '$safetyScore' },
          reportsByType: {
            $push: {
              type: '$type',
              severity: '$severity'
            }
          }
        }
      }
    ]);

    res.json(stats[0] || {
      totalReports: 0,
      totalViews: 0,
      totalUpvotes: 0,
      averageSafetyScore: 0,
      reportsByType: []
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safety heatmap data
router.get('/heatmap/data', async (req, res) => {
  try {
    const { city, type, days = 30 } = req.query;
    const query = { isPublic: true, status: 'submitted' };
    
    if (city) query['location.city'] = city;
    if (type) query.type = type;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query.createdAt = { $gte: startDate };

    const heatmapData = await Report.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            lat: { $arrayElemAt: ['$location.coordinates', 1] },
            lng: { $arrayElemAt: ['$location.coordinates', 0] }
          },
          count: { $sum: 1 },
          averageSeverity: { $avg: { $cond: [
            { $eq: ['$severity', 'critical'] }, 4,
            { $cond: [{ $eq: ['$severity', 'high'] }, 3,
              { $cond: [{ $eq: ['$severity', 'medium'] }, 2, 1] }
            ]}
          ]},
          types: { $addToSet: '$type' }
        }
      },
      {
        $project: {
          lat: '$_id.lat',
          lng: '$_id.lng',
          count: 1,
          averageSeverity: 1,
          types: 1,
          _id: 0
        }
      }
    ]);

    res.json(heatmapData);
  } catch (error) {
    console.error('Get heatmap data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
