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

  fetchPRandCommits(id, cb) {
    const deets = this.details;
    const url = `/repos/${deets.organisation}/${deets.repo}/pulls/${id}`

    this.api.get(url , (err, pr) => {
      if(err) return cb(err);

      const commitUrl = `${url}/commits`;
      this.api.get(commitUrl , (err, commits) => {
        if(err) return cb(err);

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

  fetchIssues(ids, cb) {
    const idObjs = [];
    const deets = this.details;

    if(!ids.length) cb(null, []);

    ids.forEach((id) => {
      const url = `/repos/${deets.organisation}/${deets.repo}/issues/${id}`
      this.api.get(url, function (err, issue) {
        if(err) return cb(err);
        idObjs.push(issue);

        if(ids.length === idObjs.length) cb(null, idObjs);
      });

    });
  }

  findIssueIDs(pr) {
    const re = /Fixes #(\d{1,10})/gi;
    const pr_json = JSON.stringify(pr);
    let ids = [];
    let issue_ids;

    while( (issue_ids = re.exec(pr_json) ) !== null) {
      ids.push(issue_ids[1]);
    }

    return ids;
  }

}

export default GithubPullRequests;
