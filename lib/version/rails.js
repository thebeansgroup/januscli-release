import semver from 'semver';
import shell from 'shelljs';

/**
 * Rails Version Class
 */

class RailsVersion {

  constructor(janus) {
    this.janus = janus;
  }

 /**
  * write() update Rails version number
  *
  */

  write(version) {
    if (!this.hasRailsVersion()) {
      return this.janus.info('Release:', 'No Rails version found');
    }

    const versionPath = this.getFilePath();
    if (!versionPath) {
      return this.janus.info('Release:', 'No Rails version found');
    }

    return this.updateVersionNumber(versionPath, version);
  }

  hasRailsVersion() {
    return !!this.janus.config.get('release:rails_version_path');
  }

  getFilePath() {
    return this.janus.config.get('release:rails_version_path');
  }

  updateVersionNumber(path, version) {
    shell.sed('-i', /(VERSION =.+)/g, `VERSION = "${version}"`, path);
  }
}

export default RailsVersion;
