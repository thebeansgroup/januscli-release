import semver from 'semver';
import shell from 'shelljs';
import moment from 'moment';
import fs from 'fs';

/**
 * Semantic Changelog Class
 */

class Changelog {

  constructor(prs, version) {
    this.prs = prs;
    this.version = version;
  }

 /**
  * getChangelog() get next version
  * number
  *
  */

  getNextChangelogEntry() {
    let tmpl = "";
    tmpl += this.getTitle();
    tmpl += this.getPullRequests();
    return tmpl;
  }


 /**
  * getChangelog() get next version
  * number
  *
  */

  getTitle() {
    return `# [${this.version}] - ${moment().format('YYYY-MM-DD')}\n`;
  }

 /**
  * getChangelog() get next version
  * number
  *
  */

  getPullRequests() {
    let tmpl = "";
    this.prs.forEach((pr) => {
      tmpl += `- ${pr.pull_request.title} - [PR Link](${pr.pull_request.url})\n`;
      tmpl += this.getIssues(pr);
    });
    return tmpl;
  }

  getIssues(pr) {
    let tmpl = "";
    pr.issues.forEach((issue) => {
      tmpl += ` - ${issue.title} - [Fixes #${issue.id}](${issue.url})`
    });
    return tmpl;
  }

  write(entry) {
    const tmpFile = './CHANGELOG_ENTRY.md';
    const file = './CHANGELOG.md';
    shell.echo(entry).to(tmpFile);
    shell.cat(file).toEnd(tmpFile);
    shell.cat(tmpFile).to(file);
    shell.rm(tmpFile);
  }

}

export default Changelog;
