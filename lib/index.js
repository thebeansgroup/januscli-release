import { Plugin } from 'januscli';
import Github from './github.js';
import githubConfig from 'github-config';

/**
 * Release plugin definition
 */

class Release extends Plugin {

  constructor(janus) {
    super(janus);
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
    if( this.isSetup() ) {
      this.startRelease(level);
    } else {
      this.fetchJanusGithubVaribale(
        this.startRelease.bind(level)
      )
    }
  }

 /**
  * Start release steps
  *
  */

  startRelease(level) {
    const github = new Github(this.janus);
    console.log('start release');
    this.janus.on('tasks:complete', function() {
      
    });
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
