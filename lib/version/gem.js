import semver from 'semver';
import shell from 'shelljs';

/**
 * Gem Version Class
 */

class GemVersion {

  constructor(janus) {
    this.janus = janus;
  }

 /**
  * write() update Gem version number
  *
  */

  write(version) {
    if(!this.hasGemspec()) {
      return this.janus.info('Release:', 'No Gemspec found');
    }

    const versionPath = this.getFilePath();
    if(!versionPath) {
      return this.janus.info('Release:', 'No Gemspec found');
    }

    this.updateVersionNumber(versionPath, version);
  }

  hasGemspec() {
    return !!this.getGemspecName();
  }

  getGemspecName() {
    const cmd = "ls | grep 'gemspec'"
    const exec = shell.exec(cmd, {silent: !this.janus.debug});
    return exec.stdout.trim();
  }

  getFilePath() {
    var re = /require ["|'](\S+)["|']/;
    const name = this.getGemspecName();
    const exec = shell.exec(`cat ${name}`, {silent: !this.janus.debug});
    const spec = exec.stdout;
    const search = re.exec(spec);

    return search ? `./lib/${search[1]}.rb` : false;
  }

  updateVersionNumber(path, version) {
    console.log('update number');
    shell.sed('-i', /(VERSION =.+)/g, `VERSION = "${version}"`, path);
    console.log('// update number');
  }
}

export default GemVersion;
