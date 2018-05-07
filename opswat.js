const axios = require('axios');

const OpswatAPI = {

  baseUrl: 'https://api.metadefender.com/v2',
  apiKey: 'YOUR_API_KEY',  // place your API key here (keep quotes and comma)


  getHashLookup: function(hash) {
    const url = this.baseUrl + '/hash/' + hash;
    const getRequest = {
      method: 'get',
      headers: {
        apikey: this.apiKey
      }
    }

    return axios(url, getRequest)

    .then((response) => response.data)
    
    .catch((error) => {
      return Promise.reject(error);
    });
  },

  getScanReport: function(dataId) {
    const url = this.baseUrl + '/file/' + dataId;
    const getRequest = {
      method: 'get',
      headers: {
        apikey: this.apiKey
      }
    }

    return axios(url, getRequest)

    .then((response) => response.data)
    
    .catch((error) => {
      return Promise.reject(error);
    });
  },

  postFileUpload: function(file) {
    const url = this.baseUrl + '/file/';
    const postRequest = {
      method: 'post',
      headers: {
        apikey: this.apiKey
      },
      data: file
    }

    return axios(url, postRequest)

    .then((response) => response.data)
    
    .catch((error) => {
      return Promise.reject(error);
    });
  }
}

module.exports = OpswatAPI;