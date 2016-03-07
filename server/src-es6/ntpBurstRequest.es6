const delay = require('delay');

/**
 * Creates a promise that resolves with an Date object after a successful burst of X NTP server queries
 * @return {Promise} Promise that either resolves with successful average Date object or an NTP server communication
 * error
 */
function ntpDatePromiseBurst(iLocalClockService, iNTPSingleRequestPromiseFunc) {

    return new Promise((iResolve, iReject) => {
        var burstArray = [];
        var p = Promise.resolve();
        for (let i = 0; i < 4; i += 1) {
            // Chain the promises interleaved with the 'delay' passthrough promise, that resolves after X ms
            // https://github.com/sindresorhus/delay
            p = p
                .then(delay(100))
                .then((iRes) => {
                    if (typeof iRes !== 'undefined' && iRes !== null) {
                        burstArray.push(iRes);
                    }
                    return iNTPSingleRequestPromiseFunc(iLocalClockService);
                });
        }

        p.then((iRes) => {
            if (typeof iRes !== 'undefined' && iRes !== null) {
                burstArray.push(iRes);
            }
            iResolve(burstArray);
        }).catch((err) => {
            console.log(`NTP CHAIN Broke with "${err}"`);
            iReject(err);
        });
    });
}

module.exports = {
    ntpDatePromiseBurst
};