const db = require('../database/database');

async function getConfigValues() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM config WHERE name IN (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'protocol',
      'hostname',
      'username',
      'password',
      'port',
      'ip_allowed',
      'telegram_bot_token',
      'telegram_id',
      'telegram_notification',
      'telegram_notification_start_playback',
      'telegram_notification_start_playback_text',
      'telegram_notification_stop_playback',
      'telegram_notification_stop_playback_text',
      'telegram_notification_start_recording',
      'telegram_notification_start_recording_text',
      'telegram_notification_stop_recording',
      'telegram_notification_stop_recording_text',
      'telegram_notification_time',
      'telegram_notification_time_text',
      'telegram_time_limit',
      'telegram_notification_ip_not_allowed',
      'telegram_notification_ip_not_allowed_text'
    ], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const configValues = {};
        rows.forEach((row) => {
          configValues[row.name] = row.value;
        });
        resolve(configValues);
      }
    });
  });
}

module.exports = {
  getConfigValues,
};
