const fs = require('fs');
const yaml = require('js-yaml');

const config = yaml.load(fs.readFileSync('./config.yaml', 'utf8'));

async function sendDiscordNotification({ author, message, color }) {
    const payload = {
        author,
        message,
        color,
    };

    try {
        const response = await fetch(`${config.webhooks.url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
        } else {
        }
    } catch (error) {
    }
}

module.exports = sendDiscordNotification;