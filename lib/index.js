import { Plugin } from 'januscli';
import Github from './github.js';
import githubConfig from 'github-config';
import util from 'util';
import Version from './version';
import Changelog from './changelog';

/**
 * Release plugin definition
 */

class Release extends Plugin {

  constructor(janus) {
    super(janus);
    this.level = null;
    this.github = new Github(this.janus);
  }

 /**
  * name() set plugin name
  *
  */

  name() {
    return 'release';
  }


/**
  * Event handlers
  *
  */

  events() {
    this.janus.on( this.startEventName(), this.preRelease.bind(this) )
  }

/**
  * CLI options for plugin to
  * respond to.
  *
  */

  cliCommands() {
    return [
      [
        'release [level_override]',
        'Create a release of current app',
        this.name()
      ]
    ]
  }

  /**
  * CLI options for plugin to
  * respond to.
  *
  */

  cliOptions() {
    return [
      [
        '-t, --test <n>',
        'Test 2',
        false,
        function(val) {
          console.log('arg called', arguments);
        }
      ]
    ]
  }

  /**
  * Perform pre release checks and 
  * start the release if they pass.
  *
  */

  preRelease(level) {
    this.level = level;

    if( this.isSetup() ) {
      this.startRelease();
    } else {
      this.fetchJanusGithubVaribale(
        this.startRelease.bind(this)
      )
    }
  }

 /**
  * Start release steps
  *
  */

  startRelease() {
    if( this.janus.hasPlugin('tasks') ) {
      this.runTasks();
    } else {
      this.createRelease();
    }
  }


  /**
  * Run Janus Tasks Plugin
  *
  */

  runTasks() {
    this.janus.on('tasks:complete', this.createRelease.bind(this) );
    this.janus.emit('tasks:start'); 
  }


  createRelease() {
    const getDetails = this.github.getReleaseDetails();
    getDetails.then(
      (prs) => {
        // has Deps? 
        const version = new Version(this.janus, prs, this.level);
        const nextVersion = version.getNextVersion(); 
        this.janus.success('Release:', `Next version: ${nextVersion}`); 
        version.updateVersionFiles(nextVersion);
        this.janus.success('Release:', "Version: Updated project version"); 
        const changelog = new Changelog(prs, nextVersion);
        const changelogEntry = changelog.getNextChangelogEntry();
        changelog.write(changelogEntry);
        this.janus.success('Release:', "Changelog: Next entry added to changelog");
        // commit and release
        this.github.createRelease(nextVersion, changelogEntry);;
      }
    )

    getDetails.catch(
      (msg) => { this.janus.error('Relase:', msg); }
    )
  }

  /**
  * is Plugin Setup?
  *
  */

  isSetup() {
    return Github.getAccessToken();
  }

  /**
  * is Plugin Setup?
  *
  */

  fetchJanusGithubVaribale(cb) {
    const token_name = 'janusToken';
    const questions = [
      {
        type: "input",
        name: token_name,
        message: "Please enter your Janus GitHub personal access token."
      }
    ];

    this.janus.inquirer.prompt(questions, function( answers ) {
      Github.setAccessToken( answers[token_name] );
      cb()
    });
  }

}

export default Release;