import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { 
      type: String, 
      required: true,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'],
      uppercase: true
    },
    model: { 
      type: String, 
      required: true,
      enum: ['User', 'Product', 'Category', 'Order', 'Payment', 'Cart', 'Review', 'WebColor'],
      index: true
    },
    modelId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      index: true
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'users', 
      required: true,
      index: true
    },
    userEmail: { 
      type: String, 
      required: false // Store email for reference even if user is deleted
    },
    changes: { 
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    oldValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    newValues: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    ipAddress: {
      type: String,
      required: false
    },
    userAgent: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false,
      maxlength: 500
    },
    timestamp: { 
      type: Date, 
      default: Date.now,
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    }
  },
  { 
    timestamps: true,
    collection: 'auditlogs'
  }
);

// Compound indexes for better query performance
auditLogSchema.index({ model: 1, modelId: 1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ model: 1, action: 1, timestamp: -1 });

// Static method to create audit log entry
auditLogSchema.statics.createLog = async function(logData) {
  try {
    const {
      action,
      model,
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity = 'LOW'
    } = logData;

    const auditLog = new this({
      action: action.toUpperCase(),
      model,
      modelId,
      userId,
      userEmail,
      changes,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
      description,
      severity
    });

    return await auditLog.save();
  } catch (error) {
    throw new Error(`Failed to create audit log: ${error.message}`);
  }
};

// Static method to get logs by user
auditLogSchema.statics.getLogsByUser = function(userId, options = {}) {
  const { limit = 50, skip = 0, startDate, endDate } = options;
  
  let query = { userId };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'cus_firstName cus_lastName cus_email')
    .lean();
};

// Static method to get logs by model
auditLogSchema.statics.getLogsByModel = function(model, modelId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  
  return this.find({ model, modelId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'cus_firstName cus_lastName cus_email')
    .lean();
};

// Static method to get critical logs
auditLogSchema.statics.getCriticalLogs = function(options = {}) {
  const { limit = 100, skip = 0, hours = 24 } = options;
  const timeThreshold = new Date(Date.now() - (hours * 60 * 60 * 1000));
  
  return this.find({
    severity: { $in: ['HIGH', 'CRITICAL'] },
    timestamp: { $gte: timeThreshold }
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'cus_firstName cus_lastName cus_email')
    .lean();
};

// Instance method to format log for display
auditLogSchema.methods.formatForDisplay = function() {
  return {
    id: this._id,
    action: this.action,
    model: this.model,
    modelId: this.modelId,
    user: this.userEmail || 'Unknown',
    description: this.description || `${this.action} operation on ${this.model}`,
    timestamp: this.timestamp,
    severity: this.severity,
    hasChanges: !!(this.changes || this.oldValues || this.newValues)
  };
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
