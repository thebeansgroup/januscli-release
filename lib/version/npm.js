import shell from 'shelljs';

/**
 * Gem Version Class
 */

class NpmVersion {

  constructor(janus) {
    this.janus = janus;
  }

 /**
  * write() update NPM version number
  *
  */

  write(version) {
    if(!this.hasNPM()) {
      return this.janus.info('Release:', 'No NPM package found');
    }

    const cmd = `npm --no-git-tag-version version ${version}`;
    const npmVersion = shell.exec(cmd, {silent: true});

    if(npmVersion.code !== 0) {
      this.janus.error('Release:', 'NPM Version update failed');
    } else {
      this.janus.success('Release:', `NPM Version updated to ${version}`);
    }
  }

  hasNPM() {
    const cmd = `cat ./package.json`;
    const catExec = shell.exec(cmd, {silent: true});
    return !catExec.code;
  }

}

export default NpmVersion;
