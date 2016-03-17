import semver from 'semver';
import shell from 'shelljs';
import NpmVersion from './version/npm';
import GemVersion from './version/gem';

/**
 * Semantic Version Class
 */

class Version {

  constructor(janus, prs, level) {
    this.janus = janus;
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
    }
    else if(labels.indexOf('bug') !== -1) {
      return 'patch';
    } else {
      this.janus.error(
        'Release:',
        'Version can not be identified from issue labels.'
      );
    }
  }


  getCurrentVersion() {
    const cmd = 'git describe --tags --abbrev=0';
    return semver.clean(shell.exec(cmd, {silent: true}).stdout);
  } 


 /**
  * updateVersionFiles() update version numbers
  * in current project.
  *
  */

  updateVersionFiles(version) {
    const npmVersion = new NpmVersion(this.janus);
    npmVersion.write(version);
    const gemVersion = new GemVersion(this.janus);
    gemVersion.write(version);
  }

}

export default Version;
