/*!
 * alt-interaction JavaScript Library v0.0.1
 * https://github.com/dylancashman/alt-interaction
 *
 * Author: Dylan Cashman
 * Released under the MIT license
 * Date: 2016-12-05
 */

var AltInteraction = {

  userProfile: 'default',
  keyDownListenerUsed: false,
  keyDownListeners: {},

  speechListenerUsed: false,
  speechListeners: {},

  registry: {
    inputRegistries: {},
    outputRegistries: {},
    input: function(keyname, callback) {
      // console.log('USER PROFILE IS ' + AltInteraction.userProfile);
      inputs = AltInteraction.registry.inputRegistries[keyname];
      command = inputs[AltInteraction.userProfile];
      command(callback);
    },
    output: function(keyname, content) {
      outputs = AltInteraction.registry.outputRegistries[keyname];
      command = outputs[AltInteraction.userProfile];
      command(content);
    }
  },

  setUserProfile: function(profile_type) {
    this.userProfile = profile_type;
  },

  declareInput: function(keyname, input_maps) {
    this.registry.inputRegistries[keyname] = input_maps;
  },

  declareOutput: function(keyname, output_maps) {
    this.registry.outputRegistries[keyname] = output_maps;
  },

  // Here, we define the basic inputs and outputs

  // speak() and listen() courtesy of Stephen Walther 2015 
  // (http://stephenwalther.com/archive/2015/01/05/using-html5-speech-recognition-and-text-to-speech)

  speak: function(text) {
    window.speechSynthesis.cancel();
  //   return function() { executespeak(text);};
  // },
  // executespeak: function (text) {
      var u = new SpeechSynthesisUtterance();
      u.text = text;
      u.lang = 'en-US';
      u.rate = 2
      u.volume = 0.5
   
      speechSynthesis.speak(u);
  },

  addKeydownListener: function(callback, keynumber) {
    AltInteraction.keyDownListeners[keynumber] = callback;
    AltInteraction.keyDownListenerUsed = true;
  },

  upListener: function(callback) { AltInteraction.addKeydownListener(callback, 38)},
  downListener: function(callback) { AltInteraction.addKeydownListener(callback, 40)},
  leftListener: function(callback) { AltInteraction.addKeydownListener(callback, 37)},
  rightListener: function(callback) { AltInteraction.addKeydownListener(callback, 39)},

  addSpeechListenerFor: function(text) {
    return function(callback) { console.log(text); AltInteraction.addSpeechListener(callback, text) };
  },

  addSpeechListener: function(callback, text) {
    console.log('trying to add speech listener for text ' + text + ' ___')
    AltInteraction.speechListeners[text] = callback;
    AltInteraction.speechListenerUsed = true;
  },

  initializeInteractions: function() {
    if (AltInteraction.keyDownListenerUsed) {
      addEventListener('keydown', function (e) {
        for ( var keycode in AltInteraction.keyDownListeners ) {
          if(e.keyCode == keycode) {
            callback = AltInteraction.keyDownListeners[keycode];
            callback();
          }
        }
      });
    }

    if (AltInteraction.speechListenerUsed) {
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = function (e) {
          // cancel onend handler
        console.log(e);
        recognition.onend = null;
        for (var text in AltInteraction.speechListeners) {
          var callback = AltInteraction.speechListeners[text];
          for (var key in e.results) {
            result = e.results[key];
            if (typeof(result[0]) != 'undefined' && result[0].transcript.trim() == text.toLowerCase()) {
              callback();
              recognition.stop();
              break;
            }
          }
        }
        setTimeout(AltInteraction.initializeInteractions, 3000);
      }

      // start listening
      recognition.start();
    }
  }
};