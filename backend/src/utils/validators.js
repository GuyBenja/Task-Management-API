const mongoose = require('mongoose');

// Allowed values used throughout task routes
const VALID_PRIORITIES = ['LOW','MID','HIGH'];
const VALID_STATUS = ['ALL','PENDING','LATE','DONE'];
const VALID_SORT = ['id','dueDate','title','priority','status'];

/** Validate task priority value */
const isValidPriority = p => VALID_PRIORITIES.includes(p);
/** Validate task status value */
const isValidStatus = s => VALID_STATUS.includes(s);
/** Validate sorting key */
const isValidSortBy = s => VALID_SORT.includes(s);
/** Validate numeric id (querystring or number) */
const isValidId = id => !isNaN(parseInt(id));
// Validate Mongo ObjectId string
function isValidObjectId(id) {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

module.exports = {
  isValidPriority, isValidStatus, isValidSortBy, isValidId, isValidObjectId
};
