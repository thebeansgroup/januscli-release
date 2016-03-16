import githubConfig from 'github-config';
import shell from 'shelljs';

const token_name = 'janusToken';

/** 
 * Find access token from Git config file
 */

export function getAccessToken(key) {
  return githubConfig()[ token_name ]; 
}

/** 
 * Add access token to Git config file
 */

export function setAccessToken(token) {
  let config = {};
  config[token_name] = token;
  githubConfig( config );
}

/** 
 * Find Orgnaisation and repo name from remote
 */

export function fetchProjectDetails(token) {
  const github_re = /github\.com[\/|:]([-a-z0-9\_]+)\/([-a-z0-9\_]+)/g;
  const log = shell.exec('git remote -v', {silent:true}).stdout;
  const find = github_re.exec(log);

  return {
    organisation: (find[1] || ''),
    repo: (find[2] || '')
  };
}

/** 
 * get pull request IDS from git log
 */

export function fetchPullRequestIDs (token) {
  const pr_re = /Merge pull request #(\d+)(?!.*release)/g;
  const hasTags = shell.exec('git tag -l', {silent: true}).stdout.length;
  let logCMD = 'git log --oneline'
  let ids = [];
  let pr_ids;

  if(hasTags) {
    logCMD = 'git log `git describe --tags --abbrev=0`..HEAD --oneline'
  }

  const commits = shell.exec(logCMD, {silent:true}).stdout;

  while( (pr_ids = pr_re.exec(commits) ) !== null) {
    ids.push(pr_ids[1]);
  }

  return ids;
}

/** 
 * Take GH PR object and trim it down to what we need
 */

export function cleanPR(pr) {
  return {
    id: pr.number,
    url: pr.html_url,
    title: pr.title,
    body: pr.body
  };
}

/** 
 * Take GH commits object and trim it down to what we need
 */

export function cleanCommits(commits) {
  return commits.map(function(commit) {
      return {
        url: commit.html_url,
        author: commit.commit.author.name,
        message: commit.commit.message
      };
  });
}

/** 
 * Take GH issues object and trim it down to what we need
 */

export function cleanIssues(issues) {
  return issues.map(function(issue) {
      return {
        id: issue.number,
        url: issue.html_url,
        title: issue.title,
        body: issue.body,
        labels: issue.labels.map((label) => { return label.name; })
      };
  });
}
