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
  * getNextChangeLogEntry() create changelog entry
  * as a string
  *
  */

  getNextChangelogEntry() {
    let tmpl = "";
    tmpl += this.getTitle();
    tmpl += this.getPullRequests();
    return tmpl;
  }


 /**
  * getTitle() create Entry header
  *
  */

  getTitle() {
    return `# [${this.version}] - ${moment().format('YYYY-MM-DD')}\n`;
  }

 /**
  * getPullRequests() get PR template
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

 /**
  * getIssues() get Issues template
  *
  */

  getIssues(pr) {
    let tmpl = "";
    pr.issues.forEach((issue) => {
      tmpl += ` - ${issue.title} - [Fixes #${issue.id}](${issue.url})\n`
    });
    return tmpl;
  }

 /**
  * write() Write entry to top of 
  * CHANGELOG.md
  *
  */

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
