import githubConfig from 'github-config';
import API from 'github-base';
import shell from 'shelljs';
import util from 'util';


import { fetchProjectDetails } from './github_utils';
import { cleanPR } from './github_utils';
import { cleanCommits } from './github_utils';
import { cleanIssues } from './github_utils';

const token_name = 'janusToken';

/**
 * Github Class definition
 */

class GithubPullRequests {

  constructor(api) {
    this.api = api;
    this.details = fetchProjectDetails();
  }

 /**
  * createFromIDs() Fetch Pull request, commit and issues
  * details from pull request IDs
  *
  */

  createFromIDs(ids) {
    const amount = ids.length;
    let prs = [];

    const promise = new Promise( (resolve, reject) => {
      if(!ids.length) {
        reject('No new Pull Requests found.');
      }

      ids.forEach( (id) => {
        this.fetchPRandCommits(id, function(err, prObject) {
          if(err) return reject(err);

          prs.push(prObject);
          if(prs.length === amount) resolve(prs)
        }
        );
      });
    });

    return promise;
  }

 /**
  * fetchPRandCommits() use github API to get PR and commit
  * details
  *
  */

  fetchPRandCommits(id, cb) {
    const deets = this.details;
    const url = `/repos/${deets.organisation}/${deets.repo}/pulls/${id}`

    this.api.get(url , (err, pr) => {
      if(err) return cb(err);

      const commitUrl = `${url}/commits`;
      this.api.get(commitUrl , (err, commits) => {
        if(err) return cb(err);
        if(!Array.isArray(commits)) commits = [];

        const prObj = {
          pull_request: cleanPR(pr),
          commits: cleanCommits(commits)
        };

        const issue_ids = this.findIssueIDs(prObj);

        this.fetchIssues(issue_ids, function(err, issues) {
          if(err) return cb(err);

          prObj['issues'] = cleanIssues(issues);
          cb(null, prObj);
        })
      });
    });
  }

 /**
  * fetchIssues() Fetch issue details
  * from list of issue ids
  *
  */
  fetchIssues(issues, cb) {
    const idObjs = [];

    if(!issues.length) cb(null, []);

    issues.forEach((issue) => {
      const url = `/repos/${issue.org}/${issue.repo}/issues/${issue.id}`
      this.api.get(url, function (err, issue) {
        if(err) return cb(err);
        idObjs.push(issue);

        if(issues.length === idObjs.length) cb(null, idObjs);
      });

    });
  }

 /**
  * findIssueIDs() use regex to parse Pull request
  * details for issue ids, org and repo name
  *
  */

  findIssueIDs(pr) {
    const re = /Fixes #(\d{1,10})/gi;
    const reExternal = /Fixes\s+([a-zA-Z]+)\/([-a-z0-9\._]+)#(\d{1,10})/gi;
    const deets = this.details;
    const pr_json = JSON.stringify(pr);
    let ids = [];
    let issue_ids;
    let issue_ext_ids;
  
    while( (issue_ids = re.exec(pr_json) ) !== null) {
      if (issue_ids.index === re.lastIndex) re.lastIndex++;
      ids.push({
        id: issue_ids[1],
        org: deets.organisation,
        repo: deets.repo
      });
    }

    while( (issue_ext_ids = reExternal.exec(pr_json) ) !== null) {
      if (issue_ext_ids.index === reExternal.lastIndex) reExternal.lastIndex++;
      ids.push({
        id: issue_ext_ids[3],
        org: issue_ext_ids[1],
        repo: issue_ext_ids[2]
      });
    }

    return ids;
  }

}

export default GithubPullRequests;
