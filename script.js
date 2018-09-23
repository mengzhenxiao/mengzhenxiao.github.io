const SpeechRecognition = webkitSpeechRecognition;
const synth = window.speechSynthesis;
const giphyAPIKey = 'woyXWtlpZmW3bGFSySjnqqfJ1LKaOLIu';
const urbanDAPIKey = 'oclsawatipmshX1hXW1tPbcRxoy5p17KlOajsnDW0nTBBNQsjk'

const getSpeech = () => {
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.interimResults = true;
  console.log('started rec');

  recognition.onresult = event => {
    const speechResult = event.results[0][0].transcript;
    console.log('result: ' + speechResult);
    console.log('confidence: ' + event.results[0][0].confidence);
    getGif(speechResult);
    getUrbanD(speechResult);
    // getUrbanD();
  };

  recognition.onend = () => {
    console.log('it is over');
    // for "endless" mode, comment out the next line and uncomment getSpeech()
    recognition.stop();
    // getSpeech();
  };

  recognition.onerror = event => {
    console.log('something went wrong: ' + event.error);
  };
};

const getGif = phrase => {
  let url = `http://api.giphy.com/v1/gifs/random?api_key=${giphyAPIKey}&tag=${phrase}`;

  fetch(url, {
    mode: 'cors'
  })
    .then(response => response.json())
    .then(result => {
      let imgUrl = result.data.image_url;
      document.querySelector('#the-gif').src = imgUrl;
    });
};


// const getUrbanD = word => {
//   let url = `https://mashape-community-urban-dictionary.p.mashape.com/define?term=${word}`;
//   console.log(url);
//
//   fetch(url, {
//     method: "GET",
//     mode: 'cors',
//     header:{
//       'X-Mashape-Key': 'oclsawatipmshX1hXW1tPbcRxoy5p17KlOajsnDW0nTBBNQsjk',
//       'Accept': 'text/plain',
//     }
//   })
//     .then(response => response.json())
//     .then(result => {
//       console.log(response.json)
//     });
// };

const getUrbanD = word => {

  $.ajax({
    url: 'https://mashape-community-urban-dictionary.p.mashape.com/define?term=' + word,
    headers: {
      'X-Mashape-Key': 'oclsawatipmshX1hXW1tPbcRxoy5p17KlOajsnDW0nTBBNQsjk',
      'Accept': 'application/json'
    },
    method: 'GET',
    dataType: 'json',
    success: function(data) {
      console.log(data.list[0].definition);
      $('#word').html(word+' means');
      $('#urbanD').html(data.list[0].definition);
      speak(word +' means'+data.list[0].definition);
    }
  });
}

const speak = text => {
  if (synth.speaking) {
    console.error('speechSynthesis.speaking');
    return;
  }
  let utterThis = new SpeechSynthesisUtterance(text);
  synth.speak(utterThis);
};

document.querySelector('#record').onclick = () => {
  console.log('clickity');
  getSpeech();
};
