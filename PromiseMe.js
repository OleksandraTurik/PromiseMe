const states = {
    pending: 'Pending',
    resolved: 'Resolved',
    rejected: 'Rejected'
};

jest.setTimeout(600);

class PromiseMe {
    constructor(executor) {
        const tryCall = callback => PromiseMe.try(() => callback(this.value));
        const laterCalls = [];
        const callLater = getMember => callback => new PromiseMe(resolve => laterCalls.push(() => resolve(getMember()(callback))));
        jest.setTimeout(5000)
        const members = {
            [states.resolved]: {
                state: states.resolved,
                then: tryCall,
                catch: _ => this
            },
            [states.rejected]: {
                state: states.rejected,
                then: _ => this,
                catch: tryCall
            },
            [states.pending]: {
                state: states.pending,
                then: callLater(() => this.then),
                catch: callLater(() => this.catch)
            }
        };

        const changeState = state => Object.assign(this, members[state]);
        const apply = (value, state) => {
            if (this.state === states.pending) {
                this.value = value;
                changeState(state);
                for (const laterCall of laterCalls) {
                    laterCall();
                }
            }
        };

        const getCallback = state => value => {
            if (value instanceof PromiseMe && state === states.resolved) {
                value.then(value => apply(value, states.resolved));
                value.catch(value => apply(value, states.rejected));
            } else {
                apply(value, state);
            }
        };

        const resolve = getCallback(states.resolved);
        const reject = getCallback(states.rejected);
        changeState(states.pending);

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    static resolve(value) {
        return new PromiseMe(resolve => resolve(value));
    }

    static reject(value) {
        return new PromiseMe((_, reject) => reject(value));
    }

    static try(callback) {
        return new PromiseMe(resolve => resolve(callback()));
    }
}

module.exports = PromiseMe;