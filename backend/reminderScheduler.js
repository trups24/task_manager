const cron = require('node-cron');
const Task = require('./models/Task');

function startReminderScheduler() {
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    try {
      const dueTasks = await Task.find({
        reminderAt: { $lte: now },
        reminderFired: false,
        status: { $nin: ['Approved', 'Done'] }
      }).populate('assignedTo', 'username').populate('createdBy', 'username');

      if (!dueTasks.length) return;

      for (const task of dueTasks) {
        const responsible = task.assignedTo || task.createdBy;
        task.history.push({
          action: 'Reminder Triggered',
          user: responsible._id,
          details: `Reminder fired for "${task.title}"`,
          timestamp: now
        });
        task.reminderFired = true;
        await task.save();
        console.log(`[Reminder] Fired for task "${task.title}" (${task._id})`);
      }
    } catch (err) {
      console.error('[Reminder Scheduler] Error:', err.message);
    }
  });

  console.log('⏰ Reminder scheduler started');
}

module.exports = { startReminderScheduler };
