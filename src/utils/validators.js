const VALID_PRIORITIES = ['LOW','MID','HIGH'];
const VALID_STATUS = ['ALL','PENDING','LATE','DONE'];
const VALID_SORT = ['id','dueDate','title'];

const isValidPriority = p => VALID_PRIORITIES.includes(p);
const isValidStatus = s => VALID_STATUS.includes(s);
const isValidSortBy = s => VALID_SORT.includes(s);
const isValidId = id => !isNaN(parseInt(id));

module.exports = {
  isValidPriority, isValidStatus, isValidSortBy, isValidId
};