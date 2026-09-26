import fetch from 'node-fetch';
import { config } from '../config/env.js';

export class TelegramService {
  static async sendSecurityAlert({ username, moduleName, attemptCount, ipAddress, timestamp }) {
    const token = config.telegramBotToken;
    const chatId = config.telegramChatId;

    const formattedTime = timestamp || new Date().toISOString();

    const alertMessage = 
`🚨 *SECURITY ALERT* 🚨
--------------------------------------
*Unauthorized Re-Authentication Attempt Detected*

👤 *Attempted Username*: \`${username}\`
📂 *Target Module*: \`${moduleName}\`
⚠️ *Attempt Count*: \`${attemptCount}\`
🌐 *Client IP*: \`${ipAddress}\`
🕒 *Timestamp*: \`${formattedTime}\`
⚡ *Status*: *SUSPICIOUS ACCESS LOCKOUT*
--------------------------------------
_Automated telemetry from Law Enforcement DMS Backend_`;

    console.log('\n================ Telegram Security Alert Payload ================');
    console.log(alertMessage);
    console.log('=================================================================\n');

    if (!token || !chatId || token.includes('SampleTelegramBotTokenHere')) {
      console.warn('⚠️ Telegram Bot Token or Chat ID not configured in .env. Alert logged locally to console & DB.');
      return { success: false, reason: 'Unconfigured Bot Credentials (Logged to System Audit)' };
    }

    try {
      const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: alertMessage,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        console.error('❌ Telegram API error response:', data);
        return { success: false, reason: data.description || 'Telegram API call failed' };
      }

      console.log('✅ Telegram Security Alert successfully dispatched to Chat ID:', chatId);
      return { success: true, messageId: data.result.message_id };
    } catch (err) {
      console.error('❌ Telegram dispatch exception:', err.message);
      return { success: false, reason: err.message };
    }
  }
}
