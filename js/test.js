function initiateWheel(segmentData, duration, spins, fireworkElement, btnWheelElement) {
    var theWheel = new Winwheel({
        'numSegments': segmentData ? segmentData.length : 0,
        'textAlignment': 'center',
        'fillStyle': 'silver',     // The segment background colour.
        'strokeStyle': 'white',
        'lineWidth': 2,
        'textFontSize': 18,
        'rotationAngle': 45,
        // 'pointerAngle': 45, // Define the position for pointer to get value
        'responsive': true,
        'segments': segmentData,
        'animation':                   // Note animation properties passed in constructor parameters.
        {
            'type': 'spinToStop',  // Type of animation.
            'duration': duration,             // How long the animation is to take in seconds.
            'spins': spins,              // The number of complete 360 degree rotations the wheel is to do.
            // 'callbackSound': playSound,    // Specify function to call when sound is to be triggered.
            // 'soundTrigger': 'pin',         // Pins trigger the sound for this animation.
            'callbackFinished': () => {
                // Get the audio with the sound it in, then play.
                let winsound = document.getElementById('winsound');
                winsound.volume = 0.3;
                winsound.play();

                // Call getIndicatedSegment() function to return pointer to the segment pointed to on wheel.
                let winningSegment = theWheel.getIndicatedSegment();

                // Display firework
                document.getElementById(fireworkElement).style.display = 'block';

                // Basic sweet alert of the segment text which is the prize name.
                Swal.fire({
                    title: "<i>Phần thưởng</i>",
                    html: winningSegment.text,
                    confirmButtonText: "Xóa",
                    denyButtonText: 'Đóng',
                    showDenyButton: true,
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Remove segment in the wheel
                        document.getElementById(fireworkElement).style.display = 'none';
                        let findItem = theWheel.segments.filter(item => item != null && item != undefined
                            && item.text === winningSegment.text && item.fillStyle === winningSegment.fillStyle)[0];
                        theWheel.deleteSegment(theWheel.segments.indexOf(findItem));
                        theWheel.pins.number = theWheel.segments.length * 2;
                        theWheel.draw();

                        // Remove new item in setting screen
                        let itemGuid = findItem.guid;
                        $(`#btn-remove-value_${itemGuid}`).click();
                    }
                    theWheel.rotationAngle -= spins * 360;
                });
            },
        },
        'pins':    // Display pins, and if desired specify the number.
        {
            'number': segmentData ? segmentData.length * 2 : 0,
            'outerRadius': 4,
            'fillStyle': 'white',   // Fill colour of the pins.
            'strokeStyle': 'black',
            'responsive': true, // This must be set to true if pin size is to be responsive.
        }
    });

    // Trigger for button run wheel
    document.getElementById(btnWheelElement).setAttribute("onclick", "theWheel.startAnimation();");

    return theWheel;
}

function playSound() {
    var audio = new Audio('audio/tick.mp3');  // Create audio object and load desired file.    

    // Stop and rewind the sound (stops it if already playing).
    audio.pause();
    audio.currentTime = 0;

    // Play the sound.
    audio.play();
}

const random = (min, max) => Math.random() * (max - min) + min;