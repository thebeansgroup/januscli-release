import githubConfig from 'github-config';
import API from 'github-base';

const token_name = 'janusToken';

/**
 * Github Class definition
 */

class Github {
  constructor(janus) {
    this.janus = janus;
    this.api = this.setup();
    this.testAPI();
  }

  testAPI() {
    const that = this;
    this.api.get('/user',function (err, res) {
      if( res['message'] ) {
        that.janus.error('Github API: ' + res.message);
      }
    });
  }

  setup() {
    const api = new API({
      token: Github.getAccessToken()
    });
    return api;
  }
}

Github.getAccessToken = (key) => {
  return githubConfig()[ token_name ]; 
}

Github.setAccessToken = (token) => {
  let config = {};
  config[janus_token] = answers[token_name];
  githubConfig( config )
}

export default Github;
