import githubConfig from 'github-config';
import API from 'github-base';
import shell from 'shelljs';
import GithubPullRequests from './github_pull_requests';
import simpleGit from 'simple-git';

import { getAccessToken } from './github_utils.js';
import { setAccessToken } from './github_utils';
import { fetchProjectDetails } from './github_utils';
import { fetchPullRequestIDs } from './github_utils';



/**
 * Github Class definition
 */

class Github {
  constructor(janus) {
    this.janus = janus;
    this.prs = [];
    this.api = this.setupAPI();
    this.details = fetchProjectDetails();
    this.prIDs = fetchPullRequestIDs();
    this.testAPI();
  }

  testAPI() {
    const that = this;
    this.api.get('/user',function (err, res) {
      if( res['message'] ) {
        that.janus.error('Release:', 'Github API: ' + res.message);
      } else {
        that.janus.success('Release:', 'Connected to Github API');
      }
    });
    // test up to date
  }

  setupAPI() {
    const api = new API({
      token: getAccessToken()
    });
    return api;
  }

  getReleaseDetails() {
    const pullRequests = new GithubPullRequests(this.api);

    const promise = new Promise( (resolve, reject) => {
      const createPRObject = pullRequests.createFromIDs(this.prIDs);

      createPRObject.then( (prs) => {
        this.prs = prs;
        resolve(prs);
      });

      createPRObject.catch( function(err) {
        reject(err);
      });

    });

    return promise;
  }

  createRelease(version, entry) {
    this.commitAndPush('Version bump and CHANGELOG update');
    // create a new repo
    var opts = {
      "tag_name": version,
      "target_commitish": "master",
      "name": version,
      "body": entry,
      "draft": false,
      "prerelease": false
    };

    const deets = this.details;
    const url = `/repos/${deets.organisation}/${deets.repo}/releases`;
    this.api.post(url, opts, (err, res) => {
      if(err) this.janus.error('Release:', err);

      this.janus.success('Release:', `${version} released. ${res.html_url}`); 
    });
  }

  commitAndPush(message, cb) {
    console.log('commit');
    const commit = shell.exec(`git commit -am "${message}"`);
    console.log(commit);
    if (commit.code !== 0) {
      this.janus.error('Release:', 'Error: Git commit failed');
    } 

    console.log('push');
    let e = shell.exec(`git push origin master`);
    console.log(e);
    if (e.code !== 0) {
      this.janus.error('Release:', 'Error: Git push failed');
    } 

  }

}


/**
 * Github Class methods
 */


Github.getAccessToken = getAccessToken;

Github.setAccessToken = setAccessToken;

export default Github;
