import semver from 'semver';
import shell from 'shelljs';

/**
 * Semantic Version Class
 */

class Version {

  constructor(prs, level) {
    this.prs = prs;
    this.level = level;
  }

 /**
  * getVersion() get next version
  * number
  *
  */

  getNextVersion() {
    const currentVersion = this.getCurrentVersion();
    const releaseType = this.findReleaseType();

    return semver.inc(currentVersion, releaseType);
  }

  /**
  * findReleaseType() get release type
  * number
  *
  */

  findReleaseType() {
    if(['major', 'minor', 'patch'].indexOf(this.level) !== -1) {
      return this.level;
    }

    let labels = [];

    this.prs.forEach(function(pr) {
      pr.issues.forEach(function(issue) {
        labels = labels.concat(issue.labels);
      });
    });

    // TODO: When do we major release?
    if(labels.indexOf('enhancment') !== -1) {
      return 'minor';
    } else {
      return 'patch';
    }
  }


  getCurrentVersion() {
    const cmd = 'git describe --tags --abbrev=0';
    return semver.clean(shell.exec(cmd, {silent: true}).stdout);
  } 
}

export default Version;
