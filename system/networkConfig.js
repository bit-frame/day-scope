const blacklistedIps = [
    { ip: '10.0.0.222', reason: 'test' },
];

const fullyBlacklistedIps = [
    { ip: '10.0.0.153', reason: 'Too many login attempts.'},
    { ip: '10.0.0.226', reason: 'no sus ipads allowed :o'},
    { ip: '10.0.0.149', reason: 'no phones allowed :o'},
];

module.exports = { blacklistedIps, fullyBlacklistedIps };