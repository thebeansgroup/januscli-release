import githubConfig from 'github-config';
import API from 'github-base';
import shell from 'shelljs';
import GithubPullRequests from './github_pull_requests';

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

 /**
  * testAPI() Test to see if the API is set up correct
  * and let the user know if not.
  *
  */

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

 /**
  * setupApi() init github api and 
  * return it.
  *
  */

  setupAPI() {
    const api = new API({
      token: getAccessToken()
    });
    return api;
  }

 /**
  * getReleaseDetails() fetch all PR, commit and issue
  * details. Returns as a promise — boss method.
  *
  */

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

 /**
  * createRelease() use github api to create a 
  * new GH release.
  *
  */

  createRelease(version, entry) {
    // create a new repo
    var opts = {
      "tag_name": version,
      "target_commitish": this.getReleaseBranchName(version),
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

 /**
  * createPullRequest() use github api to create a
  * new GH Pull request to merge the relase into master
  *
  */

  createPullRequest(version, entry) {
    // create a new repo
    var opts = {
      "title": `Release: ${version}`,
      "body": entry,
      "head": this.getReleaseBranchName(version),
      "base": "master"
    };

    const deets = this.details;
    const url = `/repos/${deets.organisation}/${deets.repo}/pulls`;
    this.api.post(url, opts, (err, res) => {
      if(err) this.janus.error('Release:', err);

      this.janus.success(
        'Release:',
        `PR for ${this.getReleaseBranchName(version)}. ${res.html_url}`
      ); 
    });
  }

 /**
  * commitAndPush() commit in all changes and 
  * push to github branch
  *
  */

  commitAndPush(message, branch) {
    const commit = shell.exec(`git commit -am "${message}"`, {silent: true});
    if (commit.code !== 0) {
      this.janus.error('Release:', 'Git commit failed');
    } 

    const push = shell.exec(`git push origin ${branch}`, {silent: true});
    if (push.code !== 0) {
      this.janus.error('Release:', 'Git push failed');
    } 
  }

 /**
  * createReleaseBranch() pull down changes and 
  * create a new release branch
  *
  */

  createReleaseBranch(name) {
    const pull = shell.exec('git pull', {silent: false});
    if (pull.code !== 0) {
      this.janus.error('Release:', 'Git pull failed');
    }

    const branch = shell.exec(`git checkout -b ${name}`, {silent: true});
    if (branch.code !== 0) {
      this.janus.error('Release:', `Git failed to create branch ${name}`);
    }

  }

 /**
  * getReleaseBranchName() return a consisten branch name
  *
  */

  getReleaseBranchName(version) {
    return `release-${version}`;
  }

}


/**
 * Github Class methods
 */


Github.getAccessToken = getAccessToken;

Github.setAccessToken = setAccessToken;

export default Github;
