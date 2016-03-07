import githubConfig from 'github-config';
import shell from 'shelljs';

const token_name = 'janusToken';

/**
 * Github Utility methods
 */

export function getAccessToken(key) {
  return githubConfig()[ token_name ]; 
}

export function setAccessToken(token) {
  let config = {};
  config[janus_token] = answers[token_name];
  githubConfig( config )
}

export function fetchProjectDetails(token) {
  const github_re = /https:\/\/github\.com\/([a-zA-Z]+)\/([a-zA-Z]+)/;
  const log = shell.exec('git remote -v', {silent:true}).stdout;
  const find = github_re.exec(log);
  return {
    organisation: (find[1] || ''),
    repo: (find[2] || '')
  };

}

export function fetchPullRequestIDs (token) {
  const pr_re = /Merge pull request #(\d{1,10})/g;
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

export function cleanPR(pr) {
  return {
    id: pr.number,
    url: pr.html_url,
    title: pr.title,
    body: pr.body
  };
}

export function cleanCommits(commits) {
  return commits.map(function(commit) {
      return {
        url: commit.html_url,
        author: commit.commit.author.name,
        message: commit.commit.message
      };
  });
}

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
