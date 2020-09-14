var pomodoro = {
    isStarted: null,
    isSession: null,
    countdown: null,

    sessionTime: 0,
    breakTime: 0,
    currentTime: 0,

    progressTotal: 0,
    currentProgress: 0,
    progressIncrement: 0,

    buttonPlayDOM: null,
    timerDisplayDOM: null,
    messageDOM: null,
    inputSessionDOM: null,
    inputBreakDOM: null,
    progressDOM: null,

    resetVariables: function() {
        this.isStarted = false;
        this.isSession = true;
        clearInterval(this.countdown);
        this.countdown = null;

        this.sessionTime = 1500;
        this.breakTime = 300;
        this.currentTime = this.sessionTime;

        this.currentProgress = 0;
        this.progressIncrement = 0;

        this.buttonPlayDOM.className = 'button start';
        this.messageDOM.innerHTML = ''
        this.inputSessionDOM.value = 25;
        this.inputBreakDOM.value = 5
        this.progressDOM.style.width = 0;
    },

    setSessionAndBreakTime: function(btn) {
        if (!this.isStarted && !this.countdown) {

            if (btn.parentNode.className == 'number-input') {

                if (btn.parentNode.parentNode.className == 'session') {

                    if (btn.className == 'button minus' && this.sessionTime > 60) this.sessionTime -= 60;
                    else if (btn.className == 'button plus') this.sessionTime += 60;

                } else if (btn.parentNode.parentNode.className == 'break') {

                    if (btn.className == 'button minus' && this.breakTime > 60) this.breakTime -= 60;
                    else if (btn.className == 'button plus') this.breakTime += 60;
                    this.inputBreakDOM.value = this.breakTime / 60;

                }
            } else {
                this.sessionTime = parseInt(btn.dataset.time);
            }

            this.inputSessionDOM.value = this.sessionTime / 60;
            this.currentTime = this.sessionTime;

            this.displayTimeLeft();
        }
    },

    init: function() {
        this.buttonPlayDOM = document.getElementById('button-play');
        this.timerDisplayDOM = document.querySelector('.display-time');
        this.messageDOM = document.querySelector('.message');
        this.inputSessionDOM = document.getElementById('session-minutes');
        this.inputBreakDOM = document.getElementById('break-minutes');
        this.progressDOM = document.querySelector('.progress');
        this.buttonPlayDOM.className = 'button start';
        this.messageDOM.innerHTML = ''

        this.isStarted = false;
        this.isSession = true;

        this.inputSessionDOM.value = 25;
        this.inputBreakDOM.value = 5
        this.sessionTime = this.inputSessionDOM.value * 60;
        this.breakTime = this.inputBreakDOM.value * 60;
        this.currentTime = this.sessionTime;

        this.progressTotal = parseInt(getComputedStyle(document.querySelector('.progressbar')).width.replace('px', ''));
        this.currentProgress = 0;
        this.progressIncrement = 0;

        this.buttonPlayDOM.onclick = () => {
            this.play();
        };

        document.querySelector('.button.stop').onclick = () => {
            this.stop();
        };

        document.querySelectorAll('[data-time]').forEach(btn => btn.onclick = () => {
            this.setSessionAndBreakTime(btn);
        });

        document.querySelectorAll('.button.minus').forEach(btn => btn.onclick = () => {
            this.setSessionAndBreakTime(btn);
        });

        document.querySelectorAll('.button.plus').forEach(btn => btn.onclick = () => {
            this.setSessionAndBreakTime(btn);
        });
    },

    play: function() {
        this.isStarted = !this.isStarted;

        if (this.isStarted) {
            this.buttonPlayDOM.className = 'button pause';

            this.timer();
        } else {
            this.buttonPlayDOM.className = 'button start';

            clearInterval(this.countdown)
        }
    },

    stop: function() {
        this.resetVariables();
        this.displayTimeLeft();
    },

    resetTime: function() {
        this.currentProgress = 0;
        this.progressDOM.style.width = 0;

        this.currentTime = (this.isSession ? this.sessionTime : this.breakTime);

        this.timer();
    },

    timer: function() {
        clearInterval(this.countdown)

        this.messageDOM.innerHTML = `${this.isSession ? 'Session' : 'Break'}`;
        this.displayTimeLeft();

        const now = Date.now();
        const then = now + this.currentTime * 1000;

        if (this.currentProgress == 0) this.progressIncrement = this.progressTotal / this.currentTime;

        this.countdown = setInterval(() => {

            this.currentTime = Math.round((then - Date.now()) / 1000);

            if (this.currentTime < 0) {

                let playPromise = document.getElementById('alarm-sound').play();

                // In browsers that don’t yet support this functionality, playPromise won’t be defined
                if (playPromise !== undefined) {

                    const self = this;

                    playPromise.then(function() {
                        // Automatic playback started
                    }).catch(function(error) {
                        console.log(error);
                    }).finally(function() {
                        clearInterval(self.countdown)
                        document.title = '(00:00) Pomodoro';
                        self.timerDisplayDOM.innerHTML = '00:00';
                        alert(`${self.isSession ? 'Session' : 'Break'} is over!`);
                        self.isSession = !self.isSession;
                        self.resetTime();
                    });
                }
            }

            this.currentProgress += this.progressIncrement;
            this.progressDOM.style.width = this.currentProgress + 'px';

            this.displayTimeLeft();
        }, 1000);
    },

    displayTimeLeft: function() {
        const minutes = Math.floor(this.currentTime / 60);
        const reminderSeconds = this.currentTime % 60;
        const display = `${minutes < 10 ? '0' : ''}${minutes}:${reminderSeconds < 10 ? '0' : ''}${reminderSeconds}`;

        this.timerDisplayDOM.innerHTML = display;
        document.title = '(' + display + ') Pomodoro';
    }
}

window.onload = function() {
    pomodoro.init();
};