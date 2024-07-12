const {CronJob} = require('cron');
const archivedChats = require('../controllers/archivedChats');

const job = new CronJob(
    '0 0 * * *', // Run at midnight every day
    archivedChats.archiveOldChats, // Function to call
    null, // onComplete
    true, // Start the job right now
    'Asia/Kolkata' // Time zone of this job
);
  
job.start();